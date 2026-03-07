import requests
import json

# Simple test
data = {
    "description": "Large pothole causing accidents on highway",
    "traceId": "test_001"
}

print("Testing multimodal endpoint...")
response = requests.post("http://127.0.0.1:8000/predict/multimodal", data=data)
result = response.json()

print("\n" + "="*60)
print("RESPONSE:")
print("="*60)
print(json.dumps(result, indent=2))

print("\n" + "="*60)
print("KEY METRICS:")
print("="*60)
print(f"Category: {result['category']}")
print(f"Confidence: {result['confidence']:.4f}")
print(f"Severity: {result['severity']}")
print(f"Pipeline Latency: {result['pipeline_latency_ms']} ms")

if 'explanation' in result:
    exp = result['explanation']
    print(f"\nExplanation:")
    print(f"  Text Top: {exp['text_top_category']} ({exp['text_confidence']:.4f})")
    print(f"  Image Top: {exp['image_top_category']}")
    print(f"  Fusion Weights: {exp['fusion_weights']}")
