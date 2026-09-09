import os
from torchvision import transforms, datasets
from torch.utils.data import DataLoader
from ml.config import MLConfig

def get_train_transforms():
    """
    Carefully constrained medical image augmentations that preserve retinal morphology.
    """
    return transforms.Compose([
        transforms.Resize(MLConfig.IMAGE_SIZE),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomVerticalFlip(p=0.5),
        transforms.RandomRotation(degrees=15),
        transforms.ColorJitter(brightness=0.1, contrast=0.1),
        transforms.ToTensor(),
        transforms.Normalize(mean=MLConfig.IMAGE_MEAN, std=MLConfig.IMAGE_STD)
    ])

def get_eval_transforms():
    """
    Deterministic validation/test preprocessing.
    """
    return transforms.Compose([
        transforms.Resize(MLConfig.IMAGE_SIZE),
        transforms.ToTensor(),
        transforms.Normalize(mean=MLConfig.IMAGE_MEAN, std=MLConfig.IMAGE_STD)
    ])

def create_dataloaders(dataset_dir: str = MLConfig.DATASET_DIR, batch_size: int = MLConfig.BATCH_SIZE):
    """
    Constructs DataLoader instances for train, val, and test splits
    organized under dataset/{train,val,test}/{0,1,2,3,4}.
    """
    train_dir = os.path.join(dataset_dir, "train")
    val_dir = os.path.join(dataset_dir, "val")
    test_dir = os.path.join(dataset_dir, "test")

    dataloaders = {}
    
    if os.path.exists(train_dir):
        train_ds = datasets.ImageFolder(train_dir, transform=get_train_transforms())
        dataloaders["train"] = DataLoader(
            train_ds, batch_size=batch_size, shuffle=True,
            num_workers=MLConfig.NUM_WORKERS, pin_memory=True
        )
        print(f"[RetinaAI ML] Loaded {len(train_ds)} training images across {len(train_ds.classes)} classes.")

    if os.path.exists(val_dir):
        val_ds = datasets.ImageFolder(val_dir, transform=get_eval_transforms())
        dataloaders["val"] = DataLoader(
            val_ds, batch_size=batch_size, shuffle=False,
            num_workers=MLConfig.NUM_WORKERS
        )
        print(f"[RetinaAI ML] Loaded {len(val_ds)} validation images.")

    if os.path.exists(test_dir):
        test_ds = datasets.ImageFolder(test_dir, transform=get_eval_transforms())
        dataloaders["test"] = DataLoader(
            test_ds, batch_size=batch_size, shuffle=False,
            num_workers=MLConfig.NUM_WORKERS
        )
        print(f"[RetinaAI ML] Loaded {len(test_ds)} test images.")

    return dataloaders
