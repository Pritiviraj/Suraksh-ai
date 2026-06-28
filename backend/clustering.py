import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

supabase = create_client(
    os.environ.get("SUPABASE_URL"),
    os.environ.get("SUPABASE_KEY")
)

def detect_campaigns(scam_type: str, city: str) -> dict:
    try:
        two_hours_ago = (datetime.utcnow() - timedelta(hours=2)).isoformat()

        result = supabase.table("reports")\
            .select("*")\
            .eq("scam_type", scam_type)\
            .eq("city", city)\
            .gte("timestamp", two_hours_ago)\
            .execute()

        count = len(result.data)

        if count >= 3:
            return {
                "detected": True,
                "report_count": count,
                "alert": f"ACTIVE CAMPAIGN DETECTED: {count} people in {city} reported a {scam_type.replace('_', ' ')} scam in the last 2 hours. Stay alert."
            }
        elif count >= 2:
            return {
                "detected": False,
                "report_count": count,
                "alert": f"{count} similar reports in {city} recently. Stay cautious."
            }

        return {
            "detected": False,
            "report_count": count,
            "alert": None
        }

    except Exception as e:
        print(f"Clustering error: {e}")
        return {
            "detected": False,
            "report_count": 0,
            "alert": None
        }