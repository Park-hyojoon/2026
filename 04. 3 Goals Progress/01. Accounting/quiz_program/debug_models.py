from google import genai
import os

def list_models():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        api_key = input("API Key: ")
    
    try:
        client = genai.Client(api_key=api_key)
        print("Listing models...")
        # The V2 SDK might have a different method to list models, or we try to generate with a known model
        # Let's try to list if possible. Based on docs, it might be client.models.list()
        
        # Try a simple generation to test connectivity with 'gemini-1.5-flash'
        print("\nTesting gemini-1.5-flash...")
        response = client.models.generate_content(
            model='gemini-1.5-flash',
            contents='Hello, are you there?'
        )
        print(f"Success! Response: {response.text}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    list_models()
