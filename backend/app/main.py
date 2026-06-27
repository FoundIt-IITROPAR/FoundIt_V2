from fastapi import FastAPI
from pydantic import BaseModel
import redis 

app = FastAPI()

redis_client = redis.Redis(host="redis",port=6379)






















@app.get("/health")
def health_check():
    return "Server Running Succesfully"
