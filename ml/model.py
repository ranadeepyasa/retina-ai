import torch
import torch.nn as nn
from torchvision.models import efficientnet_b0, EfficientNet_B0_Weights

def get_dr_model(num_classes: int = 5, pretrained: bool = True):
    """
    Constructs an EfficientNet-B0 backbone with customized classification head.
    Maintains exact torchvision classifier key structure (classifier[1] = nn.Linear).
    """
    if pretrained:
        try:
            weights = EfficientNet_B0_Weights.DEFAULT
            model = efficientnet_b0(weights=weights)
        except Exception:
            model = efficientnet_b0(pretrained=True)
    else:
        model = efficientnet_b0(weights=None)
        
    in_features = model.classifier[1].in_features
    # Replace dropout with p=0.3 and linear with 5 classes
    model.classifier[0] = nn.Dropout(p=0.3, inplace=True)
    model.classifier[1] = nn.Linear(in_features, num_classes)
    return model
