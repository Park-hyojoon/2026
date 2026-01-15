"""
빠른 API 테스트 - 작동하는 모델 찾기
"""
import google.generativeai as genai

print("=" * 50)
print("Google Gemini API 빠른 테스트")
print("=" * 50)

api_key = input("\nAPI 키 입력: ").strip()

if not api_key:
    print("API 키가 입력되지 않았습니다.")
    input("엔터를 눌러 종료...")
    exit()

genai.configure(api_key=api_key)
print("\n모델 테스트 중...\n")

# 테스트할 모델 목록 (무료 티어에서 작동 가능성 높은 순)
models_to_test = [
    "gemini-2.0-flash-lite",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-flash-latest",
    "gemini-pro",
]

working_model = None

for model_name in models_to_test:
    print(f"테스트: {model_name}...", end=" ")
    try:
        model = genai.GenerativeModel(model_name)
        response = model.generate_content("안녕하세요. 테스트입니다.")
        print(f"성공! ✅")
        print(f"  응답: {response.text[:50]}...")
        working_model = model_name
        break
    except Exception as e:
        error_msg = str(e)[:50]
        print(f"실패 ❌ ({error_msg})")

print("\n" + "=" * 50)
if working_model:
    print(f"작동하는 모델: {working_model}")
    print(f"\nquiz_engine.py의 model_name을 '{working_model}'로 변경하세요!")
else:
    print("모든 모델이 실패했습니다.")
    print("API 키가 올바른지 확인하세요.")
    print("https://aistudio.google.com/app/apikey 에서 새 키 발급")

input("\n엔터를 눌러 종료...")
