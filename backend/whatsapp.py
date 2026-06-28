<<<<<<< HEAD
from classifier import classify_message
from database import store_report
from clustering import detect_campaigns

def handle_whatsapp(incoming_msg: str, from_number: str) -> str:
    
    # Greeting handler
    greetings = ["hi", "hello", "help", "start", "helo", "hey"]
    if incoming_msg.strip().lower() in greetings:
        return """🛡️ *Welcome to SurakshAI*

I help you detect scams instantly.

Simply send me:
- A suspicious message you received
- Or describe a suspicious call in your own words

I will tell you immediately if it's a scam.

_Supported languages: English, Hindi, Telugu, Tamil_"""

    # Classify the message
    result = classify_message(incoming_msg)

    verdict_emoji = {
        "SCAM": "🚨",
        "SUSPICIOUS": "⚠️",
        "LEGITIMATE": "✅",
        "ERROR": "❓"
    }

    emoji = verdict_emoji.get(result["verdict"], "❓")

    # Build red flags text
    red_flags_text = ""
    if result.get("red_flags"):
        flags = "\n".join([f"  • {flag}" for flag in result["red_flags"]])
        red_flags_text = f"\n\n*Red Flags Detected:*\n{flags}"

    # Build main response
    response = f"""{emoji} *{result['verdict']}* (Confidence: {result['confidence']}%)

*What this is:* {result['explanation']}

*What you should do:* {result['action']}{red_flags_text}"""

    # Add campaign alert if detected
    if result.get("campaign", {}).get("detected"):
        response += f"\n\n⚠️ *ACTIVE SCAM CAMPAIGN:* {result['campaign']['alert']}"

    # Add report link for scams
    if result["verdict"] in ["SCAM", "SUSPICIOUS"]:
        response += "\n\n📝 *Report this:* https://cybercrime.gov.in"
        
        # Store in database
        store_report({
            "message": incoming_msg,
            "verdict": result["verdict"],
            "scam_type": result["scam_type"],
            "city": "Unknown",
            "lat": 0.0,
            "lng": 0.0,
            "red_flags": result.get("red_flags", [])
        })

=======
from classifier import classify_message
from database import store_report
from clustering import detect_campaigns

def handle_whatsapp(incoming_msg: str, from_number: str) -> str:
    
    # Greeting handler
    greetings = ["hi", "hello", "help", "start", "helo", "hey"]
    if incoming_msg.strip().lower() in greetings:
        return """🛡️ *Welcome to SurakshAI*

I help you detect scams instantly.

Simply send me:
- A suspicious message you received
- Or describe a suspicious call in your own words

I will tell you immediately if it's a scam.

_Supported languages: English, Hindi, Telugu, Tamil_"""

    # Classify the message
    result = classify_message(incoming_msg)

    verdict_emoji = {
        "SCAM": "🚨",
        "SUSPICIOUS": "⚠️",
        "LEGITIMATE": "✅",
        "ERROR": "❓"
    }

    emoji = verdict_emoji.get(result["verdict"], "❓")

    # Build red flags text
    red_flags_text = ""
    if result.get("red_flags"):
        flags = "\n".join([f"  • {flag}" for flag in result["red_flags"]])
        red_flags_text = f"\n\n*Red Flags Detected:*\n{flags}"

    # Build main response
    response = f"""{emoji} *{result['verdict']}* (Confidence: {result['confidence']}%)

*What this is:* {result['explanation']}

*What you should do:* {result['action']}{red_flags_text}"""

    # Add campaign alert if detected
    if result.get("campaign", {}).get("detected"):
        response += f"\n\n⚠️ *ACTIVE SCAM CAMPAIGN:* {result['campaign']['alert']}"

    # Add report link for scams
    if result["verdict"] in ["SCAM", "SUSPICIOUS"]:
        response += "\n\n📝 *Report this:* https://cybercrime.gov.in"
        
        # Store in database
        store_report({
            "message": incoming_msg,
            "verdict": result["verdict"],
            "scam_type": result["scam_type"],
            "city": "Unknown",
            "lat": 0.0,
            "lng": 0.0,
            "red_flags": result.get("red_flags", [])
        })

>>>>>>> 1303efccb5da36f78195f341a86cfc1251f653ae
    return response