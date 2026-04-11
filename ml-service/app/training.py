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
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from .plant_features import (
    SUPPORTED_IMAGE_EXTENSIONS,
    build_plant_model_vector,
    extract_plant_features_from_file,
)

# ──────────────────────────────────────────────────────────────
# Crop Recommendation: 22 crops, 7 features (N,P,K,temp,humidity,ph,rainfall)
# Based on Kaggle "Crop Recommendation Dataset" by Atharva Ingle
# ──────────────────────────────────────────────────────────────

CROP_PROFILES: Dict[str, Dict[str, Tuple[float, float]]] = {
    # (mean, std) for each feature: N, P, K, temperature, humidity, ph, rainfall
    "rice":         {"N": (80, 12), "P": (48, 8),  "K": (40, 6),  "temperature": (23.5, 2.5), "humidity": (82, 5),   "ph": (6.5, 0.5), "rainfall": (230, 40)},
    "maize":        {"N": (78, 10), "P": (48, 8),  "K": (20, 4),  "temperature": (22.5, 3),   "humidity": (65, 8),   "ph": (6.3, 0.5), "rainfall": (88, 20)},
    "chickpea":     {"N": (40, 12), "P": (68, 8),  "K": (80, 8),  "temperature": (18.5, 2),   "humidity": (17, 4),   "ph": (7.1, 0.3), "rainfall": (80, 15)},
    "kidneybeans":  {"N": (20, 5),  "P": (68, 8),  "K": (20, 3),  "temperature": (20, 3),     "humidity": (22, 5),   "ph": (5.8, 0.4), "rainfall": (105, 20)},
    "pigeonpeas":   {"N": (20, 5),  "P": (68, 8),  "K": (20, 3),  "temperature": (27, 3),     "humidity": (48, 6),   "ph": (6.5, 0.4), "rainfall": (145, 25)},
    "mothbeans":    {"N": (21, 5),  "P": (48, 8),  "K": (20, 3),  "temperature": (28, 3),     "humidity": (48, 6),   "ph": (6.5, 0.6), "rainfall": (50, 12)},
    "mungbean":     {"N": (21, 4),  "P": (48, 8),  "K": (20, 3),  "temperature": (28.5, 2),   "humidity": (85, 3),   "ph": (6.7, 0.3), "rainfall": (48, 10)},
    "blackgram":    {"N": (40, 8),  "P": (68, 8),  "K": (20, 3),  "temperature": (30, 3),     "humidity": (65, 5),   "ph": (7.0, 0.3), "rainfall": (68, 12)},
    "lentil":       {"N": (20, 5),  "P": (68, 8),  "K": (20, 3),  "temperature": (24, 3),     "humidity": (65, 5),   "ph": (6.8, 0.5), "rainfall": (48, 12)},
    "pomegranate":  {"N": (20, 5),  "P": (10, 3),  "K": (40, 5),  "temperature": (21.5, 3),   "humidity": (90, 4),   "ph": (6.5, 0.5), "rainfall": (110, 15)},
    "banana":       {"N": (100, 10),"P": (82, 8),  "K": (50, 5),  "temperature": (27, 2),     "humidity": (80, 4),   "ph": (6.0, 0.4), "rainfall": (105, 15)},
    "mango":        {"N": (20, 5),  "P": (28, 5),  "K": (30, 5),  "temperature": (31, 3),     "humidity": (50, 6),   "ph": (5.8, 0.5), "rainfall": (95, 20)},
    "grapes":       {"N": (23, 5),  "P": (132, 10),"K": (200, 12),"temperature": (23.5, 5),   "humidity": (82, 3),   "ph": (6.0, 0.5), "rainfall": (70, 10)},
    "watermelon":   {"N": (100, 8), "P": (18, 5),  "K": (50, 5),  "temperature": (25.5, 2),   "humidity": (85, 3),   "ph": (6.5, 0.3), "rainfall": (50, 10)},
    "muskmelon":    {"N": (100, 8), "P": (18, 5),  "K": (50, 5),  "temperature": (28.5, 2),   "humidity": (92, 3),   "ph": (6.4, 0.3), "rainfall": (25, 8)},
    "apple":        {"N": (20, 5),  "P": (134, 8), "K": (200, 10),"temperature": (22.5, 3),   "humidity": (92, 3),   "ph": (6.0, 0.5), "rainfall": (112, 15)},
    "orange":       {"N": (20, 5),  "P": (10, 3),  "K": (10, 3),  "temperature": (22.5, 3),   "humidity": (92, 3),   "ph": (7.0, 0.3), "rainfall": (110, 15)},
    "papaya":       {"N": (50, 8),  "P": (58, 8),  "K": (50, 5),  "temperature": (33, 4),     "humidity": (92, 3),   "ph": (6.7, 0.3), "rainfall": (145, 25)},
    "coconut":      {"N": (22, 5),  "P": (18, 5),  "K": (30, 5),  "temperature": (27, 2),     "humidity": (95, 2),   "ph": (6.0, 0.4), "rainfall": (175, 30)},
    "cotton":       {"N": (120, 12),"P": (46, 8),  "K": (20, 4),  "temperature": (24, 3),     "humidity": (80, 4),   "ph": (7.0, 0.3), "rainfall": (80, 15)},
    "jute":         {"N": (78, 8),  "P": (46, 8),  "K": (40, 5),  "temperature": (25, 2),     "humidity": (80, 4),   "ph": (6.8, 0.3), "rainfall": (175, 20)},
    "coffee":       {"N": (101, 10),"P": (28, 5),  "K": (30, 5),  "temperature": (25.5, 2),   "humidity": (58, 5),   "ph": (6.5, 0.5), "rainfall": (165, 25)},
}

