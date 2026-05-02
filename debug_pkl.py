import pickle
import numpy as np

file_path = 'stacking_model.pkl'

try:
    with open(file_path, 'rb') as f:
        model = pickle.load(f)
    
    print(f"Loaded object type: {type(model)}")
    if isinstance(model, np.ndarray):
        print(f"Shape: {model.shape}")
        print(f"Data: {model[:5]}")
    elif isinstance(model, list):
        print(f"List length: {len(model)}")
        print(f"First element type: {type(model[0])}")
    else:
        print(f"Attributes: {dir(model)}")

except Exception as e:
    print(f"Error: {e}")
