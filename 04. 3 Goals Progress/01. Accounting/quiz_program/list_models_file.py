import google.generativeai as genai
import json

def list_to_file():
    try:
        with open('config.json', 'r') as f:
            config = json.load(f)
            api_key = config.get('api_key')
    except:
        return

    genai.configure(api_key=api_key)
    
    with open('models_list.txt', 'w') as f:
        try:
            for m in genai.list_models():
                f.write(f"Name: {m.name}\n")
                f.write(f"Methods: {m.supported_generation_methods}\n")
                f.write("-" * 20 + "\n")
        except Exception as e:
            f.write(f"Error: {e}")

if __name__ == "__main__":
    list_to_file()
