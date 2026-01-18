import tkinter as tk
from datetime import datetime, timedelta

def center_window(root, width, height):
    """윈도우를 화면 중앙에 배치"""
    root.update_idletasks()
    x = (root.winfo_screenwidth() // 2) - (width // 2)
    y = (root.winfo_screenheight() // 2) - (height // 2)
    root.geometry(f'{width}x{height}+{x}+{y}')

class ContributionGraph:
    def __init__(self, parent, history_data):
        self.parent = parent
        self.history = history_data
        
    def draw(self):
        """학습 기여 그래프(잔디) 추가"""
        graph_frame = tk.Frame(self.parent, bg="white")
        graph_frame.pack(pady=20, padx=50, fill='x')

        tk.Label(graph_frame, text="2026 학습 활동", 
                 font=("맑은 고딕", 10, "bold"), bg="white", fg="#2c3e50").pack(anchor='w', pady=(0, 5))

        # 데이터 집계
        activity = {}
        for session in self.history:
            try:
                date_str = session['date'].split(' ')[0]
                solved = session.get('total_questions', 0)
                activity[date_str] = activity.get(date_str, 0) + solved
            except:
                continue

        # 캔버스 및 스크롤 설정
        canvas_width = 750
        canvas_height = 150 # 높이 약간 증가
        
        canvas = tk.Canvas(graph_frame, width=canvas_width, height=canvas_height, 
                           bg="white", highlightthickness=0)
        canvas.pack(fill='x', expand=True)

        colors = ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"]
        
        # 2026년 1월 1일 ~ 2026년 12월 31일
        start_date = datetime(2026, 1, 1)
        end_date = datetime(2026, 12, 31)
        
        # 시작 요일 오프셋 (일요일=0 기준)
        start_weekday = (start_date.weekday() + 1) % 7
        
        cell_size = 11
        spacing = 3
        
        # 요일 라벨
        days_labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        for i, day in enumerate([1, 3, 5]): 
            canvas.create_text(15, 25 + day * (cell_size + spacing), 
                               text=days_labels[day], font=("맑은 고딕", 7), anchor='e')

        # 2026년 전체 일수 순회
        current_date = start_date
        
        while current_date <= end_date:
            day_of_week = (current_date.weekday() + 1) % 7
            
            # 주차 계산
            days_passed = (current_date - start_date).days
            week_idx = (days_passed + start_weekday) // 7
            
            date_key = current_date.strftime("%Y-%m-%d")
            count = activity.get(date_key, 0)
            
            if count == 0: level = 0
            elif count < 5: level = 1
            elif count < 10: level = 2
            elif count < 15: level = 3
            else: level = 4
            
            x1 = 25 + week_idx * (cell_size + spacing)
            y1 = 15 + day_of_week * (cell_size + spacing)
            x2 = x1 + cell_size
            y2 = y1 + cell_size
            
            # 월 표시 (매월 1일이거나, 첫 주의 첫 날일 때)
            if current_date.day == 1:
                month_name = current_date.strftime("%b")
                canvas.create_text(x1, 5, text=month_name, 
                                   font=("맑은 고딕", 7), anchor='nw')

            rect = canvas.create_rectangle(x1, y1, x2, y2, 
                                           fill=colors[level], outline="#e1e4e8", width=1)
            
            # 툴팁 효과를 위해 root 찾기 (부모의 부모... 최상위 윈도우)
            root_window = self.parent.winfo_toplevel()
            
            canvas.tag_bind(rect, "<Enter>", lambda e, c=count, d=date_key: 
                            root_window.title(f"2026 학습 활동 - {d}: {c}문제"))
            canvas.tag_bind(rect, "<Leave>", lambda e: root_window.title("AI 회계 학습 도우미"))
            
            current_date += timedelta(days=1)
