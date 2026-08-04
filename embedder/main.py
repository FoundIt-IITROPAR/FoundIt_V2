from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from embedder import embed_image

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/check")
def check():
    return "Embedder running succesfully"

@app.post("/embed/image")
async def embedfile(file: UploadFile = File(...)):
    image_bytes = await file.read()
    vector = embed_image(image_bytes)
    return {
        'vector': vector
    }