# ──────────────────────────────────────────────────────────────
# Fertilizer Recommendation: 7 fertilizer types
# Based on Kaggle "Fertilizer Prediction" by gdabhishek
# ──────────────────────────────────────────────────────────────

FERT_SOIL_TYPES = ["Sandy", "Loamy", "Black", "Red", "Clayey"]
FERT_CROP_TYPES = [
    "Sugarcane", "Cotton", "Millets", "Paddy", "Wheat",
    "Tobacco", "Barley", "Oil seeds", "Pulses", "Ground Nuts", "Maize",
]
FERT_NAMES = ["Urea", "DAP", "14-35-14", "28-28", "17-17-17", "20-20", "10-26-26"]

# Realistic fertilizer assignment rules based on agronomic guidelines
FERT_RULES: List[Dict[str, Any]] = [
    # Urea: high N deficit, moderate P and K
    {"fert": "Urea",     "n_range": (0, 35),  "p_range": (25, 70), "k_range": (25, 70), "temp_range": (20, 42), "humidity_range": (50, 80), "moisture_range": (25, 55)},
    # DAP: low-to-mid P, moderate N
    {"fert": "DAP",      "n_range": (25, 70), "p_range": (0, 30),  "k_range": (20, 65), "temp_range": (18, 40), "humidity_range": (40, 75), "moisture_range": (30, 60)},
    # 14-35-14: balanced need with emphasis on P
    {"fert": "14-35-14", "n_range": (15, 50), "p_range": (15, 50), "k_range": (15, 50), "temp_range": (22, 38), "humidity_range": (50, 85), "moisture_range": (35, 65)},
    # 28-28: balanced high need N and P
    {"fert": "28-28",    "n_range": (30, 70), "p_range": (30, 70), "k_range": (25, 60), "temp_range": (20, 35), "humidity_range": (55, 80), "moisture_range": (30, 55)},
    # 17-17-17: balanced NPK
    {"fert": "17-17-17", "n_range": (20, 55), "p_range": (20, 55), "k_range": (20, 55), "temp_range": (18, 36), "humidity_range": (45, 80), "moisture_range": (25, 60)},
    # 20-20: moderate balanced
    {"fert": "20-20",    "n_range": (25, 60), "p_range": (25, 60), "k_range": (15, 45), "temp_range": (22, 40), "humidity_range": (50, 75), "moisture_range": (30, 55)},
    # 10-26-26: low N, high P and K
    {"fert": "10-26-26", "n_range": (30, 80), "p_range": (0, 35),  "k_range": (0, 35),  "temp_range": (20, 38), "humidity_range": (40, 80), "moisture_range": (20, 55)},
]

