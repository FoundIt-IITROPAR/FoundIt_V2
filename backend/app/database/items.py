from pymongo import MongoClient

client = MongoClient("mongodb://mongodb:27017/")
items = client["FoundIt"]["items"]

def add_item(name, description, category, image_url, typeof, location, lostdate, userid, usercollegeid, usermail, status, vector):
    doc = {
        "item_name": name,
        "item_description": description,
        "item_category": category,
        "image_url": image_url,
        "type": typeof,
        "location": location,
        "date": lostdate,
        "userid": userid,
        "usercollegeid": usercollegeid,
        "usermail": usermail,
        "status": status,
        "vector": vector
    }
    return str(items.insert_one(doc).inserted_id)

def fetch_item(doc):
    return items.find_one(doc)

def delete_item(doc):
    items.delete_one(doc)

def get_items():
    items = list(items.find(
        ({"status":"active"}).sort("date",-1).limit(50)
    ))
    return items

def get_items_bytype(item_type):
    items = items.find(
        {"type": item_type, "status": "active"}
    ).sort("date", -1).limit(50)
    return list(items)

def get_user_items(userid):
    items = list(items.find(
        {"userid":userid}.sort("date",-1)
    ))
    return items

def resolve_item(item_id):

    from bson import ObjectId

    item = items.find_one({"_id": ObjectId(item_id)})
    if not item:
        return {"success" : False, "message": "No Item Found"}
    items.update_one({"_id":ObjectId(item_id)},{"$set": {"status":"resolved"}})
    return {"success": True, "message": "Return Updated", "userid": item["userid"]}