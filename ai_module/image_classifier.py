import tensorflow as tf
import numpy as np
from PIL import Image
import io

# GPU Configuration for RTX 3050
device_used = "CPU"
try:
    gpus = tf.config.list_physical_devices('GPU')
    if gpus:
        for gpu in gpus:
            tf.config.experimental.set_memory_growth(gpu, True)
        print(f"✅ GPU Detected & Configured: {len(gpus)} device(s)")
        device_used = f"GPU ({len(gpus)})"
    else:
        print("⚠️ No GPU Detected. Running on CPU.")
except Exception as e:
    print(f"❌ GPU Configuration Failed: {e}")

# Load MobileNetV2 pre-trained on ImageNet
# We include_top=True because we want the 1000 ImageNet classes for mapping
model = tf.keras.applications.MobileNetV2(weights='imagenet')

# Determine how to preprocess images for MobileNetV2
preprocess_input = tf.keras.applications.mobilenet_v2.preprocess_input
decode_predictions = tf.keras.applications.mobilenet_v2.decode_predictions


CATEGORIES = ["Road", "Garbage", "Water", "Electricity", "Other"]

def classify_image(image_bytes):
    """
    Takes raw image bytes, runs MobileNetV2, and returns probability distribution over Urban Categories.
    Returns: (probabilities_dict, device_used)
    """
    try:
        # Load image from bytes
        img = Image.open(io.BytesIO(image_bytes))
        
        # Resize to 224x224 as required by MobileNetV2
        img = img.resize((224, 224))
        
        # Convert to array and expand dimensions (1, 224, 224, 3)
        img_array = tf.keras.preprocessing.image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)
        
        # Preprocess
        img_array = preprocess_input(img_array)
        
        # Predict
        preds = model.predict(img_array)
        
        # Decode top 10 predictions to gather enough mass
        decoded = decode_predictions(preds, top=10)[0]
        # decoded format: [(class_id, class_name, score), ...]
        
        # Initialize scores
        scores = {cat: 0.0 for cat in CATEGORIES}
        
        # Map ImageNet classes to Urban Categories
        for _, label, score in decoded:
            label = label.lower()
            score = float(score)
            
            if any(x in label for x in ['manhole', 'street_sign', 'traffic_light', 'parking_meter', 'cab', 'taxi', 'bus', 'asphalt', 'street']):
                scores["Road"] += score
            elif any(x in label for x in ['trash', 'waste', 'garbage', 'bin', 'plastic', 'carton', 'rubbish']):
                scores["Garbage"] += score
            elif any(x in label for x in ['fountain', 'geyser', 'bubble', 'water', 'lake', 'puddle']):
                scores["Water"] += score
            elif any(x in label for x in ['pole', 'spotlight', 'lamp', 'electric']):
                scores["Electricity"] += score
            else:
                scores["Other"] += score

        # Add remaining probability mass (not in top 10) to Other
        total_score = sum(scores.values())
        if total_score < 1.0:
            scores["Other"] += (1.0 - total_score)
            
        # Normalize just in case
        total_final = sum(scores.values())
        if total_final > 0:
            for cat in scores:
                scores[cat] /= total_final
                
        return scores, device_used

    except Exception as e:
        print(f"Error classifying image: {e}")
        # Return uniform distribution on error or fallback
        uniform = {cat: 1.0/len(CATEGORIES) for cat in CATEGORIES}
        return uniform, "Error"

if __name__ == "__main__":
    print("MobileNetV2 loaded successfully.")
