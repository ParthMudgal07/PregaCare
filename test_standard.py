import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

def test_connection():
    api_key = os.getenv("OPENROUTER_API_KEY")
    url = "https://openrouter.ai/api/v1/chat/completions"
    
    # Using a model that definitely exists
    model = "google/gemini-2.0-flash-lite-001"
    
    print(f"Testing with model: {model}")
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": model,
        "messages": [
            {"role": "user", "content": "Hello!"}
        ]
    }

    try:
        response = requests.post(url, headers=headers, data=json.dumps(payload))
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print("SUCCESS")
            print(response.json()['choices'][0]['message']['content'])
        else:
            print(f"FAILED: {response.text}")
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    test_connection()