# ──────────────────────────────────────────────────────────────
# Chatbot intent data: 6 intents, 100+ examples
# ──────────────────────────────────────────────────────────────

INTENT_DATA: List[Tuple[str, str]] = [
    # crop_query (18 examples)
    ("Which crop is best for high rainfall?", "crop_query"),
    ("Suggest crop for my black soil", "crop_query"),
    ("Can I grow millets in dry weather", "crop_query"),
    ("best crop for temperature 32", "crop_query"),
    ("What crop grows best in sandy soil with low rainfall?", "crop_query"),
    ("Recommend a crop for loamy soil in Karnataka", "crop_query"),
    ("Which crops need less water?", "crop_query"),
    ("What can I plant in acidic soil with pH 5.5?", "crop_query"),
    ("Best crop for humid conditions above 80%?", "crop_query"),
    ("I have red soil and 100mm rainfall, what should I plant?", "crop_query"),
    ("Tell me the best cash crop for my region", "crop_query"),
    ("Which pulse crops suit dry climate?", "crop_query"),
    ("Suggest a fruit crop for tropical weather", "crop_query"),
    ("What crop has the highest yield in black soil?", "crop_query"),
    ("Can I grow coffee in my area with 25 degree temperature?", "crop_query"),
    ("Which crop should I select for high NPK soil?", "crop_query"),
    ("Recommend crops for summer season in Maharashtra", "crop_query"),
    ("What crop is suitable for saline soil?", "crop_query"),

    # seasonal_advice (16 examples)
    ("What should I plant this season?", "seasonal_advice"),
    ("What is the rainy season crop in Karnataka", "seasonal_advice"),
    ("when should I sow paddy", "seasonal_advice"),
    ("Best time to plant wheat in Punjab?", "seasonal_advice"),
    ("When is kharif season and what crops to grow?", "seasonal_advice"),
    ("Is this a good time to plant cotton?", "seasonal_advice"),
    ("Rabi season crop suggestions for Bihar", "seasonal_advice"),
    ("What should I grow during monsoon?", "seasonal_advice"),
    ("When can I start sowing maize?", "seasonal_advice"),
    ("Which month is best for rice transplanting?", "seasonal_advice"),
    ("I missed kharif sowing, what can I plant now?", "seasonal_advice"),
    ("Summer planting options in South India", "seasonal_advice"),
    ("When to start nursery for paddy?", "seasonal_advice"),
    ("Ideal sowing window for chickpea?", "seasonal_advice"),
    ("Can I do intercropping in rabi season?", "seasonal_advice"),
    ("What are zaid season crops?", "seasonal_advice"),

    # disease_help (20 examples)
    ("How to treat leaf spots in tomato", "disease_help"),
    ("My plant leaves are yellow with fungus", "disease_help"),
    ("Powdery mildew solution", "disease_help"),
    ("plant disease with curling leaves", "disease_help"),
    ("Brown spots appearing on rice leaves", "disease_help"),
    ("My cotton plants have whitefly infestation", "disease_help"),
    ("How to control stem borer in maize?", "disease_help"),
    ("Leaves turning brown and dying from edges", "disease_help"),
    ("Yellow mosaic virus in my mungbean crop", "disease_help"),
    ("Root rot problem in sugarcane", "disease_help"),
    ("How do I treat blight in potato?", "disease_help"),
    ("Fungal infection spreading on wheat leaves", "disease_help"),
    ("Aphids are destroying my mustard crop", "disease_help"),
    ("My banana plants have panama wilt", "disease_help"),
    ("Bacterial leaf streak in rice field", "disease_help"),
    ("Red rust appearing on sugarcane", "disease_help"),
    ("Fruit borer damage in tomato", "disease_help"),
    ("Downy mildew on grape leaves", "disease_help"),
    ("My mango has anthracnose disease", "disease_help"),
    ("Nematode problem in vegetable garden", "disease_help"),

    # fertilizer_help (20 examples)
    ("I need fertilizer dosage for rice", "fertilizer_help"),
    ("Which fertilizer should I use for wheat", "fertilizer_help"),
    ("How much NPK for maize", "fertilizer_help"),
    ("Is DAP suitable for cotton", "fertilizer_help"),
    ("What is the right urea dosage for paddy?", "fertilizer_help"),
    ("Suggest organic fertilizer for tomato", "fertilizer_help"),
    ("How to apply potash fertilizer?", "fertilizer_help"),
    ("My soil has low nitrogen, what fertilizer?", "fertilizer_help"),
    ("Phosphorus deficiency remedy for wheat", "fertilizer_help"),
    ("Can I use compost instead of chemical fertilizer?", "fertilizer_help"),
    ("Best micronutrient mix for sugarcane", "fertilizer_help"),
    ("When should I apply top dressing of urea?", "fertilizer_help"),
    ("How much DAP per acre for groundnut?", "fertilizer_help"),
    ("Split dose schedule for NPK in maize", "fertilizer_help"),
    ("Zinc and boron deficiency signs and fertilizer", "fertilizer_help"),
    ("Vermicompost dosage for vegetable farming", "fertilizer_help"),
    ("Foliar spray schedule for cotton", "fertilizer_help"),
    ("Can I use 17-17-17 for all crops?", "fertilizer_help"),
    ("Basal dose recommendation for rice", "fertilizer_help"),
    ("How to calculate fertilizer requirement from soil test?", "fertilizer_help"),

    # irrigation_advice (15 examples)
    ("How often should I water my rice field?", "irrigation_advice"),
    ("Drip irrigation setup for cotton", "irrigation_advice"),
    ("What is the water requirement for sugarcane?", "irrigation_advice"),
    ("Best irrigation method for vegetable garden", "irrigation_advice"),
    ("How to manage water during drought?", "irrigation_advice"),
    ("When should I stop irrigation before wheat harvest?", "irrigation_advice"),
    ("Sprinkler vs drip irrigation for maize", "irrigation_advice"),
    ("How to prevent waterlogging in paddy?", "irrigation_advice"),
    ("Furrow irrigation tips for groundnut", "irrigation_advice"),
    ("Critical irrigation stages for mustard crop", "irrigation_advice"),
    ("Rainwater harvesting for small farm", "irrigation_advice"),
    ("How much water does banana need per week?", "irrigation_advice"),
    ("Irrigation scheduling based on soil moisture", "irrigation_advice"),
    ("Flood irrigation alternatives for rice", "irrigation_advice"),
    ("Can I use mulching to reduce irrigation?", "irrigation_advice"),

    # market_info (16 examples)
    ("What is the current price of wheat?", "market_info"),
    ("Where can I sell my rice crop?", "market_info"),
    ("Which mandi gives best price for cotton?", "market_info"),
    ("How to check MSP for paddy this year?", "market_info"),
    ("Government buying centers near me", "market_info"),
    ("Online platform to sell vegetables directly", "market_info"),
    ("Price trend for soybean this season", "market_info"),
    ("How to negotiate better price at mandi?", "market_info"),
    ("Cold storage facilities for perishable crops", "market_info"),
    ("When is the best time to sell maize for profit?", "market_info"),
    ("Export quality requirements for mango", "market_info"),
    ("How to get FPO membership for better prices?", "market_info"),
    ("Direct-to-consumer selling options for farmers", "market_info"),
    ("E-NAM registration process for farmers", "market_info"),
    ("Price forecast for commodities this quarter", "market_info"),
    ("How to reduce post-harvest losses and get better price?", "market_info"),
]


