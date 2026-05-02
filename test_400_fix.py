import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

def test_400_fix():
    api_key = os.getenv("OPENROUTER_API_KEY")
    url = "https://openrouter.ai/ai/v1/chat/completions"
    
    # Trying without 'system' role
    model = "google/gemma-3n-e2b-it:free"
    
    print(f"Testing fix for 400 error with model: {model}")
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    # Merging system prompt into the first user message
    payload = {
        "model": model,
        "messages": [
            {"role": "user", "content": "Instruction: Act as a helpful assistant. \n\nQuestion: Hello!"}
        ]
    }

    try:
        response = requests.post(url, headers=headers, data=json.dumps(payload))
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    test_400_fix()
