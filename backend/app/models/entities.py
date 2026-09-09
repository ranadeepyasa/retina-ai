from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
)
from sqlalchemy.orm import relationship
from app.database.session import Base

def get_utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="HEALTHCARE_WORKER")  # HEALTHCARE_WORKER, ADMINISTRATOR
    facility = Column(String(150), nullable=True, default="Rural Health Center")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=get_utc_now)

    screenings = relationship("Screening", back_populates="creator", foreign_keys="Screening.created_by")

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    patient_code = Column(String(50), unique=True, index=True, nullable=False)
    age = Column(Integer, nullable=False)
    sex = Column(String(20), nullable=False)  # Male, Female, Other
    diabetes_duration = Column(String(50), nullable=True)  # e.g., "5 years"
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=get_utc_now)

    screenings = relationship("Screening", back_populates="patient", cascade="all, delete-orphan", order_by="desc(Screening.created_at)")

class Screening(Base):
    __tablename__ = "screenings"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    uploaded_image_path = Column(String(255), nullable=False)
    image_quality = Column(String(50), default="GOOD_QUALITY")  # GOOD_QUALITY, POOR_QUALITY
    quality_score = Column(Float, default=1.0)
    quality_notes = Column(String(255), nullable=True)
    status = Column(String(50), default="ANALYZED")  # ANALYZED, PENDING_REVIEW, REVIEWED, REFERRED
    referral_urgency = Column(String(50), default="NONE")  # NONE, ROUTINE, SEMI_URGENT, URGENT
    reviewer_notes = Column(Text, nullable=True)
    reviewed_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_by = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=get_utc_now)

    patient = relationship("Patient", back_populates="screenings")
    creator = relationship("User", foreign_keys=[created_by], back_populates="screenings")
    reviewer = relationship("User", foreign_keys=[reviewed_by])
    prediction = relationship("Prediction", back_populates="screening", uselist=False, cascade="all, delete-orphan")

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    screening_id = Column(Integer, ForeignKey("screenings.id", ondelete="CASCADE"), unique=True, nullable=False)
    predicted_class = Column(Integer, nullable=False)  # 0 to 4
    predicted_label = Column(String(100), nullable=False)
    confidence = Column(Float, nullable=False)
    probability_json = Column(Text, nullable=False)  # JSON string of class -> probability
    gradcam_path = Column(String(255), nullable=True)
    model_version = Column(String(50), default="EfficientNet-B0-v1.0")
    is_demo_model = Column(Boolean, default=True)
    interpretation = Column(Text, nullable=True)
    suggested_action = Column(Text, nullable=True)
    created_at = Column(DateTime, default=get_utc_now)

    screening = relationship("Screening", back_populates="prediction")

class ModelVersion(Base):
    __tablename__ = "model_versions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    version = Column(String(50), nullable=False)
    architecture = Column(String(100), default="EfficientNet-B0")
    metrics_json = Column(Text, nullable=True)  # JSON accuracy, sensitivity, etc.
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=get_utc_now)
