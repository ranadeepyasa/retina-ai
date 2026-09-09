import os
import json
import numpy as np
from PIL import Image, ImageDraw
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session

from app.models.entities import User, Patient, Screening, Prediction, ModelVersion
from app.auth.security import get_password_hash
from app.ml.model import CLASS_LABELS, INTERPRETATIONS, ACTIONS, REFERRAL_URGENCIES
from app.ml.gradcam import generate_fundus_gradcam_overlay

def create_synthetic_fundus_image(output_path: str, severity: int = 0) -> str:
    """
    Generates a realistic synthetic retinal fundus photograph for demonstration purposes.
    Includes optic disc, macula, retinal vascular tree, and severity-specific lesions.
    """
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    w, h = 600, 600
    
    # 1. Base dark background with circular retinal field
    img = Image.new("RGB", (w, h), (10, 10, 14))
    draw = ImageDraw.Draw(img)
    
    # Circular retina aperture
    cx, cy, r = w // 2, h // 2, int(w * 0.46)
    
    # Gradient orange-red retinal background
    retina_bg = Image.new("RGB", (w, h), (0, 0, 0))
    retina_arr = np.zeros((h, w, 3), dtype=np.uint8)
    
    y, x = np.ogrid[:h, :w]
    dist_sq = (x - cx) ** 2 + (y - cy) ** 2
    in_circle = dist_sq <= r ** 2
    
    # Non-linear radial darkening toward periphery
    radial_factor = np.clip(1.0 - (dist_sq / (r ** 2 + 1e-5)) * 0.45, 0.0, 1.0)
    
    # Red-orange fundus coloring
    retina_arr[in_circle, 0] = (205 * radial_factor[in_circle]).astype(np.uint8)  # Red
    retina_arr[in_circle, 1] = (95 * radial_factor[in_circle]).astype(np.uint8)   # Green
    retina_arr[in_circle, 2] = (35 * radial_factor[in_circle]).astype(np.uint8)   # Blue
    
    img = Image.fromarray(retina_arr)
    draw = ImageDraw.Draw(img)
    
    # 2. Optic Disc (bright yellowish-pink oval on nasal side)
    od_x, od_y = int(cx - r * 0.42), cy - 15
    od_r = 38
    draw.ellipse([od_x - od_r, od_y - od_r, od_x + od_r, od_y + od_r], fill=(245, 215, 145))
    # Optic cup (paler center)
    draw.ellipse([od_x - 18, od_y - 18, od_x + 18, od_y + 18], fill=(255, 240, 190))
    
    # 3. Macula & Fovea (darker reddish-brown spot on temporal side)
    mac_x, mac_y = int(cx + r * 0.28), cy + 10
    mac_r = 50
    draw.ellipse([mac_x - mac_r, mac_y - mac_r, mac_x + mac_r, mac_y + mac_r], fill=(160, 55, 25))
    # Fovea centralis
    draw.ellipse([mac_x - 10, mac_y - 10, mac_x + 10, mac_y + 10], fill=(130, 40, 18))
    
    # 4. Retinal Blood Vessels radiating from Optic Disc
    vessel_color = (135, 25, 15)
    # Superior & Inferior temporal and nasal arcades
    points_sup_temp = [(od_x, od_y), (od_x + 60, od_y - 100), (od_x + 180, od_y - 160), (od_x + 300, od_y - 120), (cx + r - 40, cy - 80)]
    points_inf_temp = [(od_x, od_y), (od_x + 60, od_y + 100), (od_x + 180, od_y + 160), (od_x + 300, od_y + 130), (cx + r - 50, cy + 90)]
    points_sup_nasal = [(od_x, od_y), (od_x - 50, od_y - 90), (od_x - 90, od_y - 150)]
    points_inf_nasal = [(od_x, od_y), (od_x - 50, od_y + 90), (od_x - 85, od_y + 145)]
    
    for pts in [points_sup_temp, points_inf_temp]:
        draw.line(pts, fill=vessel_color, width=4)
    for pts in [points_sup_nasal, points_inf_nasal]:
        draw.line(pts, fill=vessel_color, width=3)
        
    # 5. Severity Specific Lesions
    if severity >= 1:
        # Microaneurysms: Tiny deep red dots
        np.random.seed(42 + severity)
        for _ in range(8 if severity == 1 else 25):
            mx = int(np.random.normal(mac_x, 70))
            my = int(np.random.normal(mac_y, 70))
            if (mx - cx)**2 + (my - cy)**2 < (r - 20)**2:
                draw.ellipse([mx-3, my-3, mx+3, my+3], fill=(110, 10, 10))

    if severity >= 2:
        # Moderate: Hard Exudates (bright yellow wax-like deposits) & Blot Hemorrhages
        for _ in range(12):
            ex_x = int(np.random.normal(mac_x + 40, 50))
            ex_y = int(np.random.normal(mac_y - 30, 50))
            draw.ellipse([ex_x-5, ex_y-4, ex_x+5, ex_y+4], fill=(245, 235, 110))
            
        for _ in range(10):
            bx = int(np.random.normal(cx, 110))
            by = int(np.random.normal(cy, 110))
            draw.ellipse([bx-7, by-6, bx+7, by+6], fill=(100, 12, 12))

    if severity >= 3:
        # Severe: Extensive Blot Hemorrhages & Cotton Wool Spots
        for _ in range(8):
            cwx = int(np.random.normal(cx + 40, 90))
            cwy = int(np.random.normal(cy - 60, 90))
            draw.ellipse([cwx-14, cwy-10, cwx+14, cwy+10], fill=(230, 220, 200))
            
        for _ in range(25):
            bx = int(np.random.normal(cx, 140))
            by = int(np.random.normal(cy, 140))
            draw.ellipse([bx-9, by-8, bx+9, by+8], fill=(90, 8, 8))

    if severity >= 4:
        # Proliferative: Vitreous/Pre-retinal hemorrhages and tortuous neovascularization
        draw.polygon([(mac_x - 30, cy + 40), (mac_x + 60, cy + 45), (mac_x + 40, cy + 80), (mac_x - 20, cy + 75)], fill=(85, 5, 5))
        for _ in range(12):
            nx = int(np.random.normal(od_x + 30, 35))
            ny = int(np.random.normal(od_y - 30, 35))
            draw.line([(nx, ny), (nx + 12, ny + 8), (nx + 20, ny - 4)], fill=(155, 20, 20), width=2)
            
    img.save(output_path, format="JPEG", quality=92)
    return output_path

