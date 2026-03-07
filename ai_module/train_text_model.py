import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import pickle
import os
import sys

# Categories
CATEGORIES = ["Road", "Garbage", "Water", "Electricity", "Other"]

def train_model():
    """Train text classification model using the labeled dataset"""
    
    print("🔹 Loading dataset...")
    data_path = os.path.join(os.path.dirname(__file__), "data", "text_dataset.csv")
    df = pd.read_csv(data_path)
    
    print(f"✅ Loaded {len(df)} samples")
    print(f"📊 Class distribution:\n{df['category'].value_counts()}\n")
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        df['text'], 
        df['category'], 
        test_size=0.2, 
        random_state=42,
        stratify=df['category']
    )
    
    print(f"🔹 Training set: {len(X_train)} samples")
    print(f"🔹 Test set: {len(X_test)} samples\n")
    
    # Create TF-IDF vectorizer
    print("🔹 Creating TF-IDF vectorizer...")
    vectorizer = TfidfVectorizer(
        max_features=500,
        ngram_range=(1, 2),  # unigrams and bigrams
        stop_words='english',
        lowercase=True
    )
    
    X_train_tfidf = vectorizer.fit_transform(X_train)
    X_test_tfidf = vectorizer.transform(X_test)
    
    # Train Logistic Regression
    print("🔹 Training Logistic Regression model...")
    model = LogisticRegression(
        max_iter=1000,
        random_state=42,
        multi_class='multinomial',
        solver='lbfgs'
    )
    
    model.fit(X_train_tfidf, y_train)
    
    # Evaluate
    print("\n📊 Model Evaluation:")
    y_pred = model.predict(X_test_tfidf)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"✅ Accuracy: {accuracy:.2%}\n")
    print("Classification Report:")
    report = classification_report(y_test, y_pred, target_names=CATEGORIES)
    print(report)
    
    # Save to file for retrieval
    with open('training_report.txt', 'w', encoding='utf-8') as f:
        f.write(f"Accuracy: {accuracy:.4f}\n\n")
        f.write("Classification Report:\n")
        f.write(report)
    
    # Save model and vectorizer
    model_dir = os.path.join(os.path.dirname(__file__), "models")
    os.makedirs(model_dir, exist_ok=True)
    
    model_path = os.path.join(model_dir, "text_classifier.pkl")
    vectorizer_path = os.path.join(model_dir, "vectorizer.pkl")
    
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
    
    with open(vectorizer_path, 'wb') as f:
        pickle.dump(vectorizer, f)
    
    print(f"\n✅ Model saved to: {model_path}")
    print(f"✅ Vectorizer saved to: {vectorizer_path}")
    
    return model, vectorizer, accuracy

if __name__ == "__main__":
    print("=" * 60)
    print("🚀 Training Text Classification Model")
    print("=" * 60 + "\n")
    
    model, vectorizer, accuracy = train_model()
    
    print("\n" + "=" * 60)
    print(f"🎉 Training Complete! Final Accuracy: {accuracy:.2%}")
    print("=" * 60)
