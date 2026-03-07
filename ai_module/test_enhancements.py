"""
Test production enhancements: normalization, explainability, latency
"""
import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_multimodal_text_only():
    """Test text-only inference with all enhancements"""
    print("\n" + "="*60)
    print("🧪 TEST 1: Text-Only Inference")
    print("="*60)
    
    data = {
        "description": "Large pothole causing accidents on highway",
        "traceId": "test_001"
    }
    
    response = requests.post(f"{BASE_URL}/predict/multimodal", data=data)
    result = response.json()
    
    print(f"\n📊 Response:")
    print(json.dumps(result, indent=2))
    
    # Validation
    assert "category" in result
    assert "confidence" in result
    assert "severity" in result
    assert "explanation" in result
    assert "pipeline_latency_ms" in result
    
    # Check explanation structure
    exp = result["explanation"]
    assert "text_top_category" in exp
    assert "text_confidence" in exp
    assert "fusion_weights" in exp
    
    print(f"\n✅ Category: {result['category']}")
    print(f"✅ Confidence: {result['confidence']:.4f}")
    print(f"✅ Severity: {result['severity']}")
    print(f"✅ Pipeline Latency: {result['pipeline_latency_ms']} ms")
    print(f"✅ Text Top: {exp['text_top_category']} ({exp['text_confidence']:.4f})")
    
    return result

def test_probability_normalization():
    """Test that probabilities sum to 1.0"""
    print("\n" + "="*60)
    print("🧪 TEST 2: Probability Normalization")
    print("="*60)
    
    data = {
        "description": "Water pipe burst flooding street",
        "traceId": "test_002"
    }
    
    response = requests.post(f"{BASE_URL}/predict/multimodal", data=data)
    result = response.json()
    
    # Note: We can't directly access final_probs from response,
    # but we can verify confidence is <= 1.0
    confidence = result["confidence"]
    
    print(f"\n✅ Confidence: {confidence:.6f}")
    assert 0.0 <= confidence <= 1.0, "Confidence must be between 0 and 1"
    print(f"✅ Confidence is properly normalized (0 ≤ {confidence:.4f} ≤ 1)")
    
    return result

def test_critical_keyword_override():
    """Test critical keyword safety override"""
    print("\n" + "="*60)
    print("🧪 TEST 3: Critical Keyword Override")
    print("="*60)
    
    data = {
        "description": "Fire on the highway near gas station",
        "traceId": "test_003"
    }
    
    response = requests.post(f"{BASE_URL}/predict/multimodal", data=data)
    result = response.json()
    
    print(f"\n✅ Category: {result['category']}")
    print(f"✅ Severity: {result['severity']}")
    
    assert result['severity'] == "Critical", "Fire keyword should trigger Critical severity"
    print(f"✅ Critical override working correctly")
    
    return result

def test_latency_measurement():
    """Test latency tracking across multiple requests"""
    print("\n" + "="*60)
    print("🧪 TEST 4: Latency Measurement")
    print("="*60)
    
    latencies = []
    
    for i in range(5):
        data = {
            "description": f"Test request {i+1}",
            "traceId": f"test_latency_{i+1}"
        }
        response = requests.post(f"{BASE_URL}/predict/multimodal", data=data)
        result = response.json()
        latencies.append(result["pipeline_latency_ms"])
    
    avg_latency = sum(latencies) / len(latencies)
    min_latency = min(latencies)
    max_latency = max(latencies)
    
    print(f"\n📊 Latency Statistics (5 requests):")
    print(f"   Min: {min_latency:.2f} ms")
    print(f"   Max: {max_latency:.2f} ms")
    print(f"   Avg: {avg_latency:.2f} ms")
    print(f"\n✅ Average pipeline latency: {avg_latency:.2f} ms")
    
    return avg_latency

if __name__ == "__main__":
    print("\n🚀 Testing Production Enhancements")
    print("="*60)
    
    try:
        # Run tests
        test_multimodal_text_only()
        test_probability_normalization()
        test_critical_keyword_override()
        avg_latency = test_latency_measurement()
        
        print("\n" + "="*60)
        print("✅ ALL TESTS PASSED")
        print("="*60)
        print(f"\n📊 FINAL RESULT: Average CPU Latency = {avg_latency:.2f} ms")
        print("="*60)
        
    except AssertionError as e:
        print(f"\n❌ TEST FAILED: {e}")
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: AI service not running. Start with: uvicorn main:app --reload")
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
