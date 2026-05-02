import joblib
import pandas as pd
import numpy as np
import warnings

# Suppress sklearn version warnings
warnings.filterwarnings("ignore", category=UserWarning)

class PregaCareRiskPipeline:
    def __init__(self, model_path='stacking_model.pkl'):
        """
        Initializes the pipeline by loading the stacking model.
        """
        try:
            # Using joblib as the model contains complex sklearn/xgboost structures
            self.model = joblib.load(model_path)
            print(f"Successfully loaded PregaCare Stacking Model.")
        except Exception as e:
            print(f"Error loading model: {e}")
            self.model = None
        
        # EXACT feature order expected by the model
        self.feature_names = ['Age', 'SystolicBP', 'DiastolicBP', 'BS', 'BodyTemp', 'HeartRate']

    def calculate_individual_risk(self, patient_data):
        """
        Takes patient clinical vitals and returns a continuous risk score (0-100).
        
        Args:
            patient_data (dict): Dictionary containing keys:
                                'Age', 'SystolicBP', 'DiastolicBP', 'BloodSugar', 'BodyTemp', 'HeartRate'
            
        Returns:
            dict: Comprehensive risk analysis
        """
        if self.model is None:
            return {"error": "Model not loaded. Check if stacking_model.pkl exists and xgboost is installed."}

        # 1. Pre-process and Map features
        # Mapping user-friendly names to model names (e.g., BloodSugar -> BS)
        mapping = {
            'BloodSugar': 'BS',
            'BS': 'BS',
            'Sugar': 'BS'
        }
        
        processed_data = {}
        for feat in self.feature_names:
            val = patient_data.get(feat)
            if val is None:
                # Try mapping if direct key not found
                for user_key, model_key in mapping.items():
                    if model_key == feat:
                        val = patient_data.get(user_key)
                        if val is not None: break
            
            if val is None:
                return {"error": f"Missing required vital: {feat}"}
            processed_data[feat] = val

        # Create DataFrame with the EXACT feature order
        input_df = pd.DataFrame([processed_data])[self.feature_names]

        try:
            # 2. Predict Class Probabilities [P(Low), P(Mid), P(High)]
            # Most models return [P(0), P(1), P(2)]
            probs = self.model.predict_proba(input_df)[0]
            
            # 3. Calculate the individual_risk_score
            # We use a weighted sum to create a continuous 0-100 scale:
            # Score = (0 * P_low) + (50 * P_mid) + (100 * P_high)
            risk_score = (probs[0] * 0) + (probs[1] * 50) + (probs[2] * 100)
            
            # 4. Get the standard categorical prediction for reference
            pred_class = self.model.predict(input_df)[0]
            class_labels = {0: 'Low Risk', 1: 'Mid Risk', 2: 'High Risk'}
            
            return {
                "individual_risk_score": round(float(risk_score), 2),
                "categorical_risk": class_labels.get(pred_class, "Unknown"),
                "confidence_metrics": {
                    "low_risk_prob": round(float(probs[0]), 4),
                    "mid_risk_prob": round(float(probs[1]), 4),
                    "high_risk_prob": round(float(probs[2]), 4)
                }
            }
        except Exception as e:
            return {"error": f"Prediction logic failed: {e}"}

# --- Quick Test ---
if __name__ == "__main__":
    pipeline = PregaCareRiskPipeline()
    
    # Test with a sample patient
    test_patient = {
        'Age': 25,
        'SystolicBP': 145, # Slightly high
        'DiastolicBP': 95, 
        'BloodSugar': 12.0, # High
        'BodyTemp': 98.6,
        'HeartRate': 85
    }
    
    analysis = pipeline.calculate_individual_risk(test_patient)
    
    if "error" in analysis:
        print(f"Error: {analysis['error']}")
    else:
        print("\n" + "="*30)
        print(" PREGACARE PATIENT ANALYSIS")
        print("="*30)
        print(f"Risk Score: {analysis['individual_risk_score']} / 100")
        print(f"Status:     {analysis['categorical_risk']}")
        print(f"Confidence: High Risk ({analysis['confidence_metrics']['high_risk_prob']*100:.1f}%)")
        print("="*30)
