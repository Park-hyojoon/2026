"""
사용 가능한 Gemini 모델 목록 확인
"""
from google import genai

api_key = input("API 키를 입력하세요: ").strip()

try:
    client = genai.Client(api_key=api_key)
    print("✓ API 연결 성공!\n")

    print("사용 가능한 모델 목록:")
    print("=" * 50)

    for model in client.models.list():
        print(f"- {model.name}")

except Exception as e:
    print(f"오류: {type(e).__name__}: {e}")

input("\n엔터를 눌러 종료...")
