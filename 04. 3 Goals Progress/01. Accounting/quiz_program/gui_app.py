import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import os
from datetime import datetime
from config_manager import ConfigManager
from ui_components import center_window, ContributionGraph
from pdf_handler import extract_text_from_pdf
from quiz_engine import configure_gemini, generate_quiz_questions, generate_review_questions
from weakness_analyzer import WeaknessAnalyzer
from statistics_dashboard import StatisticsDashboard
from weakness_dashboard import WeaknessDashboard

class AccountingQuizApp:
    def __init__(self, root):
        self.root = root
        self.root.title("AI 회계 학습 도우미")
        self.root.geometry("900x850")
        
        # 화면 중앙 배치
        center_window(self.root, 900, 850)

        # Config Manager 초기화
        base_path = os.path.dirname(os.path.abspath(__file__))
        self.config_manager = ConfigManager(base_path)
        self.config_manager.load_config()
        self.config_manager.load_history()
        
        # 메서드 및 데이터 별칭 설정 (호환성 유지)
        self.save_config = self.config_manager.save_config
        self.export_data = self.config_manager.export_data
        self.save_history = self.config_manager.save_history
        self.pdf_paths = self.config_manager.pdf_paths
        self.history = self.config_manager.history
        self.api_key = self.config_manager.api_key

        # 상태 변수
        self.pdf_text = None
        self.questions = []
        self.current_question_idx = 0
        self.score = 0
        self.user_answers = []

        # 초기 화면 표시
        self.show_setup_screen()



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


        # Subtitle removed as requested

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

        # Old PDF frame removed

        # === 메인 컨테이너 (그리드 스타일 레이아웃) ===
        main_container = tk.Frame(self.root, bg="#f5f5f5")
        main_container.pack(fill='both', expand=True, padx=40, pady=20)
        
        # 1. 왼쪽 패널 (설정 영역)
        left_panel = tk.Frame(main_container, bg="white", bd=1, relief="solid")
        left_panel.pack(side='left', fill='both', expand=True, padx=(0, 10))
        
        # 1.1 파일 선택 섹션
        file_header = tk.Frame(left_panel, bg="white")
        file_header.pack(fill='x', padx=20, pady=(20, 10))

        tk.Label(file_header, text="학습 자료 선택",
                 font=("맑은 고딕", 12, "bold"), bg="white", fg="#2c3e50").pack(side='left')

        tk.Label(file_header, text=f"(최대 5개)",
                 font=("맑은 고딕", 9), bg="white", fg="#7f8c8d").pack(side='left', padx=5)

        file_frame = tk.Frame(left_panel, bg="white")
        file_frame.pack(fill='x', padx=20)

        # PDF 파일 리스트 표시 영역
        self.pdf_list_frame = tk.Frame(file_frame, bg="#f8f9fa")
        self.pdf_list_frame.pack(fill='x', pady=(0, 10))

        self.update_pdf_list_display()

        # 버튼 영역
        btn_area = tk.Frame(file_frame, bg="white")
        btn_area.pack(anchor='w')

        add_btn = tk.Button(btn_area, text="+ PDF 추가",
                           command=self.add_pdf_file,
                           bg="#27ae60", fg="white", font=("맑은 고딕", 9),
                           relief='flat', padx=10, pady=5)
        add_btn.pack(side='left', padx=(0, 5))

        clear_btn = tk.Button(btn_area, text="전체 삭제",
                             command=self.clear_all_pdfs,
                             bg="#e74c3c", fg="white", font=("맑은 고딕", 9),
                             relief='flat', padx=10, pady=5)
        clear_btn.pack(side='left')
        
        tk.Frame(left_panel, height=2, bg="#f5f5f5").pack(fill='x', padx=20, pady=20) # 구분선
        
        # 1.2 문제 수 설정 섹션
        tk.Label(left_panel, text="학습 설정", 
                 font=("맑은 고딕", 12, "bold"), bg="white", fg="#2c3e50").pack(anchor='w', padx=20, pady=(10, 10))
        
        setting_frame = tk.Frame(left_panel, bg="white")
        setting_frame.pack(fill='x', padx=20, pady=(0, 20)) # Added bottom padding
        
        tk.Label(setting_frame, text="한 번에 풀 문제 수:", font=("맑은 고딕", 10), bg="white").pack(side='left')
        
        self.num_questions_var = tk.IntVar(value=5)
        tk.Spinbox(setting_frame, from_=3, to=10, 
                   textvariable=self.num_questions_var, 
                   font=("맑은 고딕", 10), width=5).pack(side='left', padx=10)

        # 데이터 백업 버튼
        backup_btn = tk.Button(setting_frame, text="💾 데이터 내보내기",
                             command=self.export_data,
                             bg="#95a5a6", fg="white", font=("맑은 고딕", 9),
                             relief='flat', padx=10, pady=2)
        backup_btn.pack(side='right')

        # 2. 오른쪽 패널 (액션 영역)
        right_panel = tk.Frame(main_container, bg="white", bd=1, relief="solid")
        right_panel.pack(side='right', fill='both', expand=True, padx=(10, 0))
        
        # 2.1 학습 시작 버튼 (크게)
        start_frame = tk.Frame(right_panel, bg="white")
        start_frame.pack(expand=True)
        
        tk.Label(start_frame, text="준비 되셨나요?", font=("맑은 고딕", 14), bg="white", fg="#7f8c8d").pack(pady=(0, 10))
        
        start_btn = tk.Button(start_frame, text="학습 시작하기",
                            command=self.start_quiz,
                            bg="#27ae60", fg="white",
                            font=("맑은 고딕", 16, "bold"),
                            relief='flat', padx=30, pady=15, cursor="hand2")
        start_btn.pack()
        
        # 2.2 메뉴 버튼들
        menu_frame = tk.Frame(right_panel, bg="white")
        menu_frame.pack(pady=20, fill='x')
        
        # 버튼들을 중앙 정렬하기 위한 컨테이너
        btn_center = tk.Frame(menu_frame, bg="white")
        btn_center.pack()
        
        stats_btn = tk.Button(btn_center, text="📊 학습 통계",
                            command=self.show_statistics,
                            bg="#9b59b6", fg="white", font=("맑은 고딕", 10),
                            relief='flat', padx=15, pady=8)
        stats_btn.pack(side='left', padx=5)
        
        weakness_btn = tk.Button(btn_center, text="🛡️ 취약점 분석",
                               command=self.show_weakness_analysis,
                               bg="#e67e22", fg="white", font=("맑은 고딕", 10),
                               relief='flat', padx=15, pady=8)
        weakness_btn.pack(side='left', padx=5)

        # 기여 그래프 (잔디) 추가 (맨 아래 배치)
        ContributionGraph(self.root, self.history).draw()

    def confirm_home(self):
        """홈으로 이동 확인"""
        if messagebox.askyesno("확인", "풀고 있는 문제가 저장되지 않습니다.\n첫 화면으로 돌아가시겠습니까?"):
            self.show_setup_screen()



    def update_pdf_list_display(self):
        """PDF 리스트 UI 업데이트"""
        # 기존 위젯 삭제
        for widget in self.pdf_list_frame.winfo_children():
            widget.destroy()

        if not self.pdf_paths:
            tk.Label(self.pdf_list_frame, text="선택된 파일 없음",
                    font=("맑은 고딕", 10), bg="#f8f9fa", fg="#e74c3c",
                    pady=10).pack(anchor='w', padx=10)
        else:
            for idx, path in enumerate(self.pdf_paths):
                item_frame = tk.Frame(self.pdf_list_frame, bg="#f8f9fa")
                item_frame.pack(fill='x', pady=2)

                # 파일명 표시
                tk.Label(item_frame, text=f"{idx+1}. {os.path.basename(path)}",
                        font=("맑은 고딕", 9), bg="#f8f9fa", fg="#27ae60").pack(side='left', padx=10)

                # 삭제 버튼
                del_btn = tk.Button(item_frame, text="×",
                                   command=lambda i=idx: self.remove_pdf_file(i),
                                   bg="#f8f9fa", fg="#e74c3c", font=("맑은 고딕", 9, "bold"),
                                   relief='flat', padx=5, cursor="hand2")
                del_btn.pack(side='right', padx=5)

    def add_pdf_file(self):
        """PDF 파일 추가"""
        if len(self.pdf_paths) >= 5:
            messagebox.showwarning("경고", "최대 5개의 PDF 파일만 추가할 수 있습니다.")
            return

        initial_dir = os.path.join(os.getcwd(), "PDF(ocr)")
        if not os.path.exists(initial_dir):
            initial_dir = os.getcwd()

        file_path = filedialog.askopenfilename(
            title="학습할 PDF 파일을 선택하세요",
            initialdir=initial_dir,
            filetypes=[("PDF 파일", "*.pdf"), ("모든 파일", "*.*")]
        )

        if file_path:
            if file_path in self.pdf_paths:
                messagebox.showwarning("경고", "이미 추가된 파일입니다.")
                return
            self.pdf_paths.append(file_path)
            self.update_pdf_list_display()
            self.save_config()

    def remove_pdf_file(self, index):
        """특정 PDF 파일 삭제"""
        if 0 <= index < len(self.pdf_paths):
            del self.pdf_paths[index]
            self.update_pdf_list_display()
            self.save_config()

    def clear_all_pdfs(self):
        """모든 PDF 파일 삭제"""
        if self.pdf_paths:
            if messagebox.askyesno("확인", "모든 PDF 파일을 삭제하시겠습니까?"):
                self.pdf_paths = []
                self.update_pdf_list_display()
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
        if not self.pdf_paths:
            messagebox.showerror("오류", "학습할 PDF 파일을 추가해주세요.")
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

            # 여러 PDF에서 텍스트 추출 및 결합
            all_texts = []
            char_limit_per_pdf = 5000 // len(self.pdf_paths)  # 총 5000자를 PDF 개수로 분배

            for pdf_path in self.pdf_paths:
                text = extract_text_from_pdf(pdf_path)
                if text:
                    # 각 PDF에서 균등하게 텍스트 추출
                    all_texts.append(text[:char_limit_per_pdf])

            self.pdf_text = "\n\n---\n\n".join(all_texts)

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

        # 홈 버튼 (오른쪽 상단)
        home_btn = tk.Button(progress_frame, text="처음으로",
                           command=self.confirm_home,
                           bg="#95a5a6", fg="white",
                           font=("맑은 고딕", 9),
                           relief='flat', padx=10, pady=2)
        home_btn.place(relx=0.95, rely=0.5, anchor='e')

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
                           wraplength=650,
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
            'pdf_file': ', '.join([os.path.basename(p) for p in self.pdf_paths]),
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

        stats_btn = tk.Button(btn_frame, text="학습 통계",
                            command=self.show_statistics,
                            bg="#9b59b6", fg="white",
                            font=("맑은 고딕", 12),
                            relief='flat', padx=20, pady=10)
        stats_btn.pack(side='left', padx=10)

        # 오답이 있는 경우 스마트 복습 버튼 표시
        incorrect_questions = [a for a in self.user_answers if not a['is_correct']]
        if incorrect_questions:
            review_btn = tk.Button(btn_frame, text="틀린 문제 복습하기 (유사 유형)",
                                 command=lambda: self.start_review_session(incorrect_questions),
                                 bg="#e67e22", fg="white",
                                 font=("맑은 고딕", 12),
                                 relief='flat', padx=20, pady=10)
            review_btn.pack(side='left', padx=10)

        # 기여 그래프 (잔디) 추가 (맨 아래 배치)
        ContributionGraph(self.root, self.history).draw()



    def start_review_session(self, incorrect_questions):
        """틀린 문제 복습 세션 시작"""
        # 로딩 화면 표시
        self.show_loading_screen()
        # 복습 문제 생성 (비동기)
        self.root.after(100, lambda: self._generate_and_start_review(incorrect_questions))

    def _generate_and_start_review(self, incorrect_questions):
        try:
            # 복습 문제 생성
            review_questions = generate_review_questions(incorrect_questions)
            
            if not review_questions:
                messagebox.showerror("오류", "복습 문제 생성에 실패했습니다.")
                self.show_result()
                return
                
            # 퀴즈 상태 초기화 및 문제 설정
            self.questions = review_questions
            self.current_question_idx = 0
            self.score = 0
            self.user_answers = []
            
            # 문제 풀이 시작
            self.show_question()
            
        except Exception as e:
            messagebox.showerror("오류", f"오류가 발생했습니다: {str(e)}")
            self.show_result()

    def show_statistics(self):
        """통계 화면"""
        # 기존 통계 화면 대신 새로운 대시보드 띄우기 (모달 창 아님, 독립 창)
        try:
            dashboard = StatisticsDashboard(self.root, self.history)
        except Exception as e:
            messagebox.showerror("오류", f"통계 대시보드를 여는 중 오류가 발생했습니다:\n{str(e)}")
            # 오류 시 기존 방식으로 폴백 (혹은 이 부분 삭제 가능)
            pass

    def show_weakness_analysis(self):
        """취약점 분석 화면 - 팝업 대시보드로 표시"""
        if not self.history:
            messagebox.showinfo("알림", "아직 학습 기록이 없습니다.\n문제를 풀고 나면 취약점 분석이 가능합니다.")
            return

        # 팝업 대시보드 열기
        WeaknessDashboard(self.root, self.history)

def main():
    root = tk.Tk()
    app = AccountingQuizApp(root)
    root.mainloop()

if __name__ == "__main__":
    main()
