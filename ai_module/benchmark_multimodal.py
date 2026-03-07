
import requests
import time
import os
import json

BASE_URL = "http://127.0.0.1:8000"
IMAGE_PATH = "../test_pothole.jpg"

def run_benchmark(description, file_path=None, test_name=""):
    print(f"\n⚡ {test_name} Testing...")
    
    data = {"description": description, "traceId": f"bench_{test_name}"}
    files = {"file": open(file_path, 'rb')} if file_path else None
    
    start = time.time()
    try:
        if files:
            response = requests.post(f"{BASE_URL}/predict/multimodal", data=data, files=files)
        else:
            response = requests.post(f"{BASE_URL}/predict/multimodal", data=data)
            
        latency = (time.time() - start) * 1000
        result = response.json()
        
        meta = result.get('metadata', {})
        
        print(f"✅ Status: {response.status_code}")
        print(f"📊 Pipeline Latency (Server-side): {meta.get('pipeline_latency_ms')} ms")
        print(f"🔍 Text Inference: {meta.get('text_inference_ms')} ms")
        print(f"🖼️ Image Inference: {meta.get('image_inference_ms')} ms")
        print(f"⏱️ Client-side Latency: {latency:.2f} ms")
        
        return meta
        
    except Exception as e:
        print(f"❌ Failed: {e}")
        return None

if __name__ == "__main__":
    print(f"Rocket Benchmark v1.0")
    print(f"Wait for server warmup...")
    time.sleep(2)
    
    # Check if image exists
    if not os.path.exists(IMAGE_PATH):
        print(f"❌ Error: Test image not found at {IMAGE_PATH}")
        exit(1)
        
    print(f"\n[Scenario 1] Text Only (Baseline)")
    print("="*50)
    meta_text = run_benchmark("Simple road issue", test_name="TextOnly")
    
    print(f"\n[Scenario 2] Multimodal (Text + Image)")
    print("="*50)
    meta_multi = run_benchmark("Pothole on the road", IMAGE_PATH, test_name="Multimodal")
    
    print("\n" + "="*50)
    print("VERIFICATION SUMMARY")
    print("="*50)
    
    # Write results to file for reliable reading
    with open("benchmark_results.txt", "w") as f:
        f.write("BENCHMARK RESULTS\n")
        f.write("=================\n")
        
        if meta_text:
            f.write(f"\n[Scenario 1] Text Only\n")
            f.write(f"Pipeline Latency: {meta_text.get('pipeline_latency_ms')} ms\n")
            f.write(f"Text Inference: {meta_text.get('text_inference_ms')} ms\n")
            
        if meta_multi:
            f.write(f"\n[Scenario 2] Multimodal (Text + Image)\n")
            f.write(f"Pipeline Latency: {meta_multi.get('pipeline_latency_ms')} ms\n")
            f.write(f"Image Inference: {meta_multi.get('image_inference_ms')} ms\n")
            f.write(f"Text Inference: {meta_multi.get('text_inference_ms')} ms\n")
            
    print("\n✅ Results written to benchmark_results.txt")
