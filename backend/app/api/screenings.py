import os
import json
import uuid
import shutil
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query, status, Request
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from PIL import Image

from app.database.session import get_db
from app.models.entities import Screening, Prediction, Patient, User
from app.schemas.screening import (
    QualityCheckResponse, ScreeningOut, ScreeningUpdate, PredictionOut
)
from app.auth.deps import get_current_user
from app.ml.quality import assess_image_quality
from app.ml.model import predict, generate_gradcam, CLASS_LABELS
from app.services.pdf_report import generate_screening_pdf
from app.services.rate_limiter import screening_rate_limiter

router = APIRouter(prefix="/screenings", tags=["Screenings"])

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
MAX_FILE_SIZE = 15 * 1024 * 1024  # 15 MB
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png"}

def validate_image_file(file: UploadFile):
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Only JPEG and PNG retinal images are accepted."
        )
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file must have an image MIME type."
        )

def verify_pil_image(file_path: str):
    try:
        with Image.open(file_path) as img:
            img.verify()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Corrupted or invalid image file. Please upload a valid retinal fundus photograph."
        )

def build_image_url(relative_path: str) -> str:
    """Converts a local path in uploads into an accessible API URL"""
    if not relative_path:
        return ""
    norm = relative_path.replace("\\", "/")
    parts = norm.split("uploads/")
    sub_path = parts[-1] if len(parts) > 1 else norm
    return f"/api/images/{sub_path}"

