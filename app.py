import pickle
from flask import Flask, request, jsonify
from flask_cors import CORS

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # allow requests from frontend

# Load model and vectorizer
with open("models/phishing_detector.pkl", "rb") as f:
    model = pickle.load(f)

with open("models/vectorizer.pkl", "rb") as f:
    vectorizer = pickle.load(f)

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    email_text = data.get("email", "")
    vectorized_text = vectorizer.transform([email_text])
    prediction = model.predict(vectorized_text)[0]
    result = "phishing" if prediction == 1 else "safe"
    return jsonify({"prediction": result})

if __name__ == "__main__":
    app.run(debug=True)
