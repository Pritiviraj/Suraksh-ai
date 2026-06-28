import os
from fastapi import FastAPI, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
from dotenv import load_dotenv
from classifier import classify_message
from database import store_report, get_reports
from clustering import detect_campaigns
from collections import defaultdict
from datetime import datetime

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

# Rate limiting
request_counts = defaultdict(list)

def is_rate_limited(ip: str) -> bool:
    now = datetime.utcnow()
    request_counts[ip] = [t for t in request_counts[ip] if (now - t).seconds < 60]
    if len(request_counts[ip]) >= 5:
        return True
    request_counts[ip].append(now)
    return False

class ReportRequest(BaseModel):
    message: str
    city: str = "Unknown"
    lat: float = 0.0
    lng: float = 0.0

@app.get("/")
async def root():
    return {"status": "SurakshAI backend is live"}

@app.post("/analyze")
async def analyze(request: ReportRequest, req: Request):
    ip = req.client.host
    if is_rate_limited(ip):
        return {
            "verdict": "ERROR",
            "confidence": 0,
            "scam_type": "none",
            "red_flags": [],
            "explanation": "Too many requests. Please wait a minute.",
            "action": "Please try again in a minute.",
            "campaign": None
        }

    result = classify_message(request.message)

    if result["verdict"] in ["SCAM", "SUSPICIOUS"]:
        report_id = store_report({
            "message": request.message,
            "verdict": result["verdict"],
            "scam_type": result["scam_type"],
            "city": request.city,
            "lat": request.lat,
            "lng": request.lng,
            "red_flags": result["red_flags"]
        })
        result["report_id"] = report_id
        campaign = detect_campaigns(result["scam_type"], request.city)
        result["campaign"] = campaign
    else:
        result["campaign"] = {"detected": False, "report_count": 0, "alert": None}

    return result

@app.get("/reports")
async def get_all_reports():
    return get_reports()

@app.post("/whatsapp")
async def whatsapp_webhook(Body: str = Form(), From: str = Form()):
    from twilio.twiml.messaging_response import MessagingResponse
    from whatsapp import handle_whatsapp
    reply = handle_whatsapp(Body, From)
    resp = MessagingResponse()
    resp.message(reply)
    return Response(content=str(resp), media_type="application/xml")

@app.get("/health")
async def health():
    return {"status": "ok"}