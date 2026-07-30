from fastapi import FastAPI, Response, Request, UploadFile, Form, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, timedelta, UTC
from app.tools import otp
from app.database import users, messages, items
from app.image import storage, vector
from app.startup.init_qdrant import create_collection, check_collection_exists
from app.startup.init_minio import create_bucket, check_bucket_exists
import redis 

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

@app.post("signup/verify")
def verify(body: Signup, response: Response):
    cached_otp = cache.get(body.collegeid)
    if cached_otp is None:
        response.status_code = 400
        return "OTP Expired"
    
    if cached_otp != body.otp:
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
    if cache.get(body.collegeid) is not None:
        otp = cache.get(body.collegeid)
        cache.delete(body.collegeid)
        cache.set(body.collegeid,otp,exp=300)
        otp.send_otp(body.email,otp)
        return "OTP sent"

@app.post("/login")
def login(body: Login, response: Response):
    user_exists = users.fetch_user({'collegeid': body.collegeid})
    if user_exists and user_exists['password_hash'] == body.password_hash:
        user_data = {k: v for k, v in user_exists.items() if k not in ('password_hash')}
        user_data['_id'] = str(user_data['_id'])
        return {"success": True, "user": user_data}
    elif not user_exists:
        return {"success": False, "message": "No account found with that email"}
    else:
        return {"success": False, "message": "Incorrect password"}
    
def run_ai_matching(metadata):
    try:
        vectors = vector.search_similar(metadata)
        
    except Exception as e:
        print(e)

@app.post('/additem')
def additem(background_tasks: BackgroundTasks,
            name: str = Form(), description: str = Form(), category: str = Form(),
            image: UploadFile = File(), type: str = Form(), location: str = Form(),
            date: str = Form(), userid: str = Form(), usercollegeid: str = Form(),
            usermail: str = Form(), userphone: str = Form(''), status: str = Form()):
    try:
        from ml import vectormodel
        import tempfile
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp:
            contents = image.file.read()
            tmp.write(contents)
            tmp.flush()
            vec = vectormodel.get_embedding(tmp.name)

        image_store = image.read()
        size = len(image_store)
        metadata={"name": name + userid}
        image_url = storage.upload_image(image_store,metadata,size)

        items.add_item(
            name=name, description=description, category=category, image_url=image_url,
            typeof=type, location=location, lostdate=date, userid=userid,
            usercollegeid=usercollegeid, usermail=usermail, status=status, vector=vec
        )
        metadata = {
            "name":name, "typeof":type, "vec": vec 
        }
        background_tasks.add_task(run_ai_matching, metadata)
        return {"success": True, "message": "Item posted successfully"}
    except Exception as e:
        return {"success": False, "message": str(e)}

@app.get('/items')
def get_all_items():
    try:
        items = items.get_items()
        for item in items:
            item['_id'] = str(item['_id'])
        return {"success": True, "items": items}
    except Exception as e:
        return {"success": False, "message": str(e)}

@app.get('/items/{item_type}')
def get_items_by_type(item_type: str):
    try:
        items = items.get_items_bytype(item_type)
        for item in items:
            item['_id'] = str(item['_id'])
        return {"success": True, "items": items}
    except Exception as e:
        return {"success": False, "message": str(e)}

@app.get('/item/{item_id}')
def get_item(item_id: int):
    try:
        item = items.fetch_item({"_id": item_id})
        if item:
            return {"success": True, "item": item}
        else:
            return {"success": False, "message": "Item not found"}
    except Exception as e:
        return {"success": False, "message": str(e)}

@app.get('/user/{user_id}')
def get_user(user_id: str):
    try:
        user = users.fetch_user({"_id": user_id})
        if user:
            user.pop('password_hash', None)
            return {"success": True, "user": user}
        else:
            return {"success": False, "message": "User not found"}
    except Exception as e:
        return {"success": False, "message": str(e)}

@app.post('/messages/send')
def send_message(sender_id: str = Form(), receiver_id: str = Form(),
                item_id: str = Form(), text: str = Form()):
    try:
        msg_id = messages.add_message(sender_id, receiver_id, item_id, text)
        return {"success": True, "message_id": msg_id}
    except Exception as e:
        return {"success": False, "message": str(e)}

@app.get('/messages/{sender_id}/{receiver_id}')
def get_messages(sender_id: str, receiver_id: str,):
    try:
        msgs = messages.get_conversation(sender_id, receiver_id)
        for m in msgs:
            m['_id'] = str(m['_id'])
        return {"success": True, "messages": msgs}
    except Exception as e:
        return {"success": False, "message": str(e)}

@app.get('/conversations/{user_id}')
def get_conversations(user_id: str):
    try:
        convs = messages.get_user_conversations(user_id)
        return {"success": True, "conversations": convs}
    except Exception as e:
        return {"success": False, "message": str(e)}

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
        return {"success": True, "items": items}
    except Exception as e:
        return {"success": False, "message": str(e)}

@app.post('/items/{item_id}/resolve')
def resolve_item(item_id: str, status: str = Form()):
    try:
        response = items.resolve_item(item_id)
        if response.get("success"):
            users.increment_karma(response.get("userid"), 5)
        return {"success": True}
    except Exception as e:
        return {"success": False, "message": str(e)}

@app.get('/karma/{collegeid}')
def get_karma(collegeid: str):
    try:
        karma = users.get_karma(collegeid)
        return {"success": True, "karma": karma}
    except Exception as e:
        return {"success": False, "karma": 0}

@app.get("/miniocheck")
def minio_check():
    return check_bucket_exists()

@app.get("/qdrantcheck")
def qdrant_check():
    return check_collection_exists()

@app.get("/backendcheck")
def health_check():
    return "Server Running Succesfully"
