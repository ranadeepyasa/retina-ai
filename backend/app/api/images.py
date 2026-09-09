import os
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import FileResponse

router = APIRouter(prefix="/images", tags=["Images"])

UPLOAD_DIR = os.path.abspath(os.getenv("UPLOAD_DIR", "./uploads"))

@router.get("/{subpath:path}")
def serve_image(subpath: str):
    """
    Safely resolves and serves retinal images and Grad-CAM overlays
    preventing directory traversal attacks.
    """
    clean_subpath = os.path.normpath(subpath).lstrip("/\\")
    full_path = os.path.abspath(os.path.join(UPLOAD_DIR, clean_subpath))

    # Directory traversal prevention
    if not full_path.startswith(UPLOAD_DIR):
        raise HTTPException(status_code=403, detail="Access denied")

    if not os.path.isfile(full_path):
        raise HTTPException(status_code=404, detail="Image not found")

    ext = os.path.splitext(full_path)[1].lower()
    media_type = "image/jpeg"
    if ext == ".png":
        media_type = "image/png"
    elif ext == ".pdf":
        media_type = "application/pdf"

    return FileResponse(full_path, media_type=media_type)
