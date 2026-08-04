import os
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

import io
import torch
from PIL import Image
from transformers import AutoProcessor, AutoModel

device = "cuda" if torch.cuda.is_available() else "cpu"

processor = AutoProcessor.from_pretrained("facebook/dinov2-base")
model = AutoModel.from_pretrained("facebook/dinov2-base").to(device)
model.eval()

@torch.no_grad()
def embed_image(image_bytes: bytes):
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    inputs = processor(images=image, return_tensors="pt").to(device)

    outputs = model(**inputs)

    embedding = outputs.last_hidden_state[:, 0]
    embedding = torch.nn.functional.normalize(embedding, dim=-1)

    return embedding.squeeze().cpu().tolist()