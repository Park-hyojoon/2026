import google.generativeai as genai
import json

def test_generation_permissions():
    try:
        with open('config.json', 'r') as f:
            config = json.load(f)
            api_key = config.get('api_key')
    except:
        print("Config error")
        return

    genai.configure(api_key=api_key)

    # List of models to try (prioritizing stable ones)
    candidates = [
        "models/gemini-1.5-flash",
        "models/gemini-flash-latest",
        "models/gemini-pro",
        "models/gemini-1.5-pro",
        "models/gemini-2.0-flash-lite-preview-02-05" 
    ]

    print(f"Testing generation permissions...")
    
    for model_name in candidates:
        print(f"Testing '{model_name}'...", end=" ")
        try:
            model = genai.GenerativeModel(model_name)
            response = model.generate_content("Hello, can you hear me?")
            print(f"SUCCESS! ✅ (Response length: {len(response.text)})")
            print(f"RECOMMENDATION: Use '{model_name}'")
            return 
        except Exception as e:
            print(f"FAILED ❌ ({e})")

if __name__ == "__main__":
    test_generation_permissions()
