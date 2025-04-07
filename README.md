
# 🛡️ Phishing Email Detection System

A comprehensive web-based tool to **simulate phishing attacks** and **detect phishing emails using machine learning**. This project aims to raise awareness about phishing threats and provide a real-time detection system for identifying suspicious emails.

## 🚀 Features

- 🤖 **ML-Powered Detection**: Classifies emails as *phishing* or *legitimate* using a trained machine learning model.
- 📊 **Dashboard Interface**: View analysis results and detection statistics through an intuitive UI.
- 🌐 **Responsive Frontend**: Clean, mobile-friendly HTML/CSS interface with multi-page transitions.
- 🔍 **Email Vectorization**: Preprocessing pipeline to convert email text into vector form for model prediction.

## 🧠 Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Python, Flask
- **Machine Learning**: Scikit-learn, Pandas, TfidfVectorizer
- **Other Tools**: Jupyter Notebooks (for training), Git

## 🏗️ Project Structure

```bash
phishing-attack-simulator/
├── templates/
│   ├── index.html
│   ├── result.html
│   └── surprise.html
├── static/
│   └── style.css
├── model/
│   ├── phishing_model.pkl
│   └── vectorizer.pkl
├── app.py
├── train_model.ipynb
└── README.md
```

## 🧪 How It Works

1. **Email Input**: User enters an email message via the web UI.
2. **Preprocessing**: The email is cleaned and vectorized.
3. **Prediction**: The model classifies the input as phishing or legitimate.
4. **Result Display**: Feedback is shown on the results page with additional info.

## 🔁 Training the Model

If you'd like to retrain the model:

```bash
# Inside train_model.ipynb
- Load dataset (CSV)
- Clean and vectorize text with TfidfVectorizer
- Train classifier (e.g., LogisticRegression or RandomForest)
- Save model and vectorizer using joblib
```

## ⚙️ Running the App

1. Clone the repo:
```bash
git clone https://github.com/yourusername/phishing-attack-simulator.git
cd phishing-attack-simulator
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the app:
```bash
python app.py
```

## ✅ To-Do

- [ ] Add login system for user tracking
- [ ] Integrate email delivery module 
- [ ] Improve UI animations and transitions
- [ ] Extend ML model with NLP enhancements (BERT, etc.)
