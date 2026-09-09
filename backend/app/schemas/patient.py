from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class PatientBase(BaseModel):
    patient_code: str
    age: int
    sex: str
    diabetes_duration: Optional[str] = None
    notes: Optional[str] = None

class PatientCreate(PatientBase):
    pass

class PatientUpdate(BaseModel):
    age: Optional[int] = None
    sex: Optional[str] = None
    diabetes_duration: Optional[str] = None
    notes: Optional[str] = None

class PatientOut(PatientBase):
    id: int
    created_at: datetime
    screenings_count: Optional[int] = 0
    model_config = ConfigDict(from_attributes=True)
