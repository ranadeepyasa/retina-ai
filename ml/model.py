import torch
import torch.nn as nn
from torchvision.models import efficientnet_b0, EfficientNet_B0_Weights

def get_dr_model(num_classes: int = 5, pretrained: bool = True):
    """
    Constructs an EfficientNet-B0 backbone with customized classification head.
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
    # Replace classifier with Dropout + Linear for 5 classes
    model.classifier = nn.Sequential(
        nn.Dropout(p=0.3, inplace=True),
        nn.Linear(in_features, num_classes)
    )
    return model
