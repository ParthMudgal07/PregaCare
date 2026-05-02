from final_assessment import PregaCareFinalAssessment

def run_interactive_test():
    assessor = PregaCareFinalAssessment()
    
    print("\n" + "="*40)
    print(" PREGACARE - SYSTEM TEST")
    print("="*40)
    
    try:
        # Get Patient Vitals
        print("\n[STEP 1: CLINICAL VITALS]")
        age = float(input("Enter Age: "))
        sys_bp = float(input("Enter Systolic BP (e.g., 120): "))
        dia_bp = float(input("Enter Diastolic BP (e.g., 80): "))
        sugar = float(input("Enter Blood Sugar (e.g., 7.5): "))
        temp = float(input("Enter Body Temp (e.g., 98.6): "))
        hr = float(input("Enter Heart Rate (e.g., 75): "))
        
        # Get Location
        print("\n[STEP 2: LOCATION]")
        state = input("Enter State Name: ")
        district = input("Enter District Name: ")

        vitals = {
            'Age': age, 'SystolicBP': sys_bp, 'DiastolicBP': dia_bp, 
            'BloodSugar': sugar, 'BodyTemp': temp, 'HeartRate': hr
        }

        # Perform Assessment
        print("\n[PROCESSING ASSESSMENT...]")
        report = assessor.perform_assessment(vitals, district, state)

        # Output Results
        print("\n" + "*"*40)
        print(" FINAL ASSESSMENT REPORT")
        print("*"*40)
        print(f"PATIENT:    Age {age}, {district}, {state}")
        print(f"RISK SCORE: {report['combined_score']} / 100")
        print(f"RISK BAND:  {report['risk_band']} ({report['color_code']})")
        print(f"DETAIL:     Health({report['individual_health_score']}) | District Safety({report['regional_safety_index']})")
        print(f"\nADVICE:     {report['suggested_action']}")
        print("*"*40 + "\n")

    except ValueError:
        print("Error: Please enter numeric values for clinical vitals.")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    run_interactive_test()
