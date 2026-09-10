import os
import io
import urllib.request
import pyarrow.parquet as pq
from PIL import Image
from sklearn.model_selection import train_test_split

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(BASE_DIR, "..", "dataset")
RAW_CACHE_DIR = os.path.join(BASE_DIR, "..", "dataset_cache")

TRAIN_PARQUET_URL = "https://huggingface.co/datasets/amin-nejad/idrid-disease-grading/resolve/main/data/train-00000-of-00001-d81b05cdbfbe95cd.parquet"
TEST_PARQUET_URL = "https://huggingface.co/datasets/amin-nejad/idrid-disease-grading/resolve/main/data/test-00000-of-00001-3eaaa0286c6f240e.parquet"

def download_file(url: str, dest_path: str):
    if os.path.exists(dest_path) and os.path.getsize(dest_path) > 1000000:
        print(f"Using cached file: {dest_path}")
        return
    print(f"Downloading {url} to {dest_path}...")
    headers = {"User-Agent": "Mozilla/5.0"}
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as resp, open(dest_path, "wb") as out:
        chunk_size = 1024 * 1024
        total_dl = 0
        while True:
            chunk = resp.read(chunk_size)
            if not chunk:
                break
            out.write(chunk)
            total_dl += len(chunk)
            print(f"  Downloaded {total_dl / (1024 * 1024):.1f} MB...", end="\r")
    print(f"\nDownload complete: {dest_path}")

def prepare_idrid():
    os.makedirs(RAW_CACHE_DIR, exist_ok=True)
    os.makedirs(DATASET_DIR, exist_ok=True)

    train_parquet = os.path.join(RAW_CACHE_DIR, "idrid_train.parquet")
    test_parquet = os.path.join(RAW_CACHE_DIR, "idrid_test.parquet")

    download_file(TRAIN_PARQUET_URL, train_parquet)
    download_file(TEST_PARQUET_URL, test_parquet)

    print("Reading Parquet tables...")
    train_table = pq.read_table(train_parquet)
    test_table = pq.read_table(test_parquet)

    train_df = train_table.to_pandas()
    test_df = test_table.to_pandas()

    print(f"Train samples: {len(train_df)}")
    print(f"Test samples: {len(test_df)}")

    # Extract label column name
    label_col = 'Retinopathy grade' if 'Retinopathy grade' in train_df.columns else ('label' if 'label' in train_df.columns else train_df.columns[1])
    print(f"Using label column: '{label_col}'")
    print(f"Train class counts:\n{train_df[label_col].value_counts().sort_index()}")
    print(f"Test class counts:\n{test_df[label_col].value_counts().sort_index()}")

    # Stratified train/val split (80/20)
    train_idx, val_idx = train_test_split(
        train_df.index,
        test_size=0.2,
        stratify=train_df[label_col],
        random_state=42
    )

    splits = {
        "train": train_df.loc[train_idx],
        "val": train_df.loc[val_idx],
        "test": test_df
    }

    for split_name, split_data in splits.items():
        print(f"Processing split '{split_name}' with {len(split_data)} images...")
        for idx, row in split_data.iterrows():
            lbl = int(row[label_col])
            img_dir = os.path.join(DATASET_DIR, split_name, str(lbl))
            os.makedirs(img_dir, exist_ok=True)

            img_data = row['image']
            if isinstance(img_data, dict) and 'bytes' in img_data:
                raw_bytes = img_data['bytes']
            elif hasattr(img_data, 'bytes'):
                raw_bytes = img_data.bytes
            else:
                raw_bytes = img_data

            img_filename = f"idrid_{split_name}_{idx}.jpg"
            img_path = os.path.join(img_dir, img_filename)

            if not os.path.exists(img_path):
                try:
                    with Image.open(io.BytesIO(raw_bytes)) as im:
                        im_rgb = im.convert("RGB")
                        # Pre-resize to 512x512 to save disk and memory while preserving detail
                        im_rgb.thumbnail((512, 512), Image.Resampling.LANCZOS)
                        im_rgb.save(img_path, format="JPEG", quality=90)
                except Exception as e:
                    print(f"Error saving image {img_path}: {e}")

    print("IDRiD dataset preparation completed successfully!")

if __name__ == "__main__":
    prepare_idrid()