def seed_demo_database(db: Session, upload_dir: str = "./uploads"):
    """
    Seeds the database with standard SIH demo credentials, demo patients,
    and initial screening records with synthetic fundus images and Grad-CAM overlays.
    """
    # 1. Seed Users
    worker = db.query(User).filter(User.email == "worker@retinaai.org").first()
    if not worker:
        worker = User(
            name="Priya Deshmukh (CHO)",
            email="worker@retinaai.org",
            password_hash=get_password_hash("demo123"),
            role="HEALTHCARE_WORKER",
            facility="Shirpur Primary Health Centre",
            is_active=True
        )
        db.add(worker)

    admin = db.query(User).filter(User.email == "admin@retinaai.org").first()
    if not admin:
        admin = User(
            name="Dr. Arvind Mehta",
            email="admin@retinaai.org",
            password_hash=get_password_hash("admin123"),
            role="ADMINISTRATOR",
            facility="District Tele-Ophthalmology Hub",
            is_active=True
        )
        db.add(admin)
        
    db.commit()
    db.refresh(worker)
    if admin:
        db.refresh(admin)

    # 2. Seed Demo Model Version
    m_ver = db.query(ModelVersion).filter(ModelVersion.version == "v1.0-demo").first()
    if not m_ver:
        m_ver = ModelVersion(
            name="EfficientNet-B0 (Development)",
            version="v1.0-demo",
            architecture="EfficientNet-B0 + Grad-CAM",
            metrics_json=json.dumps({
                "status": "Not evaluated",
                "message": "Model evaluation metrics will appear after evaluation on the held-out test set.",
                "is_evaluated": False
            }),
            is_active=True
        )
        db.add(m_ver)
        db.commit()

    # 3. Seed Demo Patients (DEMO-001, DEMO-002, DEMO-003)
    demo_patients_data = [
        {
            "code": "DEMO-001",
            "age": 48,
            "sex": "Female",
            "duration": "3 years",
            "notes": "Routine annual screening. Well managed HbA1c (6.8%). Asymptomatic.",
            "severity": 0,
            "quality": "GOOD_QUALITY",
            "status": "REVIEWED"
        },
        {
            "code": "DEMO-002",
            "age": 62,
            "sex": "Male",
            "duration": "11 years",
            "notes": "Type 2 diabetes for over a decade. Reports occasional blurred vision in left eye. HbA1c 8.4%.",
            "severity": 2,
            "quality": "GOOD_QUALITY",
            "status": "PENDING_REVIEW"
        },
        {
            "code": "DEMO-003",
            "age": 57,
            "sex": "Female",
            "duration": "16 years",
            "notes": "Irregular follow-ups. Uncontrolled glycemic profile. Noticed floater-like shadows in field of view.",
            "severity": 4,
            "quality": "GOOD_QUALITY",
            "status": "REFERRED"
        }
    ]

    sample_assets_dir = os.path.join(upload_dir, "samples")
    os.makedirs(sample_assets_dir, exist_ok=True)

    for p_info in demo_patients_data:
        existing_p = db.query(Patient).filter(Patient.patient_code == p_info["code"]).first()
        if not existing_p:
            p = Patient(
                patient_code=p_info["code"],
                age=p_info["age"],
                sex=p_info["sex"],
                diabetes_duration=p_info["duration"],
                notes=p_info["notes"]
            )
            db.add(p)
            db.commit()
            db.refresh(p)
            
            # Generate sample fundus photo & screening
            img_rel_dir = os.path.join(upload_dir, f"screening_demo_{p.id}")
            os.makedirs(img_rel_dir, exist_ok=True)
            
            orig_img_path = os.path.join(img_rel_dir, "fundus_original.jpg")
            create_synthetic_fundus_image(orig_img_path, severity=p_info["severity"])
            
            # Also save a copy to sample assets for easy user testing in upload wizard
            sample_copy_path = os.path.join(sample_assets_dir, f"{p_info['code'].lower()}_severity_{p_info['severity']}.jpg")
            if not os.path.exists(sample_copy_path):
                import shutil
                shutil.copy(orig_img_path, sample_copy_path)

            # Generate Grad-CAM overlay
            gradcam_img_path = os.path.join(img_rel_dir, "gradcam_overlay.jpg")
            generate_fundus_gradcam_overlay(orig_img_path, gradcam_img_path)

            sev = p_info["severity"]
            probabilities = {
                "No DR": 0.89 if sev == 0 else 0.03,
                "Mild": 0.07 if sev == 0 else (0.12 if sev == 2 else 0.02),
                "Moderate": 0.03 if sev == 0 else (0.78 if sev == 2 else 0.06),
                "Severe": 0.01 if sev == 0 else (0.05 if sev == 2 else 0.08),
                "Proliferative": 0.00 if sev == 0 else (0.02 if sev == 2 else 0.84)
            }
            short_names = ["No DR", "Mild", "Moderate", "Severe", "Proliferative"]
            conf = probabilities[short_names[sev]]

            screening = Screening(
                patient_id=p.id,
                uploaded_image_path=orig_img_path,
                image_quality="GOOD_QUALITY",
                quality_score=0.92,
                quality_notes="Image quality is sufficient for AI-assisted screening.",
                status=p_info["status"],
                referral_urgency=REFERRAL_URGENCIES[sev],
                reviewer_notes="Demo baseline screening record.",
                created_by=worker.id,
                created_at=datetime.now(timezone.utc) - timedelta(hours=3 * p.id)
            )
            db.add(screening)
            db.commit()
            db.refresh(screening)

            pred = Prediction(
                screening_id=screening.id,
                predicted_class=sev,
                predicted_label=CLASS_LABELS[sev],
                confidence=conf,
                probability_json=json.dumps(probabilities),
                gradcam_path=gradcam_img_path,
                model_version="EfficientNet-B0 (Demo/Development Mode)",
                is_demo_model=True,
                interpretation=INTERPRETATIONS[sev],
                suggested_action=ACTIONS[sev]
            )
            db.add(pred)
            db.commit()

def clear_demo_data(db: Session, upload_dir: str = "./uploads"):
    """
    Removes demo patients and demo screenings while keeping user accounts.
    """
    demo_patients = db.query(Patient).filter(Patient.patient_code.like("DEMO-%")).all()
    count = len(demo_patients)
    for p in demo_patients:
        # Screenings cascade delete
        db.delete(p)
    db.commit()
    return count
