from typing import List, Optional

from pydantic import BaseModel, Field


class CropPredictionRequest(BaseModel):
    N: float = Field(..., ge=0, le=150, description="Nitrogen ratio in soil")
    P: float = Field(..., ge=0, le=150, description="Phosphorous ratio in soil")
    K: float = Field(..., ge=0, le=210, description="Potassium ratio in soil")
    temperature: float = Field(..., ge=-10, le=60, description="Temperature in Celsius")
    humidity: float = Field(..., ge=0, le=100, description="Relative humidity %")
    ph: float = Field(..., ge=0, le=14, description="Soil pH value")
    rainfall: float = Field(..., ge=0, le=500, description="Rainfall in mm")


class FertilizerRequest(BaseModel):
    temperature: float = Field(..., ge=0, le=60)
    humidity: float = Field(..., ge=0, le=100)
    moisture: float = Field(..., ge=0, le=100)
    soilType: str
    cropType: str
    nitrogen: float = Field(..., ge=0, le=150)
    phosphorous: float = Field(..., ge=0, le=150)
    potassium: float = Field(..., ge=0, le=150)


class ChatQueryRequest(BaseModel):
    message: str
    context: Optional[List[str]] = []
    region: Optional[str] = "India"
    language: Optional[str] = "en"


class PlantDetectionRequest(BaseModel):
    imageBase64: str
    fileName: Optional[str] = "uploaded-image"
    mimeType: Optional[str] = None
