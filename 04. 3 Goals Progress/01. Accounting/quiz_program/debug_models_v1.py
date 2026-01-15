import google.generativeai as genai
import os
import json

def test_models_v1():
    try:
        with open('config.json', 'r') as f:
            config = json.load(f)
            api_key = config.get('api_key')
    except:
        print("Config file error")
        return

    if not api_key:
        print("No API key")
        return

    print(f"Testing V1 SDK with Key: {api_key[:5]}...")
    genai.configure(api_key=api_key)

    try:
        print("Listing available models in V1...")
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(f" - {m.name}")
        
        print("\nTesting generation with 'gemini-pro'...")
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content("Hello")
        print(f"Success! Response: {response.text}")

    except Exception as e:
        print(f"Error in V1: {e}")

if __name__ == "__main__":
    test_models_v1()
