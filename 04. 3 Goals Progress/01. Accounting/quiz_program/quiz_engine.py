import requests
import json
import traceback

# Ollama 설정
OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "gpt-oss:120b-cloud"

def configure_gemini(api_key=None):
    """Ollama는 API 키가 필요 없음. 호환성을 위해 함수 유지."""
    print("Ollama 모드 - API 키 불필요 (로컬 실행)")
    # Ollama 서버 연결 확인
    try:
        response = requests.get("http://localhost:11434/api/tags", timeout=5)
        if response.status_code == 200:
            print("✓ Ollama 서버 연결 성공!")
            return True
    except:
        pass
    print("⚠ Ollama 서버가 실행 중이 아닙니다.")
    print("  터미널에서 'ollama serve' 실행 후 다시 시도하세요.")
    return False

def generate_quiz_questions(text_context, num_questions=3):
    """
    Ollama를 사용하여 문제 생성
    """
    prompt = f"""당신은 회계 전문 튜터입니다. 아래 학습 자료를 바탕으로 {num_questions}개의 4지선다 문제를 만들어주세요.

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트 없이 JSON만 출력하세요:
[
  {{
    "id": 1,
    "question": "문제 내용 (한국어)",
    "options": ["선택지1", "선택지2", "선택지3", "선택지4"],
    "answer": 0,
    "explanation": "정답 해설 (한국어)"
  }}
]

answer는 정답의 인덱스입니다 (0, 1, 2, 3 중 하나).

학습 자료:
{text_context[:5000]}

위 자료를 바탕으로 {num_questions}개의 문제를 JSON 형식으로 생성하세요:"""

    try:
        print(f"Ollama ({OLLAMA_MODEL}) 호출 중...")

        response = requests.post(
            OLLAMA_URL,
            json={
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.7,
                    "num_predict": 2000
                }
            },
            timeout=120
        )

        if response.status_code != 200:
            print(f"Ollama 오류: {response.status_code}")
            return []

        result = response.json()
        text_response = result.get("response", "")
        print(f"응답 받음 (길이: {len(text_response)})")

        # JSON 추출
        text_response = text_response.strip()

        # ```json ... ``` 블록 제거
        if "```json" in text_response:
            start = text_response.find("```json") + 7
            end = text_response.find("```", start)
            text_response = text_response[start:end].strip()
        elif "```" in text_response:
            start = text_response.find("```") + 3
            end = text_response.find("```", start)
            text_response = text_response[start:end].strip()

        # [ 로 시작하는 부분 찾기
        if "[" in text_response:
            start_idx = text_response.find("[")
            end_idx = text_response.rfind("]") + 1
            text_response = text_response[start_idx:end_idx]

        questions = json.loads(text_response)
        print(f"문제 생성 완료: {len(questions)}개")
        return questions

    except json.JSONDecodeError as e:
        print(f"JSON 파싱 오류: {e}")
        print(f"응답 내용: {text_response[:500]}")
        return []
    except requests.exceptions.ConnectionError:
        print("Ollama 서버에 연결할 수 없습니다.")
        print("터미널에서 'ollama serve' 실행 후 다시 시도하세요.")
        return []
    except Exception as e:
        print(f"문제 생성 오류: {e}")
        traceback.print_exc()
        return []

if __name__ == "__main__":
    print("Ollama 연결 테스트...")
    configure_gemini()
