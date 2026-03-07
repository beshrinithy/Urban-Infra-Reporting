import requests
import time
import os

API_URL = "http://localhost:5001/api/reports"
LOG_FILE = "../backend/logs/notifications.log"

def test_notification():
    print("STARTING NOTIFICATION SYSTEM TEST...")
    
    test_email = f"test_user_{int(time.time())}@citizen.com"
    payload = {
        "title": "Notification Test",
        "description": "This is a test to verify email/sms triggers.",
        "image": None,
        "contactEmail": test_email,
        "contactPhone": "+15550100",
        "latitude": 0,
        "longitude": 0
    }

    try:
        # 1. Submit
        print(f"   -> Submitting Report with Email: {test_email}")
        res = requests.post(API_URL, json=payload, timeout=5)
        if res.status_code != 201:
            print(f"   [FAIL] Failed to submit: {res.status_code}")
            return
            
        data = res.json()
        report_id = data['id']
        print(f"   [OK] Report Accepted (ID: {report_id})")

        # 2. Wait for Processing
        print("   [WAIT] Waiting 5s for AI Processing & Notification...")
        time.sleep(5)

        # 3. Check Log File (Retry Loop)
        log_path = os.path.join(os.path.dirname(__file__), LOG_FILE)
        
        print("   [CHECK] Checking for Notification Logs...")
        found_logs = False
        for i in range(10): # Wait up to 10 seconds for file to appear/update
            if os.path.exists(log_path):
                try:
                    with open(log_path, 'r') as f:
                        logs = f.read()
                        if test_email in logs:
                            found_logs = True
                            break
                except:
                    pass
            time.sleep(1)
            
        if found_logs:
            print("\n[VERIFIED] Email Simulation Log found!")
            for line in logs.split('\n'):
                if test_email in line:
                    print(f"   [LOG] Entry: {line}")
        else:
            if not os.path.exists(log_path):
                 print(f"\n[FAIL] Log file still not found at: {log_path}")
            else:
                 print("\n[FAIL] Log file exists but email not found.")

    except Exception as e:
        print(f"   [FAIL] Exception: {e}")

if __name__ == "__main__":
    test_notification()
