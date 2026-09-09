import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from app.database.session import Base, engine, SessionLocal
from app.models.entities import User, Patient, Screening, Prediction, ModelVersion
from app.services.demo_data import seed_demo_database
from app.api import auth, patients, screenings, dashboard, admin, images

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure tables exist & seed demo data if in demo mode
    print("[RetinaAI] Initializing database schema...")
    Base.metadata.create_all(bind=engine)
    
    upload_dir = os.getenv("UPLOAD_DIR", "./uploads")
    os.makedirs(upload_dir, exist_ok=True)
    
    demo_mode = os.getenv("DEMO_MODE", "true").lower() == "true"
    if demo_mode:
        db = SessionLocal()
        try:
            print("[RetinaAI] Seeding demo baseline records (DEMO-001, DEMO-002, DEMO-003)...")
            seed_demo_database(db, upload_dir)
            print("[RetinaAI] Seeding completed successfully.")
        except Exception as e:
            print(f"[RetinaAI] Notice during seed: {e}")
        finally:
            db.close()
            
    yield
    print("[RetinaAI] Shutting down application.")

app = FastAPI(
    title="RetinaAI - Explainable Diabetic Retinopathy Screening API",
    description=(
        "Production-style backend API for AI-assisted Diabetic Retinopathy screening "
        "and Grad-CAM visual explainability in rural primary health centres. "
        "Smart India Hackathon MedTech Project."
    ),
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
cors_origins_str = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000")
origins = [o.strip() for o in cors_origins_str.split(",") if o.strip()]
origin_regex = os.getenv("CORS_ORIGIN_REGEX", r"https://.*\.vercel\.app")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_origin_regex=origin_regex if origin_regex else None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers under /api
app.include_router(auth.router, prefix="/api")
app.include_router(patients.router, prefix="/api")
app.include_router(screenings.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(images.router, prefix="/api")

@app.get("/")
def root():
    return {
        "project": "RetinaAI - Explainable AI for Diabetic Retinopathy Screening in Rural India",
        "role": "AI-Assisted Screening and Referral Support Tool",
        "status": "online",
        "demo_mode": os.getenv("DEMO_MODE", "true").lower() == "true",
        "api_docs": "/docs",
        "safety_disclaimer": "AI results are preliminary screening outputs and do not replace professional examination by an ophthalmologist."
    }

@app.get("/api/health")
def health():
    return {"status": "healthy", "service": "RetinaAI Clinical Backend"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
