import os

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
    NUM_EPOCHS = 15
    LEARNING_RATE = 1e-4
    WEIGHT_DECAY = 1e-4
    NUM_WORKERS = 0  # 0 for safe multi-platform execution
    
    # Paths
    DATASET_DIR = os.getenv("DATASET_DIR", "./dataset")
    OUTPUT_MODEL_DIR = os.getenv("OUTPUT_MODEL_DIR", "../backend/models")
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
