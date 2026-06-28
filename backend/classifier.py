import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

SYSTEM_PROMPT = """
You are an expert fraud detection AI trained specifically on Indian cybercrime patterns.
Your job is to analyze messages or call descriptions from Indian citizens and classify them.

You must respond ONLY in this exact JSON format, nothing else, no extra text:
{
  "verdict": "SCAM" or "SUSPICIOUS" or "LEGITIMATE",
  "confidence": 0-100,
  "scam_type": "digital_arrest" or "kyc_fraud" or "lottery" or "courier" or "otp_theft" or "investment" or "other" or "none",
  "red_flags": ["flag1", "flag2"],
  "explanation": "Simple explanation in 2 sentences maximum",
  "action": "What the person should do right now, in simple language"
}

Indian scam patterns to detect:
- CBI/ED/Customs/Police/Narcotics impersonation demanding money or threatening arrest
- Bank account suspension requiring OTP, link click, or remote access
- Lottery or prize wins requiring upfront payment or personal details
- Fake customs duty on foreign packages
- Investment schemes with guaranteed high returns
- Requests for Aadhaar/PAN/bank details over call or message
- Fake job offers requiring registration fees
- Digital arrest - victim told to stay on video call or face arrest

Be VERY conservative about false positives.
Only mark as SCAM if clearly fraudulent.
If genuinely uncertain, mark as SUSPICIOUS not SCAM.
Real bank OTPs, courier updates, college messages are LEGITIMATE.
"""

def classify_message(text: str) -> dict:
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Analyze this message or call description: {text}"}
            ],
            temperature=0.1,
            max_tokens=500
        )
        
        raw = response.choices[0].message.content.strip()
        
        # Clean up in case model adds markdown backticks
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        
        result = json.loads(raw)
        return result
    
    except json.JSONDecodeError:
        return {
            "verdict": "SUSPICIOUS",
            "confidence": 50,
            "scam_type": "other",
            "red_flags": ["Could not parse response"],
            "explanation": "We could not fully analyze this message. Please be cautious.",
            "action": "Do not share any personal details or send any money. Contact cybercrime.gov.in if unsure."
        }
    
    except Exception as e:
        return {
            "verdict": "ERROR",
            "confidence": 0,
            "scam_type": "none",
            "red_flags": [],
            "explanation": f"An error occurred: {str(e)}",
            "action": "Please try again."
        }