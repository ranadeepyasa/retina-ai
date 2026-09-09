import os
import io
import pytest
from fastapi.testclient import TestClient
from PIL import Image

# Ensure test database
os.environ["DATABASE_URL"] = "sqlite:///./test_retina.db"
os.environ["DEMO_MODE"] = "true"
os.environ["UPLOAD_DIR"] = "./test_uploads"

from app.main import app
from app.database.session import Base, engine, SessionLocal
from app.services.demo_data import seed_demo_database

@pytest.fixture(scope="session", autouse=True)
def setup_test_environment():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed_demo_database(db, upload_dir="./test_uploads")
    db.close()
    yield
    # Cleanup
    try:
        if os.path.exists("test_retina.db"):
            os.remove("test_retina.db")
        if os.path.exists("test_uploads"):
            import shutil
            shutil.rmtree("test_uploads", ignore_errors=True)
    except Exception:
        pass

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c

def test_health(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

def test_login_demo_worker(client):
    res = client.post("/api/auth/login", json={
        "email": "worker@retinaai.org",
        "password": "demo123"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["role"] == "HEALTHCARE_WORKER"

def test_unauthorized_access(client):
    res = client.get("/api/dashboard/stats")
    assert res.status_code == 401

def test_create_and_list_patients(client):
    # Login
    login_res = client.post("/api/auth/login", json={
        "email": "worker@retinaai.org",
        "password": "demo123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create Patient
    p_res = client.post("/api/patients", json={
        "patient_code": "TEST-PATIENT-99",
        "age": 54,
        "sex": "Male",
        "diabetes_duration": "4 years",
        "notes": "Testing patient creation"
    }, headers=headers)
    assert p_res.status_code == 200
    p_data = p_res.json()
    assert p_data["patient_code"] == "TEST-PATIENT-99"

    # List Patients
    list_res = client.get("/api/patients?search=TEST-PATIENT-99", headers=headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1

def test_quality_check_and_invalid_image(client):
    login_res = client.post("/api/auth/login", json={
        "email": "worker@retinaai.org",
        "password": "demo123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Invalid file (not an image)
    text_file = io.BytesIO(b"Not an image file content")
    res_invalid = client.post(
        "/api/screenings/quality-check",
        files={"fundus_image": ("test.txt", text_file, "text/plain")},
        headers=headers
    )
    assert res_invalid.status_code == 400

    # 2. Valid image bytes (synthetic RGB)
    img = Image.new("RGB", (300, 300), color=(180, 70, 30))
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='JPEG')
    img_byte_arr.seek(0)

    res_valid = client.post(
        "/api/screenings/quality-check",
        files={"fundus_image": ("sample.jpg", img_byte_arr, "image/jpeg")},
        headers=headers
    )
    assert res_valid.status_code == 200
    qc = res_valid.json()
    assert "image_quality" in qc
    assert "quality_score" in qc

def test_screening_analyze_and_gradcam(client):
    login_res = client.post("/api/auth/login", json={
        "email": "worker@retinaai.org",
        "password": "demo123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Generate synthetic fundus image
    img = Image.new("RGB", (400, 400), color=(160, 60, 20))
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='JPEG')
    img_byte_arr.seek(0)

    res = client.post(
        "/api/screenings/analyze",
        data={
            "patient_code": "TEST-PATIENT-99",
            "age": 54,
            "sex": "Male"
        },
        files={"fundus_image": ("moderate_test.jpg", img_byte_arr, "image/jpeg")},
        headers=headers
    )
    assert res.status_code == 200
    data = res.json()
    assert "screening_id" in data
    assert "prediction" in data
    assert "confidence" in data
    assert "probabilities" in data
    assert "gradcam_image_url" in data
    assert "original_image_url" in data
