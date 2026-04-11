from typing import Dict, List

import numpy as np
import pandas as pd
from fastapi import FastAPI

from .model_loader import ModelStore
from .plant_features import build_plant_model_vector, extract_plant_features_from_base64
from .schemas import ChatQueryRequest, CropPredictionRequest, FertilizerRequest, PlantDetectionRequest

app = FastAPI(title="Smart Agri Hub ML Service", version="3.0.0")
store = ModelStore(model_dir="models")


SEASONAL_TIPS = {
    "kharif": "For Kharif season, prioritize paddy, maize, or cotton based on rainfall. Start seed treatment before sowing.",
    "rabi": "For Rabi season, wheat and pulses perform well with moderate irrigation and weed control.",
}

DISEASE_RULES = {
    "leaf spot": "Leaf spot often indicates fungal stress. Use copper-based fungicide and avoid overhead irrigation.",
    "yellow": "Yellow leaves may indicate nitrogen deficiency. Apply split nitrogen doses and check root health.",
    "wilt": "Wilting can be due to root rot or water stress. Improve drainage and use a bio-fungicide drench.",
    "powdery": "Powdery mildew control: sulfur spray in early morning and improve airflow between plants.",
    "blight": "For blight, remove affected plant parts. Apply mancozeb or copper oxychloride spray at 7-day intervals.",
    "rust": "Rust diseases spread in humid conditions. Apply propiconazole and improve plant spacing for air circulation.",
    "borer": "For stem/fruit borers, use pheromone traps for monitoring. Apply neem oil or Bt-based bio-pesticides.",
    "aphid": "Aphids can be controlled with neem oil spray or introducing ladybugs. Avoid excessive nitrogen fertilizer.",
    "mosaic": "Viral mosaic has no cure. Remove infected plants immediately. Control whitefly vectors with yellow sticky traps.",
    "rot": "Root rot needs improved drainage. Apply Trichoderma-based bio-fungicide and avoid waterlogging.",
}

ORGANIC_MAP = {
    "Urea": ["Composted farmyard manure", "Vermicompost tea", "Green manure (dhaincha/sunhemp)"],
    "DAP": ["Bone meal", "Rock phosphate with compost", "Fish meal"],
    "14-35-14": ["Jeevamrutham", "Panchagavya foliar spray"],
    "28-28": ["Vermicompost + bone meal blend", "Composted poultry manure"],
    "17-17-17": ["Jeevamrutham", "Fish amino acid blend", "Balanced compost mix"],
    "20-20": ["Mustard cake + wood ash", "Green manure incorporation"],
    "10-26-26": ["Rock phosphate + wood ash", "Banana peel compost + bone meal"],
    "MOP": ["Wood ash (controlled)", "Banana peel compost"],
    "NPK 19-19-19": ["Jeevamrutham", "Fish amino acid blend"],
    "Ammonium Sulphate": ["Mustard cake", "Green manure crops"],
}

# Ideal NPK ranges for crops (expanded)
IDEAL_NPK = {
    "rice":       {"n": 80, "p": 48, "k": 40},
    "wheat":      {"n": 55, "p": 30, "k": 30},
    "maize":      {"n": 78, "p": 48, "k": 20},
    "cotton":     {"n": 120, "p": 46, "k": 20},
    "sugarcane":  {"n": 70, "p": 40, "k": 50},
    "paddy":      {"n": 80, "p": 48, "k": 40},
    "millets":    {"n": 40, "p": 20, "k": 20},
    "barley":     {"n": 50, "p": 25, "k": 25},
    "tobacco":    {"n": 60, "p": 30, "k": 40},
    "pulses":     {"n": 20, "p": 60, "k": 20},
    "oil seeds":  {"n": 40, "p": 35, "k": 30},
    "ground nuts": {"n": 25, "p": 50, "k": 40},
}

LANGUAGE_SNIPPETS = {
    "hi": "सलाह: ",
    "kn": "ಸಲಹೆ: ",
    "ta": "ஆலோசனை: ",
    "te": "సలహా: ",
}

