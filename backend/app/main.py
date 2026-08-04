from fastapi import FastAPI, Response, Request, UploadFile, Form, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, timedelta, UTC
from bson import ObjectId
from app.tools import otp
from app.database import users, messages, items
from app.image import storage, vector
from app.startup.init_qdrant import create_collection, check_collection_exists
from app.startup.init_minio import create_bucket, check_bucket_exists
import redis 
import os

create_collection()
create_bucket()
cache = redis.Redis(host="redis",port=6379,decode_responses=True)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"]
)

class Login(BaseModel):
    collegeid: str
    password: str

class Signup(BaseModel):
    collegeid: str
    password_hash: str
    email: str
    otp: int | None = None

@app.post("/signup/start")
def signup(body: Signup, response: Response):
    otp = otp.send_new_otp(body.email)
    cache.set(body.collegeid, otp, ex=300)

    return "OTP Sent"

@app.post("/signup/verify")
def verify(body: Signup, response: Response):
    cached_otp = cache.get(body.collegeid)
    if cached_otp is None:
        response.status_code = 400
        return "OTP Expired"
    
    if str(cached_otp) != str(body.otp):
        response.status_code = 400
        return "Invalid OTP"

    users.add_user(
        collegeid=body.collegeid,
        email=body.email,
        password_hash=body.password_hash,
        is_verified=True
    )
    return "Signup Successful"

@app.post('/signup/resend')
def resendotp(body: Signup):
    cached_otp = cache.get(body.collegeid)
    if cached_otp is not None:
        cache.delete(body.collegeid)
        cache.set(body.collegeid, cached_otp, ex=300)
        otp.send_otp(body.email, int(cached_otp))
        return {"status": True, "message": "OTP sent"}
    return {"status": False, "message": "No OTP to resend"}

@app.post("/login")
def login(body: Login, response: Response):
    user_exists = users.fetch_user({'collegeid': body.collegeid})
    if user_exists and user_exists['password_hash'] == body.password_hash:
        user_data = {k: v for k, v in user_exists.items() if k not in ('password_hash')}
        user_data['_id'] = str(user_data['_id'])
        return {"status": True, "user": user_data}
    elif not user_exists:
        return {"status": False, "message": "No account found with that email"}
    else:
        return {"status": False, "message": "Incorrect password"}
    
def run_ai_matching(metadata):
    try:
        vectors = vector.search_similar(metadata)
        
    except Exception as e:
        print(e)

@app.post('/additem')
async def additem(background_tasks: BackgroundTasks,
            name: str = Form(), description: str = Form(), category: str = Form(),
            image: UploadFile = File(), type: str = Form(), location: str = Form(),
            date: str = Form(), userid: str = Form(), usercollegeid: str = Form(),
            usermail: str = Form(), userphone: str = Form(''), status: str = Form()):
    try:
        embedder_url = os.environ["EMBEDDER_URL"]
        import httpx
        image_bytes = await image.read()
        async with httpx.AsyncClient() as client:  
            response = await client.post(
                f'{embedder_url}/embed/image',
                files={
                    'file': (image.filename, image_bytes, image.content_type)
                }
            )
        vector = response.json()['vector']

        image_store = image_bytes
        size = len(image_store)
        metadata={"name": name + userid}
        image_url = storage.upload_image(image_store,metadata,size)

        items.add_item(
            name=name, description=description, category=category, image_url=image_url,
            typeof=type, location=location, lostdate=date, userid=userid,
            usercollegeid=usercollegeid, usermail=usermail, status=status, vector=vector
        )
        metadata = {
            "name":name, "typeof":type, "vec": vector 
        }
        background_tasks.add_task(run_ai_matching, metadata)
        return {"status": True, "message": "Item posted successfully"}
    except Exception as e:
        return {"status": False, "message": str(e)}

@app.get('/items')
def get_all_items():
    try:
        items = items.get_items()
        for item in items:
            item['_id'] = str(item['_id'])
        return {"status": True, "items": items}
    except Exception as e:
        return {"status": False, "message": str(e)}

@app.get('/items/{item_type}')
def get_items_by_type(item_type: str):
    try:
        items_list = items.get_items_bytype(item_type)
        for item in items_list:
            item['_id'] = str(item['_id'])
        return {"status": True, "items": items_list}
    except Exception as e:
        return {"status": False, "message": str(e)}

@app.get('/item/{item_id}')
def get_item(item_id: str):
    try:
        item = items.fetch_item({"_id": ObjectId(item_id)})
        if item:
            item['_id'] = str(item['_id'])
            return {"status": True, "item": item}
        else:
            return {"status": False, "message": "Item not found"}
    except Exception as e:
        return {"status": False, "message": str(e)}

@app.get('/user/{user_id}')
def get_user(user_id: str):
    try:
        user = users.fetch_user({"_id": user_id})
        if user:
            user.pop('password_hash', None)
            return {"status": True, "user": user}
        else:
            return {"status": False, "message": "User not found"}
    except Exception as e:
        return {"status": False, "message": str(e)}

@app.post('/messages/send')
def send_message(sender_id: str = Form(), receiver_id: str = Form(),
                item_id: str = Form(), text: str = Form()):
    try:
        msg_id = messages.add_message(sender_id, receiver_id, item_id, text)
        return {"status": True, "message_id": msg_id}
    except Exception as e:
        return {"status": False, "message": str(e)}

@app.get('/messages/{sender_id}/{receiver_id}')
def get_messages(sender_id: str, receiver_id: str,):
    try:
        msgs = messages.get_conversation(sender_id, receiver_id)
        for m in msgs:
            m['_id'] = str(m['_id'])
        return {"status": True, "messages": msgs}
    except Exception as e:
        return {"status": False, "message": str(e)}

@app.get('/conversations/{user_id}')
def get_conversations(user_id: str):
    try:
        convs = messages.get_user_conversations(user_id)
        return {"status": True, "conversations": convs}
    except Exception as e:
        return {"status": False, "message": str(e)}

@app.get('/debug/user/{email:path}')
def debug_user(email: str):
    user = users.fetch_user({'email': email})
    if not user:
        return {"found": False, "email": email}
    return {
        "found": True,
        "email": user.get('email'),
        "collegeid": user.get('collegeid'),
        "is_verified": user.get('is_verified'),
        "has_password_hash": bool(user.get('password_hash'))
    }

@app.get('/user-items/{userid}')
def get_user_items(userid: str):
    try:
        items = items.get_user_items(userid)
        for item in items:
            item['_id'] = str(item['_id'])
        return {"status": True, "items": items}
    except Exception as e:
        return {"status": False, "message": str(e)}

@app.post('/items/{item_id}/resolve')
def resolve_item(item_id: str, status: str = Form()):
    try:
        response = items.resolve_item(item_id)
        if response.get("success"):
            users.increment_karma(response.get("userid"), 5)
        return {"status": True}
    except Exception as e:
        return {"status": False, "message": str(e)}

@app.get('/karma/{collegeid}')
def get_karma(collegeid: str):
    try:
        karma = users.get_karma(collegeid)
        return {"status": True, "karma": karma}
    except Exception as e:
        return {"status": False, "karma": 0}

@app.get("/miniocheck")
def minio_check():
    return check_bucket_exists()

@app.get("/qdrantcheck")
def qdrant_check():
    return check_collection_exists()

@app.get("/backendcheck")
def health_check():
    return "Server Running Succesfully"
