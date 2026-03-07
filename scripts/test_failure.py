import requests
import base64
import os
import time
import json
import random

API_URL = "http://localhost:5001/api/reports"

def generate_noise_image():
    # Create a small random bytes sequence to simulate a non-sensical image
    # Note: AI might reject it or classify low confidence. This tests robustness.
    return "data:image/jpeg;base64," + base64.b64encode(os.urandom(1024)).decode('utf-8')

def test_failure_path():
    print("🧪 STARTING FAILURE PATH TEST (Edge Cases)...")
    
    payload = {
        "title": "Noise Test Report",
        "description": "Testing AI robustness with random noise.",
        "image": generate_noise_image(),
        "latitude": 0,
        "longitude": 0
    }

    try:
        # 1. Submit Report
        print("   ➡️ Submitting 'Noise' Report...")
        res = requests.post(API_URL, json=payload, timeout=10)
        
        if res.status_code != 201:
            print(f"   ❌ API Submission Failed: {res.status_code}")
            print(f"   📄 Response: {res.text}")
            return
            
        try:
            data = res.json()
        except Exception as e:
            print(f"   ❌ JSON Decode Error: {e}")
            print(f"   📄 Raw Response: {res.text}")
            return
        report_id = data['id']
        trace_id = data.get('traceId', 'N/A')
        print(f"   ✅ API Accepted (ID: {report_id}, Trace: {trace_id})")
        print(f"   ℹ️ Initial Status: {data['status']}")

        # 2. Poll for Result
        print("   ⏳ Polling for Worker result (expecting 'Needs Review' or 'Other')...")
        for i in range(10):
            time.sleep(1)
            poll = requests.get(f"{API_URL}/{report_id}")
            target = poll.json()
            
            if target['status'] != 'Processing':
                print(f"   ✅ Processing Complete!")
                print(f"   🎯 Final Status: {target['status']}")
                print(f"   🧠 Confidence: {target.get('confidence', 0)*100:.1f}%")
                print(f"   📂 Category: {target.get('category')}")
                print(f"   🏢 Department: {target.get('department')}")
                
                if target['status'] == 'Needs Review' or target['confidence'] < 0.5:
                    print("\n✅ TEST PASSED: System correctly flagged low-confidence/garbage input.")
                else:
                    print("\n⚠️ TEST WARNING: AI might have hallucinated a category. Check confidence.")
                return

        print("\n❌ TEST FAILED: Timeout waiting for processing.")

    except Exception as e:
        print(f"\n❌ TEST FAILED: Exception: {e}")

if __name__ == "__main__":
    test_failure_path()
