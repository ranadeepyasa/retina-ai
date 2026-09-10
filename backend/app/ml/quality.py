import numpy as np
from PIL import Image
from typing import Dict, Any, Tuple

def assess_image_quality(image_path: str) -> Dict[str, Any]:
    """
    Evaluates image quality of a retinal fundus photograph based on
    illumination, contrast, sharpness (Laplacian gradient), and resolution heuristics.
    Clearly labeled as a prototype quality assessment.
    """
    try:
        with Image.open(image_path) as img:
            img_rgb = img.convert("RGB")
            width, height = img_rgb.size
            
            # 1. Resolution Check
            if width < 224 or height < 224:
                return {
                    "image_quality": "POOR_QUALITY",
                    "quality_score": 0.35,
                    "is_acceptable": False,
                    "message": "Image resolution is too low (< 224x224). Retinal micro-lesions cannot be reliably detected.",
                    "metrics": {
                        "resolution_width": width,
                        "resolution_height": height,
                        "mean_brightness": 0.0,
                        "contrast_std": 0.0,
                        "sharpness_score": 0.0
                    }
                }
            
            # Convert to numpy array for fast numerical analysis
            arr = np.array(img_rgb, dtype=np.float32)
            
            # Grayscale for luminance & sharpness
            gray = 0.299 * arr[:, :, 0] + 0.587 * arr[:, :, 1] + 0.114 * arr[:, :, 2]
            
            # Find non-black / retinal mask (avoid black borders typical in fundus photography)
            mask = gray > 15
            if np.sum(mask) < (width * height * 0.15):
                # Almost entirely black
                return {
                    "image_quality": "POOR_QUALITY",
                    "quality_score": 0.20,
                    "is_acceptable": False,
                    "message": "Fundus field-of-view is insufficient or image is severely underexposed. Please capture another image.",
                    "metrics": {
                        "resolution_width": width,
                        "resolution_height": height,
                        "mean_brightness": float(np.mean(gray)),
                        "contrast_std": float(np.std(gray)),
                        "sharpness_score": 0.0
                    }
                }
            
            valid_pixels = gray[mask]
            mean_brightness = float(np.mean(valid_pixels))
            contrast_std = float(np.std(valid_pixels))
            
            # 2. Exposure checks
            if mean_brightness < 35:
                return {
                    "image_quality": "POOR_QUALITY",
                    "quality_score": 0.42,
                    "is_acceptable": False,
                    "message": "Image is severely underexposed. Retinal vasculature and optic disc are not clearly distinguishable.",
                    "metrics": {
                        "resolution_width": width,
                        "resolution_height": height,
                        "mean_brightness": round(mean_brightness, 2),
                        "contrast_std": round(contrast_std, 2),
                        "sharpness_score": 0.0
                    }
                }
            
            if mean_brightness > 225:
                return {
                    "image_quality": "POOR_QUALITY",
                    "quality_score": 0.40,
                    "is_acceptable": False,
                    "message": "Image has severe flash glare or overexposure. Retinal details are washed out.",
                    "metrics": {
                        "resolution_width": width,
                        "resolution_height": height,
                        "mean_brightness": round(mean_brightness, 2),
                        "contrast_std": round(contrast_std, 2),
                        "sharpness_score": 0.0
                    }
                }
                
            # 3. Sharpness / Focus check (Approximated Laplacian variance)
            # Simple discrete 3x3 Laplacian kernel convolution on downscaled grid for speed
            sample = gray[::2, ::2]  # Subsample for efficiency
            laplacian = (
                -4 * sample[1:-1, 1:-1]
                + sample[:-2, 1:-1]
                + sample[2:, 1:-1]
                + sample[1:-1, :-2]
                + sample[1:-1, 2:]
            )
            sharpness_var = float(np.var(laplacian))
            
            # Composite quality scoring
            # Ideal: mean brightness between 65 and 180, contrast > 30, sharpness > 40
            score = 1.0
            reasons = []
            
            if mean_brightness < 55:
                score -= 0.20
                reasons.append("Marginally dark illumination")
            elif mean_brightness > 195:
                score -= 0.20
                reasons.append("Elevated illumination/glare")
                
            if contrast_std < 25:
                score -= 0.25
                reasons.append("Low contrast across retinal background")
                
            if sharpness_var < 20:
                score -= 0.30
                reasons.append("Potential lens blur or motion artifact")
                
            score = max(0.20, min(0.98, score))
            
            if score >= 0.65:
                return {
                    "image_quality": "GOOD_QUALITY",
                    "quality_score": round(score, 2),
                    "is_acceptable": True,
                    "message": "Image quality is sufficient for AI-assisted screening.",
                    "metrics": {
                        "resolution_width": width,
                        "resolution_height": height,
                        "mean_brightness": round(mean_brightness, 2),
                        "contrast_std": round(contrast_std, 2),
                        "sharpness_score": round(sharpness_var, 2)
                    }
                }
            else:
                reason_str = ", ".join(reasons) if reasons else "Sub-optimal focus or illumination"
                return {
                    "image_quality": "POOR_QUALITY",
                    "quality_score": round(score, 2),
                    "is_acceptable": False,
                    "message": f"Image quality may affect the reliability of the screening result ({reason_str}). Please capture another image.",
                    "metrics": {
                        "resolution_width": width,
                        "resolution_height": height,
                        "mean_brightness": round(mean_brightness, 2),
                        "contrast_std": round(contrast_std, 2),
                        "sharpness_score": round(sharpness_var, 2)
                    }
                }

    except Exception as e:
        return {
            "image_quality": "POOR_QUALITY",
            "quality_score": 0.30,
            "is_acceptable": False,
            "message": f"Unable to parse fundus image file: {str(e)}. Please upload a valid JPG/PNG.",
            "metrics": {
                "resolution_width": 0,
                "resolution_height": 0,
                "mean_brightness": 0.0,
                "contrast_std": 0.0,
                "sharpness_score": 0.0
            }
        }
