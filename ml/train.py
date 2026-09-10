import os
import sys
import torch
import torch.nn as nn
from torch.optim import AdamW
from torch.optim.lr_scheduler import CosineAnnealingLR
from sklearn.metrics import f1_score, accuracy_score
import numpy as np

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ml.config import MLConfig
from ml.model import get_dr_model
from ml.dataset import create_dataloaders

def compute_class_weights(dataset):
    """
    Computes inverse class frequency weights to address severe class imbalance
    (e.g., mild DR having significantly fewer training samples).
    """
    targets = [s[1] for s in dataset.samples]
    counts = np.bincount(targets, minlength=MLConfig.NUM_CLASSES)
    print(f"[RetinaAI Training] Training class counts: {counts}")
    
    # Smooth inverse frequency weights
    weights = len(targets) / (MLConfig.NUM_CLASSES * np.maximum(counts, 1).astype(np.float32))
    # Normalize so mean weight is 1.0
    weights = weights / np.mean(weights)
    print(f"[RetinaAI Training] Inverse class weights: {np.round(weights, 3)}")
    return torch.tensor(weights, dtype=torch.float)

def train():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"[RetinaAI Training] Execution Device: {device}")
    
    dataloaders = create_dataloaders(MLConfig.DATASET_DIR, MLConfig.BATCH_SIZE)
    if "train" not in dataloaders or "val" not in dataloaders:
        print("[RetinaAI Training] Error: Required dataset splits not found.")
        return

    train_ds = dataloaders["train"].dataset
    class_weights = compute_class_weights(train_ds).to(device)

    model = get_dr_model(num_classes=MLConfig.NUM_CLASSES, pretrained=MLConfig.PRETRAINED)
    model.to(device)

    criterion = nn.CrossEntropyLoss(weight=class_weights)
    os.makedirs(MLConfig.OUTPUT_MODEL_DIR, exist_ok=True)

    best_val_macro_f1 = 0.0
    best_epoch = 0

    # =========================================================================
    # STAGE 1: Train classification head with frozen backbone (Warmup)
    # =========================================================================
    print("\n--- [STAGE 1] Training classification head (Backbone Frozen) ---")
    for param in model.features.parameters():
        param.requires_grad = False

    optimizer_s1 = AdamW(model.classifier.parameters(), lr=MLConfig.LEARNING_RATE_STAGE1, weight_decay=MLConfig.WEIGHT_DECAY)

    for epoch in range(1, MLConfig.STAGE1_EPOCHS + 1):
        model.train()
        running_loss = 0.0
        train_preds, train_targets = [], []

        for images, labels in dataloaders["train"]:
            images, labels = images.to(device), labels.to(device)
            optimizer_s1.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer_s1.step()

            running_loss += loss.item() * images.size(0)
            preds = torch.argmax(outputs, dim=1)
            train_preds.extend(preds.cpu().numpy())
            train_targets.extend(labels.cpu().numpy())

        train_loss = running_loss / len(train_targets)
        train_acc = accuracy_score(train_targets, train_preds)

        # Validation
        model.eval()
        val_loss = 0.0
        val_preds, val_targets = [], []

        with torch.no_grad():
            for images, labels in dataloaders["val"]:
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                loss = criterion(outputs, labels)

                val_loss += loss.item() * images.size(0)
                preds = torch.argmax(outputs, dim=1)
                val_preds.extend(preds.cpu().numpy())
                val_targets.extend(labels.cpu().numpy())

        val_loss = val_loss / len(val_targets)
        val_acc = accuracy_score(val_targets, val_preds)
        val_macro_f1 = f1_score(val_targets, val_preds, average="macro", zero_division=0)

        print(f"Stage 1 Epoch {epoch:02d}/{MLConfig.STAGE1_EPOCHS:02d} | "
              f"Train Loss: {train_loss:.4f} Acc: {train_acc:.4f} | "
              f"Val Loss: {val_loss:.4f} Acc: {val_acc:.4f} Macro F1: {val_macro_f1:.4f}")

    # =========================================================================
    # STAGE 2: Fine-tune entire network with Cosine Annealing
    # =========================================================================
    print("\n--- [STAGE 2] Full Network Fine-Tuning ---")
    for param in model.parameters():
        param.requires_grad = True

    optimizer_s2 = AdamW(model.parameters(), lr=MLConfig.LEARNING_RATE_STAGE2, weight_decay=MLConfig.WEIGHT_DECAY)
    scheduler_s2 = CosineAnnealingLR(optimizer_s2, T_max=MLConfig.STAGE2_EPOCHS)

    for epoch in range(1, MLConfig.STAGE2_EPOCHS + 1):
        model.train()
        running_loss = 0.0
        train_preds, train_targets = [], []

        for images, labels in dataloaders["train"]:
            images, labels = images.to(device), labels.to(device)
            optimizer_s2.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer_s2.step()

            running_loss += loss.item() * images.size(0)
            preds = torch.argmax(outputs, dim=1)
            train_preds.extend(preds.cpu().numpy())
            train_targets.extend(labels.cpu().numpy())

        train_loss = running_loss / len(train_targets)
        train_acc = accuracy_score(train_targets, train_preds)

        # Validation
        model.eval()
        val_loss = 0.0
        val_preds, val_targets = [], []

        with torch.no_grad():
            for images, labels in dataloaders["val"]:
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                loss = criterion(outputs, labels)

                val_loss += loss.item() * images.size(0)
                preds = torch.argmax(outputs, dim=1)
                val_preds.extend(preds.cpu().numpy())
                val_targets.extend(labels.cpu().numpy())

        val_loss = val_loss / len(val_targets)
        val_acc = accuracy_score(val_targets, val_preds)
        val_macro_f1 = f1_score(val_targets, val_preds, average="macro", zero_division=0)
        scheduler_s2.step()

        print(f"Stage 2 Epoch {epoch:02d}/{MLConfig.STAGE2_EPOCHS:02d} | "
              f"Train Loss: {train_loss:.4f} Acc: {train_acc:.4f} | "
              f"Val Loss: {val_loss:.4f} Acc: {val_acc:.4f} Macro F1: {val_macro_f1:.4f}")

        # Save model based on highest validation Macro F1 score
        if val_macro_f1 > best_val_macro_f1:
            best_val_macro_f1 = val_macro_f1
            best_epoch = epoch
            torch.save(model.state_dict(), MLConfig.MODEL_SAVE_PATH)
            print(f"  [Checkpoint] --> Saved best weights to {MLConfig.MODEL_SAVE_PATH} (Val Macro F1: {val_macro_f1:.4f})")

    if best_val_macro_f1 == 0.0:
        # Fallback save in case all f1 are identical
        torch.save(model.state_dict(), MLConfig.MODEL_SAVE_PATH)
        print(f"  [Checkpoint] --> Saved weights to {MLConfig.MODEL_SAVE_PATH}")

    print(f"\n[RetinaAI Training] Completed! Best validation Macro F1: {best_val_macro_f1:.4f}")

if __name__ == "__main__":
    train()
