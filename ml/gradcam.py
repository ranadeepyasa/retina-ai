import torch
import torch.nn.functional as F
import numpy as np
from PIL import Image

class GradCAM:
    """
    Grad-CAM: Visual Explanations from Deep Networks via Gradient-based Localization.
    Computes class activation maps using forward and backward hooks on feature layer.
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
            self.gradients = grad_out[0]

        self.target_layer.register_forward_hook(forward_hook)
        self.target_layer.register_full_backward_hook(backward_hook)

    def generate(self, input_tensor: torch.Tensor, target_class: int) -> np.ndarray:
        self.model.eval()
        self.model.zero_grad()
        
        output = self.model(input_tensor)
        target_score = output[0, target_class]
        target_score.backward(retain_graph=True)

        grads = self.gradients  # [1, C, H, W]
        acts = self.activations  # [1, C, H, W]

        # Channel-wise global average pooling of gradients
        weights = torch.mean(grads, dim=(2, 3), keepdim=True)
        
        # Weighted combination of activation maps
        cam = torch.sum(weights * acts, dim=1, keepdim=True)
        cam = F.relu(cam)
        
        cam_np = cam.squeeze().detach().cpu().numpy()
        min_v, max_v = np.min(cam_np), np.max(cam_np)
        if max_v - min_v > 1e-6:
            cam_np = (cam_np - min_v) / (max_v - min_v)
        else:
            cam_np = np.zeros_like(cam_np)

        return cam_np
