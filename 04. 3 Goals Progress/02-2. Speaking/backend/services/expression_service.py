import json
import os
import uuid
from datetime import datetime, timedelta
from typing import List, Optional, Dict
from pydantic import BaseModel

# 현재 파일 위치를 기준으로 절대 경로 설정
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
EXPRESSIONS_FILE = os.path.join(DATA_DIR, "expressions.json")

class Expression(BaseModel):
    id: str
    expression: str          # 표현/숙어 (예: "break the ice")
    meaning: str             # 의미 (예: "처음 만난 사람과 어색한 분위기를 푸다")
    example: str             # 예문
    category: str            # 카테고리 (idiom, phrasal_verb, expression)
    created_at: str          # 생성일
    next_review: str         # 다음 복습 날짜
    review_count: int        # 복습 횟수
    mastery_level: int       # 습득 수준 (0: 새로움, 1: 학습중, 2: 익숙함, 3: 완전습득)

class ExpressionService:
    def __init__(self):
        if not os.path.exists(DATA_DIR):
            os.makedirs(DATA_DIR)
        if not os.path.exists(EXPRESSIONS_FILE):
            self._save_data([])

    def _load_data(self) -> List[Dict]:
        try:
            with open(EXPRESSIONS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return []

    def _save_data(self, data: List[Dict]):
        with open(EXPRESSIONS_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    def _calculate_next_review(self, mastery_level: int) -> str:
        """간격 반복 스케줄: 수준에 따라 복습 날짜 계산"""
        intervals = {
            0: 1,    # 새로움: 1일 후
            1: 3,    # 학습중: 3일 후
            2: 14,   # 익숙함: 2주 후
            3: 30    # 완전습득: 1개월 후
        }
        days = intervals.get(mastery_level, 1)
        next_date = datetime.now() + timedelta(days=days)
        return next_date.strftime("%Y-%m-%d")

    def add_expression(self, expression: str, meaning: str, example: str = "", category: str = "expression") -> Expression:
        expressions = self._load_data()
        new_expr = Expression(
            id=str(uuid.uuid4()),
            expression=expression,
            meaning=meaning,
            example=example,
            category=category,
            created_at=datetime.now().strftime("%Y-%m-%d"),
            next_review=self._calculate_next_review(0),
            review_count=0,
            mastery_level=0
        )
        expressions.append(new_expr.model_dump())
        self._save_data(expressions)
        return new_expr

    def get_all_expressions(self) -> List[Expression]:
        data = self._load_data()
        return [Expression(**item) for item in data]

    def get_expression(self, expr_id: str) -> Optional[Expression]:
        expressions = self._load_data()
        for item in expressions:
            if item["id"] == expr_id:
                return Expression(**item)
        return None

    def get_due_expressions(self) -> List[Expression]:
        """오늘 복습해야 할 표현들 반환"""
        today = datetime.now().strftime("%Y-%m-%d")
        data = self._load_data()
        due = [Expression(**item) for item in data if item["next_review"] <= today]
        return due

    def update_mastery(self, expr_id: str, correct: bool) -> Optional[Expression]:
        """퀴즈 결과에 따라 습득 수준 업데이트"""
        expressions = self._load_data()
        for item in expressions:
            if item["id"] == expr_id:
                if correct:
                    item["mastery_level"] = min(item["mastery_level"] + 1, 3)
                else:
                    item["mastery_level"] = max(item["mastery_level"] - 1, 0)
                item["review_count"] += 1
                item["next_review"] = self._calculate_next_review(item["mastery_level"])
                self._save_data(expressions)
                return Expression(**item)
        return None

    def update_expression(self, expr_id: str, expression: str, meaning: str, example: str, category: str) -> Optional[Expression]:
        """표현 수정"""
        expressions = self._load_data()
        for item in expressions:
            if item["id"] == expr_id:
                item["expression"] = expression
                item["meaning"] = meaning
                item["example"] = example
                item["category"] = category
                self._save_data(expressions)
                return Expression(**item)
        return None

    def delete_expression(self, expr_id: str) -> bool:
        expressions = self._load_data()
        initial_len = len(expressions)
        expressions = [item for item in expressions if item["id"] != expr_id]
        if len(expressions) < initial_len:
            self._save_data(expressions)
            return True
        return False

    def get_stats(self) -> Dict:
        """학습 통계"""
        expressions = self._load_data()
        total = len(expressions)
        mastered = sum(1 for e in expressions if e["mastery_level"] == 3)
        learning = sum(1 for e in expressions if e["mastery_level"] in [1, 2])
        new = sum(1 for e in expressions if e["mastery_level"] == 0)
        due_today = len(self.get_due_expressions())

        return {
            "total": total,
            "mastered": mastered,
            "learning": learning,
            "new": new,
            "due_today": due_today
        }

expression_service = ExpressionService()