PLANT_PROFILES = {
    "rice": {
        "signature": np.array([0.31, 0.34, 0.66, 0.50, 0.68, 0.16]),
        "health": "Likely healthy",
        "care": [
            "Maintain shallow standing water during active growth stage.",
            "Monitor leaf tip yellowing for early nitrogen deficiency.",
            "Ensure good field drainage before harvest window.",
        ],
    },
    "wheat": {
        "signature": np.array([0.28, 0.40, 0.60, 0.46, 0.62, 0.14]),
        "health": "Likely healthy",
        "care": [
            "Schedule irrigation at crown root initiation stage.",
            "Check for rust symptoms on lower leaves.",
            "Apply split nutrient doses for better tillering.",
        ],
    },
    "maize": {
        "signature": np.array([0.30, 0.44, 0.58, 0.56, 0.69, 0.20]),
        "health": "Mild stress possible",
        "care": [
            "Inspect for leaf curling during afternoon heat stress.",
            "Keep potassium levels adequate during tasseling.",
            "Scout for stem borer and early pest patches.",
        ],
    },
    "cotton": {
        "signature": np.array([0.32, 0.39, 0.55, 0.47, 0.60, 0.22]),
        "health": "Mild stress possible",
        "care": [
            "Monitor pink bollworm and whitefly pressure weekly.",
            "Avoid waterlogging near root zone.",
            "Use balanced NPK to support boll formation.",
        ],
    },
    "sugarcane": {
        "signature": np.array([0.31, 0.38, 0.60, 0.52, 0.71, 0.13]),
        "health": "Likely healthy",
        "care": [
            "Ensure regular irrigation in dry spells.",
            "Monitor red rot symptoms in humid periods.",
            "Apply organic mulch to reduce evaporation losses.",
        ],
    },
    "tomato": {
        "signature": np.array([0.10, 0.43, 0.55, 0.41, 0.52, 0.30]),
        "health": "Disease watch advised",
        "care": [
            "Inspect lower canopy for early blight spots.",
            "Avoid overhead irrigation late in the day.",
            "Improve airflow between plants.",
        ],
    },
}

FEATURE_WEIGHTS = np.array([1.3, 1.3, 1.2, 1.2, 1.0, 0.8])
DEFAULT_PLANT_PROFILE = {
    "health": "General crop health check advised",
    "care": [
        "Monitor irrigation and avoid waterlogging.",
        "Inspect leaves weekly for disease or pest symptoms.",
        "Use balanced nutrients based on soil test.",
    ],
}

# Crop info metadata for richer prediction responses
CROP_INFO = {
    "rice": {"season": "Kharif", "waterNeed": "High", "growthDays": "120-150"},
    "maize": {"season": "Kharif/Rabi", "waterNeed": "Moderate", "growthDays": "80-110"},
    "chickpea": {"season": "Rabi", "waterNeed": "Low", "growthDays": "90-120"},
    "kidneybeans": {"season": "Rabi", "waterNeed": "Moderate", "growthDays": "90-120"},
    "pigeonpeas": {"season": "Kharif", "waterNeed": "Low", "growthDays": "120-180"},
    "mothbeans": {"season": "Kharif", "waterNeed": "Very Low", "growthDays": "60-90"},
    "mungbean": {"season": "Kharif/Zaid", "waterNeed": "Low", "growthDays": "60-75"},
    "blackgram": {"season": "Kharif", "waterNeed": "Low", "growthDays": "80-90"},
    "lentil": {"season": "Rabi", "waterNeed": "Low", "growthDays": "100-120"},
    "pomegranate": {"season": "Year-round", "waterNeed": "Moderate", "growthDays": "150-180"},
    "banana": {"season": "Year-round", "waterNeed": "High", "growthDays": "300-365"},
    "mango": {"season": "Summer fruit", "waterNeed": "Moderate", "growthDays": "100-150 (fruiting)"},
    "grapes": {"season": "Year-round", "waterNeed": "Moderate", "growthDays": "150-180"},
    "watermelon": {"season": "Summer", "waterNeed": "High", "growthDays": "80-90"},
    "muskmelon": {"season": "Summer", "waterNeed": "Moderate", "growthDays": "70-90"},
    "apple": {"season": "Temperate", "waterNeed": "Moderate", "growthDays": "150-180"},
    "orange": {"season": "Year-round", "waterNeed": "Moderate", "growthDays": "200-300"},
    "papaya": {"season": "Year-round", "waterNeed": "Moderate", "growthDays": "270-330"},
    "coconut": {"season": "Tropical", "waterNeed": "High", "growthDays": "365+"},
    "cotton": {"season": "Kharif", "waterNeed": "Moderate", "growthDays": "150-180"},
    "jute": {"season": "Kharif", "waterNeed": "High", "growthDays": "120-150"},
    "coffee": {"season": "Year-round", "waterNeed": "Moderate", "growthDays": "60-90 (cherry)"},
}