@router.post("/quality-check", response_model=QualityCheckResponse)
async def check_quality(
    request: Request,
    fundus_image: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    screening_rate_limiter.check(request, custom_limit=30)
    validate_image_file(fundus_image)

    # Save temporary file for quality assessment
    temp_dir = os.path.join(UPLOAD_DIR, "temp")
    os.makedirs(temp_dir, exist_ok=True)
    temp_filename = f"temp_qc_{uuid.uuid4().hex}.jpg"
    temp_path = os.path.join(temp_dir, temp_filename)

    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(fundus_image.file, buffer)
        
        verify_pil_image(temp_path)
        qc_result = assess_image_quality(temp_path)
        return qc_result
    finally:
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass

@router.post("/analyze")
async def analyze_screening(
    request: Request,
    fundus_image: UploadFile = File(...),
    patient_id: Optional[int] = Form(None),
    patient_code: Optional[str] = Form(None),
    age: Optional[int] = Form(None),
    sex: Optional[str] = Form(None),
    diabetes_duration: Optional[str] = Form(None),
    notes: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    screening_rate_limiter.check(request, custom_limit=25)
    validate_image_file(fundus_image)

    # 1. Resolve or Create Patient
    patient = None
    if patient_id:
        patient = db.query(Patient).filter(Patient.id == patient_id).first()
    elif patient_code:
        code_clean = patient_code.strip().upper()
        patient = db.query(Patient).filter(Patient.patient_code == code_clean).first()
        if not patient:
            patient = Patient(
                patient_code=code_clean,
                age=age or 50,
                sex=sex or "Unknown",
                diabetes_duration=diabetes_duration,
                notes=notes
            )
            db.add(patient)
            db.commit()
            db.refresh(patient)
            
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Patient identification is required. Please specify patient_id or patient_code."
        )

    # 2. Setup Persistent Storage Directory for this screening
    screening_uuid = uuid.uuid4().hex[:10]
    screening_dir = os.path.join(UPLOAD_DIR, f"scr_{patient.patient_code}_{screening_uuid}")
    os.makedirs(screening_dir, exist_ok=True)

    # Save uploaded image with safe sanitized filename
    file_ext = os.path.splitext(fundus_image.filename or "")[1].lower() or ".jpg"
    orig_filename = f"fundus_original{file_ext}"
    orig_filepath = os.path.join(screening_dir, orig_filename)

    with open(orig_filepath, "wb") as buffer:
        shutil.copyfileobj(fundus_image.file, buffer)

    # Verify PIL integrity
    verify_pil_image(orig_filepath)

    # 3. Perform Image Quality Check
    qc_result = assess_image_quality(orig_filepath)

    # 4. Perform ML Inference
    pred_result = predict(orig_filepath)
    predicted_class = pred_result["predicted_class"]

    # 5. Generate Grad-CAM Heatmap
    gradcam_filename = "gradcam_overlay.jpg"
    gradcam_filepath = os.path.join(screening_dir, gradcam_filename)
    generate_gradcam(orig_filepath, gradcam_filepath, predicted_class)

    # 6. Persist to Database
    screening = Screening(
        patient_id=patient.id,
        uploaded_image_path=orig_filepath,
        image_quality=qc_result["image_quality"],
        quality_score=qc_result["quality_score"],
        quality_notes=qc_result["message"],
        status="ANALYZED",
        referral_urgency=pred_result["referral_urgency"],
        created_by=current_user.id
    )
    db.add(screening)
    db.commit()
    db.refresh(screening)

    prediction = Prediction(
        screening_id=screening.id,
        predicted_class=predicted_class,
        predicted_label=pred_result["predicted_label"],
        confidence=pred_result["confidence"],
        probability_json=json.dumps(pred_result["probabilities"]),
        gradcam_path=gradcam_filepath,
        model_version=pred_result["model_version"],
        is_demo_model=pred_result["is_demo_model"],
        interpretation=pred_result["interpretation"],
        suggested_action=pred_result["suggested_action"]
    )
    db.add(prediction)
    db.commit()
    db.refresh(prediction)

    return {
        "screening_id": screening.id,
        "patient_id": patient.id,
        "patient_code": patient.patient_code,
        "prediction": pred_result["predicted_label"],
        "class_id": predicted_class,
        "confidence": pred_result["confidence"],
        "probabilities": pred_result["probabilities"],
        "image_quality": qc_result["image_quality"],
        "quality_score": qc_result["quality_score"],
        "quality_message": qc_result["message"],
        "original_image_url": build_image_url(orig_filepath),
        "gradcam_image_url": build_image_url(gradcam_filepath),
        "interpretation": pred_result["interpretation"],
        "suggested_action": pred_result["suggested_action"],
        "referral_urgency": pred_result["referral_urgency"],
        "is_demo_model": pred_result["is_demo_model"],
        "model_version": pred_result["model_version"],
        "timestamp": screening.created_at.isoformat()
    }

@router.get("")
def list_screenings(
    severity: Optional[int] = Query(None, ge=0, le=4),
    status: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Screening).join(Patient)
    
    if search:
        s = f"%{search.strip().upper()}%"
        query = query.filter(Patient.patient_code.ilike(s))
        
    if status:
        query = query.filter(Screening.status == status.upper())
        
    if severity is not None:
        query = query.join(Prediction).filter(Prediction.predicted_class == severity)

    screenings = query.order_by(Screening.created_at.desc()).limit(limit).all()

    results = []
    for s in screenings:
        creator_name = s.creator.name if s.creator else "Healthcare Worker"
        pred = s.prediction
        
        prob_dict = {}
        if pred and pred.probability_json:
            try:
                prob_dict = json.loads(pred.probability_json)
            except Exception:
                pass

        results.append({
            "id": s.id,
            "patient_id": s.patient_id,
            "patient": {
                "id": s.patient.id,
                "patient_code": s.patient.patient_code,
                "age": s.patient.age,
                "sex": s.patient.sex,
                "diabetes_duration": s.patient.diabetes_duration
            },
            "uploaded_image_url": build_image_url(s.uploaded_image_path),
            "image_quality": s.image_quality,
            "quality_score": s.quality_score,
            "quality_notes": s.quality_notes,
            "status": s.status,
            "referral_urgency": s.referral_urgency,
            "reviewer_notes": s.reviewer_notes,
            "created_by": s.created_by,
            "created_by_name": creator_name,
            "created_at": s.created_at,
            "prediction": {
                "id": pred.id,
                "predicted_class": pred.predicted_class,
                "predicted_label": pred.predicted_label,
                "confidence": pred.confidence,
                "probabilities": prob_dict,
                "gradcam_image_url": build_image_url(pred.gradcam_path),
                "model_version": pred.model_version,
                "is_demo_model": pred.is_demo_model,
                "interpretation": pred.interpretation,
                "suggested_action": pred.suggested_action,
                "created_at": pred.created_at
            } if pred else None
        })
    return results

@router.get("/{screening_id}")
def get_screening(
    screening_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    s = db.query(Screening).filter(Screening.id == screening_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Screening record not found")

    pred = s.prediction
    prob_dict = {}
    if pred and pred.probability_json:
        try:
            prob_dict = json.loads(pred.probability_json)
        except Exception:
            pass

    return {
        "id": s.id,
        "patient_id": s.patient_id,
        "patient": {
            "id": s.patient.id,
            "patient_code": s.patient.patient_code,
            "age": s.patient.age,
            "sex": s.patient.sex,
            "diabetes_duration": s.patient.diabetes_duration,
            "notes": s.patient.notes
        },
        "uploaded_image_url": build_image_url(s.uploaded_image_path),
        "image_quality": s.image_quality,
        "quality_score": s.quality_score,
        "quality_notes": s.quality_notes,
        "status": s.status,
        "referral_urgency": s.referral_urgency,
        "reviewer_notes": s.reviewer_notes,
        "created_by": s.created_by,
        "created_by_name": s.creator.name if s.creator else "Healthcare Worker",
        "created_at": s.created_at,
        "prediction": {
            "id": pred.id,
            "predicted_class": pred.predicted_class,
            "predicted_label": pred.predicted_label,
            "confidence": pred.confidence,
            "probabilities": prob_dict,
            "gradcam_image_url": build_image_url(pred.gradcam_path),
            "model_version": pred.model_version,
            "is_demo_model": pred.is_demo_model,
            "interpretation": pred.interpretation,
            "suggested_action": pred.suggested_action,
            "created_at": pred.created_at
        } if pred else None
    }

@router.patch("/{screening_id}")
def update_screening(
    screening_id: int,
    update_data: ScreeningUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    s = db.query(Screening).filter(Screening.id == screening_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Screening not found")

    if update_data.status is not None:
        s.status = update_data.status.upper()
    if update_data.referral_urgency is not None:
        s.referral_urgency = update_data.referral_urgency.upper()
    if update_data.reviewer_notes is not None:
        s.reviewer_notes = update_data.reviewer_notes
    s.reviewed_by = current_user.id

    db.commit()
    db.refresh(s)
    return {"message": "Screening updated successfully", "screening_id": s.id, "status": s.status}

@router.get("/{screening_id}/report")
def download_screening_report(
    screening_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    s = db.query(Screening).filter(Screening.id == screening_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Screening record not found")

    pred = s.prediction
    patient = s.patient
    
    # Target PDF path in screening folder
    scr_dir = os.path.dirname(s.uploaded_image_path)
    pdf_filename = f"RetinaAI_Report_SCR{s.id}_{patient.patient_code}.pdf"
    pdf_path = os.path.join(scr_dir, pdf_filename)

    screening_dict = {
        "id": s.id,
        "image_quality": s.image_quality,
        "referral_urgency": s.referral_urgency,
        "created_at": s.created_at
    }
    patient_dict = {
        "patient_code": patient.patient_code,
        "age": patient.age,
        "sex": patient.sex,
        "diabetes_duration": patient.diabetes_duration
    }
    prediction_dict = {
        "predicted_label": pred.predicted_label if pred else "Unclassified",
        "confidence": pred.confidence if pred else 0.0,
        "probabilities": pred.probability_json if pred else "{}",
        "interpretation": pred.interpretation if pred else "",
        "suggested_action": pred.suggested_action if pred else "",
        "is_demo_model": pred.is_demo_model if pred else True
    }

    generate_screening_pdf(
        pdf_output_path=pdf_path,
        screening_data=screening_dict,
        patient_data=patient_dict,
        prediction_data=prediction_dict,
        original_img_path=s.uploaded_image_path,
        gradcam_img_path=pred.gradcam_path if pred else "",
        reviewer_name=current_user.name
    )

    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename=pdf_filename
    )
