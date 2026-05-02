import joblib

file_path = 'stacking_model.pkl'

try:
    model = joblib.load(file_path)
    print(f"Loaded with joblib. Type: {type(model)}")
    if hasattr(model, 'predict_proba'):
        print("Has predict_proba")
    else:
        print("Does not have predict_proba")

except Exception as e:
    print(f"Joblib Error: {e}")
