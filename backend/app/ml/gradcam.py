import numpy as np
from PIL import Image
import os
from typing import Tuple, Optional

def apply_colormap_on_image(
    original_img: Image.Image,
    activation_map: np.ndarray,
    alpha: float = 0.45
) -> Image.Image:
    """
    Blends a 2D normalized activation map (0.0 to 1.0) with the original fundus image
    using a professional turbo/jet clinical colormap overlay.
    """
    orig_w, orig_h = original_img.size
    
    # Resize activation map to original image resolution
    act_img = Image.fromarray((activation_map * 255).astype(np.uint8))
    act_resized = act_img.resize((orig_w, orig_h), resample=Image.Resampling.BILINEAR)
    act_arr = np.array(act_resized, dtype=np.float32) / 255.0
    
    # Generate Turbo/Jet-like colormap RGB without requiring heavy external dependencies
    # Color mapping: 0.0=Dark Blue, 0.25=Teal, 0.5=Green/Yellow, 0.75=Orange, 1.0=Ruby Red
    heatmap = np.zeros((orig_h, orig_w, 3), dtype=np.uint8)
    
    r = np.clip(1.5 - np.abs(act_arr * 4 - 3), 0.0, 1.0)
    g = np.clip(1.5 - np.abs(act_arr * 4 - 2), 0.0, 1.0)
    b = np.clip(1.5 - np.abs(act_arr * 4 - 1), 0.0, 1.0)
    
    heatmap[:, :, 0] = (r * 255).astype(np.uint8)
    heatmap[:, :, 1] = (g * 255).astype(np.uint8)
    heatmap[:, :, 2] = (b * 255).astype(np.uint8)
    
    heatmap_pil = Image.fromarray(heatmap, mode="RGB")
    orig_rgb = original_img.convert("RGB")
    
    # Weighted alpha blend
    blended = Image.blend(orig_rgb, heatmap_pil, alpha=alpha)
    return blended

class GradCAMExplainer:
    """
    PyTorch-native Grad-CAM implementation that hooks into the final convolutional layer.
    """
    def __init__(self, model, target_layer):
        self.model = model
        self.target_layer = target_layer
        self.gradients = None
        self.activations = None
        self._register_hooks()

    def _register_hooks(self):
        def forward_hook(module, input, output):
            self.activations = output

        def backward_hook(module, grad_in, grad_out):
            # grad_out is a tuple
            self.gradients = grad_out[0]

        self.target_layer.register_forward_hook(forward_hook)
        self.target_layer.register_full_backward_hook(backward_hook)

    def generate(self, input_tensor, target_class_idx: int) -> np.ndarray:
        """
        Executes forward + backward pass and returns normalized 2D heatmap.
        """
        import torch
        import torch.nn.functional as F

        self.model.zero_grad()
        output = self.model(input_tensor)
        
        # Target score for specified class
        score = output[0, target_class_idx]
        score.backward(retain_graph=True)
        
        # Pooled gradients across channels
        # gradients shape: [1, C, H, W]
        grads = self.gradients
        activations = self.activations
        
        # Global Average Pooling of gradients
        weights = torch.mean(grads, dim=(2, 3), keepdim=True)
        
        # Linear combination of weighted activation maps
        cam = torch.sum(weights * activations, dim=1, keepdim=True)
        
        # Apply ReLU to keep only features that positively correlate with the class
        cam = F.relu(cam)
        
        # Normalize between 0 and 1
        cam = cam.squeeze().detach().cpu().numpy()
        cam_min, cam_max = np.min(cam), np.max(cam)
        if cam_max - cam_min > 1e-6:
            cam = (cam - cam_min) / (cam_max - cam_min)
        else:
            cam = np.zeros_like(cam)
            
        return cam

def generate_fundus_gradcam_overlay(
    original_image_path: str,
    output_heatmap_path: str,
    activation_map: Optional[np.ndarray] = None
) -> str:
    """
    Generates and saves the final Grad-CAM blended overlay image to disk.
    If no activation map is provided (e.g. in synthetic dev mode),
    computes plausible retinal saliency focusing on macular/vascular regions.
    """
    with Image.open(original_image_path) as orig_img:
        orig_w, orig_h = orig_img.size
        
        if activation_map is None:
            # Saliency simulation for demo/dev mode based on image gradients
            # Highlights lesions, microaneurysms, or vessel branching
            arr = np.array(orig_img.convert("RGB"), dtype=np.float32)
            gray = 0.299 * arr[:, :, 0] + 0.587 * arr[:, :, 1] + 0.114 * arr[:, :, 2]
            
            # Center-weighted Gaussian prior + high-contrast micro-vascular focal points
            y, x = np.ogrid[:orig_h, :orig_w]
            cy, cx = orig_h * 0.48, orig_w * 0.52
            dist_from_center = np.sqrt((x - cx) ** 2 + (y - cy) ** 2)
            radius = min(orig_w, orig_h) * 0.45
            mask = (dist_from_center < radius).astype(np.float32)
            
            # Local contrast variance
            gy, gx = np.gradient(gray)
            grad_mag = np.sqrt(gx**2 + gy**2) * mask
            
            # Smooth with simple box filter
            from scipy.ndimage import gaussian_filter
            smooth_cam = gaussian_filter(grad_mag, sigma=max(8, int(min(orig_w, orig_h) / 28)))
            
            s_min, s_max = np.min(smooth_cam), np.max(smooth_cam)
            if s_max - s_min > 1e-6:
                activation_map = (smooth_cam - s_min) / (s_max - s_min)
            else:
                activation_map = np.ones((orig_h, orig_w), dtype=np.float32) * 0.5
                
        overlay_img = apply_colormap_on_image(orig_img, activation_map, alpha=0.45)
        os.makedirs(os.path.dirname(output_heatmap_path), exist_ok=True)
        overlay_img.save(output_heatmap_path, format="JPEG", quality=90)
        return output_heatmap_path
