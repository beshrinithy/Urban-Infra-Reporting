import requests
import time
import base64
import os

# Configuration
# Configuration
API_URL = "http://127.0.0.1:5001/api/reports"
IMAGE_PATH = "test_pothole.jpg"
IMAGE_PATH = "test_pothole.jpg"

def create_dummy_image():
    from PIL import Image, ImageDraw
    img = Image.new('RGB', (224, 224), color = (73, 109, 137))
    d = ImageDraw.Draw(img)
    d.text((10,10), "Pothole Test", fill=(255, 255, 0))
    img.save(IMAGE_PATH)
    print(f"✅ Generated test image: {IMAGE_PATH}")

def encode_image(path):
    with open(path, "rb") as image_file:
        encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
    return f"data:image/jpeg;base64,{encoded_string}"

def test_flow():
    # 1. Create Image
    create_dummy_image()
    
    # 2. Prepare Payload
    payload = {
        "title": "Automated Stream Test",
        "description": "There is a large pothole on the test road.",
        "latitude": 12.9716,
        "longitude": 77.5946,
        "image": encode_image(IMAGE_PATH)
    }
    
    # 3. Submit Report (Expect Fast Response)
    print("\n--- Step 1: Submitting Report ---")
    start_time = time.time()
    try:
        response = requests.post(API_URL, json=payload)
        elapsed = time.time() - start_time
        
        if response.status_code == 201:
            data = response.json()
            print(f"✅ API Responded in {elapsed:.3f}s")
            print(f"🆔 Report ID: {data['id']}")
            print(f"📊 Initial Status: {data['status']} (Should be 'Processing')")
            
            if data['status'] == 'Processing':
                print("✅ Stream Processing Logic: CONFIRMED (API did NOT block)")
                trace_id = data.get('traceId')
                if trace_id:
                     print(f"🔍 Trace ID: {trace_id}")
                else:
                     # It might be in the object if my controller change didn't return it at top level
                     # But my code puts it in { ...result, traceId }
                     print("⚠️ Trace ID missing from response (Schema mismatch might hide it if not returned explicitly)")
            else:
                print("❌ Stream Processing Logic: FAILED (API blocked or worker synchronous)")
                
            return data['id']
        else:
            print(f"❌ API Failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ Connection Failed: {e}")
        return None

def poll_status(report_id):
    # 4. Poll for Update (Worker Activity)
    print("\n--- Step 2: Waiting for AI Worker ---")
    
    for i in range(10): # Wait up to 10 seconds
        time.sleep(1)
        try:
            # We need a GET endpoint for single report or just list all and find
            # Ideally we have GET /api/reports?search=Automated
            response = requests.get(f"http://127.0.0.1:5001/api/reports")
            if response.status_code == 200:
                reports = response.json()
                target = next((r for r in reports if r['id'] == report_id), None)
                
                if target:
                    print(f"⏳ T+{i}s Status: {target['status']} | Category: {target['category']}")
                    if target['status'] != 'Processing':
                        print("\n✅ WORKER SUCCESS!")
                        print(f"🎯 Final Category: {target['category']}")
                        conf = target.get('confidence', 0)
                        print(f"🧠 AI Confidence: {conf*100:.1f}%")
                        print(f"⚖️ Priority: {target['priority']}")
                        print(f"🏢 Department: {target['department']}")
                        return
                else:
                    print("⚠️ Report not found via GET (DB Lag?)")
        except Exception as e:
            print(f"Poll Error: {e}")
            
    print("\n❌ Worker Timed Out (Did not update status in 10s)")

if __name__ == "__main__":
    report_id = test_flow()
    if report_id:
        poll_status(report_id)