def _top_feature_importance(pipeline, feature_names: List[str] = None, top_n: int = 5) -> List[Dict[str, float]]:
    model = pipeline.named_steps["model"]
    importances = model.feature_importances_

    if feature_names is None:
        if hasattr(pipeline, "named_steps") and "preprocessor" in pipeline.named_steps:
            preprocessor = pipeline.named_steps["preprocessor"]
            feature_names = list(preprocessor.get_feature_names_out())
        else:
            feature_names = [f"feature_{i}" for i in range(len(importances))]

    ranked = np.argsort(importances)[::-1][:top_n]
    return [{"feature": str(feature_names[i] if i < len(feature_names) else f"f{i}"), "importance": float(round(importances[i], 4))} for i in ranked]


def _maybe_localize(text: str, language: str) -> str:
    prefix = LANGUAGE_SNIPPETS.get((language or "en").lower())
    if not prefix:
        return text
    return f"{prefix}{text}"


def _profile_for_crop(crop_name: str) -> Dict:
    return PLANT_PROFILES.get(crop_name, DEFAULT_PLANT_PROFILE)


def _fallback_detect_from_filename(file_name: str, reason: str = "image_unreadable") -> Dict:
    name = (file_name or "").lower()
    for crop_name in PLANT_PROFILES.keys():
        if crop_name in name:
            profile = _profile_for_crop(crop_name)
            return {
                "plant": crop_name,
                "confidence": 0.45,
                "healthStatus": profile["health"],
                "careTips": profile["care"],
                "topMatches": [{"crop": crop_name, "score": 0.45}],
                "source": "filename_hint",
                "message": f"Image parsing failed ({reason}). Prediction is based on filename hint only.",
                "modelVersion": store.metadata.get("version", "v1"),
            }

    default = _profile_for_crop("rice")
    return {
        "plant": "unknown",
        "confidence": 0.2,
        "healthStatus": "Uncertain - upload a clear JPG/PNG/WebP leaf image",
        "careTips": default["care"],
        "topMatches": [],
        "source": "fallback_unreadable",
        "message": f"Image parsing failed ({reason}). Try a clear close-up of one leaf in daylight.",
        "modelVersion": store.metadata.get("version", "v1"),
    }


def _decode_image_to_features(image_base64: str) -> tuple[np.ndarray, np.ndarray, Dict[str, float]]:
    bundle = extract_plant_features_from_base64(image_base64)
    summary = np.asarray(bundle["summary"], dtype=np.float32)
    model_vector = build_plant_model_vector(bundle)
    signals = bundle["signals"]  # type: ignore[assignment]
    return summary, model_vector, signals


