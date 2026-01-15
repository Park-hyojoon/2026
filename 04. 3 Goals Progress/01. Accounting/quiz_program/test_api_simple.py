"""
API 키 테스트 스크립트
이 스크립트로 API 키가 올바르게 작동하는지 확인하세요.
"""
import sys
import os

# 상위 디렉토리에서도 실행 가능하도록
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from pdf_handler import extract_text_from_pdf
from quiz_engine import configure_gemini, generate_quiz_questions

def main():
    print("=" * 50)
    print("Google Gemini API 테스트")
    print("=" * 50)
    print()

    # 1. API 키 입력
    api_key = input("Google Gemini API 키를 입력하세요: ").strip()

    if not api_key:
        print("❌ API 키가 입력되지 않았습니다.")
        return

    # 2. API 설정
    print("\n[1단계] API 설정 중...")
    try:
        configure_gemini(api_key)
        print("✅ API 설정 성공!")
    except Exception as e:
        print(f"❌ API 설정 실패: {e}")
        return

    # 3. PDF 경로 설정
    pdf_path = r"d:\00. WorkSpace\02. Creat\01. Antigravity\2026\04. 3 Goals Progress\01. Accounting\PDF(ocr)\02.계정과목별 정리_01.유동(당좌자산)-현금및현금성자산 회계처리.pdf"

    if not os.path.exists(pdf_path):
        print(f"❌ PDF 파일을 찾을 수 없습니다: {pdf_path}")
        return

    # 4. PDF 텍스트 추출
    print("\n[2단계] PDF 텍스트 추출 중...")
    pdf_text = extract_text_from_pdf(pdf_path, max_pages=2)

    if not pdf_text:
        print("❌ PDF에서 텍스트를 추출하지 못했습니다.")
        return

    print(f"✅ 텍스트 추출 성공! (총 {len(pdf_text)}자)")
    print(f"   첫 200자: {pdf_text[:200]}...")

    # 5. 문제 생성
    print("\n[3단계] AI 문제 생성 중... (30초 정도 걸립니다)")
    questions = generate_quiz_questions(pdf_text, num_questions=2)

    if not questions:
        print("❌ 문제 생성에 실패했습니다.")
        print("   위의 오류 메시지를 확인하세요.")
        return

    print(f"✅ 문제 생성 성공! (총 {len(questions)}개)")
    print()

    # 6. 생성된 문제 출력
    for i, q in enumerate(questions, 1):
        print(f"\n[문제 {i}]")
        print(f"Q: {q['question']}")
        print(f"선택지:")
        for j, opt in enumerate(q['options'], 1):
            print(f"  {j}. {opt}")
        print(f"정답: {q['answer'] + 1}번")
        print(f"해설: {q['explanation']}")
        print("-" * 50)

    print("\n" + "=" * 50)
    print("✅ 모든 테스트 완료!")
    print("=" * 50)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n프로그램이 중단되었습니다.")
    except Exception as e:
        print(f"\n예상치 못한 오류 발생: {e}")
        import traceback
        traceback.print_exc()
    finally:
        input("\n엔터를 눌러 종료하세요...")
