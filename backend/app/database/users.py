from pymongo import MongoClient
from datetime import datetime
import hashlib

client = MongoClient("mongodb://mongodb:27017")

users = client["FoundIt"]["users"]


def add_user(collegeid, email, password_hash, is_verified=False):
    dt = datetime.now().isoformat().encode('utf-8')
    userid = hashlib.sha256(dt).hexdigest()
    users.update_one(
        {'email': email},
        {'$set': {
            'collegeid': collegeid,
            'password_hash': password_hash,
            'is_verified': is_verified,
            'karma_points': 0
        }, '$setOnInsert': {'_id': userid}},
        upsert=True
    )
    return

def fetch_user(doc):
    return users.find_one(doc)

def change_password(collegeid, password_hash):
    users.update_one(
        {"college_id":collegeid},
        {"$set":{
            "password_hash": password_hash
        }}
    )
    return

def increment_karma(collegeid, points):
    users.update_one(
        {"collegeid": collegeid}, 
        {"$inc":{
            "karma_points": points
        }}
    )
    return

def get_karma(collegeid):
    user = users.find_one({"collegeid": collegeid}, {"karma_points": 1})
    return int(user.get("karma", 0)) if user else 0