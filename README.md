# 🏦 Bank Marketing Prediction App

An end-to-end machine learning application that predicts whether a customer will subscribe to a term deposit using a trained Random Forest classifier. The project consists of a Python FastAPI backend with a modern Next.js frontend dashboard.

## 📋 Project Overview

This application implements a complete ML pipeline for bank marketing campaign optimization:

- **ML Model**: Weighted Random Forest Classifier (150 trees, trained on Portuguese bank marketing dataset)
- **Model Performance**: 
  - Accuracy: 88.07%
  - Precision: 46.88% (when model predicts "yes", it's correct ~47% of the time)
  - Confidence: Optimized for minimizing marketing waste
- **Features**: 33 engineered features (from 17 original columns)
- **Class Balance Handling**: Direct class weights (1:7.67 ratio) to handle imbalanced data

## 🗂️ Project Structure

```
banking-app/
├── backend/                          # FastAPI backend server
│   ├── app.py                       # Main FastAPI application
│   ├── classifier.ipynb             # ML pipeline notebook
│   ├── requirements.txt             # Python dependencies
│   ├── models/
│   │   └── bank_marketing_classifier.pkl  # Trained model
│   └── data/
│       ├── bank.csv                 # Original dataset
│       ├── bank-names.txt          # Feature names reference
│       └── bank_encoded.csv        # Feature-engineered dataset
├── frontend/
│   └── banking-app/                 # Next.js frontend application
│       ├── app/
│       │   └── page.tsx            # Main prediction dashboard
│       ├── next.config.js          # Next.js configuration
│       ├── .env.local              # Environment variables
│       └── package.json            # Node dependencies
└── README.md                         # This file
```

## 🚀 Quick Start

### Prerequisites

- **Python 3.11+** (for backend)
- **Node.js 18+** (for frontend)
- **uv** (Python package manager) - [Install here](https://github.com/astral-sh/uv)
- **npm** (Node package manager)

### 1️⃣ Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Install Python dependencies:

```bash
uv pip install -r requirements.txt
```

Start the FastAPI server:

```bash
uv run uvicorn app:app --reload
```

The backend will be available at: **http://localhost:8000**

**API Endpoints:**
- `GET /health` - Health check
- `POST /predict` - Make predictions
- `GET /model-info` - Get model information
- `GET /docs` - Interactive API documentation (Swagger UI)

### 2️⃣ Frontend Setup

In a new terminal, navigate to the frontend directory:

```bash
cd frontend/banking-app
```

Install Node dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will be available at: **http://localhost:3000**

## 📊 Using the Application

1. **Open Frontend**: Navigate to `http://localhost:3000` in your browser
2. **Check API Status**: The header shows 🟢 (API Online) or 🔴 (API Offline)
3. **Fill Customer Information**:
   - **Customer Profile Tab**: Age, balance, campaign history, loan status
   - **Categorical Features Tab**: Job, marital status, education, contact type, previous outcome
4. **Click Predict**: Get subscription prediction with:
   - Binary prediction (Yes/No)
   - Probability scores
   - Confidence level
   - Business recommendation

## 🛠️ Development Commands

### Backend

```bash
# Start development server with auto-reload
uv run uvicorn app:app --reload

# Run on specific port
uv run uvicorn app:app --reload --port 8001

# Production server
uv run uvicorn app:app --host 0.0.0.0 --port 8000
```

### Frontend

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter/type checker
npm run lint
```

## 📝 API Documentation

### Health Check Endpoint

```bash
GET /health
```

Response:
```json
{
  "status": "healthy",
  "model_loaded": true,
  "api_version": "1.0.0"
}
```

### Prediction Endpoint

```bash
POST /predict
Content-Type: application/json

{
  "age": 40,
  "balance": 1000,
  "day": 15,
  "month": 6,
  "campaign": 1,
  "pdays": 999,
  "previous": 0,
  "default_0": 1,
  "default_1": 0,
  "housing_0": 1,
  "housing_1": 0,
  "loan_0": 1,
  "loan_1": 0,
  "education_ordinal": 2,
  "month_ordinal": 6,
  "job_admin_": 0,
  "job_blue_collar": 0,
  "job_entrepreneur": 0,
  "job_housemaid": 0,
  "job_management": 1,
  "job_retired": 0,
  "job_services": 0,
  "job_technician": 0,
  "job_unemployed": 0,
  "job_unknown": 0,
  "marital_divorced": 0,
  "marital_married": 1,
  "marital_single": 0,
  "contact_telephone": 0,
  "contact_unknown": 1,
  "poutcome_failure": 1,
  "poutcome_other": 0,
  "poutcome_success": 0
}
```

Response:
```json
{
  "prediction": 1,
  "probability_no": 0.68,
  "probability_yes": 0.32,
  "confidence": 0.68,
  "recommendation": "Moderate confidence - May or may not subscribe. Use caution."
}
```

### Model Info Endpoint

```bash
GET /model-info
```

Response:
```json
{
  "model_type": "RandomForestClassifier",
  "n_estimators": 150,
  "max_depth": 12,
  "min_samples_split": 5,
  "min_samples_leaf": 2,
  "class_weight": {0: 1, 1: 7.67},
  "random_state": 42,
  "expected_features": 33,
  "model_path": "models/bank_marketing_classifier.pkl"
}
```

## 🔧 Configuration

### Backend Configuration

Edit `backend/app.py` to modify:
- Model path: `MODEL_PATH = "models/bank_marketing_classifier.pkl"`
- CORS allowed origins (line 13-22)
- Server port and host (bottom of file)

### Frontend Configuration

Create/edit `frontend/banking-app/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📚 Machine Learning Pipeline

The ML pipeline is documented in `backend/classifier.ipynb`:

1. **Data Loading & EDA** - Explored 4,521 bank marketing records
2. **Feature Engineering** - Created 33 features from 17 original columns
   - Binary encoding (default, housing, loan)
   - Ordinal encoding (education, month)
   - One-hot encoding (job, marital, contact, outcome)
3. **Class Imbalance Handling** - Used weighted RF to handle 7.68:1 imbalance
4. **Model Training** - Random Forest with balanced class weights
5. **Evaluation** - Compared 4 techniques (baseline, SMOTE, threshold tuning, weighted RF)
6. **Model Selection** - Weighted RF chosen for best precision (46.88%)

## 🐛 Troubleshooting

### Frontend Can't Connect to Backend

**Error**: "Backend API is offline"

**Solution**:
1. Ensure backend is running: `uv run uvicorn app:app --reload`
2. Check it's on `http://localhost:8000/health`
3. Verify no firewall blocks localhost connections
4. Check `NEXT_PUBLIC_API_URL` in `.env.local`

### CORS Issues

**Error**: "Cross-origin request blocked"

**Solution**:
- Backend has CORS enabled for localhost and your network IP
- If needed, add origins to `app.add_middleware()` in `app.py`

### Model Loading Errors

**Error**: "Failed to load model: node array from pickle has incompatible dtype"

**Solution**:
- Model must be saved with same scikit-learn version as runtime
- Regenerate model by running the last cell in `classifier.ipynb`
- Ensure you're using the venv: `uv run uvicorn ...`

### Port Already in Use

**Error**: "Address already in use"

**Solution**:
```bash
# Find process using port 8000
lsof -i :8000

# Kill it
kill -9 <PID>

# Or use different port
uv run uvicorn app:app --reload --port 8001
```

## 📦 Dependencies

### Backend
- fastapi (0.121.1) - Web framework
- uvicorn (0.38.0) - ASGI server
- scikit-learn (1.7.2) - ML library
- pandas (2.1.3) - Data processing
- numpy (≥1.23.2,<2) - Numerical computing
- joblib (1.4.2) - Model persistence
- pydantic (2.12.4) - Data validation

### Frontend
- next (15+) - React framework
- react (19+) - UI library
- typescript (5+) - Type safety
- tailwindcss (3+) - Styling

## 🔐 Security Notes

- CORS is configured for local development only
- For production, update CORS origins in `app.add_middleware()`
- Model file should be protected/encrypted in production
- Consider adding authentication for production API

## 📈 Model Performance Metrics

| Metric | Value |
|--------|-------|
| Accuracy | 88.07% |
| Precision | 46.88% |
| Recall | 28.85% |
| Specificity | 95.76% |
| F1-Score | 35.71% |
| ROC-AUC | 74.09% |

**Interpretation**: The model is conservative—when it predicts "yes," it's correct ~47% of the time, minimizing marketing waste while maintaining strong specificity (95.8% correctly identified non-subscribers).

## 📄 License

MIT License - Feel free to use this project for learning and development.

## 👨‍💻 Development

### Regenerating the Model

If you modify the ML pipeline:

1. Update `backend/classifier.ipynb`
2. Run all cells to retrain the model
3. The last cell saves to `models/bank_marketing_classifier.pkl`
4. Restart backend: `uv run uvicorn app:app --reload`

### Adding New Features

To add features to predictions:

1. Update `classifier.ipynb` feature engineering
2. Regenerate and save model
3. Update `FormData` interface in `frontend/banking-app/app/page.tsx`
4. Update `CustomerData` BaseModel in `backend/app.py`
5. Update `/predict` endpoint logic

## 🚀 Deployment

### Deploy Backend (Example: Render, Railway, Heroku)

```bash
# Create production Dockerfile
# Push to Git repo
# Connect to deployment platform
# Set NEXT_PUBLIC_API_URL to production API URL
```

### Deploy Frontend (Example: Vercel, Netlify)

```bash
# Push to Git
# Connect to Vercel/Netlify
# Set environment variable NEXT_PUBLIC_API_URL
# Automatic deployment on push
```

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review API logs: Check browser console and backend terminal
3. Check model logs: View `backend/classifier.ipynb` output
4. Visit API docs: `http://localhost:8000/docs`

---

**Last Updated**: November 21, 2025
**Status**: ✅ Production Ready