PLANT_CLASSES = ["rice", "wheat", "maize", "cotton", "sugarcane", "tomato"]

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

FEATURE_JITTER_STD = np.array([0.018, 0.022, 0.022, 0.028, 0.028, 0.018, 0.03, 0.04, 0.04, 0.05], dtype=np.float32)


# ──────────────────────────────────────────────────────────────
# Dataset builders
# ──────────────────────────────────────────────────────────────

def build_crop_dataset(rows_per_crop: int = 100) -> pd.DataFrame:
    """Generate realistic crop recommendation data based on real agronomic profiles."""
    rng = np.random.default_rng(42)
    data = []

    for crop, profile in CROP_PROFILES.items():
        for _ in range(rows_per_crop):
            row = {}
            for feat, (mean, std) in profile.items():
                val = float(rng.normal(mean, std))
                if feat in ("N", "P", "K"):
                    val = max(0, min(140, val))
                elif feat == "temperature":
                    val = max(8, min(45, val))
                elif feat == "humidity":
                    val = max(10, min(100, val))
                elif feat == "ph":
                    val = max(3.5, min(9.5, val))
                elif feat == "rainfall":
                    val = max(20, min(300, val))
                row[feat] = round(val, 2)
            row["label"] = crop
            data.append(row)

    return pd.DataFrame(data)


