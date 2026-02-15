from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Tuple

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

from .plant_features import (
    SUPPORTED_IMAGE_EXTENSIONS,
    build_plant_model_vector,
    extract_plant_features_from_file,
)

SOIL_TYPES = ["alluvial", "black", "red", "laterite", "clay", "sandy"]
REGIONS = ["Karnataka", "Tamil Nadu", "Punjab", "Maharashtra", "Bihar", "Andhra Pradesh"]
CROPS = ["rice", "wheat", "maize", "cotton", "sugarcane", "millets", "groundnut"]
FERTILIZERS = ["Urea", "DAP", "NPK 19-19-19", "MOP", "Ammonium Sulphate"]

PLANT_CLASSES = ["rice", "wheat", "maize", "cotton", "sugarcane", "tomato"]

# Vector layout: [mean_g, saturation, value, exg_norm, green_share, texture_std, red_ratio, green_ratio, vivid_ratio, tomato_scene]
PLANT_PRIORS: Dict[str, Dict[str, np.ndarray]] = {
    "rice": {
        "mean": np.array([0.31, 0.34, 0.66, 0.50, 0.68, 0.16, 0.02, 0.45, 0.34, 0.30], dtype=np.float32),
        "std": np.array([0.05, 0.05, 0.06, 0.07, 0.08, 0.04, 0.02, 0.08, 0.08, 0.10], dtype=np.float32),
    },
    "wheat": {
        "mean": np.array([0.28, 0.40, 0.60, 0.46, 0.62, 0.14, 0.02, 0.36, 0.33, 0.22], dtype=np.float32),
        "std": np.array([0.05, 0.06, 0.07, 0.07, 0.08, 0.04, 0.02, 0.08, 0.08, 0.09], dtype=np.float32),
    },
    "maize": {
        "mean": np.array([0.30, 0.44, 0.58, 0.56, 0.69, 0.20, 0.03, 0.43, 0.41, 0.34], dtype=np.float32),
        "std": np.array([0.06, 0.07, 0.07, 0.08, 0.08, 0.05, 0.03, 0.09, 0.09, 0.10], dtype=np.float32),
    },
    "cotton": {
        "mean": np.array([0.32, 0.39, 0.55, 0.47, 0.60, 0.22, 0.07, 0.24, 0.45, 0.44], dtype=np.float32),
        "std": np.array([0.06, 0.06, 0.07, 0.08, 0.09, 0.06, 0.05, 0.08, 0.10, 0.12], dtype=np.float32),
    },
    "sugarcane": {
        "mean": np.array([0.31, 0.38, 0.60, 0.52, 0.71, 0.13, 0.02, 0.50, 0.31, 0.25], dtype=np.float32),
        "std": np.array([0.05, 0.05, 0.06, 0.07, 0.08, 0.04, 0.02, 0.09, 0.08, 0.09], dtype=np.float32),
    },
    "tomato": {
        "mean": np.array([0.23, 0.47, 0.62, 0.40, 0.21, 0.28, 0.26, 0.15, 0.52, 0.92], dtype=np.float32),
        "std": np.array([0.08, 0.08, 0.08, 0.09, 0.09, 0.06, 0.10, 0.10, 0.11, 0.10], dtype=np.float32),
    },
}

INTENT_DATA: List[Tuple[str, str]] = [
    ("Which crop is best for high rainfall?", "crop_query"),
    ("Suggest crop for my black soil", "crop_query"),
    ("What should I plant this season?", "seasonal_advice"),
    ("How to treat leaf spots in tomato", "disease_help"),
    ("My plant leaves are yellow with fungus", "disease_help"),
    ("I need fertilizer dosage for rice", "fertilizer_help"),
    ("Which fertilizer should I use for wheat", "fertilizer_help"),
    ("How much NPK for maize", "fertilizer_help"),
    ("What is the rainy season crop in Karnataka", "seasonal_advice"),
    ("Can I grow millets in dry weather", "crop_query"),
    ("Powdery mildew solution", "disease_help"),
    ("Is DAP suitable for cotton", "fertilizer_help"),
    ("when should I sow paddy", "seasonal_advice"),
    ("best crop for temperature 32", "crop_query"),
    ("plant disease with curling leaves", "disease_help"),
]


FEATURE_JITTER_STD = np.array([0.018, 0.022, 0.022, 0.028, 0.028, 0.018, 0.03, 0.04, 0.04, 0.05], dtype=np.float32)


def _crop_label(soil: str, rainfall: float, temperature: float, region: str) -> str:
    if rainfall >= 180 and 22 <= temperature <= 34:
        return "rice"
    if rainfall < 80 and temperature > 28:
        return "millets"
    if 90 <= rainfall <= 160 and 18 <= temperature <= 30 and soil in {"black", "alluvial"}:
        return "wheat"
    if temperature > 30 and soil in {"black", "clay"}:
        return "cotton"
    if rainfall > 120 and temperature > 25:
        return "sugarcane"
    if soil in {"sandy", "red"} and rainfall < 120:
        return "groundnut"
    return "maize"


