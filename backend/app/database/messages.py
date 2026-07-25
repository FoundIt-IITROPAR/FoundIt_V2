from pymongo import MongoClient
from datetime import datetime
from bson import ObjectId

client = MongoClient("mongodb://mongodb:27017")

messages = client["FoundIt"]["messages"]

def add_message(sender_id, receiver_id, item_id, text):
    doc = {
        'sender_id': sender_id,
        'receiver_id': receiver_id,
        'item_id': item_id,
        'text': text,
        'timestamp': datetime.now().isoformat(),
    }
    return str(messages.insert_one(doc).inserted_id)

def get_conversation(user1_id, user2_id):
    query = {
        '$or': [
            {'sender_id': user1_id, 'receiver_id': user2_id},
            {'sender_id': user2_id, 'receiver_id': user1_id}
        ]
    }
    return list(messages.find(query).sort('timestamp', 1))

def get_user_conversations(user_id):
    query = {'$or': [{'sender_id': user_id}, {'receiver_id': user_id}]}
    conversations = {}
    for msg in messages.find(query).sort('timestamp', -1):
        other_id = msg['receiver_id'] if msg['sender_id'] == user_id else msg['sender_id']
        key = f"{other_id}_{msg['item_id']}"
        if key not in conversations:
            conversations[key] = {
                'other_user_id': other_id,
                'item_id': msg['item_id'],
                'last_message': msg['text'],
                'timestamp': msg['timestamp'],
            }
    return list(conversations.values())

def delete_message(message_id):
    messages.delete_one({'_id': ObjectId(message_id)})
