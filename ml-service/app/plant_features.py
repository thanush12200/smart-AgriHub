from __future__ import annotations

import base64
import io
from pathlib import Path
from typing import Dict, Tuple

import numpy as np

try:
    from PIL import Image
except Exception:  # pragma: no cover
    Image = None


SUPPORTED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}


def _safe_histogram(values: np.ndarray, bins: int, value_range: Tuple[float, float]) -> np.ndarray:
    hist, _ = np.histogram(values, bins=bins, range=value_range, density=False)
    hist = hist.astype(np.float32)
    total = float(np.sum(hist))
    if total > 0:
        hist /= total
    return hist


def _compute_hsv(rgb: np.ndarray) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    r = rgb[:, :, 0]
    g = rgb[:, :, 1]
    b = rgb[:, :, 2]

    max_channel = np.maximum(np.maximum(r, g), b)
    min_channel = np.minimum(np.minimum(r, g), b)
    delta = max_channel - min_channel

    hue = np.zeros_like(max_channel)
    safe_delta = delta + 1e-6
    non_gray = delta > 1e-6

    r_is_max = (max_channel == r) & non_gray
    g_is_max = (max_channel == g) & non_gray
    b_is_max = (max_channel == b) & non_gray

    hue[r_is_max] = ((g[r_is_max] - b[r_is_max]) / safe_delta[r_is_max]) % 6
    hue[g_is_max] = ((b[g_is_max] - r[g_is_max]) / safe_delta[g_is_max]) + 2
    hue[b_is_max] = ((r[b_is_max] - g[b_is_max]) / safe_delta[b_is_max]) + 4
    hue = hue / 6.0

    saturation = np.where(max_channel > 1e-6, delta / (max_channel + 1e-6), 0.0)
    value = max_channel

    return hue, saturation, value, delta


def _extract_from_rgb_array(rgb: np.ndarray) -> Dict[str, np.ndarray | Dict[str, float]]:
    r = rgb[:, :, 0]
    g = rgb[:, :, 1]
    b = rgb[:, :, 2]

    hue, saturation, value, _ = _compute_hsv(rgb)

    vivid = (saturation > 0.28) & (value > 0.2)
    red_hue = ((hue < 0.05) | (hue > 0.95)) & vivid
    green_hue = (hue > 0.22) & (hue < 0.45) & vivid
    deep_red = (r > 0.35) & (r > (g * 1.2)) & (r > (b * 1.2))
    foliage = (g > 0.2) & (g > (r * 1.04)) & (g > (b * 1.04))

    red_ratio = float(np.mean(red_hue | deep_red))
    green_ratio = float(np.mean(green_hue | foliage))
    vivid_ratio = float(np.mean(vivid))
    tomato_scene_score = float(np.clip((red_ratio * 4.0) + (green_ratio * 2.1) + (vivid_ratio * 0.5), 0.0, 1.0))

    exg = float(np.mean((2 * g) - r - b))
    green_share = float(np.mean((g > r) & (g > b)))
    luma = (0.299 * r) + (0.587 * g) + (0.114 * b)
    texture_std = float(np.std(luma))

    summary_features = np.array(
        [
            float(np.mean(g)),
            float(np.mean(saturation)),
            float(np.mean(value)),
            float(np.clip((exg + 1.0) / 2.0, 0.0, 1.0)),
            green_share,
            texture_std,
        ],
        dtype=np.float32,
    )

    hue_hist = _safe_histogram(hue, bins=18, value_range=(0.0, 1.0))
    sat_hist = _safe_histogram(saturation, bins=8, value_range=(0.0, 1.0))
    val_hist = _safe_histogram(value, bins=8, value_range=(0.0, 1.0))

    texture_stats = np.array(
        [
            float(np.mean(luma)),
            float(np.std(luma)),
            float(np.percentile(luma, 25)),
            float(np.percentile(luma, 50)),
            float(np.percentile(luma, 75)),
            red_ratio,
            green_ratio,
            vivid_ratio,
            tomato_scene_score,
        ],
        dtype=np.float32,
    )

    model_features = np.concatenate([summary_features, hue_hist, sat_hist, val_hist, texture_stats]).astype(np.float32)

    return {
        "summary": summary_features,
        "model": model_features,
        "signals": {
            "redRatio": red_ratio,
            "greenRatio": green_ratio,
            "vividRatio": vivid_ratio,
            "tomatoSceneScore": tomato_scene_score,
        },
    }


def extract_plant_features_from_image(image: "Image.Image") -> Dict[str, np.ndarray | Dict[str, float]]:
    if Image is None:
        raise RuntimeError("Pillow not available")

    processed = image.convert("RGB").resize((224, 224))
    rgb = np.asarray(processed).astype(np.float32) / 255.0
    return _extract_from_rgb_array(rgb)


def extract_plant_features_from_base64(image_base64: str) -> Dict[str, np.ndarray | Dict[str, float]]:
    if Image is None:
        raise RuntimeError("Pillow not available")

    if "," in image_base64:
        image_base64 = image_base64.split(",", 1)[1]

    image_bytes = base64.b64decode(image_base64)
    image = Image.open(io.BytesIO(image_bytes))
    return extract_plant_features_from_image(image)


def extract_plant_features_from_file(image_path: Path) -> Dict[str, np.ndarray | Dict[str, float]]:
    if Image is None:
        raise RuntimeError("Pillow not available")

    image = Image.open(image_path)
    return extract_plant_features_from_image(image)


def build_plant_model_vector(feature_bundle: Dict[str, np.ndarray | Dict[str, float]]) -> np.ndarray:
    summary = np.asarray(feature_bundle["summary"], dtype=np.float32)
    signals = feature_bundle["signals"]  # type: ignore[assignment]
    signal_vector = np.array(
        [
            float(signals["redRatio"]),
            float(signals["greenRatio"]),
            float(signals["vividRatio"]),
            float(signals["tomatoSceneScore"]),
        ],
        dtype=np.float32,
    )
    return np.concatenate([summary, signal_vector]).astype(np.float32)
