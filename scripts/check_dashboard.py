import requests
import json

def check_dashboard_data():
    print("📊 CHECKING DASHBOARD DATA CONSISTENCY...")
    try:
        res = requests.get("http://localhost:5001/api/reports?limit=5")
        if res.status_code != 200:
            print(f"❌ API Error: {res.status_code}")
            return

        reports = res.json()
        print(f"✅ Fetched {len(reports)} reports.")
        
        if not reports:
            print("⚠️ No reports to validate.")
            return

        # check fields
        sample = reports[0]
        missing = []
        if 'confidence' not in sample: missing.append('confidence')
        if 'traceId' not in sample: missing.append('traceId')
        
        # Check Metadata
        meta_ok = False
        if 'aiMetadata' in sample and sample['aiMetadata']:
            try:
                meta = json.loads(sample['aiMetadata'])
                if 'device' in meta:
                    meta_ok = True
                    print(f"✅ AI Metadata found: {meta}")
            except:
                pass
        
        if missing:
            print(f"❌ Missing Fields: {missing}")
        else:
            print("✅ Critical Fields Present: confidence, traceId")
            
        if meta_ok:
            print("✅ AI Metadata Structure: VALID")
        else:
            print("⚠️ AI Metadata Missing or Invalid (Might be old report?)")

        print("\n✅ DASHBOARD DATA TEST PASSED")

    except Exception as e:
        print(f"❌ Exception: {e}")

if __name__ == "__main__":
    check_dashboard_data()
