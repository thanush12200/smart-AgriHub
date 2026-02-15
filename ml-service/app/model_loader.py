from pathlib import Path
from typing import Dict, Any

import joblib

from .training import train_and_save


class ModelStore:
    def __init__(self, model_dir: str = "models") -> None:
        self.model_dir = Path(model_dir)
        self.crop_model = None
        self.fertilizer_model = None
        self.intent_model = None
        self.plant_model = None
        self.metadata: Dict[str, Any] = {}

    def load(self) -> None:
        required = [
            self.model_dir / "crop_model.joblib",
            self.model_dir / "fertilizer_model.joblib",
            self.model_dir / "intent_model.joblib",
            self.model_dir / "metadata.joblib",
        ]

        if not all(path.exists() for path in required):
            self.metadata = train_and_save(self.model_dir)

        self.crop_model = joblib.load(self.model_dir / "crop_model.joblib")
        self.fertilizer_model = joblib.load(self.model_dir / "fertilizer_model.joblib")
        self.intent_model = joblib.load(self.model_dir / "intent_model.joblib")
        self.metadata = joblib.load(self.model_dir / "metadata.joblib")

        plant_model_path = self.model_dir / "plant_vision_model.joblib"
        if plant_model_path.exists():
            self.plant_model = joblib.load(plant_model_path)
        else:
            self.plant_model = None
