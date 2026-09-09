from pydantic import BaseModel
from typing import Optional, Dict, List, Any
from datetime import datetime

class AdminUserUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    facility: Optional[str] = None
    is_active: Optional[bool] = None

class SeverityDistribution(BaseModel):
    no_dr: int = 0
    mild: int = 0
    moderate: int = 0
    severe: int = 0
    proliferative: int = 0

class ImageQualityStats(BaseModel):
    good_quality: int = 0
    poor_quality: int = 0
    good_rate_percent: float = 0.0

class TimeSeriesPoint(BaseModel):
    date: str
    screenings: int
    referrals: int

class AdminAnalytics(BaseModel):
    total_users: int
    total_screenings: int
    screenings_today: int
    referrals_suggested: int
    avg_confidence: float
    severity_distribution: SeverityDistribution
    quality_stats: ImageQualityStats
    screenings_timeline: List[TimeSeriesPoint]

class ModelPerformanceMetrics(BaseModel):
    model_name: str
    version: str
    architecture: str
    is_evaluated: bool
    status_message: str
    accuracy: Optional[float] = None
    precision: Optional[float] = None
    recall: Optional[float] = None
    f1_score: Optional[float] = None
    sensitivity: Optional[float] = None
    specificity: Optional[float] = None
    confusion_matrix: Optional[List[List[int]]] = None
    per_class_metrics: Optional[Dict[str, Dict[str, float]]] = None
