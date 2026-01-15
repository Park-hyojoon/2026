import os
import sys
from pdf_handler import extract_text_from_pdf
from quiz_engine import configure_gemini, generate_quiz_questions

def main():
    print("=== AI 회계 퀴즈 프로그램 (Gemini 기반) ===")
    
    # 1. API Key Setup
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("경고: GEMINI_API_KEY 환경 변수가 설정되지 않았습니다.")
        api_key = input("Google Gemini API 키를 입력해주세요: ").strip()
        if not api_key:
            print("API 키가 없으면 프로그램을 실행할 수 없습니다.")
            return

    try:
        configure_gemini(api_key)
        print(">> Gemini API 설정 완료.")
    except Exception as e:
        print(f"API 설정 중 오류 발생: {e}")
        return

    # 2. PDF Load
    pdf_path = r"d:\00. WorkSpace\02. Creat\01. Antigravity\2026\04. 3 Goals Progress\01. Accounting\PDF(ocr)\02.계정과목별 정리_01.유동(당좌자산)-현금및현금성자산 회계처리.pdf"
    
    print(f"\n>> PDF 파일을 읽어오는 중... \n({pdf_path})")
    pdf_text = extract_text_from_pdf(pdf_path)
    
    if not pdf_text:
        print("PDF에서 텍스트를 추출하지 못했습니다. 프로그램을 종료합니다.")
        return
    print(f">> 텍스트 추출 완료 ({len(pdf_text)} 자)")

    # 3. Generate Quiz
    print("\n>> AI가 문제를 생성하고 있습니다... (잠시만 기다려주세요)")
    questions = generate_quiz_questions(pdf_text, num_questions=5)

    if not questions:
        print("문제 생성에 실패했습니다.")
        return

    # 4. Interactive Loop
    score = 0
    total = len(questions)

    for i, q in enumerate(questions):
        print(f"\n[문제 {i+1}/{total}] {q['question']}")
        for idx, option in enumerate(q['options']):
            print(f"  {idx+1}. {option}")
        
        while True:
            try:
                user_choice = int(input("\n정답 번호를 입력하세요 (1-4): ")) - 1
                if 0 <= user_choice <= 3:
                    break
                print("1에서 4 사이의 숫자를 입력해주세요.")
            except ValueError:
                print("숫자를 입력해주세요.")

        if user_choice == q['answer']:
            print("✅ 정답입니다!")
            score += 1
        else:
            print(f"❌ 틀렸습니다. 정답은 {q['answer']+1}번 입니다.")
        
        print(f"💡 해설: {q['explanation']}\n")
        print("-" * 50)

    print(f"\n=== 퀴즈 종료 ===")
    print(f"최종 점수: {score} / {total}")
    result_percent = (score/total) * 100
    if result_percent >= 80:
        print("훌륭합니다! 내용을 잘 이해하고 계시네요.")
    elif result_percent >= 50:
        print("좋습니다. 조금 더 복습해볼까요?")
    else:
        print("관련 내용을 다시 한번 읽어보시는 것을 추천합니다.")

    input("\n엔터 키를 누르면 종료합니다.")

if __name__ == "__main__":
    main()
