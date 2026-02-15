from typing import List, Optional

from pydantic import BaseModel, Field


class CropPredictionRequest(BaseModel):
    soilType: str
    rainfall: float = Field(..., ge=0)
    temperature: float = Field(..., ge=-10, le=60)
    region: str


class FertilizerNPK(BaseModel):
    n: float = Field(..., ge=0)
    p: float = Field(..., ge=0)
    k: float = Field(..., ge=0)


class FertilizerRequest(BaseModel):
    crop: str
    npk: FertilizerNPK


class ChatQueryRequest(BaseModel):
    message: str
    context: Optional[List[str]] = []
    region: Optional[str] = "India"
    language: Optional[str] = "en"


class PlantDetectionRequest(BaseModel):
    imageBase64: str
    fileName: Optional[str] = "uploaded-image"
    mimeType: Optional[str] = None