def build_fertilizer_dataset(rows: int = 2000) -> pd.DataFrame:
    """Generate realistic fertilizer recommendation data based on agronomic rules."""
    rng = np.random.default_rng(7)
    data = []

    for _ in range(rows):
        rule = FERT_RULES[rng.integers(0, len(FERT_RULES))]
        soil = rng.choice(FERT_SOIL_TYPES)
        crop = rng.choice(FERT_CROP_TYPES)

        temp = float(rng.uniform(*rule["temp_range"]))
        humidity = float(rng.uniform(*rule["humidity_range"]))
        moisture = float(rng.uniform(*rule["moisture_range"]))
        n = float(rng.uniform(*rule["n_range"]))
        p = float(rng.uniform(*rule["p_range"]))
        k = float(rng.uniform(*rule["k_range"]))

        # Add some noise to make it harder for model
        temp += float(rng.normal(0, 2))
        humidity += float(rng.normal(0, 3))
        moisture += float(rng.normal(0, 2))
        n += float(rng.normal(0, 5))
        p += float(rng.normal(0, 4))
        k += float(rng.normal(0, 4))

        data.append({
            "temperature": round(max(15, min(45, temp)), 1),
            "humidity": round(max(20, min(100, humidity)), 1),
            "moisture": round(max(10, min(80, moisture)), 1),
            "soilType": soil,
            "cropType": crop,
            "nitrogen": round(max(0, min(100, n)), 1),
            "phosphorous": round(max(0, min(100, p)), 1),
            "potassium": round(max(0, min(100, k)), 1),
            "fertilizerName": rule["fert"],
        })

    return pd.DataFrame(data)


# ──────────────────────────────────────────────────────────────
# ML pipeline builders
# ──────────────────────────────────────────────────────────────

def _build_crop_pipeline() -> Pipeline:
    """Crop prediction: 7 numeric features → 22 crop classes."""
    return Pipeline(
        steps=[
            ("scaler", StandardScaler()),
            (
                "model",
                RandomForestClassifier(
                    n_estimators=200,
                    max_depth=16,
                    min_samples_leaf=3,
                    random_state=42,
                    class_weight="balanced_subsample",
                ),
            ),
        ]
    )


