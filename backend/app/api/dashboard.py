from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.session import get_db
from app.models.entities import Screening, Prediction, Patient, User
from app.schemas.screening import DashboardStats
from app.auth.deps import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    now = datetime.now(timezone.utc)
    today_start = datetime(now.year, now.month, now.day, tzinfo=timezone.utc)

    total_screenings = db.query(Screening).count()
    todays_screenings = db.query(Screening).filter(Screening.created_at >= today_start).count()
    pending_review = db.query(Screening).filter(Screening.status == "PENDING_REVIEW").count()
    
    # Referrals suggested: where referral_urgency is ROUTINE, SEMI_URGENT, or URGENT
    referrals_suggested = db.query(Screening).filter(
        Screening.referral_urgency.in_(["ROUTINE", "SEMI_URGENT", "URGENT"])
    ).count()

    # Average confidence
    avg_conf_row = db.query(func.avg(Prediction.confidence)).scalar()
    avg_conf = float(avg_conf_row) if avg_conf_row is not None else 0.88

    return {
        "todays_screenings": todays_screenings,
        "pending_review": pending_review,
        "referrals_suggested": referrals_suggested,
        "total_screenings": total_screenings,
        "avg_confidence": round(avg_conf, 3)
    }
