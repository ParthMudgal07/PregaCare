import joblib

model = joblib.load('stacking_model.pkl')
if hasattr(model, 'feature_names_in_'):
    print(f"Features: {model.feature_names_in_}")
else:
    # If not scikit-learn 1.0+, try to find features elsewhere
    print("feature_names_in_ not found. Checking estimators...")
    for est in model.estimators_:
        if hasattr(est, 'feature_names_in_'):
            print(f"Est Features: {est.feature_names_in_}")
            break
