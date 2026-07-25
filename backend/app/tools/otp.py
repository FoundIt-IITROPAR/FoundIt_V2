import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import secrets
from dotenv import load_dotenv
import os

load_dotenv()

def send_new_otp(email):
    def generate_otp():
        return secrets.randbelow(900000)+100000

    otp = generate_otp()
    sender_email = os.environ.get("SENDER_EMAIL")
    password =os.environ.get("EMAIL_PASSWORD")

    try:
        with smtplib.SMTP("smtp.gmail.com",587) as server:
            server.starttls()
            server.login(sender_email,password)
            msg = MIMEMultipart()
            msg["From"] = sender_email
            msg["To"] = email
            msg["Subject"] = "OTP to login your FoundIt Account"

            msg.attach(MIMEText("Your OTP for the FoundIt Account is","plain"))
            msg.attach(MIMEText(f"<div><button style=\"background-color: #0077B6; border-radius: 5px; padding: 10px; color: white; border: none\">{otp}</button></div>","html"))
            server.sendmail(sender_email,email,msg.as_string())
            print("Sent")
            server.quit()

    except Exception as e:
        print(e)
    
    return otp

def send_otp(email,otp):
    sender_email = os.environ.get("SENDER_EMAIL")
    password =os.environ.get("EMAIL_PASSWORD")

    try:
        with smtplib.SMTP("smtp.gmail.com",587) as server:
            server.starttls()
            server.login(sender_email,password)
            msg = MIMEMultipart()
            msg["From"] = sender_email
            msg["To"] = email
            msg["Subject"] = "OTP to login your FoundIt Account"

            msg.attach(MIMEText("Your OTP for the FoundIt Account is","plain"))
            msg.attach(MIMEText(f"<div><button style=\"background-color: #0077B6; border-radius: 5px; padding: 10px; color: white; border: none\">{otp}</button></div>","html"))
            server.sendmail(sender_email,email,msg.as_string())
            print("Sent")
            server.quit()

    except Exception as e:
        print(e)
    
    return otp
