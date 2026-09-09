from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, List
from datetime import datetime

class QualityCheckResponse(BaseModel):
    image_quality: str  # "GOOD_QUALITY" or "POOR_QUALITY"
    quality_score: float
    is_acceptable: bool
    message: str
    metrics: Dict[str, float]

class PredictionOut(BaseModel):
    id: int
    predicted_class: int  # 0 to 4
    predicted_label: str
    confidence: float
    probabilities: Dict[str, float]
    gradcam_image_url: Optional[str] = None
    model_version: str
    is_demo_model: bool
    interpretation: Optional[str] = None
    suggested_action: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class PatientMini(BaseModel):
    id: int
    patient_code: str
    age: int
    sex: str
    diabetes_duration: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class ScreeningOut(BaseModel):
    id: int
    patient_id: int
    patient: Optional[PatientMini] = None
    uploaded_image_url: str
    image_quality: str
    quality_score: float
    quality_notes: Optional[str] = None
    status: str
    referral_urgency: str
    reviewer_notes: Optional[str] = None
    created_by: int
    created_by_name: Optional[str] = None
    created_at: datetime
    prediction: Optional[PredictionOut] = None
    model_config = ConfigDict(from_attributes=True)

class ScreeningUpdate(BaseModel):
    status: Optional[str] = None
    referral_urgency: Optional[str] = None
    reviewer_notes: Optional[str] = None

class DashboardStats(BaseModel):
    todays_screenings: int
    pending_review: int
    referrals_suggested: int
    total_screenings: int
    avg_confidence: float
