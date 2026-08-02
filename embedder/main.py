from fastapi import FastAPI, UploadFile, File
from embedder import embed_image, embed_text

app = FastAPI()

@app.get("/check")
def check():
    return "Embedder running succesfully"

@app.get("/embed/image")
def embedfile(image_bytes: bytes):
    vector = embed_image(image_bytes)
    return {
        'vector': vector
    }