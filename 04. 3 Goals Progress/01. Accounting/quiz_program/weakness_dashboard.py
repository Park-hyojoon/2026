import tkinter as tk
from tkinter import ttk
from weakness_analyzer import WeaknessAnalyzer

class WeaknessDashboard(tk.Toplevel):
    def __init__(self, parent, history):
        super().__init__(parent)
        self.history = history
        self.title("취약점 분석")
        self.geometry("900x800")
        self.configure(bg="#f5f5f5")
        
        # 모달 설정 (선택 사항 - 여기선 일반 팝업으로 유지)
        # self.transient(parent)
        # self.grab_set()
        
        # 화면 중앙 배치
        self.center_window()
        
        self.create_widgets()

    def center_window(self):
        self.update_idletasks()
        width = self.winfo_width()
        height = self.winfo_height()
        x = (self.winfo_screenwidth() // 2) - (width // 2)
        y = (self.winfo_screenheight() // 2) - (height // 2)
        self.geometry(f'{width}x{height}+{x}+{y}')

    def create_widgets(self):
        # 헤더
        header_frame = tk.Frame(self, bg="white", pady=20)
        header_frame.pack(fill='x')
        
        tk.Label(header_frame, text="🛡️ 개인 맞춤형 취약점 분석", 
                 font=("맑은 고딕", 18, "bold"), bg="white", fg="#2c3e50").pack()
        
        # 메인 컨텐츠 영역 (스크롤 가능하게 할 수도 있지만, 일단 프레임으로 구성)
        content_frame = tk.Frame(self, bg="#f5f5f5")
        content_frame.pack(fill='both', expand=True, padx=30, pady=20)

        # 분석기 초기화
        analyzer = WeaknessAnalyzer(self.history)
        weak_areas = analyzer.analyze_weak_areas()

        # 1. 취약 영역 (상단)
        top_frame = tk.Frame(content_frame, bg="#f5f5f5")
        top_frame.pack(fill='x', pady=(0, 20))

        # 1.1 취약한 주제 (왼쪽)
        weak_topic_frame = tk.Frame(top_frame, bg="white", bd=1, relief="solid")
        weak_topic_frame.pack(side='left', fill='both', expand=True, padx=(0, 10))
        
        tk.Label(weak_topic_frame, text="⚠️ 집중 케어 필요 영역", 
                 font=("맑은 고딕", 12, "bold"), bg="white", fg="#e74c3c").pack(anchor='w', padx=20, pady=15)
        
        if not weak_areas['weak_topics']:
            tk.Label(weak_topic_frame, text="데이터가 부족하거나 취약 영역이 없습니다.", 
                     font=("맑은 고딕", 10), bg="white", fg="#7f8c8d").pack(pady=20)
        else:
            for topic, accuracy in weak_areas['weak_topics']:
                item_frame = tk.Frame(weak_topic_frame, bg="white")
                item_frame.pack(fill='x', padx=20, pady=2)
                
                tk.Label(item_frame, text=topic, font=("맑은 고딕", 10, "bold"), 
                         bg="white", fg="#e74c3c", width=25, anchor='w').pack(side='left')
                
                # 게이지 바
                canvas = tk.Canvas(item_frame, width=150, height=10, bg="#ecf0f1", highlightthickness=0)
                canvas.pack(side='left', padx=10)
                canvas.create_rectangle(0, 0, 150 * (accuracy/100), 10, fill="#e74c3c", width=0)
                
                tk.Label(item_frame, text=f"{accuracy:.1f}%", font=("맑은 고딕", 9), 
                         bg="white", fg="#e74c3c").pack(side='right')
        
        tk.Frame(weak_topic_frame, bg="white", height=10).pack() # 하단 여백

        # 1.2 학습 추천 (오른쪽)
        recommend_frame = tk.Frame(top_frame, bg="white", bd=1, relief="solid")
        recommend_frame.pack(side='right', fill='both', expand=True, padx=(10, 0))
        
        tk.Label(recommend_frame, text="💡 AI 학습 추천", 
                 font=("맑은 고딕", 12, "bold"), bg="white", fg="#3498db").pack(anchor='w', padx=20, pady=15)
        
        if not weak_areas['recommendations']:
            tk.Label(recommend_frame, text="추천 항목이 없습니다.", 
                     font=("맑은 고딕", 10), bg="white", fg="#7f8c8d").pack(pady=20)
        else:
            for rec in weak_areas['recommendations']:
                tk.Label(recommend_frame, text=f"• {rec}", font=("맑은 고딕", 10), 
                         bg="white", fg="#34495e", wraplength=350, justify='left').pack(anchor='w', padx=20, pady=5)
        
        tk.Frame(recommend_frame, bg="white", height=10).pack() # 하단 여백

        # 2. 최근 오답 노트 (하단)
        if weak_areas['recent_incorrect']:
            recent_frame = tk.Frame(content_frame, bg="white", bd=1, relief="solid")
            recent_frame.pack(fill='both', expand=True)

            tk.Label(recent_frame, text="📝 최근 오답 노트 (복습 필수)", 
                     font=("맑은 고딕", 12, "bold"), bg="white", fg="#2c3e50").pack(anchor='w', padx=20, pady=15)

            # 스크롤 영역
            canvas_container = tk.Frame(recent_frame, bg="white")
            canvas_container.pack(fill='both', expand=True, padx=10, pady=(0, 10))

            canvas = tk.Canvas(canvas_container, bg="white", highlightthickness=0)
            scrollbar = ttk.Scrollbar(canvas_container, orient="vertical", command=canvas.yview)
            scrollable_frame = tk.Frame(canvas, bg="white")

            scrollable_frame.bind(
                "<Configure>",
                lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
            )

            canvas_window = canvas.create_window((0, 0), window=scrollable_frame, anchor="nw")
            canvas.configure(yscrollcommand=scrollbar.set)

            def on_canvas_configure(event):
                canvas.itemconfig(canvas_window, width=event.width)
            canvas.bind('<Configure>', on_canvas_configure)

            def on_mousewheel(event):
                canvas.yview_scroll(int(-1*(event.delta/120)), "units")
            canvas.bind_all("<MouseWheel>", on_mousewheel)

            for idx, item in enumerate(weak_areas['recent_incorrect'][:5], 1):
                item_frame = tk.Frame(scrollable_frame, bg="#fff9e6", relief='solid', borderwidth=1)
                item_frame.pack(fill='x', pady=5, padx=5)

                tk.Label(item_frame, text=f"Q{idx}. {item['question']}", font=("맑은 고딕", 10, "bold"), 
                         bg="#fff9e6", fg="#2c3e50", wraplength=780, justify='left').pack(anchor='w', padx=15, pady=8)

                tk.Label(item_frame, text=f"해설: {item['explanation']}", font=("맑은 고딕", 9), 
                         bg="#fff9e6", fg="#7f8c8d", wraplength=780, justify='left').pack(anchor='w', padx=15, pady=(0, 8))

            canvas.pack(side="left", fill="both", expand=True)
            scrollbar.pack(side="right", fill="y")

        # 닫기 버튼
        tk.Button(self, text="닫기", command=self.destroy,
                 bg="#7f8c8d", fg="white", font=("맑은 고딕", 10),
                 relief='flat', padx=30, pady=8).pack(pady=20)
