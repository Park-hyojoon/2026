import google.generativeai as genai
import json
import os

def list_all_models():
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

    print(f"Using Key: {api_key[:5]}...")
    genai.configure(api_key=api_key)

    print("\n--- Available Models ---")
    try:
        for m in genai.list_models():
            print(f"Model: {m.name}")
            print(f"  - Methods: {m.supported_generation_methods}")
    except Exception as e:
        print(f"Error listing models: {e}")

if __name__ == "__main__":
    list_all_models()