def _predict_plant_with_model(model_vector: np.ndarray, signals: Dict[str, float]) -> Dict | None:
    model_payload = store.plant_model
    if model_payload is None:
        return None

    if isinstance(model_payload, dict):
        model = model_payload.get("model")
        classes = model_payload.get("classes")
    else:
        model = model_payload
        classes = None

    if model is None or not hasattr(model, "predict_proba"):
        return None

    probs = model.predict_proba([model_vector])[0]
    classes_arr = np.asarray(classes if classes is not None else getattr(model, "classes_", []))
    if classes_arr.size == 0:
        return None

    idx = np.argsort(probs)[::-1][:3]
    top_matches = [{"crop": str(classes_arr[i]), "score": float(round(float(probs[i]), 4))} for i in idx]

    best_idx = int(idx[0])
    best_crop = str(classes_arr[best_idx])
    confidence = float(round(float(probs[best_idx]), 4))
    margin = float(float(probs[idx[0]]) - float(probs[idx[1]])) if len(idx) > 1 else confidence

    tomato_scene_score = signals.get("tomatoSceneScore", 0.0)
    red_ratio = signals.get("redRatio", 0.0)
    green_ratio = signals.get("greenRatio", 0.0)
    mean_green = float(model_vector[0])

    if "tomato" in classes_arr and tomato_scene_score >= 0.72 and red_ratio >= 0.08 and (green_ratio >= 0.03 or mean_green >= 0.33):
        confidence = float(round(max(confidence, 0.68), 4))
        profile = _profile_for_crop("tomato")
        tomato_top = [{"crop": "tomato", "score": confidence}]
        tomato_top.extend([item for item in top_matches if item["crop"] != "tomato"][:2])
        return {
            "plant": "tomato",
            "confidence": confidence,
            "healthStatus": profile["health"],
            "careTips": profile["care"],
            "topMatches": tomato_top,
            "source": "plant_model+vision_rule",
            "modelVersion": store.metadata.get("version", "v1"),
            "message": "Tomato-specific visual cues detected from fruit/canopy color composition.",
        }

    if confidence < 0.55 or margin < 0.08:
        return {
            "plant": "unknown",
            "confidence": float(round(min(confidence, 0.54), 4)),
            "healthStatus": "Uncertain - current model confidence is low",
            "careTips": [
                "Capture one clear crop leaf or fruit cluster close-up.",
                "Avoid background clutter and shadows.",
                "Upload JPG/PNG/WEBP with good daylight.",
            ],
            "topMatches": top_matches,
            "source": "plant_model",
            "modelVersion": store.metadata.get("version", "v1"),
            "message": "Low-confidence prediction. Returning unknown to avoid wrong advisory.",
        }

    profile = _profile_for_crop(best_crop)
    return {
        "plant": best_crop,
        "confidence": confidence,
        "healthStatus": profile["health"],
        "careTips": profile["care"],
        "topMatches": top_matches,
        "source": "plant_model",
        "modelVersion": store.metadata.get("version", "v1"),
    }


def _detect_plant_from_features(features: np.ndarray, signals: Dict[str, float]) -> Dict:
    scored = []
    for crop_name, profile in PLANT_PROFILES.items():
        weighted_diff = (features - profile["signature"]) * FEATURE_WEIGHTS
        distance = float(np.linalg.norm(weighted_diff))
        score = float(round(1.0 / (1.0 + distance), 4))
        scored.append((crop_name, distance, score))

    scored.sort(key=lambda item: item[1])
    best_crop, best_distance, _ = scored[0]
    second_distance = scored[1][1] if len(scored) > 1 else best_distance + 0.15
    margin = max(0.0, second_distance - best_distance)
    confidence = float(round(min(0.95, max(0.35, (1 - best_distance) + (margin * 0.7))), 4))
    selected = PLANT_PROFILES[best_crop]
    top_matches = [{"crop": item[0], "score": item[2]} for item in scored[:3]]

    tomato_scene_score = signals.get("tomatoSceneScore", 0.0)
    red_ratio = signals.get("redRatio", 0.0)
    green_ratio = signals.get("greenRatio", 0.0)
    mean_green = float(features[0])

    if tomato_scene_score >= 0.72 and red_ratio >= 0.08 and (green_ratio >= 0.03 or mean_green >= 0.33):
        tomato_confidence = float(round(min(0.93, max(confidence, 0.58 + (tomato_scene_score * 0.28))), 4))
        tomato_top_matches = [{"crop": "tomato", "score": tomato_confidence}]
        tomato_top_matches.extend([item for item in top_matches if item["crop"] != "tomato"][:2])
        return {
            "plant": "tomato",
            "confidence": tomato_confidence,
            "healthStatus": _profile_for_crop("tomato")["health"],
            "careTips": _profile_for_crop("tomato")["care"],
            "topMatches": tomato_top_matches,
            "source": "vision_rule_enhanced",
            "modelVersion": store.metadata.get("version", "v1"),
            "message": "Tomato-specific visual cues detected (red fruit clusters with green canopy).",
        }

    if confidence < 0.55 or margin < 0.06:
        return {
            "plant": "unknown",
            "confidence": float(round(min(confidence, 0.54), 4)),
            "healthStatus": "Uncertain - image is ambiguous for current model",
            "careTips": [
                "Capture one crop/leaf closer with plain background.",
                "Avoid mixed-scene images containing many crop types.",
                "Use daylight and keep image in focus.",
            ],
            "topMatches": top_matches,
            "source": "vision_heuristic",
            "modelVersion": store.metadata.get("version", "v1"),
            "message": "Prediction confidence is low. Returning unknown to avoid incorrect crop advice.",
        }

    if best_distance > 0.85:
        return {
            "plant": "unknown",
            "confidence": float(round(min(confidence, 0.35), 4)),
            "healthStatus": "Uncertain - image quality or crop class mismatch",
            "careTips": [
                "Capture one leaf clearly with plain background.",
                "Use daylight and avoid blur or shadows.",
                "Try JPG, PNG, or WEBP image formats.",
            ],
            "topMatches": top_matches,
            "source": "vision_heuristic",
            "modelVersion": store.metadata.get("version", "v1"),
            "message": "Unable to confidently map this image to a supported crop class.",
        }

    return {
        "plant": best_crop,
        "confidence": confidence,
        "healthStatus": selected["health"],
        "careTips": selected["care"],
        "topMatches": top_matches,
        "source": "vision_heuristic",
        "modelVersion": store.metadata.get("version", "v1"),
    }


