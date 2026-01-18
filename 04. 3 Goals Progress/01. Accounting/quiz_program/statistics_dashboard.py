import tkinter as tk
from tkinter import ttk
import math

class StatisticsDashboard(tk.Toplevel):
    def __init__(self, parent, history_data):
        super().__init__(parent)
        self.title("학습 성취도 분석")
        self.geometry("800x600")
        self.config(bg="#f5f6fa")
        self.history = history_data
        
        # 데이터 분석
        self.analyze_data()
        
        # UI 구성
        self.create_widgets()

    def analyze_data(self):
        """학습 데이터 분석"""
        # 문제별 정답 횟수 추적
        # key: question text (or id if reliable), value: correct count
        self.question_stats = {}
        self.total_attempts = 0
        self.total_correct = 0
        
        for session in self.history:
            if 'answers' in session:
                for ans in session['answers']:
                    q_text = ans['question']
                    is_correct = ans['is_correct']
                    
                    if q_text not in self.question_stats:
                        self.question_stats[q_text] = {'correct': 0, 'incorrect': 0}
                    
                    if is_correct:
                        self.question_stats[q_text]['correct'] += 1
                        self.total_correct += 1
                    else:
                        self.question_stats[q_text]['incorrect'] += 1
                    
                    self.total_attempts += 1

        # Anki 스타일 분류
        # New (새로운 카드): 한번도 안 푼 문제 (전체 문제 풀을 모르므로, 여기서는 '틀린 횟수가 더 많은 문제'로 정의하거나 생략)
        # -> 여기서는 "미숙지(New/Fail)" : 정답 < 오답
        # -> "학습중(Learning)" : 정답 1~3회 (오답보다 많아야 함)
        # -> "성숙(Mature)" : 정답 4회 이상
        
        self.stats_count = {
            'new': 0,      # 미숙지 (Needs Work)
            'learning': 0, # 학습중 (Young)
            'mature': 0    # 성숙 (Mature)
        }
        
        for q_data in self.question_stats.values():
            correct = q_data['correct']
            incorrect = q_data['incorrect']
            
            if correct < incorrect or correct == 0:
                self.stats_count['new'] += 1
            elif correct < 4:
                self.stats_count['learning'] += 1
            else:
                self.stats_count['mature'] += 1
                
        self.total_unique_questions = sum(self.stats_count.values())

    def create_widgets(self):
        """대시보드 UI 구성"""
        # 메인 타이틀
        title_frame = tk.Frame(self, bg="#f5f6fa")
        title_frame.pack(pady=20, fill='x', padx=30)
        
        tk.Label(title_frame, text="전산회계 2급 합격 예측 대시보드", 
                 font=("맑은 고딕", 20, "bold"), bg="#f5f6fa", fg="#2c3e50").pack(side='left')

        # 메인 컨텐츠 영역 (2단 레이아웃)
        content_frame = tk.Frame(self, bg="#f5f6fa")
        content_frame.pack(expand=True, fill='both', padx=30, pady=10)
        
        # 왼쪽: 학습 상태 (파이 차트)
        left_frame = tk.Frame(content_frame, bg="white", bd=1, relief="solid")
        left_frame.pack(side='left', fill='both', expand=True, padx=(0, 10))
        
        self.create_pie_chart(left_frame)
        
        # 오른쪽: 합격 예측 (막대 그래프)
        right_frame = tk.Frame(content_frame, bg="white", bd=1, relief="solid")
        right_frame.pack(side='right', fill='both', expand=True, padx=(10, 0))
        
        self.create_progress_chart(right_frame)
        
        # 하단: 조언
        self.create_advice_section()

    def create_pie_chart(self, parent):
        """학습 상태 파이 차트"""
        tk.Label(parent, text="이론 문제 숙련도 분석", 
                 font=("맑은 고딕", 14, "bold"), bg="white", fg="#34495e").pack(pady=20)
        
        canvas = tk.Canvas(parent, width=300, height=300, bg="white", highlightthickness=0)
        canvas.pack()
        
        if self.total_unique_questions == 0:
            canvas.create_oval(50, 50, 250, 250, fill="#ecf0f1")
            canvas.create_text(150, 150, text="데이터 부족", font=("맑은 고딕", 12))
            return

        # 데이터 비율 계산
        counts = [self.stats_count['new'], self.stats_count['learning'], self.stats_count['mature']]
        colors = ["#3498db", "#e67e22", "#2ecc71"] # 파랑(미숙지), 주황(학습중), 초록(성숙)
        labels = ["미숙지", "학습 중", "마스터(성숙)"]
        
        start_angle = 90
        for i, count in enumerate(counts):
            if count == 0: continue
            extent = (count / self.total_unique_questions) * 360
            canvas.create_arc(50, 50, 250, 250, start=start_angle, extent=-extent, 
                              fill=colors[i], outline="white")
            start_angle -= extent
            
        # 범례 표시
        legend_frame = tk.Frame(parent, bg="white")
        legend_frame.pack(pady=20)
        
        for i, label in enumerate(labels):
            item = tk.Frame(legend_frame, bg="white")
            item.pack(side='left', padx=10)
            tk.Frame(item, width=15, height=15, bg=colors[i]).pack(side='left', padx=5)
            tk.Label(item, text=f"{label} ({counts[i]}문제)", font=("맑은 고딕", 10), bg="white").pack(side='left')

    def create_progress_chart(self, parent):
        """합격 예측 그래프"""
        tk.Label(parent, text="예상 점수 및 합격 가능성", 
                 font=("맑은 고딕", 14, "bold"), bg="white", fg="#34495e").pack(pady=20)
        
        # 이론 점수 추산 (성숙 문제는 100%, 학습중은 50%, 미숙지는 0% 확률로 정답 가정)
        # 전산회계 2급 이론 만점 30점
        # 전체 문제 풀(Pool)을 모르므로, 현재 푼 문제들 내에서의 비율로 추산
        if self.total_unique_questions > 0:
            score_potential = (self.stats_count['mature'] * 1.0 + self.stats_count['learning'] * 0.5) 
            score_ratio = score_potential / self.total_unique_questions
            estimated_theory_score = score_ratio * 30
        else:
            estimated_theory_score = 0
            
        # 목표: 이론에서 최소 24점 (80%) 획득 목표 - "확실한 합격"을 위해
        target_score = 24 
        
        # 프로그레스 바 캔버스
        canvas = tk.Canvas(parent, width=250, height=300, bg="white", highlightthickness=0)
        canvas.pack()
        
        # 바 그리기설정
        bar_width = 80
        max_height = 200
        x_start = 85
        y_bottom = 250
        
        # 1. 목표 점수 라인 (24점)
        target_y = y_bottom - (target_score / 30 * max_height)
        canvas.create_line(40, target_y, 210, target_y, dash=(4, 2), fill="#e74c3c", width=2)
        canvas.create_text(220, target_y, text="목표(24점)", fill="#e74c3c", anchor='w', font=("맑은 고딕", 8))
        
        # 2. 현재 점수 바
        current_height = (estimated_theory_score / 30) * max_height
        current_y = y_bottom - current_height
        
        bar_color = "#3498db" if estimated_theory_score < target_score else "#2ecc71"
        
        canvas.create_rectangle(x_start, current_y, x_start + bar_width, y_bottom, 
                                fill=bar_color, outline="")
        
        # 점수 텍스트
        canvas.create_text(x_start + bar_width/2, current_y - 15, 
                           text=f"{estimated_theory_score:.1f}점", 
                           font=("맑은 고딕", 14, "bold"), fill=bar_color)
                           
        canvas.create_text(x_start + bar_width/2, y_bottom + 20, 
                           text="이론 예상 점수", 
                           font=("맑은 고딕", 10), fill="#7f8c8d")
                           
        # 설명
        desc = tk.Label(parent, text="* 마스터한 문제와 학습 중인 문제를\n기반으로 추산한 점수입니다.",
                       font=("맑은 고딕", 9), fg="#95a5a6", bg="white", justify='center')
        desc.pack(pady=10)

    def create_advice_section(self):
        """하단 조언 섹션"""
        advice_frame = tk.Frame(self, bg="#fff3cd", bd=1, relief="solid")
        advice_frame.pack(fill='x', padx=30, pady=20)
        
        msg = "💡 아직 데이터가 충분하지 않습니다. 더 많은 문제를 풀어주세요!"
        if self.stats_count['new'] > self.stats_count['mature']:
            msg = "💡 틀린 문제가 많습니다. '스마트 복습' 기능을 적극 활용해보세요."
        elif self.stats_count['learning'] > self.stats_count['mature']:
            msg = "💡 조금만 더 노력하면 '마스터' 단계로 넘어갈 수 있습니다!"
        elif self.stats_count['mature'] > 50: # 임의 기준
            msg = "🎉 아주 훌륭합니다! 이론 시험 합격이 가시권에 들어왔습니다!"
            
        tk.Label(advice_frame, text=msg, font=("맑은 고딕", 11), 
                 bg="#fff3cd", fg="#856404", padx=20, pady=15).pack()

