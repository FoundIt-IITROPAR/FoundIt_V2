import os

from PIL import Image

def load_image(path):

    return Image.open(path).convert("RGB")

def get_all_images(folder):

    paths = []

    for root, dirs, files in os.walk(folder):

        for file in files:

            if file.lower().endswith((".jpg",".jpeg",".png",".bmp",".webp")):

                paths.append(os.path.join(root,file))

    return paths