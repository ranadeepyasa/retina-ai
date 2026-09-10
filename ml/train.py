import os
import sys
import torch
import torch.nn as nn
from torch.optim import AdamW
from torch.optim.lr_scheduler import CosineAnnealingLR

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ml.config import MLConfig
from ml.model import get_dr_model
from ml.dataset import create_dataloaders

def train():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"[RetinaAI Training] Device: {device}")
    
    dataloaders = create_dataloaders(MLConfig.DATASET_DIR, MLConfig.BATCH_SIZE)
    if "train" not in dataloaders or "val" not in dataloaders:
        print("[RetinaAI Training] Dataset not found in './dataset' directory.")
        print("Please structure your dataset as:")
        print("  dataset/")
        print("    train/ [0/, 1/, 2/, 3/, 4/]")
        print("    val/   [0/, 1/, 2/, 3/, 4/]")
        print("    test/  [0/, 1/, 2/, 3/, 4/]")
        return

    model = get_dr_model(num_classes=MLConfig.NUM_CLASSES, pretrained=MLConfig.PRETRAINED)
    model.to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = AdamW(model.parameters(), lr=MLConfig.LEARNING_RATE, weight_decay=MLConfig.WEIGHT_DECAY)
    scheduler = CosineAnnealingLR(optimizer, T_max=MLConfig.NUM_EPOCHS)

    best_val_acc = 0.0
    os.makedirs(MLConfig.OUTPUT_MODEL_DIR, exist_ok=True)

    print(f"[RetinaAI Training] Starting training for {MLConfig.NUM_EPOCHS} epochs...")
    for epoch in range(1, MLConfig.NUM_EPOCHS + 1):
        # Training Phase
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0

        for images, labels in dataloaders["train"]:
            images, labels = images.to(device), labels.to(device)
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.item() * images.size(0)
            _, preds = torch.max(outputs, 1)
            correct += torch.sum(preds == labels.data).item()
            total += labels.size(0)

        epoch_loss = running_loss / total
        epoch_acc = correct / total

        # Validation Phase
        model.eval()
        val_loss = 0.0
        val_correct = 0
        val_total = 0

        with torch.no_grad():
            for images, labels in dataloaders["val"]:
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                loss = criterion(outputs, labels)

                val_loss += loss.item() * images.size(0)
                _, preds = torch.max(outputs, 1)
                val_correct += torch.sum(preds == labels.data).item()
                val_total += labels.size(0)

        val_loss = val_loss / val_total
        val_acc = val_correct / val_total
        scheduler.step()

        print(f"Epoch {epoch:02d}/{MLConfig.NUM_EPOCHS} | "
              f"Train Loss: {epoch_loss:.4f} Acc: {epoch_acc:.4f} | "
              f"Val Loss: {val_loss:.4f} Acc: {val_acc:.4f}")

        if val_acc > best_val_acc:
            best_val_acc = val_acc
            torch.save(model.state_dict(), MLConfig.MODEL_SAVE_PATH)
            print(f"  --> Saved new best checkpoint to {MLConfig.MODEL_SAVE_PATH} (Val Acc: {val_acc:.4f})")

    print("[RetinaAI Training] Training process complete.")

if __name__ == "__main__":
    train()
