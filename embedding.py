import numpy as np

import torch

from model import *

@torch.no_grad()

def get_embedding(image):

    inputs = processor(images=image,
                       return_tensors="pt").to(DEVICE)

    outputs = model(**inputs)

    embedding = outputs.last_hidden_state[:,0]

    embedding = embedding.cpu().numpy()

    embedding = embedding / np.linalg.norm(embedding)

    return embedding.astype(np.float32)