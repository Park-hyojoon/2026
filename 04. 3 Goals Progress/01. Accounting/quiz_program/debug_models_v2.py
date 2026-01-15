from google import genai
import os
import json

def test_models():
    # Load key from config
    try:
        with open('config.json', 'r') as f:
            config = json.load(f)
            api_key = config.get('api_key')
    except:
        print("Config file not found or invalid.")
        return

    if not api_key:
        print("No API key found in config.json")
        return

    print(f"Using API Key: {api_key[:5]}...{api_key[-5:]}")
    
    client = genai.Client(api_key=api_key)
    
    # List of models to try
    candidates = [
        'gemini-1.5-flash',
        'models/gemini-1.5-flash',
        'gemini-1.5-pro',
        'models/gemini-1.5-pro',
        'gemini-2.0-flash-exp', # If available
        'gemini-pro',
        'models/gemini-pro'
    ]

    print("\n--- Testing Model Availability ---")
    for model_name in candidates:
        print(f"Testing '{model_name}'...", end=" ")
        try:
            # Try a minimal generation
            response = client.models.generate_content(
                model=model_name,
                contents='Hi'
            )
            print(f"✅ SUCCESS")
            print(f"   Response: {response.text[:20]}...")
            return  # Stop after first success if you want, or continue to see all
        except Exception as e:
            print(f"❌ FAILED")
            print(f"   Error: {e}")

if __name__ == "__main__":
    test_models()
