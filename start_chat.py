import os
from final_assessment import PregaCareFinalAssessment
from pregacare_engine import PregaCareAIEngine

def main():
    # Initialize components
    assessor = PregaCareFinalAssessment()
    engine = PregaCareAIEngine()
    
    print("\n" + "="*50)
    print(" PREGACARE - PERSONALIZED CONTEXT-AWARE AI")
    print("="*50)
    
    # Check for API Key
    if not os.getenv("OPENROUTER_API_KEY"):
        print("\n[!] WARNING: OPENROUTER_API_KEY not found in .env file.")
        print("Please paste your key in the .env file before chatting.")
        # Create .env template if it doesn't exist
        if not os.path.exists(".env"):
            with open(".env", "w") as f:
                f.write("OPENROUTER_API_KEY=your_key_here")
    
    # 1. SETUP THE CONTEXT
    print("\n[FIRST, LET'S SYNC YOUR LOCAL HEALTH DATA]")
    try:
        age = float(input("Enter Age: "))
        sys_bp = float(input("Enter Systolic BP: "))
        dia_bp = float(input("Enter Diastolic BP: "))
        sugar = float(input("Enter Blood Sugar: "))
        temp = float(input("Enter Body Temp: "))
        hr = float(input("Enter Heart Rate: "))
        state = input("Enter State: ")
        district = input("Enter District: ")

        vitals = {
            'Age': age, 'SystolicBP': sys_bp, 'DiastolicBP': dia_bp, 
            'BS': sugar, 'BodyTemp': temp, 'HeartRate': hr
        }

        # Generate the assessment (The Context)
        report = assessor.perform_assessment(vitals, district, state)
        
        print("\n" + "-"*50)
        print(f"ASSESSMENT SYNCED: {report['risk_band']} | Score: {report['combined_score']}")
        print(f"LOCATION: {report['location']}")
        print("-" * 50)
        
        # 2. START THE CHAT
        chat_history = []
        print("\nPregaCare AI is ready. (Type 'exit' to quit)")
        
        while True:
            user_query = input("\nYou: ")
            if user_query.lower() in ['exit', 'quit']:
                print("Take care! Closing PregaCare AI.")
                break
            
            print("\nAI is thinking...", end="\r")
            
            # Call the AI Engine with RAG
            response = engine.generate_response(user_query, report, chat_history)
            
            print(f"PregaCare AI: {response}")
            
            # Update history
            chat_history.append({"role": "user", "content": user_query})
            chat_history.append({"role": "assistant", "content": response})

    except Exception as e:
        print(f"\n[!] Error during setup: {e}")

if __name__ == "__main__":
    main()
