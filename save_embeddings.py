import os
import pickle
import numpy as np

# Get the project root (one level above src)
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

EMBEDDINGS_DIR = os.path.join(PROJECT_ROOT, "embeddings")

os.makedirs(EMBEDDINGS_DIR, exist_ok=True)

def save_embeddings(embeddings, paths):

    np.save(
        os.path.join(EMBEDDINGS_DIR, "embeddings.npy"),
        embeddings
    )

    with open(
        os.path.join(EMBEDDINGS_DIR, "image_paths.pkl"),
        "wb"
    ) as f:
        pickle.dump(paths, f)