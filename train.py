# train_model.py

import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
from sklearn.utils import resample
import pickle

# Step 1: Load your CSV
df = pd.read_csv("data/preprocessed_data.csv")

# Step 2: Handle class imbalance
phishing = df[df['label'] == 1]
safe = df[df['label'] == 0]
phishing_upsampled = resample(phishing, replace=True, n_samples=len(safe), random_state=42)
df_balanced = pd.concat([safe, phishing_upsampled])

# Step 3: Vectorize
vectorizer = TfidfVectorizer(stop_words='english', max_features=5000, ngram_range=(1, 2))
X = vectorizer.fit_transform(df_balanced['text'])
y = df_balanced['label'].values

# Step 4: Split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Step 5: Train model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Step 6: Evaluate
y_pred = model.predict(X_test)
print(classification_report(y_test, y_pred))

# Step 7: Save model and vectorizer
with open("phishing_detector.pkl", "wb") as f:
    pickle.dump(model, f)

with open("vectorizer.pkl", "wb") as f:
    pickle.dump(vectorizer, f)

print("✅ Model and vectorizer saved.")
