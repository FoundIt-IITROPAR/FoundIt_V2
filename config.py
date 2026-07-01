import torch
import os

IMAGE_FOLDER = "../images"

EMBEDDING_FILE = "../embeddings/embeddings.npy"

PATH_FILE = "../embeddings/image_paths.pkl"

MODEL_NAME = "facebook/dinov2-base"

TOP_K = 5

if torch.backends.mps.is_available():
    DEVICE = "mps"
elif torch.cuda.is_available():
    DEVICE = "cuda"
else:
    DEVICE = "cpu"

print("Using Device:", DEVICE)