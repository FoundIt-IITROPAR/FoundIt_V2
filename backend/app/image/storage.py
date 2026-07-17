from minio import Minio
from dotenv import load_dotenv
import os
load_dotenv()

user = os.environ.get("MINIO_USER")
password = os.environ.get("MINIO_PASSWORD")

client = Minio(
    "minio:9000",
    access_key=user,
    secret_key=password,
    secure=False
)

def upload_image(file,metadata):
    client.append_object(
        bucket_name="Images",
        object_name=metadata["id"],
        data=file
    )
    return f"https://foundit.com/Images/{metadata["id"]}"

def delete_image(metadata):
    client.remove_object(
        bucket_name="Images",
        object_name=metadata["id"]
    )