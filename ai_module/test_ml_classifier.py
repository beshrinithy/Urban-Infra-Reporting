from predict_category import predict_category

# Test cases
test_cases = [
    "There is a big pothole on the highway",
    "Garbage overflowing from the bin",
    "Water pipe leaking near my house",
    "Street light not working",
    "Tree fallen on the road"
]

print("=" * 70)
print("🧪 Testing ML-Based Text Classification")
print("=" * 70 + "\n")

for i, desc in enumerate(test_cases, 1):
    print(f"Test {i}: \"{desc}\"")
    result = predict_category(desc)
    
    # Sort by probability
    sorted_probs = sorted(result.items(), key=lambda x: x[1], reverse=True)
    
    print(f"  Top Prediction: {sorted_probs[0][0]} ({sorted_probs[0][1]:.2%})")
    print(f"  All Probabilities:")
    for cat, prob in sorted_probs:
        bar = "█" * int(prob * 50)
        print(f"    {cat:12s}: {prob:6.2%} {bar}")
    print()

print("=" * 70)
print("✅ Testing Complete!")
print("=" * 70)
