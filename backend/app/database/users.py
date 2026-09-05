from pymongo import MongoClient
from datetime import datetime
import hashlib

client = MongoClient("mongodb://mongodb:27017")

users = client["FoundIt"]["users"]
karma_events = client["FoundIt"]["karma_events"]


def add_user(collegeid, email, password_hash, is_verified=False, name=""):
    dt = datetime.now().isoformat().encode('utf-8')
    userid = hashlib.sha256(dt).hexdigest()
    users.update_one(
        {'email': email},
        {'$set': {
            'collegeid': collegeid,
            'name': name or email.split('@')[0],
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
        {"collegeid": collegeid},
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
    user = users.find_one({"$or": [{"collegeid": collegeid}, {"_id": collegeid}, {"email": collegeid}]}, {"karma_points": 1})
    return int(user.get("karma_points", 0)) if user else 0

def add_karma_event(collegeid, amount, reason):
    users.update_one({"collegeid": collegeid}, {"$inc": {"karma_points": amount}})
    karma_events.insert_one({"userId": collegeid, "amount": amount, "reason": reason,
                             "createdAt": datetime.now().isoformat()})

def get_karma_events(collegeid):
    user = users.find_one({"$or": [{"collegeid": collegeid}, {"_id": collegeid}, {"email": collegeid}]})
    identifiers = [collegeid]
    if user:
        identifiers.extend([user.get("collegeid"), str(user.get("_id"))])
    return list(karma_events.find({"userId": {"$in": identifiers}}).sort("createdAt", -1))