def _fertilizer_label(crop: str, n: float, p: float, k: float) -> str:
    if n < 40:
        return "Urea"
    if p < 30:
        return "DAP"
    if k < 35:
        return "MOP"
    if crop in {"cotton", "sugarcane"}:
        return "NPK 19-19-19"
    return "Ammonium Sulphate"


def build_crop_dataset(rows: int = 1400) -> pd.DataFrame:
    rng = np.random.default_rng(42)
    data = []

    for _ in range(rows):
        soil = rng.choice(SOIL_TYPES)
        region = rng.choice(REGIONS)
        rainfall = float(rng.normal(120, 55))
        rainfall = max(20, min(320, rainfall))
        temperature = float(rng.normal(27, 6))
        temperature = max(12, min(42, temperature))
        crop = _crop_label(soil, rainfall, temperature, region)
        data.append((soil, rainfall, temperature, region, crop))

    return pd.DataFrame(data, columns=["soilType", "rainfall", "temperature", "region", "target"])


def build_fertilizer_dataset(rows: int = 1500) -> pd.DataFrame:
    rng = np.random.default_rng(7)
    data = []

    for _ in range(rows):
        crop = rng.choice(CROPS)
        n = float(max(10, min(90, rng.normal(45, 20))))
        p = float(max(10, min(80, rng.normal(35, 15))))
        k = float(max(10, min(85, rng.normal(38, 16))))
        fert = _fertilizer_label(crop, n, p, k)
        data.append((crop, n, p, k, fert))

    return pd.DataFrame(data, columns=["crop", "n", "p", "k", "target"])


def _build_crop_pipeline() -> Pipeline:
    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore"), ["soilType", "region"]),
            ("num", "passthrough", ["rainfall", "temperature"]),
        ]
    )

    return Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            (
                "model",
                RandomForestClassifier(
                    n_estimators=180,
                    max_depth=14,
                    random_state=42,
                    class_weight="balanced_subsample",
                ),
            ),
        ]
    )


def _build_fertilizer_pipeline() -> Pipeline:
    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore"), ["crop"]),
            ("num", "passthrough", ["n", "p", "k"]),
        ]
    )

    return Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("model", RandomForestClassifier(n_estimators=160, max_depth=12, random_state=11)),
        ]
    )


def _build_intent_pipeline() -> Pipeline:
    return Pipeline(
        steps=[
            ("tfidf", TfidfVectorizer(ngram_range=(1, 2), min_df=1)),
            ("model", LogisticRegression(max_iter=600, random_state=22)),
        ]
    )


def _build_plant_classifier() -> RandomForestClassifier:
    return RandomForestClassifier(
        n_estimators=420,
        max_depth=20,
        min_samples_leaf=2,
        class_weight="balanced_subsample",
        random_state=101,
    )


def _clip_vector(vec: np.ndarray) -> np.ndarray:
    clipped = np.array(vec, dtype=np.float32)
    clipped[:5] = np.clip(clipped[:5], 0.0, 1.0)
    clipped[5] = float(np.clip(clipped[5], 0.0, 0.7))
    clipped[6:] = np.clip(clipped[6:], 0.0, 1.0)
    return clipped


def _synthetic_plant_samples(rows_per_class: int = 2200) -> Tuple[np.ndarray, np.ndarray]:
    rng = np.random.default_rng(99)
    x_rows: List[np.ndarray] = []
    y_rows: List[str] = []

    for label in PLANT_CLASSES:
        prior = PLANT_PRIORS[label]
        mean = prior["mean"]
        std = prior["std"]

        for _ in range(rows_per_class):
            vec = rng.normal(mean, std)
            vec = _clip_vector(vec)
            x_rows.append(vec)
            y_rows.append(label)

    return np.asarray(x_rows, dtype=np.float32), np.asarray(y_rows)


def _augment_feature_vector(base_vector: np.ndarray, copies: int, rng: np.random.Generator) -> List[np.ndarray]:
    variants = []
    for _ in range(copies):
        aug = base_vector + rng.normal(0.0, FEATURE_JITTER_STD)
        variants.append(_clip_vector(aug))
    return variants


