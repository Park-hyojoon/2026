from google import genai
from google.genai import types
import json
import re
import traceback

client = None

def configure_gemini(api_key):
    """Configures the Gemini API with the provided key."""
    global client
    try:
        client = genai.Client(api_key=api_key)
        print("Gemini API 클라이언트 생성 완료")
    except Exception as e:
        print(f"API 클라이언트 생성 오류: {e}")
        raise

def generate_quiz_questions(text_context, num_questions=3):
    """
    Generates multiple-choice questions based on the provided text using Gemini.
    """
    if not client:
        raise ValueError("Gemini API not configured. Call configure_gemini() first.")

    prompt = f"""
    You are an expert accounting tutor. Based on the following text context from a study material,
    create {num_questions} multiple-choice questions (4 options each) to test the student's understanding.

    Return the result strictly in JSON format as a list of objects.
    Each object should have:
    - "id": number
    - "question": string (The question text in Korean)
    - "options": list of 4 strings (The choices in Korean)
    - "answer": number (The index of the correct option, 0-3)
    - "explanation": string (A brief explanation of why the answer is correct in Korean)

    Context:
    {text_context[:10000]}
    """

    try:
        print("Gemini API 호출 중...")
        response = client.models.generate_content(
            model='models/gemini-1.5-flash',
            contents=prompt
        )
        print("API 응답 받음")

        text_response = response.text
        print(f"응답 텍스트 길이: {len(text_response)}")

        # Clean up Markdown code blocks if present
        text_response = text_response.replace("```json", "").replace("```", "").strip()

        questions = json.loads(text_response)
        print(f"문제 생성 완료: {len(questions)}개")
        return questions
    except json.JSONDecodeError as e:
        print(f"JSON 파싱 오류: {e}")
        print(f"응답 내용: {text_response[:500]}")
        return []
    except Exception as e:
        print(f"문제 생성 오류: {type(e).__name__}: {e}")
        traceback.print_exc()
        return []

if __name__ == "__main__":
    print("This module is intended to be imported.")