def _build_fertilizer_pipeline() -> Pipeline:
    """Fertilizer prediction: 2 categorical + 6 numeric → 7 fertilizer classes."""
    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore"), ["soilType", "cropType"]),
            ("num", StandardScaler(), ["temperature", "humidity", "moisture", "nitrogen", "phosphorous", "potassium"]),
        ]
    )

    return Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("model", RandomForestClassifier(n_estimators=180, max_depth=14, random_state=11, class_weight="balanced")),
        ]
    )


def _build_intent_pipeline() -> Pipeline:
    return Pipeline(
        steps=[
            ("tfidf", TfidfVectorizer(ngram_range=(1, 2), min_df=1, max_features=2000)),
            ("model", LogisticRegression(max_iter=800, random_state=22, C=3.0)),
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


# ──────────────────────────────────────────────────────────────
# Plant vision helpers (unchanged)
# ──────────────────────────────────────────────────────────────

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


# ──────────────────────────────────────────────────────────────
# Master training function
# ──────────────────────────────────────────────────────────────

def train_and_save(model_dir: Path, plant_dataset_dir: Path | None = None) -> Dict[str, Any]:
    model_dir.mkdir(parents=True, exist_ok=True)

    # ── Crop model ──
    crop_df = build_crop_dataset(rows_per_crop=100)
    crop_features = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]
    crop_x = crop_df[crop_features]
    crop_y = crop_df["label"]

    crop_x_train, crop_x_test, crop_y_train, crop_y_test = train_test_split(
        crop_x, crop_y, test_size=0.2, random_state=42, stratify=crop_y
    )
    crop_pipeline = _build_crop_pipeline()
    crop_pipeline.fit(crop_x_train, crop_y_train)
    crop_accuracy = float(round(accuracy_score(crop_y_test, crop_pipeline.predict(crop_x_test)), 4))
    joblib.dump(crop_pipeline, model_dir / "crop_model.joblib")

    # ── Fertilizer model ──
    fert_df = build_fertilizer_dataset(rows=2000)
    fert_features = ["soilType", "cropType", "temperature", "humidity", "moisture", "nitrogen", "phosphorous", "potassium"]
    fert_x = fert_df[fert_features]
    fert_y = fert_df["fertilizerName"]

    fert_x_train, fert_x_test, fert_y_train, fert_y_test = train_test_split(
        fert_x, fert_y, test_size=0.2, random_state=11, stratify=fert_y
    )
    fert_pipeline = _build_fertilizer_pipeline()
    fert_pipeline.fit(fert_x_train, fert_y_train)
    fert_accuracy = float(round(accuracy_score(fert_y_test, fert_pipeline.predict(fert_x_test)), 4))
    joblib.dump(fert_pipeline, model_dir / "fertilizer_model.joblib")

    # ── Intent model ──
    intent_df = pd.DataFrame(INTENT_DATA, columns=["text", "intent"])
    intent_pipeline = _build_intent_pipeline()
    intent_pipeline.fit(intent_df["text"], intent_df["intent"])
    joblib.dump(intent_pipeline, model_dir / "intent_model.joblib")

    # ── Plant vision model ──
    if plant_dataset_dir is None:
        plant_dataset_dir = Path("data") / "plant_dataset"

    plant_info = train_plant_model(model_dir, plant_dataset_dir)

    metadata: Dict[str, Any] = {
        "version": "v3",
        "trainedAt": datetime.now(timezone.utc).isoformat(),
        "cropClasses": sorted(crop_y.unique().tolist()),
        "cropFeatures": crop_features,
        "cropTrainingSamples": len(crop_df),
        "cropValidationAccuracy": crop_accuracy,
        "fertilizerClasses": sorted(fert_y.unique().tolist()),
        "fertilizerFeatures": fert_features,
        "fertilizerTrainingSamples": len(fert_df),
        "fertilizerValidationAccuracy": fert_accuracy,
        "intents": sorted(intent_df["intent"].unique().tolist()),
        "intentSamples": len(intent_df),
        **plant_info,
    }
    joblib.dump(metadata, model_dir / "metadata.joblib")

    return metadata
