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

            # 2. Retinal Chromaticity & Non-Fundus / Face Photo Rejection Check
            # Authentic fundus images exhibit strong red/orange reflection from retinal vasculature & RPE,
            # with heavy blue light absorption (R channel is substantially higher than B channel).
            # Everyday non-fundus images (faces, skin selfies, documents, outdoor photos) exhibit high blue/green
            # or near-equal R/G/B luminance.
            red_valid = arr[:, :, 0][mask]
            green_valid = arr[:, :, 1][mask]
            blue_valid = arr[:, :, 2][mask]
            mean_r = float(np.mean(red_valid))
            mean_g = float(np.mean(green_valid))
            mean_b = float(np.mean(blue_valid))
            
            rb_ratio = mean_r / (mean_b + 1e-5)
            # Rejection criteria for non-fundus / regular face photographs:
            if rb_ratio < 1.25 or (mean_b > 115 and rb_ratio < 1.45) or (mean_r < 30):
                return {
                    "image_quality": "POOR_QUALITY",
                    "quality_score": 0.15,
                    "is_acceptable": False,
                    "is_prototype_heuristic": True,
                    "message": "Image quality may affect screening reliability. Please capture another retinal image. (Uploaded photograph does not exhibit retinal fundus characteristics; normal face or non-retinal images are not accepted).",
                    "metrics": {
                        "resolution_width": width,
                        "resolution_height": height,
                        "mean_brightness": round(mean_brightness, 2),
                        "contrast_std": round(contrast_std, 2),
                        "sharpness_score": 0.0,
                        "retinal_chromaticity_ratio": round(rb_ratio, 2)
                    }
                }

            # 3. Exposure checks
            if mean_brightness < 35:
                return {
                    "image_quality": "POOR_QUALITY",
                    "quality_score": 0.35,
                    "is_acceptable": False,
                    "is_prototype_heuristic": True,
                    "message": "Image quality may affect screening reliability. Please capture another retinal image. (Image is severely underexposed; retinal vasculature and optic disc cannot be visualized).",
                    "metrics": {
                        "resolution_width": width,
                        "resolution_height": height,
                        "mean_brightness": round(mean_brightness, 2),
                        "contrast_std": round(contrast_std, 2),
                        "sharpness_score": 0.0
                    }
                }
            
            if mean_brightness > 220:
                return {
                    "image_quality": "POOR_QUALITY",
                    "quality_score": 0.35,
                    "is_acceptable": False,
                    "is_prototype_heuristic": True,
                    "message": "Image quality may affect screening reliability. Please capture another retinal image. (Severe overexposure or flash glare; retinal microvascular details are washed out).",
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
                    "is_prototype_heuristic": True,
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
                    "is_prototype_heuristic": True,
                    "message": f"Image quality may affect screening reliability. Please capture another retinal image. ({reason_str})",
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
