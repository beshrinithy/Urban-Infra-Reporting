"""
Train severity prediction model using feature-engineered dataset
"""
import pandas as pd
from sklearn.preprocessing import LabelEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import pickle
import os

def train_severity_model():
    """Train severity prediction model"""
    
    print("🔹 Loading severity dataset...")
    data_path = os.path.join(os.path.dirname(__file__), "data", "severity_dataset.csv")
    df = pd.read_csv(data_path)
    
    print(f"✅ Loaded {len(df)} samples")
    print(f"📊 Severity distribution:\n{df['severity'].value_counts()}\n")
    
    # Feature engineering: One-hot encode category
    category_dummies = pd.get_dummies(df['category'], prefix='cat')
    
    # Combine features
    features = pd.concat([
        category_dummies,
        df[['confidence', 'duplicate_flag', 'urgent_flag', 'description_length']]
    ], axis=1)
    
    # Target
    target = df['severity']
    
    print(f"🔹 Features: {list(features.columns)}")
    print(f"🔹 Feature shape: {features.shape}\n")
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        features, 
        target, 
        test_size=0.2, 
        random_state=42,
        stratify=target
    )
    
    print(f"🔹 Training set: {len(X_train)} samples")
    print(f"🔹 Test set: {len(X_test)} samples\n")
    
    # Train Logistic Regression
    print("🔹 Training Logistic Regression model...")
    model = LogisticRegression(
        max_iter=1000,
        random_state=42,
        multi_class='multinomial',
        solver='lbfgs'
    )
    
    model.fit(X_train, y_train)
    
    # Evaluate
    print("\n📊 Model Evaluation:")
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"✅ Accuracy: {accuracy:.2%}\n")
    print("Classification Report:")
    report = classification_report(y_test, y_pred)
    print(report)
    
    # Save to file for retrieval
    with open('severity_training_report.txt', 'w', encoding='utf-8') as f:
        f.write(f"Accuracy: {accuracy:.4f}\n\n")
        f.write("Classification Report:\n")
        f.write(report)
        f.write(f"\n\nFeature Names:\n")
        f.write(str(list(features.columns)))
    
    # Save model and feature names
    model_dir = os.path.join(os.path.dirname(__file__), "models")
    os.makedirs(model_dir, exist_ok=True)
    
    model_path = os.path.join(model_dir, "severity_model.pkl")
    feature_names_path = os.path.join(model_dir, "severity_features.pkl")
    
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
    
    with open(feature_names_path, 'wb') as f:
        pickle.dump(list(features.columns), f)
    
    print(f"\n✅ Model saved to: {model_path}")
    print(f"✅ Feature names saved to: {feature_names_path}")
    
    return model, accuracy

if __name__ == "__main__":
    print("=" * 60)
    print("🚀 Training Severity Prediction Model")
    print("=" * 60 + "\n")
    
    model, accuracy = train_severity_model()
    
    print("\n" + "=" * 60)
    print(f"🎉 Training Complete! Final Accuracy: {accuracy:.2%}")
    print("=" * 60)
