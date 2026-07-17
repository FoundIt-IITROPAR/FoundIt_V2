from minio import Minio
from dotenv import load_dotenv
import os
import json

load_dotenv()

user = os.environ.get("MINIO_USER")
password = os.environ.get("MINIO_PASSWORD")

policy = {
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": { "AWS": ["*"] },
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::images/*"]
    }
  ]
}

client = Minio(
    "minio:9000",
    access_key=user,
    secret_key=password,
    secure=False
)

def create_bucket():

    if client.bucket_exists("images"):
        return 
    else:
        client.make_bucket("images")
        client.set_bucket_policy("images",json.dumps(policy))

def check_bucket_exists():
    return client.bucket_exists("images")