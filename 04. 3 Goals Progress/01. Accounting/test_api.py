from google import genai
import sys

# 테스트용 - API 키 입력받기
api_key = input("API 키를 입력하세요: ").strip()

try:
    # Client 생성
    client = genai.Client(api_key=api_key)
    print("✓ Client 생성 성공")

    # 간단한 테스트 프롬프트
    test_prompt = "안녕하세요를 영어로 번역해주세요."

    print("API 호출 중...")
    response = client.models.generate_content(
        model='gemini-2.0-flash-exp',
        contents=test_prompt
    )

    print("✓ API 호출 성공!")
    print(f"응답: {response.text}")

except Exception as e:
    print(f"✗ 오류 발생: {type(e).__name__}")
    print(f"상세 내용: {str(e)}")
    import traceback
    traceback.print_exc()
