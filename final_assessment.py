import pandas as pd
from patient_risk_pipeline import PregaCareRiskPipeline

class PregaCareFinalAssessment:
    def __init__(self, rankings_path='District_Safety_Rankings.csv'):
        """
        Integrates Clinical Risk Model and Regional Safety TOPSIS model.
        """
        # Initialize the clinical pipeline (loads the stacking model)
        self.clinical_pipeline = PregaCareRiskPipeline()
        
        # Load District Safety Rankings (pre-calculated TOPSIS scores)
        try:
            self.rankings = pd.read_csv(rankings_path)
            # Normalize district names for easier searching
            self.rankings['District_Lower'] = self.rankings['District Names'].str.strip().str.lower()
        except Exception as e:
            print(f"Error loading rankings: {e}")
            self.rankings = None

    def get_district_safety(self, district_name):
        """
        Retrieves the safety score (0 to 1) for a specific district.
        """
        if self.rankings is None:
            return 0.5 # Default fallback
            
        # Try to find a match
        query = district_name.strip().lower()
        match = self.rankings[self.rankings['District_Lower'] == query]
        
        if not match.empty:
            return float(match.iloc[0]['Safety_Score'])
        else:
            # If specific district not found, could fallback to state average
            # For now, we use a conservative default
            print(f"Warning: District '{district_name}' not found in database.")
            return 0.5

    def perform_assessment(self, vitals, district, state):
        """
        Calculates the combined risk and determines the risk band.
        
        Args:
            vitals (dict): Patient vitals ('Age', 'SystolicBP', etc.)
            district (str): Name of the district
            state (str): Name of the state
            
        Returns:
            dict: The final report
        """
        # 1. Get Individual Clinical Risk (Scale: 0 - 100)
        clinical_results = self.clinical_pipeline.calculate_individual_risk(vitals)
        if "error" in clinical_results:
            return clinical_results
            
        individual_risk = clinical_results['individual_risk_score']
        
        # 2. Get Regional Safety Score (Scale: 0 - 1)
        district_safety = self.get_district_safety(district)
        
        # 3. Calculate Combined Risk Score (Scale: 0 - 100)
        # Weighted formula: 75% Health, 25% Environment
        # Environment risk is (1 - safety)
        regional_risk_penalty = (1 - district_safety) * 100
        combined_score = (individual_risk * 0.75) + (regional_risk_penalty * 0.25)
        
        # 4. Map to Risk Band
        if combined_score <= 35:
            risk_band = "Low Risk"
            color_code = "Green"
            action = "Everything looks good! Follow your routine checkups and stay healthy."
        elif combined_score <= 70:
            risk_band = "Mid Risk"
            color_code = "Yellow/Orange"
            action = "Moderate concern. Please consult your physician and monitor your vitals more frequently."
        else:
            risk_band = "High Risk"
            color_code = "Red"
            action = "IMMEDIATE ATTENTION: High risk detected. Please visit the nearest hospital or consult a specialist immediately."

        return {
            "combined_score": round(combined_score, 2),
            "risk_band": risk_band,
            "color_code": color_code,
            "individual_health_score": individual_risk,
            "regional_safety_index": round(district_safety, 3),
            "suggested_action": action,
            "location": f"{district}, {state}"
        }

# --- Demonstration ---
if __name__ == "__main__":
    assessor = PregaCareFinalAssessment()
    
    print("\n--- Testing PregaCare Integrated Assessment ---")
    
    # Example 1: Healthy patient in a safe district
    patient1 = {
        'vitals': {'Age': 24, 'SystolicBP': 115, 'DiastolicBP': 75, 'BS': 6.0, 'BodyTemp': 98.6, 'HeartRate': 70},
        'district': 'Navsari', 'state': 'Gujarat'
    }
    
    # Example 2: Healthy patient in an unsafe district
    patient2 = {
        'vitals': {'Age': 24, 'SystolicBP': 115, 'DiastolicBP': 75, 'BS': 6.0, 'BodyTemp': 98.6, 'HeartRate': 70},
        'district': 'Jabalpur', 'state': 'Madhya Pradesh'
    }
    
    for i, p in enumerate([patient1, patient2], 1):
        res = assessor.perform_assessment(p['vitals'], p['district'], p['state'])
        print(f"\n[Test {i}] Patient in {res['location']}:")
        print(f" >> Combined Risk: {res['combined_score']} ({res['risk_band']})")
        print(f" >> Individual Health: {res['individual_health_score']}")
        print(f" >> Regional Safety: {res['regional_safety_index']}")
        print(f" >> Action: {res['suggested_action']}")
