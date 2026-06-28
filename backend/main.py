import os
from fastapi import FastAPI, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
from dotenv import load_dotenv
from classifier import classify_message
from database import store_report, get_reports
from clustering import detect_campaigns

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

class ReportRequest(BaseModel):
    message: str
    city: str = "Unknown"
    lat: float = 0.0
    lng: float = 0.0

@app.get("/")
async def root():
    return {"status": "SurakshAI backend is live"}

@app.post("/analyze")
async def analyze(request: ReportRequest):
    # Step 1 - classify
    result = classify_message(request.message)

    # Step 2 - store if scam or suspicious
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

        # Step 3 - check for active campaign
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