@app.on_event("startup")
def on_startup() -> None:
    store.load()


@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok", "service": "ml-service", "version": store.metadata.get("version", "v1")}


@app.post("/predict/crop")
def predict_crop(payload: CropPredictionRequest) -> Dict:
    features = pd.DataFrame(
        [
            {
                "N": payload.N,
                "P": payload.P,
                "K": payload.K,
                "temperature": payload.temperature,
                "humidity": payload.humidity,
                "ph": payload.ph,
                "rainfall": payload.rainfall,
            }
        ]
    )

    probs = store.crop_model.predict_proba(features)[0]
    labels = store.crop_model.classes_
    idx = np.argsort(probs)[::-1][:5]

    recommendations = []
    for i in idx:
        crop_name = str(labels[i])
        info = CROP_INFO.get(crop_name, {})
        recommendations.append({
            "crop": crop_name,
            "score": float(round(float(probs[i]), 4)),
            "season": info.get("season", "—"),
            "waterNeed": info.get("waterNeed", "—"),
            "growthDays": info.get("growthDays", "—"),
        })

    crop_features = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]

    return {
        "recommendations": recommendations,
        "confidence": recommendations[0]["score"],
        "featureImportance": _top_feature_importance(store.crop_model, feature_names=crop_features),
        "modelVersion": store.metadata.get("version", "v1"),
    }


@app.post("/predict/fertilizer")
def predict_fertilizer(payload: FertilizerRequest) -> Dict:
    features = pd.DataFrame(
        [
            {
                "soilType": payload.soilType,
                "cropType": payload.cropType,
                "temperature": payload.temperature,
                "humidity": payload.humidity,
                "moisture": payload.moisture,
                "nitrogen": payload.nitrogen,
                "phosphorous": payload.phosphorous,
                "potassium": payload.potassium,
            }
        ]
    )

    probs = store.fertilizer_model.predict_proba(features)[0]
    labels = store.fertilizer_model.classes_
    best_idx = int(np.argmax(probs))
    fertilizer = str(labels[best_idx])

    # Get top 3 recommendations
    sorted_idx = np.argsort(probs)[::-1][:3]
    alternatives = [{"name": str(labels[i]), "score": float(round(float(probs[i]), 4))} for i in sorted_idx]

    crop_key = payload.cropType.lower()
    ideal = IDEAL_NPK.get(crop_key, {"n": 55, "p": 35, "k": 35})
    deficits = {
        "n": max(0, ideal["n"] - payload.nitrogen),
        "p": max(0, ideal["p"] - payload.phosphorous),
        "k": max(0, ideal["k"] - payload.potassium),
    }

    dosage = round(25 + (deficits["n"] * 0.6) + (deficits["p"] * 0.5) + (deficits["k"] * 0.5), 2)

    return {
        "fertilizer": fertilizer,
        "dosageKgPerAcre": dosage,
        "organicAlternatives": ORGANIC_MAP.get(fertilizer, ["Compost", "Vermicompost"]),
        "confidence": float(round(float(probs[best_idx]), 4)),
        "alternatives": alternatives,
        "deficits": deficits,
        "modelVersion": store.metadata.get("version", "v1"),
    }


