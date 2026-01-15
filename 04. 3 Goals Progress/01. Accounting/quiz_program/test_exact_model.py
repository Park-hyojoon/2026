import google.generativeai as genai
import json

def test_specific_models():
    try:
        with open('config.json', 'r') as f:
            config = json.load(f)
            api_key = config.get('api_key')
    except:
        print("Config error")
        return

    genai.configure(api_key=api_key)

    # Candidates to test
    candidates = [
        "gemini-1.5-flash",
        "models/gemini-1.5-flash",
        "gemini-pro",
        "models/gemini-pro",
        "gemini-1.5-flash-001",
        "gemini-1.5-pro"
    ]

    print(f"Testing with key: {api_key[:5]}...")
    
    for model_name in candidates:
        print(f"Testing model: '{model_name}'...", end=" ")
        try:
            model = genai.GenerativeModel(model_name)
            response = model.generate_content("Hello")
            print("SUCCESS! ✅")
            print(f"Response: {response.text}")
            return # Stop on first success
        except Exception as e:
            print("FAIL ❌")
            # print(f"Error: {e}") # Uncomment if needed, but keep output clean for now

if __name__ == "__main__":
    test_specific_models()
