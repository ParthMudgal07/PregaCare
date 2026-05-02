import requests

BASE_URL = "http://127.0.0.1:8001"

def test_assess():
    payload = {
        "vitals": {
            "Age": 25,
            "SystolicBP": 120,
            "DiastolicBP": 80,
            "BS": 5.5,
            "BodyTemp": 98.6,
            "HeartRate": 72
        },
        "district": "Navsari",
        "state": "Gujarat"
    }
    response = requests.post(f"{BASE_URL}/assess", json=payload)
    print("--- ASSESS RESPONSE ---")
    print(response.json())
    return response.json()

def test_chat(report):
    payload = {
        "user_query": "Is my health okay based on the report?",
        "assessment_report": report,
        "chat_history": []
    }
    response = requests.post(f"{BASE_URL}/chat", json=payload)
    print("\n--- CHAT RESPONSE ---")
    print(response.json())

if __name__ == "__main__":
    try:
        report = test_assess()
        test_chat(report)
    except Exception as e:
        print(f"Error testing API: {e}")
