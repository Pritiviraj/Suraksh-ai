from classifier import classify_message
from database import store_report
from clustering import detect_campaigns

def handle_whatsapp(incoming_msg: str, from_number: str) -> str:
    greetings = ["hi", "hello", "help", "start", "helo", "hey"]
    if incoming_msg.strip().lower() in greetings:
        return """Welcome to SurakshAI. I help you detect scams instantly. Simply send me a suspicious message or describe a suspicious call. I will tell you immediately if it is a scam."""

    result = classify_message(incoming_msg)

    verdict_emoji = {
        "SCAM": "SCAM DETECTED",
        "SUSPICIOUS": "SUSPICIOUS",
        "LEGITIMATE": "LEGITIMATE",
        "ERROR": "ERROR"
    }

    label = verdict_emoji.get(result["verdict"], "UNKNOWN")

    red_flags_text = ""
    if result.get("red_flags"):
        flags = "\n".join([f"- {flag}" for flag in result["red_flags"]])
        red_flags_text = f"\n\nRed Flags:\n{flags}"

    response = f"""{label} (Confidence: {result['confidence']}%)

What this is: {result['explanation']}

What you should do: {result['action']}{red_flags_text}"""

    if result.get("campaign", {}).get("detected"):
        response += f"\n\nALERT: {result['campaign']['alert']}"

    if result["verdict"] in ["SCAM", "SUSPICIOUS"]:
        response += "\n\nReport this: https://cybercrime.gov.in"
        store_report({
            "message": incoming_msg,
            "verdict": result["verdict"],
            "scam_type": result["scam_type"],
            "city": "Unknown",
            "lat": 0.0,
            "lng": 0.0,
            "red_flags": result.get("red_flags", [])
        })

    return response