@app.post("/chatbot/query")
def chatbot_query(payload: ChatQueryRequest) -> Dict:
    message = payload.message.strip()
    lower = message.lower()

    intent_probs = store.intent_model.predict_proba([message])[0]
    intents = store.intent_model.classes_
    best_idx = int(np.argmax(intent_probs))
    confidence = float(intent_probs[best_idx])
    intent = str(intents[best_idx])

    source = "ml"
    if confidence >= 0.50:
        if intent == "crop_query":
            answer = (
                "Based on your conditions, shortlist drought-tolerant and region-suited crops. "
                "Share soil type, NPK levels, rainfall, temperature, humidity, and pH for a precise prediction."
            )
        elif intent == "fertilizer_help":
            answer = (
                "Use balanced NPK after soil testing. For immediate guidance, share crop, soil type, "
                "NPK values, temperature, humidity, and moisture to get dosage and organic alternatives."
            )
        elif intent == "disease_help":
            answer = (
                "Start with symptom isolation, remove infected leaves, and apply targeted bio-fungicide or pesticide "
                "based on observed symptom cluster."
            )
        elif intent == "irrigation_advice":
            answer = (
                "Irrigation needs depend on crop type, growth stage, and soil moisture. "
                "Drip irrigation is most efficient. Monitor soil moisture at root zone for optimal scheduling."
            )
        elif intent == "market_info":
            answer = (
                "Check e-NAM portal or local APMC mandi for current prices. "
                "Consider FPO membership for better negotiation power and direct market access."
            )
        else:
            season = "kharif" if any(token in lower for token in ["rain", "monsoon", "kharif"]) else "rabi"
            answer = SEASONAL_TIPS[season]
    else:
        source = "rules"
        confidence = max(confidence, 0.45)
        answer = "I need a bit more detail. "

        for key, rule_answer in DISEASE_RULES.items():
            if key in lower:
                answer = rule_answer
                break

        if "fertilizer" in lower or "npk" in lower or "urea" in lower:
            answer = "For fertilizer advice, provide crop name, soil type, and NPK values along with temperature, humidity, and moisture. I will suggest dosage per acre."
        elif "crop" in lower or "soil" in lower or "plant" in lower:
            answer = "For crop recommendation, share NPK levels, temperature, humidity, soil pH, and rainfall."
        elif "water" in lower or "irrigat" in lower:
            answer = "For irrigation advice, specify your crop, growth stage, and current soil moisture level."
        elif "price" in lower or "market" in lower or "sell" in lower:
            answer = "Check e-NAM portal or local APMC mandi for current market prices. I can help with general market guidance."

    if payload.context:
        answer = f"Considering recent context: {payload.context[-1]}. {answer}"

    answer = _maybe_localize(answer, payload.language or "en")

    return {
        "answer": answer,
        "confidence": round(confidence, 4),
        "source": source,
        "intent": intent,
    }


@app.post("/predict/plant")
def detect_plant(payload: PlantDetectionRequest) -> Dict:
    try:
        features, model_vector, signals = _decode_image_to_features(payload.imageBase64)
        model_prediction = _predict_plant_with_model(model_vector, signals)
        if model_prediction is not None:
            return model_prediction
        return _detect_plant_from_features(features, signals)
    except Exception as exc:
        return _fallback_detect_from_filename(payload.fileName or "uploaded-image", reason=str(exc))
