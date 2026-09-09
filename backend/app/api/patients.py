from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.session import get_db
from app.models.entities import Patient, Screening, User
from app.schemas.patient import PatientCreate, PatientOut, PatientUpdate
from app.auth.deps import get_current_user

router = APIRouter(prefix="/patients", tags=["Patients"])

@router.post("", response_model=PatientOut)
def create_patient(
    patient_in: PatientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    code = patient_in.patient_code.strip().upper()
    existing = db.query(Patient).filter(Patient.patient_code == code).first()
    if existing:
        return existing

    patient = Patient(
        patient_code=code,
        age=patient_in.age,
        sex=patient_in.sex,
        diabetes_duration=patient_in.diabetes_duration,
        notes=patient_in.notes
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient

@router.get("", response_model=List[PatientOut])
def list_patients(
    search: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Patient)
    if search:
        s = f"%{search.strip().upper()}%"
        query = query.filter(Patient.patient_code.ilike(s))
    
    patients = query.order_by(Patient.created_at.desc()).limit(limit).all()
    
    # Calculate screenings count for each
    results = []
    for p in patients:
        count = db.query(Screening).filter(Screening.patient_id == p.id).count()
        p_dict = {
            "id": p.id,
            "patient_code": p.patient_code,
            "age": p.age,
            "sex": p.sex,
            "diabetes_duration": p.diabetes_duration,
            "notes": p.notes,
            "created_at": p.created_at,
            "screenings_count": count
        }
        results.append(PatientOut(**p_dict))
    return results

@router.get("/{patient_id}")
def get_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    screenings = db.query(Screening).filter(Screening.patient_id == patient.id).order_by(Screening.created_at.desc()).all()
    
    timeline = []
    for s in screenings:
        timeline.append({
            "id": s.id,
            "created_at": s.created_at,
            "status": s.status,
            "referral_urgency": s.referral_urgency,
            "image_quality": s.image_quality,
            "prediction": {
                "predicted_class": s.prediction.predicted_class if s.prediction else None,
                "predicted_label": s.prediction.predicted_label if s.prediction else "Pending",
                "confidence": s.prediction.confidence if s.prediction else 0.0,
                "is_demo_model": s.prediction.is_demo_model if s.prediction else True,
            } if s.prediction else None
        })

    return {
        "id": patient.id,
        "patient_code": patient.patient_code,
        "age": patient.age,
        "sex": patient.sex,
        "diabetes_duration": patient.diabetes_duration,
        "notes": patient.notes,
        "created_at": patient.created_at,
        "timeline": timeline
    }
