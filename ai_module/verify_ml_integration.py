"""
Comprehensive verification test for ML text classification integration
"""
import json
from predict_category import predict_category

print("=" * 70)
print("🔍 ML TEXT CLASSIFICATION VERIFICATION")
print("=" * 70)

# Test 1: Probability Format
print("\n✅ TEST 1: Probability Dictionary Format")
print("-" * 70)
result = predict_category("There is a pothole on the street")
print(f"Keys: {list(result.keys())}")
print(f"All 5 categories present: {len(result) == 5}")
print(f"Sum of probabilities: {sum(result.values()):.4f}")
print(f"All values are floats: {all(isinstance(v, float) for v in result.values())}")

# Test 2: Confidence Scores
print("\n✅ TEST 2: Text Confidence Scores")
print("-" * 70)
test_cases = [
    ("Big pothole on highway", "Road"),
    ("Garbage overflowing from bin", "Garbage"),
    ("Water pipe leaking", "Water"),
    ("Street light not working", "Electricity"),
    ("Tree fallen on path", "Other")
]

for desc, expected in test_cases:
    probs = predict_category(desc)
    predicted = max(probs, key=probs.get)
    confidence = probs[predicted]
    match = "✅" if predicted == expected else "❌"
    print(f"{match} '{desc[:30]:30s}' → {predicted:12s} ({confidence:.2%})")

# Test 3: Fusion Compatibility
print("\n✅ TEST 3: Fusion Logic Compatibility")
print("-" * 70)
text_probs = predict_category("Pothole on road")
text_confidence = max(text_probs.values())

# Simulate fusion (no image)
CATEGORIES = ["Road", "Garbage", "Water", "Electricity", "Other"]
final_probs = {}
for cat in CATEGORIES:
    t_p = text_probs.get(cat, 0.0)
    final_probs[cat] = t_p  # Text-only fallback

predicted_category = max(final_probs, key=final_probs.get)
final_confidence = final_probs[predicted_category]

print(f"Text confidence: {text_confidence:.4f}")
print(f"Final confidence: {final_confidence:.4f}")
print(f"Predicted category: {predicted_category}")
print(f"Fusion math correct: {text_confidence == final_confidence}")

# Test 4: Model Classes Order
print("\n✅ TEST 4: Model Classes Verification")
print("-" * 70)
try:
    from predict_category import model, USE_ML_MODEL
    if USE_ML_MODEL:
        print(f"Model classes: {list(model.classes_)}")
        print(f"Expected order: {CATEGORIES}")
        print(f"Order matches: {list(model.classes_) == CATEGORIES}")
    else:
        print("⚠️  ML model not loaded - using keyword fallback")
except:
    print("⚠️  Could not access model.classes_")

print("\n" + "=" * 70)
print("✅ VERIFICATION COMPLETE")
print("=" * 70)
