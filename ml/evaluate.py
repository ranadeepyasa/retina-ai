import os
import sys
import json
import torch
import numpy as np
from sklearn.metrics import confusion_matrix, accuracy_score, precision_recall_fscore_support

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ml.config import MLConfig
from ml.model import get_dr_model
from ml.dataset import create_dataloaders
from ml.calibrate import compute_ece

def evaluate():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"[RetinaAI Evaluation] Device: {device}")

    if not os.path.exists(MLConfig.MODEL_SAVE_PATH):
        print(f"[RetinaAI Evaluation] Model file not found at {MLConfig.MODEL_SAVE_PATH}. Cannot evaluate.")
        return

    dataloaders = create_dataloaders(MLConfig.DATASET_DIR, batch_size=8)
    if "test" not in dataloaders:
        print("[RetinaAI Evaluation] Error: Test dataset not found in './dataset/test'.")
        return

    model = get_dr_model(num_classes=MLConfig.NUM_CLASSES, pretrained=False)
    state_dict = torch.load(MLConfig.MODEL_SAVE_PATH, map_location=device)
    model.load_state_dict(state_dict)
    model.to(device)
    model.eval()

    # Load calibration temperature if available
    calib_path = os.path.join(MLConfig.OUTPUT_MODEL_DIR, "calibration.json")
    temperature = 1.0
    if os.path.exists(calib_path):
        try:
            with open(calib_path, "r") as f:
                calib_info = json.load(f)
                temperature = calib_info.get("temperature", 1.0)
                print(f"[RetinaAI Evaluation] Loaded calibration temperature T={temperature:.4f}")
        except Exception as e:
            print(f"Warning: Could not read calibration.json: {e}")

    all_raw_logits = []
    all_targets = []

    print(f"[RetinaAI Evaluation] Running inference on {len(dataloaders['test'].dataset)} held-out test images...")
    with torch.no_grad():
        for images, labels in dataloaders["test"]:
            images = images.to(device)
            outputs = model(images)
            all_raw_logits.append(outputs.cpu())
            all_targets.extend(labels.numpy())

    all_raw_logits = torch.cat(all_raw_logits, dim=0)
    all_targets = np.array(all_targets)

    # Raw probabilities
    raw_probs = torch.softmax(all_raw_logits, dim=1).numpy()
    raw_preds = np.argmax(raw_probs, axis=1)
    raw_ece = compute_ece(raw_probs, all_targets)
    raw_avg_conf = float(np.mean(np.max(raw_probs, axis=1)))

    # Calibrated probabilities with temperature scaling
    calibrated_probs = torch.softmax(all_raw_logits / temperature, dim=1).numpy()
    calibrated_preds = np.argmax(calibrated_probs, axis=1)
    calibrated_ece = compute_ece(calibrated_probs, all_targets)
    calibrated_avg_conf = float(np.mean(np.max(calibrated_probs, axis=1)))

    # Evaluation metrics
    acc = float(accuracy_score(all_targets, calibrated_preds))
    prec_macro, rec_macro, f1_macro, _ = precision_recall_fscore_support(all_targets, calibrated_preds, average='macro', zero_division=0)
    prec_weighted, rec_weighted, f1_weighted, _ = precision_recall_fscore_support(all_targets, calibrated_preds, average='weighted', zero_division=0)
    cm = confusion_matrix(all_targets, calibrated_preds, labels=[0, 1, 2, 3, 4]).tolist()

    # Referable DR Triage Metric (Referable: Moderate, Severe, Proliferative DR [Classes 2,3,4] vs Non-referable [0,1])
    binary_targets = (all_targets >= 2).astype(int)
    binary_preds = (calibrated_preds >= 2).astype(int)
    b_cm = confusion_matrix(binary_targets, binary_preds, labels=[0, 1])
    tn, fp, fn, tp = b_cm.ravel()
    sensitivity = float(tp / (tp + fn)) if (tp + fn) > 0 else 0.0
    specificity = float(tn / (tn + fp)) if (tn + fp) > 0 else 0.0

    # Per-class metrics
    p_class, r_class, f_class, support_class = precision_recall_fscore_support(all_targets, calibrated_preds, labels=[0, 1, 2, 3, 4], zero_division=0)
    class_names = ["No DR", "Mild", "Moderate", "Severe", "Proliferative"]
    per_class = {}
    for idx, name in enumerate(class_names):
        per_class[name] = {
            "precision": round(float(p_class[idx]), 4),
            "recall": round(float(r_class[idx]), 4),
            "f1_score": round(float(f_class[idx]), 4),
            "support": int(support_class[idx])
        }

    metrics_output = {
        "model_name": "EfficientNet-B0 (Trained & Calibrated)",
        "version": "v1.0-evaluated",
        "architecture": "EfficientNet-B0 + Grad-CAM",
        "dataset_source": "IDRiD (Indian Diabetic Retinopathy Image Dataset - 103 Held-Out Test Images)",
        "is_evaluated": True,
        "status": "Evaluated on held-out test set with Temperature Calibration",
        "total_test_samples": len(all_targets),
        "accuracy": round(acc, 4),
        "precision": round(float(prec_weighted), 4),
        "recall": round(float(rec_weighted), 4),
        "f1_score": round(float(f1_weighted), 4),
        "macro_f1": round(float(f1_macro), 4),
        "sensitivity": round(sensitivity, 4),
        "specificity": round(specificity, 4),
        "referable_dr_tp": int(tp),
        "referable_dr_fp": int(fp),
        "referable_dr_fn": int(fn),
        "referable_dr_tn": int(tn),
        "temperature": round(temperature, 4),
        "raw_avg_confidence": round(raw_avg_conf, 4),
        "calibrated_avg_confidence": round(calibrated_avg_conf, 4),
        "raw_ece": round(raw_ece, 4),
        "calibrated_ece": round(calibrated_ece, 4),
        "confusion_matrix": cm,
        "per_class_metrics": per_class
    }

    os.makedirs(os.path.dirname(MLConfig.METRICS_SAVE_PATH), exist_ok=True)
    with open(MLConfig.METRICS_SAVE_PATH, "w") as f:
        json.dump(metrics_output, f, indent=2)

    print(f"\n[RetinaAI Test Set Evaluation Complete]")
    print(f"==================================================")
    print(f"Test Samples:        {len(all_targets)}")
    print(f"Overall Accuracy:    {acc*100:.2f}%")
    print(f"Weighted F1:         {f1_weighted*100:.2f}%")
    print(f"Macro F1:            {f1_macro*100:.2f}%")
    print(f"Referable DR Sens:   {sensitivity*100:.2f}%")
    print(f"Referable DR Spec:   {specificity*100:.2f}%")
    print(f"Calibration Temp:    {temperature:.4f}")
    print(f"Calibrated Avg Conf: {calibrated_avg_conf*100:.2f}% (ECE: {calibrated_ece:.4f})")
    print(f"Saved metrics to:    {MLConfig.METRICS_SAVE_PATH}")
    print(f"==================================================")

if __name__ == "__main__":
    evaluate()
