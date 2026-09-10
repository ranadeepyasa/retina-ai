import os
import sys
import json
import torch
import torch.nn as nn
import numpy as np
from scipy.optimize import minimize

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ml.config import MLConfig
from ml.model import get_dr_model
from ml.dataset import create_dataloaders

def compute_ece(probs, labels, n_bins=10):
    """
    Computes Expected Calibration Error (ECE).
    """
    confidences = np.max(probs, axis=1)
    predictions = np.argmax(probs, axis=1)
    accuracies = (predictions == labels)

    bin_boundaries = np.linspace(0, 1, n_bins + 1)
    ece = 0.0

    for i in range(n_bins):
        in_bin = (confidences > bin_boundaries[i]) & (confidences <= bin_boundaries[i + 1])
        prop_in_bin = np.mean(in_bin)
        if prop_in_bin > 0:
            accuracy_in_bin = np.mean(accuracies[in_bin])
            avg_confidence_in_bin = np.mean(confidences[in_bin])
            ece += np.abs(avg_confidence_in_bin - accuracy_in_bin) * prop_in_bin

    return float(ece)

def calibrate():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"[RetinaAI Calibration] Device: {device}")

    if not os.path.exists(MLConfig.MODEL_SAVE_PATH):
        print(f"[RetinaAI Calibration] Model not found at {MLConfig.MODEL_SAVE_PATH}")
        return None

    dataloaders = create_dataloaders(MLConfig.DATASET_DIR, batch_size=8)
    if "val" not in dataloaders:
        print("[RetinaAI Calibration] Validation set not found.")
        return None

    model = get_dr_model(num_classes=MLConfig.NUM_CLASSES, pretrained=False)
    state_dict = torch.load(MLConfig.MODEL_SAVE_PATH, map_location=device)
    model.load_state_dict(state_dict)
    model.to(device)
    model.eval()

    val_logits = []
    val_labels = []

    print("[RetinaAI Calibration] Extracting logits on validation set...")
    with torch.no_grad():
        for images, labels in dataloaders["val"]:
            images = images.to(device)
            outputs = model(images)
            val_logits.append(outputs.cpu())
            val_labels.append(labels)

    val_logits = torch.cat(val_logits, dim=0)
    val_labels = torch.cat(val_labels, dim=0)

    # Initial probabilities and ECE
    initial_probs = torch.softmax(val_logits, dim=1).numpy()
    initial_labels = val_labels.numpy()
    initial_ece = compute_ece(initial_probs, initial_labels)
    initial_avg_conf = float(np.mean(np.max(initial_probs, axis=1)))

    print(f"Validation Initial Avg Confidence: {initial_avg_conf * 100:.2f}% | Initial ECE: {initial_ece:.4f}")

    # Optimize Temperature T via NLL
    nll_criterion = nn.CrossEntropyLoss()

    def loss_fun(t_val):
        t = float(t_val[0])
        scaled_logits = val_logits / t
        loss = nll_criterion(scaled_logits, val_labels).item()
        return loss

    res = minimize(loss_fun, [1.0], method='Nelder-Mead', bounds=[(0.1, 5.0)])
    optimal_t = float(res.x[0])
    optimal_t = max(0.1, min(5.0, optimal_t))

    calibrated_probs = torch.softmax(val_logits / optimal_t, dim=1).numpy()
    calibrated_ece = compute_ece(calibrated_probs, initial_labels)
    calibrated_avg_conf = float(np.mean(np.max(calibrated_probs, axis=1)))

    print(f"[RetinaAI Calibration] Optimal Temperature T: {optimal_t:.4f}")
    print(f"Calibrated Avg Confidence: {calibrated_avg_conf * 100:.2f}% | Calibrated ECE: {calibrated_ece:.4f}")

    calibration_data = {
        "temperature": round(optimal_t, 4),
        "initial_ece": round(initial_ece, 4),
        "calibrated_ece": round(calibrated_ece, 4),
        "initial_avg_conf": round(initial_avg_conf, 4),
        "calibrated_avg_conf": round(calibrated_avg_conf, 4)
    }

    calib_path = os.path.join(MLConfig.OUTPUT_MODEL_DIR, "calibration.json")
    with open(calib_path, "w") as f:
        json.dump(calibration_data, f, indent=2)

    print(f"[RetinaAI Calibration] Saved calibration parameters to {calib_path}")
    return optimal_t

if __name__ == "__main__":
    calibrate()
