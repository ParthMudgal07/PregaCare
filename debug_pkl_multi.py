import pickle

file_path = 'stacking_model.pkl'

objects = []
try:
    with open(file_path, 'rb') as f:
        while True:
            try:
                objects.append(pickle.load(f))
            except EOFError:
                break
    
    print(f"Number of objects in file: {len(objects)}")
    for i, obj in enumerate(objects):
        print(f"Object {i} type: {type(obj)}")
        if hasattr(obj, 'predict'):
            print(f"Object {i} is an estimator")

except Exception as e:
    print(f"Error: {e}")
