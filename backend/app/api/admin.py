import os
import json
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database.session import get_db
from app.models.entities import User, Screening, Prediction, Patient, ModelVersion
from app.schemas.auth import UserOut
from app.schemas.admin import (
    AdminUserUpdate, AdminAnalytics, ModelPerformanceMetrics,
    SeverityDistribution, ImageQualityStats, TimeSeriesPoint
)
from app.auth.deps import get_current_admin
from app.services.demo_data import clear_demo_data

router = APIRouter(prefix="/admin", tags=["Administrator"])

METRICS_PATH = os.getenv("METRICS_PATH", "./models/metrics.json")

@router.get("/users", response_model=list[UserOut])
def get_all_users(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    users = db.query(User).order_by(User.created_at.desc()).all()
    return users

@router.patch("/users/{user_id}", response_model=UserOut)
def update_user(
    user_id: int,
    user_update: AdminUserUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user_update.name is not None:
        user.name = user_update.name
    if user_update.role is not None:
        user.role = user_update.role
    if user_update.facility is not None:
        user.facility = user_update.facility
    if user_update.is_active is not None:
        user.is_active = user_update.is_active

    db.commit()
    db.refresh(user)
    return user

@router.get("/analytics", response_model=AdminAnalytics)
def get_admin_analytics(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    now = datetime.now(timezone.utc)
    today_start = datetime(now.year, now.month, now.day, tzinfo=timezone.utc)

    total_users = db.query(User).count()
    total_screenings = db.query(Screening).count()
    screenings_today = db.query(Screening).filter(Screening.created_at >= today_start).count()
    referrals_suggested = db.query(Screening).filter(
        Screening.referral_urgency.in_(["ROUTINE", "SEMI_URGENT", "URGENT"])
    ).count()

    avg_conf_row = db.query(func.avg(Prediction.confidence)).scalar()
    avg_conf = float(avg_conf_row) if avg_conf_row is not None else 0.88

    # Severity distribution
    sev_counts = {0: 0, 1: 0, 2: 0, 3: 0, 4: 0}
    preds = db.query(Prediction.predicted_class, func.count(Prediction.id)).group_by(Prediction.predicted_class).all()
    for p_class, cnt in preds:
        if p_class in sev_counts:
            sev_counts[p_class] = cnt

    severity_dist = SeverityDistribution(
        no_dr=sev_counts[0],
        mild=sev_counts[1],
        moderate=sev_counts[2],
        severe=sev_counts[3],
        proliferative=sev_counts[4]
    )

    # Quality stats
    good_q = db.query(Screening).filter(Screening.image_quality == "GOOD_QUALITY").count()
    poor_q = db.query(Screening).filter(Screening.image_quality == "POOR_QUALITY").count()
    total_q = good_q + poor_q
    good_rate = round((good_q / total_q * 100), 1) if total_q > 0 else 100.0

    quality_stats = ImageQualityStats(
        good_quality=good_q,
        poor_quality=poor_q,
        good_rate_percent=good_rate
    )

    # Time series (last 7 days)
    timeline = []
    for i in range(6, -1, -1):
        day_date = now - timedelta(days=i)
        day_start = datetime(day_date.year, day_date.month, day_date.day, tzinfo=timezone.utc)
        day_end = day_start + timedelta(days=1)
        
        day_scr = db.query(Screening).filter(
            Screening.created_at >= day_start,
            Screening.created_at < day_end
        ).count()

        day_ref = db.query(Screening).filter(
            Screening.created_at >= day_start,
            Screening.created_at < day_end,
            Screening.referral_urgency.in_(["ROUTINE", "SEMI_URGENT", "URGENT"])
        ).count()

        timeline.append(TimeSeriesPoint(
            date=day_start.strftime("%b %d"),
            screenings=day_scr,
            referrals=day_ref
        ))

    return AdminAnalytics(
        total_users=total_users,
        total_screenings=total_screenings,
        screenings_today=screenings_today,
        referrals_suggested=referrals_suggested,
        avg_confidence=round(avg_conf, 3),
        severity_distribution=severity_dist,
        quality_stats=quality_stats,
        screenings_timeline=timeline
    )

@router.get("/model-performance", response_model=ModelPerformanceMetrics)
def get_model_performance(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """
    Reads evaluated model metrics dynamically from metrics.json if available.
    If no evaluated model metrics exist, strictly displays 'Not evaluated'
    with message: 'Model evaluation metrics will appear after evaluation on the held-out test set.'
    """
    possible_paths = [
        METRICS_PATH,
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "models", "metrics.json")),
        os.path.join(os.getcwd(), "models", "metrics.json"),
        os.path.join(os.getcwd(), "backend", "models", "metrics.json")
    ]
    resolved_metrics_path = None
    for p in possible_paths:
        if p and os.path.exists(p):
            resolved_metrics_path = p
            break

    if resolved_metrics_path:
        try:
            with open(resolved_metrics_path, "r") as f:
                data = json.load(f)
            return ModelPerformanceMetrics(
                model_name=data.get("model_name", "EfficientNet-B0 (Trained)"),
                version=data.get("version", "v1.0-evaluated"),
                architecture=data.get("architecture", "EfficientNet-B0 + Grad-CAM"),
                is_evaluated=True,
                status_message="Evaluation completed on held-out test set.",
                accuracy=data.get("accuracy"),
                precision=data.get("precision"),
                recall=data.get("recall"),
                f1_score=data.get("f1_score"),
                sensitivity=data.get("sensitivity"),
                specificity=data.get("specificity"),
                confusion_matrix=data.get("confusion_matrix"),
                per_class_metrics=data.get("per_class_metrics")
            )
        except Exception as e:
            print(f"[RetinaAI Admin] Failed to parse {resolved_metrics_path}: {e}")

    # Honest un-evaluated state
    return ModelPerformanceMetrics(
        model_name="EfficientNet-B0 (Prototype / Development)",
        version="v1.0-dev",
        architecture="EfficientNet-B0 Transfer Learning + Grad-CAM",
        is_evaluated=False,
        status_message="Model evaluation metrics will appear after evaluation on the held-out test set.",
        accuracy=None,
        precision=None,
        recall=None,
        f1_score=None,
        sensitivity=None,
        specificity=None,
        confusion_matrix=None,
        per_class_metrics=None
    )

@router.post("/clear-demo-data")
def handle_clear_demo_data(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    deleted_count = clear_demo_data(db)
    return {"message": f"Successfully cleared {deleted_count} demo patient records.", "deleted_count": deleted_count}
