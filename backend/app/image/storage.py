from minio import Minio
from dotenv import load_dotenv
import os
import io
load_dotenv("../../.env")

user = os.environ.get("MINIO_USER","minioadmin")
password = os.environ.get("MINIO_PASSWORD","miniopassword")

client = Minio(
    "minio:9000",
    access_key=user,
    secret_key=password,
    secure=False
)

def upload_image(file,metadata,image_type="image/jpeg"):
    image_bytes = io.BytesIO(file)
    image_name = metadata["name"]
    size = len(file)
    _ ,ext = image_type.split("/")
    if ext == "jpeg":
        ext = "jpg"

    object_name = f"{image_name}.{ext}"

    client.put_object(
        bucket_name="images",
        object_name=object_name,
        data=image_bytes,
        length=size,
        content_type=image_type
    )
    return f"https://localhost:9000/images/{object_name}"

def delete_image(metadata):
    client.remove_object(
        bucket_name="images",
        object_name=metadata["name"]
    )
