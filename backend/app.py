from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import pandas as pd
import numpy as np
import os
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Bank Marketing Classifier API", version="1.0.0")

# Add CORS middleware to allow requests from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://192.168.0.123:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the trained model
MODEL_PATH = "models/bank_marketing_classifier.pkl"

# Global model variable
model = None

@app.on_event("startup")
async def load_model():
    """Load the trained model when the app starts"""
    global model
    try:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")
        model = joblib.load(MODEL_PATH)
        print(f"✅ Model loaded successfully from {MODEL_PATH}")
    except Exception as e:
        print(f"❌ Failed to load model: {str(e)}")
        raise

# Define the request schema based on the 33 encoded features
class CustomerData(BaseModel):
    """
    Schema for customer data input
    33 features after one-hot encoding from original bank marketing dataset
    """
    age: int
    balance: float
    day: int
    month: int
    campaign: int
    pdays: int
    previous: int
    default_0: int
    default_1: int
    housing_0: int
    housing_1: int
    loan_0: int
    loan_1: int
    education_ordinal: int
    month_ordinal: int
    job_admin_: int
    job_blue_collar: int
    job_entrepreneur: int
    job_housemaid: int
    job_management: int
    job_retired: int
    job_services: int
    job_technician: int
    job_unemployed: int
    job_unknown: int
    marital_divorced: int
    marital_married: int
    marital_single: int
    contact_telephone: int
    contact_unknown: int
    poutcome_failure: int
    poutcome_other: int
    poutcome_success: int

class PredictionResponse(BaseModel):
    """Response schema for prediction results"""
    prediction: int
    probability_no: float
    probability_yes: float
    confidence: float
    recommendation: str

@app.get("/health", tags=["Health Check"])
async def health_check():
    """Health check endpoint to verify API is running"""
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "api_version": "1.0.0"
    }

@app.post("/predict", response_model=PredictionResponse, tags=["Prediction"])
async def predict_subscription(customer: CustomerData):
    """
    Predict whether a customer will subscribe to a term deposit.
    
    Returns:
    - prediction: 0 (No) or 1 (Yes)
    - probability_no: Probability of not subscribing
    - probability_yes: Probability of subscribing
    - confidence: Confidence level of the prediction
    - recommendation: Marketing recommendation based on prediction
    """
    
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded. Please restart the server.")
    
    try:
        # Convert customer data to DataFrame with proper feature order
        features = [
            customer.age,
            customer.balance,
            customer.day,
            customer.month,
            customer.campaign,
            customer.pdays,
            customer.previous,
            customer.default_0,
            customer.default_1,
            customer.housing_0,
            customer.housing_1,
            customer.loan_0,
            customer.loan_1,
            customer.education_ordinal,
            customer.month_ordinal,
            customer.job_admin_,
            customer.job_blue_collar,
            customer.job_entrepreneur,
            customer.job_housemaid,
            customer.job_management,
            customer.job_retired,
            customer.job_services,
            customer.job_technician,
            customer.job_unemployed,
            customer.job_unknown,
            customer.marital_divorced,
            customer.marital_married,
            customer.marital_single,
            customer.contact_telephone,
            customer.contact_unknown,
            customer.poutcome_failure,
            customer.poutcome_other,
            customer.poutcome_success,
        ]
        
        # Reshape for single prediction
        X = np.array(features).reshape(1, -1)
        
        # Make prediction
        prediction = model.predict(X)[0]
        probabilities = model.predict_proba(X)[0]
        
        prob_no = float(probabilities[0])
        prob_yes = float(probabilities[1])
        confidence = float(max(probabilities))
        
        # Generate recommendation based on prediction and probability
        if prediction == 1:
            if prob_yes > 0.6:
                recommendation = "High confidence - Highly likely to subscribe. Recommend contacting."
            else:
                recommendation = "Moderate confidence - Likely to subscribe. Recommend contacting."
        else:
            if prob_no > 0.8:
                recommendation = "High confidence - Unlikely to subscribe. Consider deprioritizing."
            else:
                recommendation = "Moderate confidence - May or may not subscribe. Use caution."
        
        return PredictionResponse(
            prediction=int(prediction),
            probability_no=prob_no,
            probability_yes=prob_yes,
            confidence=confidence,
            recommendation=recommendation
        )
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid input data: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.get("/model-info", tags=["Model Info"])
async def get_model_info():
    """Get information about the loaded model"""
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    return {
        "model_type": type(model).__name__,
        "n_estimators": model.n_estimators,
        "max_depth": model.max_depth,
        "min_samples_split": model.min_samples_split,
        "min_samples_leaf": model.min_samples_leaf,
        "class_weight": model.class_weight,
        "random_state": model.random_state,
        "expected_features": 33,
        "model_path": MODEL_PATH
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
