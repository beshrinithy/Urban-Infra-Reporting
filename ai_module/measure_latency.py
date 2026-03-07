import requests
import json

tests = [
    {
        "name": "Normal Road Issue",
        "description": "Large pothole causing accidents on highway",
        "expected_category": "Road"
    },
    {
        "name": "Critical Fire Issue",
        "description": "Fire on the highway near gas station",
        "expected_severity": "Critical"
    },
    {
        "name": "Water Issue",
        "description": "Water pipe burst flooding street",
        "expected_category": "Water"
    }
]

latencies = []

for i, test in enumerate(tests):
    print(f"\n{'='*60}")
    print(f"TEST {i+1}: {test['name']}")
    print(f"{'='*60}")
    
    data = {
        "description": test['description'],
        "traceId": f"test_{i+1}"
    }
    
    response = requests.post("http://127.0.0.1:8000/predict/multimodal", data=data)
    result = response.json()
    
    print(f"Category: {result['category']}")
    print(f"Confidence: {result['confidence']:.4f}")
    print(f"Severity: {result['severity']}")
    print(f"Latency: {result['pipeline_latency_ms']} ms")
    
    latencies.append(result['pipeline_latency_ms'])
    
    if 'explanation' in result:
        exp = result['explanation']
        print(f"Text Prediction: {exp['text_top_category']} ({exp['text_confidence']:.4f})")

print(f"\n{'='*60}")
print("SUMMARY")
print(f"{'='*60}")
avg_latency = sum(latencies) / len(latencies)
print(f"Average Pipeline Latency (CPU): {avg_latency:.2f} ms")
print(f"Min: {min(latencies):.2f} ms | Max: {max(latencies):.2f} ms")
print(f"{'='*60}")