def _load_real_plant_dataset(dataset_dir: Path, feature_augments: int = 6) -> Tuple[np.ndarray, np.ndarray, Dict[str, int], int]:
    if not dataset_dir.exists() or not dataset_dir.is_dir():
        return np.empty((0, 10), dtype=np.float32), np.asarray([]), {}, 0

    rng = np.random.default_rng(123)
    x_rows: List[np.ndarray] = []
    y_rows: List[str] = []
    class_counts: Dict[str, int] = {}
    skipped = 0

    class_dirs = sorted([path for path in dataset_dir.iterdir() if path.is_dir()])
    for class_dir in class_dirs:
        label = class_dir.name.strip().lower().replace(" ", "_")
        class_counts.setdefault(label, 0)

        image_paths = sorted(
            [
                path
                for path in class_dir.rglob("*")
                if path.is_file() and path.suffix.lower() in SUPPORTED_IMAGE_EXTENSIONS
            ]
        )

        for image_path in image_paths:
            try:
                feature_bundle = extract_plant_features_from_file(image_path)
                base_vec = build_plant_model_vector(feature_bundle)
                base_vec = _clip_vector(base_vec)
            except Exception:
                skipped += 1
                continue

            x_rows.append(base_vec)
            y_rows.append(label)
            class_counts[label] += 1

            for aug_vec in _augment_feature_vector(base_vec, feature_augments, rng):
                x_rows.append(aug_vec)
                y_rows.append(label)

    if not x_rows:
        return np.empty((0, 10), dtype=np.float32), np.asarray([]), class_counts, skipped

    return np.asarray(x_rows, dtype=np.float32), np.asarray(y_rows), class_counts, skipped


def train_plant_model(model_dir: Path, dataset_dir: Path) -> Dict[str, Any]:
    real_x, real_y, real_class_counts, skipped = _load_real_plant_dataset(dataset_dir)
    synthetic_x, synthetic_y = _synthetic_plant_samples(rows_per_class=2200 if len(real_y) == 0 else 700)

    if len(real_y) > 0:
        x = np.vstack([real_x, synthetic_x])
        y = np.concatenate([real_y, synthetic_y])
    else:
        x, y = synthetic_x, synthetic_y

    class_counts = {label: int(np.sum(y == label)) for label in sorted(set(y.tolist()))}

    classifier = _build_plant_classifier()

    min_class_count = min(class_counts.values()) if class_counts else 0
    if len(y) >= 50 and min_class_count >= 2:
        x_train, x_test, y_train, y_test = train_test_split(
            x,
            y,
            test_size=0.2,
            random_state=101,
            stratify=y,
        )
        classifier.fit(x_train, y_train)
        test_pred = classifier.predict(x_test)
        val_accuracy = float(round(accuracy_score(y_test, test_pred), 4))
    else:
        classifier.fit(x, y)
        val_accuracy = None

    model_payload = {
        "model": classifier,
        "classes": sorted(set(y.tolist())),
        "featureVersion": "plant_features_v3",
    }
    joblib.dump(model_payload, model_dir / "plant_vision_model.joblib")

    return {
        "plantModelTrained": True,
        "plantDatasetPath": str(dataset_dir),
        "plantUsedRealImages": bool(len(real_y) > 0),
        "plantRealImageCount": int(sum(real_class_counts.values())),
        "plantSyntheticCount": int(len(synthetic_y)),
        "plantTrainingSamples": int(len(y)),
        "plantValidationAccuracy": val_accuracy,
        "plantClasses": sorted(set(y.tolist())),
        "plantClassDistribution": class_counts,
        "plantSkippedImages": int(skipped),
    }


def train_and_save(model_dir: Path, plant_dataset_dir: Path | None = None) -> Dict[str, Any]:
    model_dir.mkdir(parents=True, exist_ok=True)

    crop_df = build_crop_dataset()
    crop_x = crop_df[["soilType", "rainfall", "temperature", "region"]]
    crop_y = crop_df["target"]

    crop_pipeline = _build_crop_pipeline()
    crop_pipeline.fit(crop_x, crop_y)
    joblib.dump(crop_pipeline, model_dir / "crop_model.joblib")

    fert_df = build_fertilizer_dataset()
    fert_x = fert_df[["crop", "n", "p", "k"]]
    fert_y = fert_df["target"]

    fert_pipeline = _build_fertilizer_pipeline()
    fert_pipeline.fit(fert_x, fert_y)
    joblib.dump(fert_pipeline, model_dir / "fertilizer_model.joblib")

    intent_df = pd.DataFrame(INTENT_DATA, columns=["text", "intent"])
    intent_pipeline = _build_intent_pipeline()
    intent_pipeline.fit(intent_df["text"], intent_df["intent"])
    joblib.dump(intent_pipeline, model_dir / "intent_model.joblib")

    if plant_dataset_dir is None:
        plant_dataset_dir = Path("data") / "plant_dataset"

    plant_info = train_plant_model(model_dir, plant_dataset_dir)

    metadata: Dict[str, Any] = {
        "version": "v2",
        "trainedAt": datetime.now(timezone.utc).isoformat(),
        "cropClasses": sorted(crop_y.unique().tolist()),
        "fertilizerClasses": sorted(fert_y.unique().tolist()),
        "intents": sorted(intent_df["intent"].unique().tolist()),
        **plant_info,
    }
    joblib.dump(metadata, model_dir / "metadata.joblib")

    return metadata
