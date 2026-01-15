import json
from collections import Counter
from datetime import datetime

class WeaknessAnalyzer:
    """학습 취약점 분석 클래스"""

    def __init__(self, history_data):
        """
        Args:
            history_data (list): 학습 기록 리스트
        """
        self.history = history_data

    def get_overall_stats(self):
        """전체 통계"""
        if not self.history:
            return None

        total_sessions = len(self.history)
        total_questions = sum(s['total_questions'] for s in self.history)
        total_correct = sum(s['correct_answers'] for s in self.history)
        avg_percentage = sum(s['percentage'] for s in self.history) / total_sessions

        return {
            'total_sessions': total_sessions,
            'total_questions': total_questions,
            'total_correct': total_correct,
            'total_incorrect': total_questions - total_correct,
            'avg_percentage': avg_percentage
        }

    def get_weak_areas(self):
        """취약한 영역 분석"""
        if not self.history:
            return []

        # 모든 오답 수집
        incorrect_questions = []
        for session in self.history:
            for answer in session.get('answers', []):
                if not answer['is_correct']:
                    incorrect_questions.append({
                        'question': answer['question'],
                        'date': session['date'],
                        'explanation': answer['explanation']
                    })

        # 문제 키워드 추출 및 빈도 분석
        keyword_counter = Counter()
        for q in incorrect_questions:
            # 간단한 키워드 추출 (회계 관련 용어)
            keywords = self._extract_keywords(q['question'])
            keyword_counter.update(keywords)

        # 가장 많이 틀린 키워드 상위 5개
        weak_keywords = keyword_counter.most_common(5)

        return {
            'total_incorrect': len(incorrect_questions),
            'weak_keywords': weak_keywords,
            'recent_incorrect': incorrect_questions[-5:]  # 최근 5개 오답
        }

    def _extract_keywords(self, text):
        """회계 용어 키워드 추출"""
        # 회계 관련 주요 키워드 리스트
        accounting_keywords = [
            '현금', '현금성자산', '당좌자산', '유동자산', '고정자산',
            '자산', '부채', '자본', '수익', '비용',
            '차변', '대변', '분개', '결산', '재무제표',
            '대차대조표', '손익계산서', '현금흐름표',
            '회계처리', '계정과목', '거래', '회계원칙',
            '감가상각', '대손충당금', '재고자산', '매출', '매입',
            '은행', '예금', '적금', '수표', '어음',
            '외상', '선급', '선수', '미수', '미지급'
        ]

        found_keywords = []
        for keyword in accounting_keywords:
            if keyword in text:
                found_keywords.append(keyword)

        return found_keywords

    def get_progress_trend(self):
        """학습 진도 추이"""
        if not self.history:
            return []

        # 최근 10개 세션의 정답률 추이
        recent_sessions = self.history[-10:]
        trend = []

        for session in recent_sessions:
            trend.append({
                'date': session['date'].split()[0],  # 날짜만
                'percentage': session['percentage']
            })

        return trend

    def get_recommendations(self):
        """학습 추천 사항"""
        stats = self.get_overall_stats()
        weak_areas = self.get_weak_areas()

        if not stats:
            return ["아직 학습 기록이 없습니다. 첫 학습을 시작해보세요!"]

        recommendations = []

        # 평균 정답률에 따른 추천
        avg_perc = stats['avg_percentage']
        if avg_perc < 50:
            recommendations.append("기본 개념 학습이 더 필요합니다. PDF 자료를 다시 한번 정독해보세요.")
        elif avg_perc < 70:
            recommendations.append("전반적으로 이해도가 높아지고 있습니다. 조금 더 연습하면 좋겠습니다.")
        else:
            recommendations.append("훌륭합니다! 높은 이해도를 보이고 있습니다.")

        # 취약 키워드에 따른 추천
        if weak_areas['weak_keywords']:
            top_weak = weak_areas['weak_keywords'][0][0]
            recommendations.append(f"'{top_weak}' 관련 내용을 집중적으로 복습하는 것을 추천합니다.")

        # 학습 횟수에 따른 추천
        if stats['total_sessions'] < 3:
            recommendations.append("꾸준한 학습이 중요합니다. 정기적으로 복습해보세요.")
        elif stats['total_sessions'] >= 10:
            recommendations.append("꾸준히 학습하고 계시네요! 이 패턴을 유지하세요.")

        return recommendations

    def generate_custom_quiz_prompt(self):
        """취약점 기반 맞춤 문제 생성을 위한 프롬프트"""
        weak_areas = self.get_weak_areas()

        if not weak_areas['weak_keywords']:
            return ""

        keywords = [kw[0] for kw in weak_areas['weak_keywords'][:3]]
        prompt = f"다음 주제에 집중한 문제를 만들어주세요: {', '.join(keywords)}"

        return prompt
