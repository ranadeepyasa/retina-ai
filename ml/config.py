import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, ".."))

class MLConfig:
    # Model Architecture
    MODEL_NAME = "efficientnet_b0"
    NUM_CLASSES = 5
    PRETRAINED = True
    
    # Image Input Specs
    IMAGE_SIZE = (224, 224)
    IMAGE_MEAN = [0.485, 0.456, 0.406]
    IMAGE_STD = [0.229, 0.224, 0.225]
    
    # Training Hyperparameters
    BATCH_SIZE = 16
    STAGE1_EPOCHS = 3
    STAGE2_EPOCHS = 10
    NUM_EPOCHS = STAGE1_EPOCHS + STAGE2_EPOCHS
    LEARNING_RATE_STAGE1 = 1e-3
    LEARNING_RATE_STAGE2 = 1e-4
    WEIGHT_DECAY = 1e-4
    NUM_WORKERS = 0  # Safe cross-platform
    
    # Paths
    DATASET_DIR = os.getenv("DATASET_DIR", os.path.join(PROJECT_ROOT, "dataset"))
    OUTPUT_MODEL_DIR = os.getenv("OUTPUT_MODEL_DIR", os.path.join(PROJECT_ROOT, "backend", "models"))
    MODEL_SAVE_PATH = os.path.join(OUTPUT_MODEL_DIR, "dr_model.pth")
    METRICS_SAVE_PATH = os.path.join(OUTPUT_MODEL_DIR, "metrics.json")
    
    # Class names mapping
    CLASSES = [
        "0 - No DR",
        "1 - Mild",
        "2 - Moderate",
        "3 - Severe",
        "4 - Proliferative"
    ]
