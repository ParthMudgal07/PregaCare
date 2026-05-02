from final_assessment import PregaCareFinalAssessment
from pregacare_engine import PregaCareAIEngine
import os
from dotenv import load_dotenv

load_dotenv()

def debug_flow():
    print("--- FULL FLOW DIAGNOSTIC ---")
    assessor = PregaCareFinalAssessment()
    engine = PregaCareAIEngine()
    
    # 1. Test Assessment
    vitals = {'Age': 25, 'SystolicBP': 120, 'DiastolicBP': 80, 'BS': 7.0, 'BodyTemp': 98.6, 'HeartRate': 75}
    report = assessor.perform_assessment(vitals, "Rohtak", "Haryana")
    print(f"Assessment Success: {report['risk_band']}")

    # 2. Test Engine
    print("Calling AI Engine...")
    response = engine.generate_response("Hello, how are you?", report)
    
    print(f"\nAI RESPONSE: {response}")

if __name__ == "__main__":
    debug_flow()
