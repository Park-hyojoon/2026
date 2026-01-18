import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import json
import os
from pathlib import Path
from pdf_handler import extract_text_from_pdf
from quiz_engine import configure_gemini, generate_quiz_questions
from weakness_analyzer import WeaknessAnalyzer
from datetime import datetime

class AccountingQuizApp:
    def __init__(self, root):
        self.root = root
        self.root.title("AI 회계 학습 도우미")
        self.root.geometry("900x700")

        # 데이터 저장 경로
        self.config_file = "config.json"
        self.history_file = "learning_history.json"

        # 상태 변수
        self.api_key = None
        self.pdf_path = None
        self.pdf_text = None
        self.questions = []
        self.current_question_idx = 0
        self.score = 0
        self.user_answers = []

        # 설정 및 기록 로드
        self.load_config()
        self.load_history()

        # 초기 화면 표시
        self.show_setup_screen()

    def load_config(self):
        """설정 파일 로드"""
        if os.path.exists(self.config_file):
            try:
                with open(self.config_file, 'r', encoding='utf-8') as f:
                    config = json.load(f)
                    self.api_key = config.get('api_key', '')
                    # 저장된 PDF 경로 로드
                    saved_pdf = config.get('last_pdf_path', '')
                    if saved_pdf and os.path.exists(saved_pdf):
                        self.pdf_path = saved_pdf
            except:
                pass

    def save_config(self):
        """설정 파일 저장"""
        config = {
            'api_key': self.api_key,
            'last_pdf_path': self.pdf_path or ''
        }
        with open(self.config_file, 'w', encoding='utf-8') as f:
            json.dump(config, f, ensure_ascii=False, indent=2)

    def load_history(self):
        """학습 기록 로드"""
        if os.path.exists(self.history_file):
            try:
                with open(self.history_file, 'r', encoding='utf-8') as f:
                    self.history = json.load(f)
            except:
                self.history = []
        else:
            self.history = []

    def save_history(self, session_data):
        """학습 기록 저장"""
        self.history.append(session_data)
        with open(self.history_file, 'w', encoding='utf-8') as f:
            json.dump(self.history, f, ensure_ascii=False, indent=2)

    def clear_screen(self):
        """화면 클리어"""
        for widget in self.root.winfo_children():
            widget.destroy()

    def show_setup_screen(self):
        """초기 설정 화면"""
        self.clear_screen()

        # 타이틀
        title = tk.Label(self.root, text="AI 회계 학습 도우미",
                        font=("맑은 고딕", 24, "bold"), fg="#2c3e50")
        title.pack(pady=30)

        subtitle = tk.Label(self.root, text="Ollama 기반 로컬 AI 학습 프로그램",
                           font=("맑은 고딕", 12), fg="#7f8c8d")
        subtitle.pack(pady=10)

        # Ollama 상태 프레임
        ollama_frame = tk.Frame(self.root, bg="#e8f5e9")
        ollama_frame.pack(pady=20, padx=50, fill='x')

        self.ollama_status_label = tk.Label(ollama_frame,
                                           text="Ollama 상태 확인 중...",
                                           font=("맑은 고딕", 11),
                                           bg="#e8f5e9", fg="#2e7d32")
        self.ollama_status_label.pack(pady=15)

        # Ollama 상태 확인
        self.check_ollama_status()

        info_label = tk.Label(ollama_frame,
                             text="* Ollama가 설치되어 있어야 합니다. (ollama.com)",
                             font=("맑은 고딕", 9), bg="#e8f5e9", fg="#7f8c8d")
        info_label.pack(anchor='w', padx=10, pady=5)

        # PDF 선택 프레임
        pdf_frame = tk.Frame(self.root)
        pdf_frame.pack(pady=20, padx=50, fill='x')

        tk.Label(pdf_frame, text="학습할 PDF 파일:",
                font=("맑은 고딕", 11)).pack(anchor='w', pady=5)

        pdf_select_frame = tk.Frame(pdf_frame)
        pdf_select_frame.pack(fill='x', pady=5)

        # 저장된 PDF 경로가 있으면 표시
        if self.pdf_path:
            pdf_display_text = f"선택됨: {os.path.basename(self.pdf_path)}"
            pdf_display_color = "#27ae60"
        else:
            pdf_display_text = "PDF 파일을 선택해주세요"
            pdf_display_color = "#7f8c8d"

        self.pdf_label = tk.Label(pdf_select_frame,
                                 text=pdf_display_text,
                                 font=("맑은 고딕", 9),
                                 fg=pdf_display_color,
                                 anchor='w')
        self.pdf_label.pack(side='left', fill='x', expand=True)

        select_btn = tk.Button(pdf_select_frame, text="파일 선택",
                              command=self.select_pdf_file,
                              bg="#3498db", fg="white",
                              font=("맑은 고딕", 10),
                              relief='flat', padx=20, pady=5)
        select_btn.pack(side='right', padx=5)

        # 문제 수 설정
        num_frame = tk.Frame(self.root)
        num_frame.pack(pady=20, padx=50, fill='x')

        tk.Label(num_frame, text="생성할 문제 수:",
                font=("맑은 고딕", 11)).pack(anchor='w', pady=5)

        self.num_questions_var = tk.IntVar(value=5)
        num_spinbox = tk.Spinbox(num_frame, from_=3, to=10,
                                textvariable=self.num_questions_var,
                                font=("맑은 고딕", 10), width=10)
        num_spinbox.pack(anchor='w', pady=5)

        # 시작 버튼
        start_btn = tk.Button(self.root, text="학습 시작",
                            command=self.start_quiz,
                            bg="#27ae60", fg="white",
                            font=("맑은 고딕", 14, "bold"),
                            relief='flat', padx=40, pady=15)
        start_btn.pack(pady=30)

        # 버튼 프레임
        menu_frame = tk.Frame(self.root)
        menu_frame.pack(pady=10)

        # 통계 버튼
        stats_btn = tk.Button(menu_frame, text="학습 통계 보기",
                            command=self.show_statistics,
                            bg="#95a5a6", fg="white",
                            font=("맑은 고딕", 10),
                            relief='flat', padx=20, pady=10)
        stats_btn.pack(side='left', padx=5)

        # 취약점 분석 버튼
        weakness_btn = tk.Button(menu_frame, text="취약점 분석",
                               command=self.show_weakness_analysis,
                               bg="#e67e22", fg="white",
                               font=("맑은 고딕", 10),
                               relief='flat', padx=20, pady=10)
        weakness_btn.pack(side='left', padx=5)

    def select_pdf_file(self):
        """PDF 파일 선택"""
        initial_dir = os.path.join(os.getcwd(), "PDF(ocr)")
        if not os.path.exists(initial_dir):
            initial_dir = os.getcwd()

        file_path = filedialog.askopenfilename(
            title="학습할 PDF 파일을 선택하세요",
            initialdir=initial_dir,
            filetypes=[("PDF 파일", "*.pdf"), ("모든 파일", "*.*")]
        )

        if file_path:
            self.pdf_path = file_path
            file_name = os.path.basename(file_path)
            self.pdf_label.config(text=f"선택됨: {file_name}", fg="#27ae60")
            # PDF 경로 저장
            self.save_config()

    def check_ollama_status(self):
        """Ollama 연결 상태 확인"""
        import requests
        try:
            response = requests.get("http://localhost:11434/api/tags", timeout=3)
            if response.status_code == 200:
                models = response.json().get("models", [])
                if models:
                    model_names = [m.get("name", "") for m in models]
                    self.ollama_status_label.config(
                        text=f"✓ Ollama 연결됨 (모델: {', '.join(model_names[:2])})",
                        fg="#27ae60"
                    )
                else:
                    self.ollama_status_label.config(
                        text="⚠ Ollama 연결됨 - 모델 없음 (ollama pull llama3.2 실행 필요)",
                        fg="#e67e22"
                    )
                return True
        except:
            pass
        self.ollama_status_label.config(
            text="✗ Ollama 연결 안됨 - 터미널에서 'ollama serve' 실행 필요",
            fg="#e74c3c"
        )
        return False

    def start_quiz(self):
        """퀴즈 시작"""
        # Ollama 연결 확인
        if not self.check_ollama_status():
            messagebox.showerror("오류", "Ollama가 실행 중이 아닙니다.\n터미널에서 'ollama serve' 명령을 실행해주세요.")
            return

        # PDF 파일 확인
        if not self.pdf_path:
            messagebox.showerror("오류", "학습할 PDF 파일을 선택해주세요.")
            return

        # 로딩 화면 표시
        self.show_loading_screen()

        # PDF 텍스트 추출 및 문제 생성
        self.root.after(100, self.generate_questions)

    def show_loading_screen(self):
        """로딩 화면"""
        self.clear_screen()

        loading_label = tk.Label(self.root,
                                text="AI가 문제를 생성하고 있습니다...\n잠시만 기다려주세요.",
                                font=("맑은 고딕", 16),
                                fg="#3498db")
        loading_label.pack(expand=True)

        progress = ttk.Progressbar(self.root, mode='indeterminate', length=300)
        progress.pack(pady=20)
        progress.start(10)

    def generate_questions(self):
        """문제 생성"""
        try:
            # Ollama 연결 확인
            configure_gemini()

            # PDF 텍스트 추출
            self.pdf_text = extract_text_from_pdf(self.pdf_path)

            if not self.pdf_text:
                messagebox.showerror("오류", "PDF에서 텍스트를 추출하지 못했습니다.")
                self.show_setup_screen()
                return

            # 문제 생성
            num_questions = self.num_questions_var.get()
            self.questions = generate_quiz_questions(self.pdf_text, num_questions)

            if not self.questions:
                messagebox.showerror("오류", "문제 생성에 실패했습니다.\nOllama가 실행 중인지 확인해주세요.")
                self.show_setup_screen()
                return

            # 초기화
            self.current_question_idx = 0
            self.score = 0
            self.user_answers = []

            # 문제 풀이 화면으로 이동
            self.show_question()

        except Exception as e:
            messagebox.showerror("오류", f"문제 생성 중 오류가 발생했습니다:\n{str(e)}")
            self.show_setup_screen()

    def show_question(self):
        """문제 표시"""
        self.clear_screen()

        if self.current_question_idx >= len(self.questions):
            self.show_result()
            return

        q = self.questions[self.current_question_idx]
        total = len(self.questions)

        # 상단 진행 바
        progress_frame = tk.Frame(self.root, bg="#ecf0f1")
        progress_frame.pack(fill='x', pady=10)

        progress_text = tk.Label(progress_frame,
                                text=f"문제 {self.current_question_idx + 1} / {total}",
                                font=("맑은 고딕", 12, "bold"),
                                bg="#ecf0f1", fg="#2c3e50")
        progress_text.pack(pady=10)

        # 문제
        question_frame = tk.Frame(self.root)
        question_frame.pack(pady=20, padx=50, fill='both', expand=True)

        question_label = tk.Label(question_frame,
                                 text=q['question'],
                                 font=("맑은 고딕", 14, "bold"),
                                 wraplength=800,
                                 justify='left')
        question_label.pack(anchor='w', pady=20)

        # 선택지
        self.answer_var = tk.IntVar(value=-1)

        for idx, option in enumerate(q['options']):
            rb = tk.Radiobutton(question_frame,
                               text=f"{idx + 1}. {option}",
                               variable=self.answer_var,
                               value=idx,
                               font=("맑은 고딕", 12),
                               wraplength=750,
                               justify='left',
                               padx=20, pady=10)
            rb.pack(anchor='w', pady=5)

        # 버튼 프레임
        btn_frame = tk.Frame(self.root)
        btn_frame.pack(pady=20)

        submit_btn = tk.Button(btn_frame, text="답안 제출",
                              command=self.submit_answer,
                              bg="#3498db", fg="white",
                              font=("맑은 고딕", 12, "bold"),
                              relief='flat', padx=30, pady=10)
        submit_btn.pack()

    def submit_answer(self):
        """답안 제출"""
        user_answer = self.answer_var.get()

        if user_answer == -1:
            messagebox.showwarning("경고", "답을 선택해주세요.")
            return

        q = self.questions[self.current_question_idx]
        correct_answer = q['answer']
        is_correct = (user_answer == correct_answer)

        if is_correct:
            self.score += 1

        # 답안 기록
        self.user_answers.append({
            'question_id': self.current_question_idx,
            'question': q['question'],
            'user_answer': user_answer,
            'correct_answer': correct_answer,
            'is_correct': is_correct,
            'explanation': q['explanation']
        })

        # 해설 표시
        self.show_explanation(is_correct, q)

    def show_explanation(self, is_correct, question):
        """해설 표시"""
        self.clear_screen()

        # 결과 표시
        result_frame = tk.Frame(self.root)
        result_frame.pack(pady=30)

        if is_correct:
            result_label = tk.Label(result_frame,
                                   text="정답입니다!",
                                   font=("맑은 고딕", 20, "bold"),
                                   fg="#27ae60")
        else:
            result_label = tk.Label(result_frame,
                                   text="틀렸습니다",
                                   font=("맑은 고딕", 20, "bold"),
                                   fg="#e74c3c")
        result_label.pack()

        # 정답 표시
        answer_label = tk.Label(result_frame,
                               text=f"정답: {question['answer'] + 1}번",
                               font=("맑은 고딕", 14),
                               fg="#34495e")
        answer_label.pack(pady=10)

        # 해설
        explanation_frame = tk.Frame(self.root, bg="#ecf0f1")
        explanation_frame.pack(pady=20, padx=100, fill='both', expand=True)

        exp_title = tk.Label(explanation_frame,
                            text="해설",
                            font=("맑은 고딕", 12, "bold"),
                            bg="#ecf0f1", fg="#2c3e50")
        exp_title.pack(anchor='w', padx=20, pady=10)

        exp_text = tk.Label(explanation_frame,
                           text=question['explanation'],
                           font=("맑은 고딕", 11),
                           bg="#ecf0f1", fg="#34495e",
                           wraplength=800,
                           justify='left')
        exp_text.pack(anchor='w', padx=20, pady=10)

        # 다음 버튼
        next_btn = tk.Button(self.root, text="다음 문제",
                           command=self.next_question,
                           bg="#3498db", fg="white",
                           font=("맑은 고딕", 12, "bold"),
                           relief='flat', padx=30, pady=10)
        next_btn.pack(pady=20)

    def next_question(self):
        """다음 문제로 이동"""
        self.current_question_idx += 1
        self.show_question()

    def show_result(self):
        """최종 결과 표시"""
        self.clear_screen()

        total = len(self.questions)
        percentage = (self.score / total) * 100

        # 결과 표시
        result_frame = tk.Frame(self.root)
        result_frame.pack(pady=40)

        title = tk.Label(result_frame,
                        text="학습 완료!",
                        font=("맑은 고딕", 24, "bold"),
                        fg="#2c3e50")
        title.pack(pady=20)

        score_label = tk.Label(result_frame,
                              text=f"{self.score} / {total}",
                              font=("맑은 고딕", 40, "bold"),
                              fg="#3498db")
        score_label.pack(pady=10)

        percent_label = tk.Label(result_frame,
                                text=f"{percentage:.1f}%",
                                font=("맑은 고딕", 20),
                                fg="#7f8c8d")
        percent_label.pack(pady=5)

        # 평가 메시지
        if percentage >= 80:
            message = "훌륭합니다! 내용을 잘 이해하고 계시네요."
            color = "#27ae60"
        elif percentage >= 50:
            message = "좋습니다. 조금 더 복습해볼까요?"
            color = "#f39c12"
        else:
            message = "관련 내용을 다시 한번 읽어보시는 것을 추천합니다."
            color = "#e74c3c"

        msg_label = tk.Label(result_frame,
                            text=message,
                            font=("맑은 고딕", 14),
                            fg=color)
        msg_label.pack(pady=20)

        # 학습 기록 저장
        session_data = {
            'date': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            'pdf_file': os.path.basename(self.pdf_path),
            'total_questions': total,
            'correct_answers': self.score,
            'percentage': percentage,
            'answers': self.user_answers
        }
        self.save_history(session_data)

        # 버튼 프레임
        btn_frame = tk.Frame(self.root)
        btn_frame.pack(pady=30)

        retry_btn = tk.Button(btn_frame, text="다시 학습하기",
                            command=self.show_setup_screen,
                            bg="#3498db", fg="white",
                            font=("맑은 고딕", 12),
                            relief='flat', padx=20, pady=10)
        retry_btn.pack(side='left', padx=10)

        stats_btn = tk.Button(btn_frame, text="통계 보기",
                            command=self.show_statistics,
                            bg="#95a5a6", fg="white",
                            font=("맑은 고딕", 12),
                            relief='flat', padx=20, pady=10)
        stats_btn.pack(side='left', padx=10)

    def show_statistics(self):
        """통계 화면"""
        self.clear_screen()

        title = tk.Label(self.root,
                        text="학습 통계",
                        font=("맑은 고딕", 20, "bold"),
                        fg="#2c3e50")
        title.pack(pady=20)

        if not self.history:
            no_data = tk.Label(self.root,
                             text="아직 학습 기록이 없습니다.",
                             font=("맑은 고딕", 14),
                             fg="#7f8c8d")
            no_data.pack(pady=40)
        else:
            # 통계 정보
            total_sessions = len(self.history)
            total_questions = sum(s['total_questions'] for s in self.history)
            total_correct = sum(s['correct_answers'] for s in self.history)
            avg_percentage = sum(s['percentage'] for s in self.history) / total_sessions

            stats_frame = tk.Frame(self.root)
            stats_frame.pack(pady=20, padx=50, fill='x')

            stats_data = [
                ("총 학습 세션", f"{total_sessions}회"),
                ("총 풀이 문제", f"{total_questions}문제"),
                ("총 정답 수", f"{total_correct}문제"),
                ("평균 정답률", f"{avg_percentage:.1f}%")
            ]

            for label, value in stats_data:
                row = tk.Frame(stats_frame)
                row.pack(fill='x', pady=5)

                tk.Label(row, text=label,
                        font=("맑은 고딕", 12),
                        fg="#34495e").pack(side='left')

                tk.Label(row, text=value,
                        font=("맑은 고딕", 12, "bold"),
                        fg="#3498db").pack(side='right')

            # 최근 학습 기록
            history_frame = tk.Frame(self.root)
            history_frame.pack(pady=20, padx=50, fill='both', expand=True)

            tk.Label(history_frame,
                    text="최근 학습 기록",
                    font=("맑은 고딕", 14, "bold"),
                    fg="#2c3e50").pack(anchor='w', pady=10)

            # 스크롤바가 있는 프레임
            canvas = tk.Canvas(history_frame, bg="white")
            scrollbar = ttk.Scrollbar(history_frame, orient="vertical", command=canvas.yview)
            scrollable_frame = tk.Frame(canvas, bg="white")

            scrollable_frame.bind(
                "<Configure>",
                lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
            )

            canvas.create_window((0, 0), window=scrollable_frame, anchor="nw")
            canvas.configure(yscrollcommand=scrollbar.set)

            # 최근 10개 기록 표시
            for session in reversed(self.history[-10:]):
                record = tk.Frame(scrollable_frame, bg="#ecf0f1", relief='solid', borderwidth=1)
                record.pack(fill='x', pady=5, padx=5)

                date_label = tk.Label(record,
                                     text=session['date'],
                                     font=("맑은 고딕", 10),
                                     bg="#ecf0f1", fg="#7f8c8d")
                date_label.pack(anchor='w', padx=10, pady=5)

                file_label = tk.Label(record,
                                     text=session['pdf_file'],
                                     font=("맑은 고딕", 10, "bold"),
                                     bg="#ecf0f1", fg="#2c3e50")
                file_label.pack(anchor='w', padx=10)

                score_label = tk.Label(record,
                                      text=f"{session['correct_answers']}/{session['total_questions']} ({session['percentage']:.1f}%)",
                                      font=("맑은 고딕", 10),
                                      bg="#ecf0f1", fg="#3498db")
                score_label.pack(anchor='w', padx=10, pady=5)

            canvas.pack(side="left", fill="both", expand=True)
            scrollbar.pack(side="right", fill="y")

        # 돌아가기 버튼
        back_btn = tk.Button(self.root, text="돌아가기",
                           command=self.show_setup_screen,
                           bg="#95a5a6", fg="white",
                           font=("맑은 고딕", 12),
                           relief='flat', padx=30, pady=10)
        back_btn.pack(pady=20)

    def show_weakness_analysis(self):
        """취약점 분석 화면"""
        self.clear_screen()

        title = tk.Label(self.root,
                        text="취약점 분석",
                        font=("맑은 고딕", 20, "bold"),
                        fg="#2c3e50")
        title.pack(pady=20)

        if not self.history:
            no_data = tk.Label(self.root,
                             text="아직 학습 기록이 없습니다.\n문제를 풀고 나면 취약점 분석이 가능합니다.",
                             font=("맑은 고딕", 14),
                             fg="#7f8c8d",
                             justify='center')
            no_data.pack(pady=40)
        else:
            # 분석기 초기화
            analyzer = WeaknessAnalyzer(self.history)
            stats = analyzer.get_overall_stats()
            weak_areas = analyzer.get_weak_areas()
            recommendations = analyzer.get_recommendations()

            # 전체 통계
            stats_frame = tk.Frame(self.root, bg="#ecf0f1")
            stats_frame.pack(pady=10, padx=50, fill='x')

            tk.Label(stats_frame,
                    text="전체 통계",
                    font=("맑은 고딕", 14, "bold"),
                    bg="#ecf0f1", fg="#2c3e50").pack(anchor='w', padx=20, pady=10)

            stats_info = tk.Frame(stats_frame, bg="#ecf0f1")
            stats_info.pack(fill='x', padx=20, pady=10)

            stats_text = f"""
총 학습 횟수: {stats['total_sessions']}회
총 문제 수: {stats['total_questions']}문제
정답: {stats['total_correct']}문제 | 오답: {stats['total_incorrect']}문제
평균 정답률: {stats['avg_percentage']:.1f}%
            """.strip()

            tk.Label(stats_info,
                    text=stats_text,
                    font=("맑은 고딕", 11),
                    bg="#ecf0f1", fg="#34495e",
                    justify='left').pack(anchor='w')

            # 취약 영역
            weak_frame = tk.Frame(self.root, bg="#ffe6e6")
            weak_frame.pack(pady=10, padx=50, fill='x')

            tk.Label(weak_frame,
                    text="취약한 영역",
                    font=("맑은 고딕", 14, "bold"),
                    bg="#ffe6e6", fg="#e74c3c").pack(anchor='w', padx=20, pady=10)

            if weak_areas['total_incorrect'] > 0:
                tk.Label(weak_frame,
                        text=f"총 {weak_areas['total_incorrect']}개의 오답이 있습니다.",
                        font=("맑은 고딕", 11),
                        bg="#ffe6e6", fg="#c0392b").pack(anchor='w', padx=20, pady=5)

                if weak_areas['weak_keywords']:
                    tk.Label(weak_frame,
                            text="자주 틀리는 주제:",
                            font=("맑은 고딕", 11, "bold"),
                            bg="#ffe6e6", fg="#2c3e50").pack(anchor='w', padx=20, pady=5)

                    for keyword, count in weak_areas['weak_keywords']:
                        tk.Label(weak_frame,
                                text=f"  • {keyword} ({count}회)",
                                font=("맑은 고딕", 10),
                                bg="#ffe6e6", fg="#34495e").pack(anchor='w', padx=40, pady=2)
            else:
                tk.Label(weak_frame,
                        text="모든 문제를 정확하게 풀었습니다!",
                        font=("맑은 고딕", 11),
                        bg="#ffe6e6", fg="#27ae60").pack(anchor='w', padx=20, pady=10)

            weak_frame.pack_configure(pady=(10, 5))

            # 학습 추천
            recommend_frame = tk.Frame(self.root, bg="#e6f7ff")
            recommend_frame.pack(pady=10, padx=50, fill='x')

            tk.Label(recommend_frame,
                    text="학습 추천",
                    font=("맑은 고딕", 14, "bold"),
                    bg="#e6f7ff", fg="#2980b9").pack(anchor='w', padx=20, pady=10)

            for rec in recommendations:
                tk.Label(recommend_frame,
                        text=f"• {rec}",
                        font=("맑은 고딕", 11),
                        bg="#e6f7ff", fg="#34495e",
                        wraplength=800,
                        justify='left').pack(anchor='w', padx=30, pady=5)

            recommend_frame.pack_configure(pady=(5, 10))

            # 최근 오답 노트
            if weak_areas['recent_incorrect']:
                recent_frame = tk.Frame(self.root)
                recent_frame.pack(pady=10, padx=50, fill='both', expand=True)

                tk.Label(recent_frame,
                        text="최근 오답 노트",
                        font=("맑은 고딕", 14, "bold"),
                        fg="#2c3e50").pack(anchor='w', pady=10)

                # 스크롤 가능한 영역
                canvas = tk.Canvas(recent_frame, bg="white", height=200)
                scrollbar = ttk.Scrollbar(recent_frame, orient="vertical", command=canvas.yview)
                scrollable_frame = tk.Frame(canvas, bg="white")

                scrollable_frame.bind(
                    "<Configure>",
                    lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
                )

                canvas.create_window((0, 0), window=scrollable_frame, anchor="nw")
                canvas.configure(yscrollcommand=scrollbar.set)

                for idx, item in enumerate(weak_areas['recent_incorrect'][:5], 1):
                    item_frame = tk.Frame(scrollable_frame, bg="#fff9e6", relief='solid', borderwidth=1)
                    item_frame.pack(fill='x', pady=5, padx=5)

                    tk.Label(item_frame,
                            text=f"{idx}. {item['question']}",
                            font=("맑은 고딕", 10, "bold"),
                            bg="#fff9e6", fg="#2c3e50",
                            wraplength=700,
                            justify='left').pack(anchor='w', padx=10, pady=5)

                    tk.Label(item_frame,
                            text=f"해설: {item['explanation']}",
                            font=("맑은 고딕", 9),
                            bg="#fff9e6", fg="#7f8c8d",
                            wraplength=700,
                            justify='left').pack(anchor='w', padx=10, pady=5)

                canvas.pack(side="left", fill="both", expand=True)
                scrollbar.pack(side="right", fill="y")

        # 돌아가기 버튼
        back_btn = tk.Button(self.root, text="돌아가기",
                           command=self.show_setup_screen,
                           bg="#95a5a6", fg="white",
                           font=("맑은 고딕", 12),
                           relief='flat', padx=30, pady=10)
        back_btn.pack(pady=20)

def main():
    root = tk.Tk()
    app = AccountingQuizApp(root)
    root.mainloop()

if __name__ == "__main__":
    main()
