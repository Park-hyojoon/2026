/**
 * Accounting Tycoon 02_version Game Data
 * This file contains the game data in a format that can be loaded via a script tag,
 * avoiding CORS/fetch issues when running via file:// protocol.
 */

window.ACCOUNTING_GAME_DATA = {
    theory: {
        "chapter": "01. 유동자산 (당좌자산)",
        "topic": "현금 및 현금성자산",
        "stage": 1,
        "title": "이론: 현금의 범위와 정의",
        "content": [
            {
                "id": "T1_1",
                "heading": "회계에서의 '현금'이란?",
                "text": "단순한 지폐나 동전(통화)뿐만 아니라, 은행에서 즉시 현금으로 바꿀 수 있는 '통화대용증권'까지 포함합니다.",
                "items": [
                    "지폐 및 주화 (통화)",
                    "자기앞수표",
                    "타인발행수표 (남이 준 수표)",
                    "우편환증서",
                    "만기도래 이자표"
                ]
            },
            {
                "id": "T1_2",
                "heading": "현금성자산의 핵심 조건",
                "text": "큰 거래비용 없이 현금으로 전환이 용이하고, 가치변동 위험이 적어야 합니다.",
                "critical_point": "취득 당시 만기가 3개월(90일) 이내여야 합니다."
            },
            {
                "id": "T1_3",
                "heading": "⚠️ 현금이 아닌 것들 (주의!)",
                "text": "겉보기엔 현금 같지만 회계에서는 다른 이름을 쓰는 항목들입니다.",
                "items": [
                    "선일자수표 (어음으로 처리)",
                    "우표 및 수입인지 (소모품비 또는 세금과공과)",
                    "차용증서 (대여금 또는 차입금)"
                ]
            }
        ]
    },
    quiz: {
        "stage": 2,
        "title": "퀴즈: 현금 감별사",
        "questions": [
            {
                "id": "Q2_1",
                "type": "selection",
                "question": "다음 중 회계상 '현금' 계정과목으로 처리할 수 없는 것은?",
                "options": [
                    "자기앞수표",
                    "타인발행수표",
                    "우표",
                    "만기도래 이자표"
                ],
                "answer": "우표",
                "explanation": "우표는 통신비나 소모품비로 처리하며, 현금이 아닙니다."
            },
            {
                "id": "Q2_2",
                "type": "calculation",
                "question": "다음 항목들의 합계 중 '현금 및 현금성자산'은 총 얼마인가?\n- 지폐: 100,000원\n- 자기앞수표: 50,000원\n- 수입인지: 10,000원\n- 만기 2개월 남은 채권(취득시): 200,000원",
                "options": [
                    "150,000원",
                    "160,000원",
                    "350,000원",
                    "360,000원"
                ],
                "answer": "350,000원",
                "explanation": "지폐(10만) + 자기앞수표(5만) + 현금성자산(20만) = 35만입니다. 수입인지는 제외됩니다."
            }
        ]
    },
    journal: {
        "stage": 3,
        "title": "분개 훈련: 실전 장부 작성",
        "practice": [
            {
                "id": "J3_1",
                "scenario": "창고에서 보관 중이던 상품 500,000원을 매출하고, 대금은 전액 타인발행수표로 받았다.",
                "solution": {
                    "debit": {
                        "account": "현금",
                        "amount": 500000
                    },
                    "credit": {
                        "account": "상품매출",
                        "amount": 500000
                    }
                },
                "hint": "타인발행수표는 '현금' 계정을 사용합니다."
            },
            {
                "id": "J3_2",
                "scenario": "결산 시점에 장부상 현금 잔액은 100,000원이나, 실제 금고 안의 현금은 80,000원임을 발견하였다. (원인 불명)",
                "solution": {
                    "debit": {
                        "account": "현금과부족",
                        "amount": 20000
                    },
                    "credit": {
                        "account": "현금",
                        "amount": 20000
                    }
                },
                "hint": "돈이 부족할 때는 대변에 현금을 기록하여 장부 잔액을 줄여줍니다."
            }
        ]
    }
};
