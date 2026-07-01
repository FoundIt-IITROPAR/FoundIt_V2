import sys
import os

sys.path.append("src")

import numpy as np

from tqdm import tqdm

from config import *

from image_loader import *

from embedding import *

from save_embeddings import *

from faiss_index import *

from search import *

print("Scanning Images...")

paths = get_all_images("images")

print("Found",len(paths),"images")

embeddings=[]

for path in tqdm(paths):

    image=load_image(path)

    emb=get_embedding(image)

    embeddings.append(emb[0])

embeddings=np.array(embeddings)

save_embeddings(embeddings,paths)

print("Building FAISS Index")

index=build_index(embeddings)

print("Searching...")

search(index,embeddings,paths)