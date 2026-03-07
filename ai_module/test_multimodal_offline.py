import sys
import os

# Add current directory to path
sys.path.append(os.getcwd())

from image_classifier import classify_image
from predict_category import predict_category

def test_fusion():
    print("--- Testing Multimodal Fusion Logic ---")
    
    # 1. Test Text
    description = "There is a large pothole on the main street"
    print(f"\nInput Text: '{description}'")
    text_probs = predict_category(description)
    print("Text Probs:", text_probs)
    
    # 2. Test Image (if available)
    image_path = "../test_pothole.jpg"
    image_probs = None
    if os.path.exists(image_path):
        print(f"\nTesting with Image: {image_path}")
        with open(image_path, "rb") as f:
            img_bytes = f.read()
        
        image_probs, device = classify_image(img_bytes)
        print(f"Image Probs ({device}):", image_probs)
    else:
        print("\nImage not found, skipping image test.")

    # 3. Simulate Fusion
    print("\n--- Simulating Fusion (0.6 Img + 0.4 Text) ---")
    CATEGORIES = ["Road", "Garbage", "Water", "Electricity", "Other"]
    final_probs = {}
    
    for cat in CATEGORIES:
        t_p = text_probs.get(cat, 0.0)
        if image_probs:
            i_p = image_probs.get(cat, 0.0)
            final_probs[cat] = (0.6 * i_p) + (0.4 * t_p)
        else:
            final_probs[cat] = t_p
            
    print("Final Probs:", final_probs)
    best = max(final_probs, key=final_probs.get)
    print(f"Winner: {best} ({final_probs[best]:.4f})")
    
    # Validation
    if best == "Road":
        print("\n✅ SUCCESS: Correctly identified Road.")
    else:
        print(f"\n❌ FAILURE: Expected Road, got {best}")

if __name__ == "__main__":
    test_fusion()
