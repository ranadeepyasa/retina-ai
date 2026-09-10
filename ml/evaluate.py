import os
import sys
import json
import torch
import numpy as np
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, precision_recall_fscore_support

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ml.config import MLConfig
from ml.model import get_dr_model
from ml.dataset import create_dataloaders

def evaluate():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"[RetinaAI Evaluation] Device: {device}")

    if not os.path.exists(MLConfig.MODEL_SAVE_PATH):
        print(f"[RetinaAI Evaluation] Model file not found at {MLConfig.MODEL_SAVE_PATH}. Cannot evaluate.")
        return

    dataloaders = create_dataloaders(MLConfig.DATASET_DIR, MLConfig.BATCH_SIZE)
    if "test" not in dataloaders:
        print("[RetinaAI Evaluation] Test dataset not found in './dataset/test'.")
        return

    model = get_dr_model(num_classes=MLConfig.NUM_CLASSES, pretrained=False)
    model.load_state_dict(torch.load(MLConfig.MODEL_SAVE_PATH, map_location=device))
    model.to(device)
    model.eval()

    all_preds = []
    all_targets = []

    print("[RetinaAI Evaluation] Running evaluation on held-out test set...")
    with torch.no_grad():
        for images, labels in dataloaders["test"]:
            images = images.to(device)
            outputs = model(images)
            _, preds = torch.max(outputs, 1)

            all_preds.extend(preds.cpu().numpy())
            all_targets.extend(labels.numpy())

    all_preds = np.array(all_preds)
    all_targets = np.array(all_targets)

    acc = float(accuracy_score(all_targets, all_preds))
    prec, rec, f1, _ = precision_recall_fscore_support(all_targets, all_preds, average='weighted', zero_division=0)
    cm = confusion_matrix(all_targets, all_preds, labels=[0, 1, 2, 3, 4]).tolist()

    # Calculate Sensitivity & Specificity for referable DR (Class 2, 3, 4 vs 0, 1)
    binary_targets = (all_targets >= 2).astype(int)
    binary_preds = (all_preds >= 2).astype(int)
    b_cm = confusion_matrix(binary_targets, binary_preds, labels=[0, 1])
    tn, fp, fn, tp = b_cm.ravel()
    sensitivity = float(tp / (tp + fn)) if (tp + fn) > 0 else 0.0
    specificity = float(tn / (tn + fp)) if (tn + fp) > 0 else 0.0

    # Per class metrics
    p_class, r_class, f_class, _ = precision_recall_fscore_support(all_targets, all_preds, labels=[0, 1, 2, 3, 4], zero_division=0)
    per_class = {}
    for idx, name in enumerate(["No DR", "Mild", "Moderate", "Severe", "Proliferative"]):
        per_class[name] = {
            "precision": round(float(p_class[idx]), 3),
            "recall": round(float(r_class[idx]), 3),
            "f1_score": round(float(f_class[idx]), 3)
        }

    metrics_output = {
        "model_name": "EfficientNet-B0 (Trained)",
        "version": "v1.0-evaluated",
        "architecture": "EfficientNet-B0 + Grad-CAM",
        "is_evaluated": True,
        "status": "Evaluated on held-out test set",
        "accuracy": round(acc, 4),
        "precision": round(float(prec), 4),
        "recall": round(float(rec), 4),
        "f1_score": round(float(f1), 4),
        "sensitivity": round(sensitivity, 4),
        "specificity": round(specificity, 4),
        "confusion_matrix": cm,
        "per_class_metrics": per_class
    }

    os.makedirs(os.path.dirname(MLConfig.METRICS_SAVE_PATH), exist_ok=True)
    with open(MLConfig.METRICS_SAVE_PATH, "w") as f:
        json.dump(metrics_output, f, indent=2)

    print(f"[RetinaAI Evaluation] Saved evaluation metrics to {MLConfig.METRICS_SAVE_PATH}")
    print(f"Accuracy: {acc*100:.2f}% | Sensitivity: {sensitivity*100:.2f}% | Specificity: {specificity*100:.2f}%")

if __name__ == "__main__":
    evaluate()
