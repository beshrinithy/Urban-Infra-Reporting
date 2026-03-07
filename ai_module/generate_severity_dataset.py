"""
Generate severity dataset with feature engineering
Uses existing text_dataset.csv and simulates realistic features
"""
import pandas as pd
import random
import csv

# Set seed for reproducibility
random.seed(42)

# Urgent keywords that indicate high severity
URGENT_KEYWORDS = [
    "fire", "flood", "accident", "electrocution", "explosion", 
    "gas leak", "blood", "emergency", "danger", "critical",
    "collapse", "burst", "sparking", "leaking gas"
]

def has_urgent_keyword(description):
    """Check if description contains urgent keywords"""
    desc_lower = description.lower()
    return 1 if any(keyword in desc_lower for keyword in URGENT_KEYWORDS) else 0

def assign_severity(category, confidence, duplicate_flag, urgent_flag, description_length):
    """
    Hybrid domain logic for severity assignment
    
    Rules:
    1. Urgent keywords → High
    2. Duplicate + low confidence → Low
    3. Critical categories (Road/Water/Electricity) + high confidence → High
    4. Low confidence → Low
    5. Default → Moderate
    """
    
    # Rule 1: Urgent keywords always high
    if urgent_flag == 1:
        return "High"
    
    # Rule 2: Duplicates with low confidence are low priority
    if duplicate_flag == 1 and confidence < 0.6:
        return "Low"
    
    # Rule 3: Critical infrastructure categories with high confidence
    if category in ["Road", "Water", "Electricity"] and confidence > 0.8:
        return "High"
    
    # Rule 4: Low confidence generally means low severity
    if confidence < 0.6:
        return "Low"
    
    # Rule 5: Medium confidence, non-urgent
    if confidence >= 0.6 and confidence < 0.8:
        return "Moderate"
    
    # Default: Moderate
    return "Moderate"

def generate_severity_dataset():
    """Generate severity dataset from existing text dataset"""
    
    print("🔹 Loading text dataset...")
    text_df = pd.read_csv('data/text_dataset.csv')
    print(f"✅ Loaded {len(text_df)} text samples\n")
    
    severity_data = []
    
    print("🔹 Generating severity features and labels...")
    
    for idx, row in text_df.iterrows():
        category = row['category']
        description = row['text']
        
        # Simulate realistic features
        # Confidence: Higher for clear descriptions, lower for ambiguous
        base_confidence = random.uniform(0.5, 1.0)
        
        # Adjust confidence based on description length (longer = more context = higher confidence)
        desc_length = len(description)
        if desc_length > 50:
            base_confidence = min(1.0, base_confidence + 0.1)
        
        confidence = round(base_confidence, 4)
        
        # Duplicate flag: ~15% of reports might be duplicates
        duplicate_flag = 1 if random.random() < 0.15 else 0
        
        # Urgent keyword flag
        urgent_flag = has_urgent_keyword(description)
        
        # Assign severity using domain logic
        severity = assign_severity(category, confidence, duplicate_flag, urgent_flag, desc_length)
        
        severity_data.append({
            'category': category,
            'confidence': confidence,
            'duplicate_flag': duplicate_flag,
            'urgent_flag': urgent_flag,
            'description_length': desc_length,
            'severity': severity
        })
    
    # Create DataFrame
    severity_df = pd.DataFrame(severity_data)
    
    # Save to CSV
    output_path = 'data/severity_dataset.csv'
    severity_df.to_csv(output_path, index=False)
    
    print(f"✅ Generated {len(severity_df)} severity samples\n")
    print("📊 Severity Distribution:")
    print(severity_df['severity'].value_counts().sort_index())
    print(f"\n📊 Feature Statistics:")
    print(f"   Avg Confidence: {severity_df['confidence'].mean():.2f}")
    print(f"   Duplicate Rate: {severity_df['duplicate_flag'].mean():.1%}")
    print(f"   Urgent Rate: {severity_df['urgent_flag'].mean():.1%}")
    print(f"   Avg Description Length: {severity_df['description_length'].mean():.0f} chars")
    print(f"\n✅ Saved to {output_path}")

if __name__ == "__main__":
    print("=" * 60)
    print("🚀 Generating Severity Dataset")
    print("=" * 60 + "\n")
    
    generate_severity_dataset()
    
    print("\n" + "=" * 60)
    print("✅ Dataset Generation Complete!")
    print("=" * 60)
