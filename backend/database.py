import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

supabase = create_client(
    os.environ.get("SUPABASE_URL"),
    os.environ.get("SUPABASE_KEY")
)

def store_report(report: dict) -> str:
    try:
        result = supabase.table("reports").insert(report).execute()
        return result.data[0]["id"]
    except Exception as e:
        print(f"Database error: {e}")
        return None

def get_reports():
    try:
        result = supabase.table("reports")\
            .select("*")\
            .order("timestamp", desc=True)\
            .limit(500)\
            .execute()
        return result.data
    except Exception as e:
        print(f"Database error: {e}")
        return []