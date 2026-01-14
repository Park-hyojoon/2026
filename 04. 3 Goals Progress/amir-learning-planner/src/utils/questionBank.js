// 전산회계 2급/1급 문제 은행
// 학습 범위 키워드와 매칭하여 문제 출제

export const accountingQuestions = {
  // ===== PART 01: 회계의 기초 =====
  "회계기초": [
    {
      id: "basic-1",
      question: "재무상태표의 기본 등식으로 올바른 것은?",
      options: ["자산 + 부채 = 자본", "자산 = 부채 + 자본", "자산 - 자본 = 부채", "자본 = 자산 + 부채"],
      correct: 1,
      explanation: "재무상태표의 기본 등식은 '자산 = 부채 + 자본'입니다. 이는 회계항등식이라고도 합니다."
    },
    {
      id: "basic-2",
      question: "회계기간 동안의 경영성과를 나타내는 보고서는?",
      options: ["재무상태표", "손익계산서", "현금흐름표", "자본변동표"],
      correct: 1,
      explanation: "손익계산서는 일정 기간 동안 기업의 수익과 비용을 나타내는 재무제표입니다."
    },
    {
      id: "basic-3",
      question: "다음 중 재무상태표에 표시되지 않는 항목은?",
      options: ["자산", "부채", "매출액", "자본"],
      correct: 2,
      explanation: "매출액은 손익계산서 항목입니다. 재무상태표는 자산, 부채, 자본으로 구성됩니다."
    },
    {
      id: "basic-4",
      question: "기업의 일정 시점의 재무상태를 나타내는 보고서는?",
      options: ["손익계산서", "재무상태표", "현금흐름표", "제조원가명세서"],
      correct: 1,
      explanation: "재무상태표는 특정 시점의 자산, 부채, 자본의 상태를 보여주는 재무제표입니다."
    },
    {
      id: "basic-5",
      question: "순이익의 계산식으로 올바른 것은?",
      options: ["자산 - 부채", "수익 - 비용", "자본 - 부채", "자산 - 자본"],
      correct: 1,
      explanation: "순이익 = 수익 - 비용입니다. 수익이 비용보다 크면 순이익, 작으면 순손실입니다."
    }
  ],

  // ===== 유동자산 - 당좌자산 =====
  "유동자산": [
    {
      id: "current-1",
      question: "다음 중 유동자산에 해당하지 않는 것은?",
      options: ["현금", "보통예금", "토지", "외상매출금"],
      correct: 2,
      explanation: "토지는 비유동자산(유형자산)입니다. 유동자산은 1년 내 현금화 가능한 자산입니다."
    },
    {
      id: "current-2",
      question: "당좌자산에 해당하는 것은?",
      options: ["상품", "제품", "현금및현금성자산", "원재료"],
      correct: 2,
      explanation: "당좌자산은 현금 및 단기간 내 현금화 가능한 자산입니다. 상품, 제품, 원재료는 재고자산입니다."
    },
    {
      id: "current-3",
      question: "외상매출금의 분류로 올바른 것은?",
      options: ["비유동자산", "유동부채", "유동자산(당좌자산)", "자본"],
      correct: 2,
      explanation: "외상매출금은 상품 판매 대금을 나중에 받을 권리로, 당좌자산에 해당합니다."
    },
    {
      id: "current-4",
      question: "다음 중 재고자산에 해당하는 것은?",
      options: ["미수금", "선급금", "상품", "단기대여금"],
      correct: 2,
      explanation: "상품은 판매 목적으로 보유하는 재고자산입니다. 나머지는 당좌자산입니다."
    },
    {
      id: "current-5",
      question: "현금및현금성자산에 해당하지 않는 것은?",
      options: ["보통예금", "당좌예금", "정기예금(1년)", "현금"],
      correct: 2,
      explanation: "정기예금(1년)은 단기금융상품으로 분류됩니다. 현금성자산은 취득 당시 만기 3개월 이내입니다."
    }
  ],

  // ===== 당좌자산 상세 =====
  "당좌자산": [
    {
      id: "quick-1",
      question: "받을어음의 분류로 올바른 것은?",
      options: ["유동부채", "당좌자산", "재고자산", "비유동자산"],
      correct: 1,
      explanation: "받을어음은 상거래에서 발생한 채권으로, 당좌자산에 해당합니다."
    },
    {
      id: "quick-2",
      question: "선급금의 의미로 올바른 것은?",
      options: ["상품 대금을 미리 받은 것", "상품 대금을 미리 지급한 것", "이자를 미리 받은 것", "급여를 미리 받은 것"],
      correct: 1,
      explanation: "선급금은 상품이나 서비스를 받기 전에 미리 지급한 대금입니다."
    },
    {
      id: "quick-3",
      question: "미수금이 발생하는 경우는?",
      options: ["상품을 외상으로 판매", "비품을 외상으로 처분", "상품을 현금으로 판매", "비품을 현금으로 구입"],
      correct: 1,
      explanation: "미수금은 주된 영업활동 이외의 거래에서 발생한 채권입니다. 상품 외상판매는 외상매출금입니다."
    },
    {
      id: "quick-4",
      question: "단기대여금의 분류로 올바른 것은?",
      options: ["비유동자산", "유동부채", "당좌자산", "자본"],
      correct: 2,
      explanation: "단기대여금은 1년 이내 회수 예정인 대여금으로, 당좌자산에 해당합니다."
    },
    {
      id: "quick-5",
      question: "가지급금에 대한 설명으로 올바른 것은?",
      options: ["확정된 비용의 지급", "용도가 정해지지 않은 지급", "미래 비용의 선급", "확정된 수익의 수취"],
      correct: 1,
      explanation: "가지급금은 현금 지출은 되었으나 용도나 금액이 확정되지 않은 일시적인 자산 계정입니다."
    }
  ],

  // ===== 단기투자자산 =====
  "단기투자자산": [
    {
      id: "invest-1",
      question: "단기매매증권의 평가방법은?",
      options: ["원가법", "공정가치법", "저가법", "정액법"],
      correct: 1,
      explanation: "단기매매증권은 공정가치로 평가하며, 평가손익은 당기손익으로 인식합니다."
    },
    {
      id: "invest-2",
      question: "단기금융상품에 해당하는 것은?",
      options: ["보통예금", "정기예금(만기 6개월)", "현금", "당좌예금"],
      correct: 1,
      explanation: "정기예금 등 만기가 1년 이내인 금융상품은 단기금융상품으로 분류합니다."
    },
    {
      id: "invest-3",
      question: "단기매매증권 평가이익의 회계처리는?",
      options: ["자본 증가", "부채 감소", "당기순이익 증가", "자산 감소"],
      correct: 2,
      explanation: "단기매매증권평가이익은 영업외수익으로 당기순이익을 증가시킵니다."
    },
    {
      id: "invest-4",
      question: "단기투자자산의 분류 기준은?",
      options: ["취득 목적", "보유 기간", "금액 크기", "발행 기관"],
      correct: 1,
      explanation: "단기투자자산은 1년 이내 처분 또는 만기 도래 예정인 투자자산입니다."
    },
    {
      id: "invest-5",
      question: "단기매매증권 처분손익은 어디에 표시되는가?",
      options: ["영업이익", "영업외손익", "자본잉여금", "기타포괄손익"],
      correct: 1,
      explanation: "단기매매증권처분손익은 손익계산서의 영업외손익에 표시됩니다."
    }
  ],

  // ===== 비유동자산 - 유형자산 =====
  "비유동자산": [
    {
      id: "noncurrent-1",
      question: "다음 중 유형자산에 해당하는 것은?",
      options: ["특허권", "상표권", "건물", "영업권"],
      correct: 2,
      explanation: "건물은 물리적 형체가 있는 유형자산입니다. 나머지는 무형자산입니다."
    },
    {
      id: "noncurrent-2",
      question: "유형자산의 감가상각 방법이 아닌 것은?",
      options: ["정액법", "정률법", "원가법", "생산량비례법"],
      correct: 2,
      explanation: "원가법은 감가상각 방법이 아니라 자산의 측정방법입니다."
    },
    {
      id: "noncurrent-3",
      question: "토지의 회계처리로 올바른 것은?",
      options: ["감가상각 한다", "재평가만 한다", "감가상각하지 않는다", "매년 손상검사만 한다"],
      correct: 2,
      explanation: "토지는 비상각자산으로 감가상각하지 않습니다."
    },
    {
      id: "noncurrent-4",
      question: "감가상각비의 성격은?",
      options: ["현금 지출 비용", "비현금 비용", "자본적 지출", "수익적 수입"],
      correct: 1,
      explanation: "감가상각비는 현금 유출 없이 비용으로 인식되는 비현금 비용입니다."
    },
    {
      id: "noncurrent-5",
      question: "다음 중 비상각자산은?",
      options: ["건물", "차량운반구", "토지", "비품"],
      correct: 2,
      explanation: "토지는 사용에 따른 가치 감소가 없어 감가상각하지 않습니다."
    }
  ],

  // ===== 유형자산 상세 =====
  "유형자산": [
    {
      id: "tangible-1",
      question: "유형자산의 취득원가에 포함되는 것은?",
      options: ["취득 후 수선비", "취득세", "이자비용 전액", "감가상각비"],
      correct: 1,
      explanation: "취득세, 등록세 등 취득부대비용은 취득원가에 포함됩니다."
    },
    {
      id: "tangible-2",
      question: "정액법 감가상각비 계산식은?",
      options: ["(취득원가-잔존가치)/내용연수", "취득원가×상각률", "장부금액×상각률", "(취득원가+잔존가치)/내용연수"],
      correct: 0,
      explanation: "정액법: (취득원가-잔존가치)/내용연수로 매년 동일한 감가상각비를 계상합니다."
    },
    {
      id: "tangible-3",
      question: "자본적 지출에 해당하는 것은?",
      options: ["일상적인 수선비", "엘리베이터 신규 설치", "유지보수비", "청소비"],
      correct: 1,
      explanation: "자본적 지출은 자산의 가치를 증가시키거나 내용연수를 연장시키는 지출입니다."
    },
    {
      id: "tangible-4",
      question: "유형자산 처분손익의 계산식은?",
      options: ["취득원가-처분가액", "처분가액-취득원가", "처분가액-장부금액", "장부금액-취득원가"],
      correct: 2,
      explanation: "처분손익 = 처분가액 - 장부금액(취득원가-감가상각누계액)입니다."
    },
    {
      id: "tangible-5",
      question: "감가상각누계액의 재무상태표 표시방법은?",
      options: ["자산 가산", "부채 표시", "자산 차감", "자본 차감"],
      correct: 2,
      explanation: "감가상각누계액은 해당 자산에서 차감하는 형식으로 표시합니다."
    }
  ],

  // ===== 부채 =====
  "부채": [
    {
      id: "liab-1",
      question: "다음 중 유동부채에 해당하는 것은?",
      options: ["사채", "장기차입금", "외상매입금", "퇴직급여충당부채"],
      correct: 2,
      explanation: "외상매입금은 1년 내 상환해야 하는 유동부채입니다."
    },
    {
      id: "liab-2",
      question: "선수금의 의미로 올바른 것은?",
      options: ["상품 대금을 미리 지급", "상품 대금을 미리 수령", "이자를 미리 지급", "급여를 미리 지급"],
      correct: 1,
      explanation: "선수금은 상품이나 서비스를 제공하기 전에 미리 받은 대금입니다."
    },
    {
      id: "liab-3",
      question: "미지급금이 발생하는 경우는?",
      options: ["상품을 외상으로 매입", "비품을 외상으로 구입", "상품을 현금으로 판매", "급여를 현금으로 지급"],
      correct: 1,
      explanation: "미지급금은 주된 영업활동 이외의 거래에서 발생한 채무입니다."
    },
    {
      id: "liab-4",
      question: "지급어음의 분류로 올바른 것은?",
      options: ["당좌자산", "유동부채", "비유동부채", "자본"],
      correct: 1,
      explanation: "지급어음은 상거래에서 발생한 채무로, 유동부채에 해당합니다."
    },
    {
      id: "liab-5",
      question: "예수금에 해당하는 것은?",
      options: ["미리 받은 상품대금", "원천징수한 소득세", "미리 지급한 급여", "외상으로 매입한 상품대금"],
      correct: 1,
      explanation: "예수금은 일시적으로 보관하는 금액으로, 원천징수세액 등이 해당됩니다."
    }
  ],

  // ===== 유동부채 상세 =====
  "유동부채": [
    {
      id: "curliab-1",
      question: "단기차입금의 분류로 올바른 것은?",
      options: ["당좌자산", "유동부채", "비유동부채", "자본"],
      correct: 1,
      explanation: "단기차입금은 1년 이내 상환 예정인 차입금으로 유동부채입니다."
    },
    {
      id: "curliab-2",
      question: "미지급비용에 해당하는 것은?",
      options: ["미리 지급한 이자", "기간 경과한 미지급 이자", "미리 받은 임대료", "미리 지급한 보험료"],
      correct: 1,
      explanation: "미지급비용은 기간이 경과했으나 아직 지급하지 않은 비용입니다."
    },
    {
      id: "curliab-3",
      question: "가수금에 대한 설명으로 올바른 것은?",
      options: ["용도가 확정된 수입", "내용이 불분명한 일시적 수입", "미래 수익의 선수", "확정된 비용의 지급"],
      correct: 1,
      explanation: "가수금은 현금 수입은 되었으나 내용이나 금액이 확정되지 않은 일시적인 부채 계정입니다."
    },
    {
      id: "curliab-4",
      question: "선수수익에 해당하는 것은?",
      options: ["미리 지급한 임대료", "미리 받은 임대료", "미수 이자", "미지급 급여"],
      correct: 1,
      explanation: "선수수익은 아직 제공하지 않은 서비스에 대해 미리 받은 수익입니다."
    },
    {
      id: "curliab-5",
      question: "부가가치세 예수금은 어디에 분류되는가?",
      options: ["자산", "유동부채", "비유동부채", "자본"],
      correct: 1,
      explanation: "부가가치세 예수금은 국가에 납부해야 할 의무로 유동부채입니다."
    }
  ],

  // ===== 자본 =====
  "자본": [
    {
      id: "equity-1",
      question: "자본금에 대한 설명으로 올바른 것은?",
      options: ["영업활동으로 벌어들인 이익", "주주가 납입한 금액 중 액면금액", "자산에서 부채를 뺀 금액", "이익잉여금의 적립액"],
      correct: 1,
      explanation: "자본금은 주주가 납입한 금액 중 주식의 액면금액 해당분입니다."
    },
    {
      id: "equity-2",
      question: "이익잉여금에 해당하는 것은?",
      options: ["주식발행초과금", "감자차익", "이익준비금", "자기주식"],
      correct: 2,
      explanation: "이익준비금은 법정적립금으로 이익잉여금에 해당합니다."
    },
    {
      id: "equity-3",
      question: "자본잉여금에 해당하는 것은?",
      options: ["이익준비금", "주식발행초과금", "미처분이익잉여금", "임의적립금"],
      correct: 1,
      explanation: "주식발행초과금은 주식 발행 시 액면초과 납입액으로 자본잉여금입니다."
    },
    {
      id: "equity-4",
      question: "배당금 지급이 자본에 미치는 영향은?",
      options: ["자본 증가", "자본 감소", "자본 변동 없음", "부채 증가"],
      correct: 1,
      explanation: "배당금 지급은 이익잉여금 감소로 자본이 감소합니다."
    },
    {
      id: "equity-5",
      question: "자기주식의 재무상태표 표시방법은?",
      options: ["자산 표시", "부채 표시", "자본 차감", "자본 가산"],
      correct: 2,
      explanation: "자기주식은 자본에서 차감하는 형식으로 표시합니다."
    }
  ],

  // ===== 수익과 비용 =====
  "수익비용": [
    {
      id: "income-1",
      question: "매출액에서 매출원가를 차감한 금액은?",
      options: ["영업이익", "매출총이익", "당기순이익", "영업외수익"],
      correct: 1,
      explanation: "매출총이익 = 매출액 - 매출원가입니다."
    },
    {
      id: "income-2",
      question: "판매비와관리비에 해당하는 것은?",
      options: ["매출원가", "급여", "이자비용", "유형자산처분손실"],
      correct: 1,
      explanation: "급여는 판매비와관리비에 해당합니다. 이자비용과 처분손실은 영업외비용입니다."
    },
    {
      id: "income-3",
      question: "영업외수익에 해당하는 것은?",
      options: ["매출액", "이자수익", "임대료(주된 영업)", "수수료수익(주된 영업)"],
      correct: 1,
      explanation: "이자수익은 주된 영업활동 이외에서 발생한 수익으로 영업외수익입니다."
    },
    {
      id: "income-4",
      question: "영업이익의 계산식은?",
      options: ["매출액-매출원가", "매출총이익-판매비와관리비", "매출액-판매비와관리비", "당기순이익+법인세비용"],
      correct: 1,
      explanation: "영업이익 = 매출총이익 - 판매비와관리비입니다."
    },
    {
      id: "income-5",
      question: "감가상각비는 어디에 분류되는가?",
      options: ["매출원가 또는 판매비와관리비", "영업외비용", "자본", "부채"],
      correct: 0,
      explanation: "감가상각비는 자산의 용도에 따라 매출원가 또는 판매비와관리비로 분류됩니다."
    }
  ],

  // ===== 분개 =====
  "분개": [
    {
      id: "entry-1",
      question: "현금 100원으로 상품을 매입한 분개에서 대변은?",
      options: ["상품 100", "현금 100", "매입 100", "외상매입금 100"],
      correct: 1,
      explanation: "현금 지급이므로 대변에 현금이 기록됩니다. 차변: 상품(매입) / 대변: 현금"
    },
    {
      id: "entry-2",
      question: "외상으로 상품 200원을 판매한 분개에서 차변은?",
      options: ["현금 200", "외상매출금 200", "매출 200", "상품 200"],
      correct: 1,
      explanation: "외상 판매이므로 차변에 외상매출금이 기록됩니다. 차변: 외상매출금 / 대변: 매출"
    },
    {
      id: "entry-3",
      question: "자산의 증가는 어느 쪽에 기록하는가?",
      options: ["차변", "대변", "차변 또는 대변", "기록하지 않음"],
      correct: 0,
      explanation: "자산의 증가는 차변에, 감소는 대변에 기록합니다."
    },
    {
      id: "entry-4",
      question: "부채의 감소는 어느 쪽에 기록하는가?",
      options: ["대변", "차변", "차변 또는 대변", "기록하지 않음"],
      correct: 1,
      explanation: "부채의 증가는 대변에, 감소는 차변에 기록합니다."
    },
    {
      id: "entry-5",
      question: "비용의 발생은 어느 쪽에 기록하는가?",
      options: ["대변", "차변", "차변 또는 대변", "기록하지 않음"],
      correct: 1,
      explanation: "비용의 발생은 차변에 기록합니다. 비용은 자본의 감소 요인입니다."
    }
  ],

  // ===== 부가가치세 =====
  "부가가치세": [
    {
      id: "vat-1",
      question: "부가가치세 과세기간은?",
      options: ["1개월", "3개월", "6개월", "1년"],
      correct: 2,
      explanation: "부가가치세 과세기간은 6개월입니다. (1기: 1~6월, 2기: 7~12월)"
    },
    {
      id: "vat-2",
      question: "일반과세자의 부가가치세율은?",
      options: ["5%", "10%", "15%", "20%"],
      correct: 1,
      explanation: "일반과세자의 부가가치세율은 10%입니다."
    },
    {
      id: "vat-3",
      question: "매출세액에서 매입세액을 차감한 금액은?",
      options: ["부가가치세 예수금", "부가가치세 대급금", "납부세액", "환급세액"],
      correct: 2,
      explanation: "납부세액 = 매출세액 - 매입세액입니다. 음수이면 환급세액입니다."
    },
    {
      id: "vat-4",
      question: "부가가치세 신고·납부 기한(확정)은?",
      options: ["과세기간 종료 후 15일 이내", "과세기간 종료 후 25일 이내", "과세기간 종료 후 1개월 이내", "과세기간 종료 후 2개월 이내"],
      correct: 1,
      explanation: "부가가치세 확정신고·납부 기한은 과세기간 종료 후 25일 이내입니다."
    },
    {
      id: "vat-5",
      question: "부가가치세 면세사업에 해당하는 것은?",
      options: ["일반 음식점", "기초생활필수품", "의류 판매", "가전제품 판매"],
      correct: 1,
      explanation: "기초생활필수품, 의료·교육서비스 등은 부가가치세 면세대상입니다."
    }
  ],

  // ===== 결산 =====
  "결산": [
    {
      id: "closing-1",
      question: "결산의 순서로 올바른 것은?",
      options: ["재무제표 작성→수정분개→마감분개", "수정분개→마감분개→재무제표 작성", "마감분개→수정분개→재무제표 작성", "재무제표 작성→마감분개→수정분개"],
      correct: 1,
      explanation: "결산 순서: 수정분개(결산정리분개) → 마감분개 → 재무제표 작성"
    },
    {
      id: "closing-2",
      question: "기말 미수이자에 대한 수정분개 차변은?",
      options: ["이자수익", "미수수익", "선수수익", "이자비용"],
      correct: 1,
      explanation: "미수이자 인식: 차변 미수수익 / 대변 이자수익"
    },
    {
      id: "closing-3",
      question: "선급비용에 대한 설명으로 올바른 것은?",
      options: ["이미 비용 처리했으나 차기에 속하는 비용", "당기에 속하나 미지급한 비용", "미리 받은 수익", "당기에 속하나 미수한 수익"],
      correct: 0,
      explanation: "선급비용은 이미 지급했으나 차기 이후에 속하는 비용입니다."
    },
    {
      id: "closing-4",
      question: "손익계정에 대체되는 계정은?",
      options: ["자산 계정", "부채 계정", "수익·비용 계정", "자본 계정"],
      correct: 2,
      explanation: "수익·비용 계정은 결산 시 손익계정으로 대체하여 마감합니다."
    },
    {
      id: "closing-5",
      question: "이월시산표에 나타나는 계정은?",
      options: ["수익 계정", "비용 계정", "손익 계정", "자산·부채·자본 계정"],
      correct: 3,
      explanation: "이월시산표에는 자산, 부채, 자본 계정만 나타납니다."
    }
  ],

  // ===== 전표와 장부 =====
  "전표장부": [
    {
      id: "book-1",
      question: "입금전표를 사용하는 거래는?",
      options: ["현금 지출 거래", "현금 수입 거래", "대체 거래", "어음 수취 거래"],
      correct: 1,
      explanation: "입금전표는 현금이 들어오는 거래에 사용합니다."
    },
    {
      id: "book-2",
      question: "총계정원장의 역할은?",
      options: ["거래 발생순 기록", "계정과목별 집계", "보조부 기록", "전표 작성"],
      correct: 1,
      explanation: "총계정원장은 계정과목별로 모든 거래를 집계하는 주요부입니다."
    },
    {
      id: "book-3",
      question: "분개장에서 총계정원장으로의 이동을 무엇이라 하는가?",
      options: ["분개", "전기", "결산", "마감"],
      correct: 1,
      explanation: "전기는 분개장의 내용을 총계정원장에 옮겨 적는 것입니다."
    },
    {
      id: "book-4",
      question: "시산표의 역할은?",
      options: ["거래 기록", "전기 정확성 검증", "재무제표 작성", "결산 분개"],
      correct: 1,
      explanation: "시산표는 차변합계와 대변합계의 일치 여부로 전기 정확성을 검증합니다."
    },
    {
      id: "book-5",
      question: "3전표제에서 사용하지 않는 전표는?",
      options: ["입금전표", "출금전표", "대체전표", "매출전표"],
      correct: 3,
      explanation: "3전표제는 입금전표, 출금전표, 대체전표를 사용합니다."
    }
  ],

  // ===== 재고자산 =====
  "재고자산": [
    {
      id: "inventory-1",
      question: "재고자산에 해당하지 않는 것은?",
      options: ["상품", "제품", "원재료", "비품"],
      correct: 3,
      explanation: "비품은 유형자산입니다. 재고자산은 판매 또는 생산 목적으로 보유하는 자산입니다."
    },
    {
      id: "inventory-2",
      question: "선입선출법의 특징은?",
      options: ["먼저 매입한 것이 먼저 판매", "나중에 매입한 것이 먼저 판매", "평균 단가로 계산", "개별 단가로 계산"],
      correct: 0,
      explanation: "선입선출법(FIFO)은 먼저 매입한 재고가 먼저 판매된다고 가정합니다."
    },
    {
      id: "inventory-3",
      question: "물가상승 시 선입선출법의 특징은?",
      options: ["매출원가 높음, 이익 낮음", "매출원가 낮음, 이익 높음", "매출원가와 이익 변동 없음", "기말재고 낮음"],
      correct: 1,
      explanation: "물가상승 시 선입선출법은 매출원가가 낮고, 이익이 높게 나타납니다."
    },
    {
      id: "inventory-4",
      question: "재고자산의 평가방법으로 올바른 것은?",
      options: ["공정가치법", "저가법", "원가법", "저가법 또는 순실현가능가치 중 낮은 금액"],
      correct: 3,
      explanation: "재고자산은 취득원가와 순실현가능가치 중 낮은 금액으로 평가합니다."
    },
    {
      id: "inventory-5",
      question: "상품매출원가의 계산식은?",
      options: ["기초상품+당기매입액", "기초상품+당기매입액-기말상품", "기말상품+당기매입액", "당기매입액-기말상품"],
      correct: 1,
      explanation: "매출원가 = 기초상품재고액 + 당기상품매입액 - 기말상품재고액"
    }
  ]
};

// 학습 범위에서 키워드 추출하여 매칭되는 토픽 찾기
export function findMatchingTopics(studyRange) {
  const keywords = {
    "회계기초": ["회계", "기초", "재무상태표", "손익계산서", "기본"],
    "유동자산": ["유동자산", "유동 자산", "current asset"],
    "당좌자산": ["당좌자산", "당좌", "현금", "예금", "매출금", "미수금", "선급금", "대여금"],
    "단기투자자산": ["단기투자", "투자자산", "매매증권", "금융상품"],
    "비유동자산": ["비유동자산", "비유동", "고정자산"],
    "유형자산": ["유형자산", "건물", "토지", "차량", "비품", "감가상각"],
    "부채": ["부채", "liab"],
    "유동부채": ["유동부채", "매입금", "지급", "미지급", "선수", "예수"],
    "자본": ["자본", "자본금", "잉여금", "equity"],
    "수익비용": ["수익", "비용", "매출", "영업", "손익"],
    "분개": ["분개", "차변", "대변", "전기"],
    "부가가치세": ["부가가치세", "부가세", "VAT", "매출세액", "매입세액"],
    "결산": ["결산", "마감", "수정분개", "결산정리"],
    "전표장부": ["전표", "장부", "원장", "시산표", "분개장"],
    "재고자산": ["재고자산", "재고", "상품", "제품", "원재료", "선입선출", "매출원가"]
  };

  const matchedTopics = [];
  const lowerRange = studyRange.toLowerCase();

  for (const [topic, words] of Object.entries(keywords)) {
    if (words.some(word => lowerRange.includes(word.toLowerCase()))) {
      matchedTopics.push(topic);
    }
  }

  return matchedTopics.length > 0 ? matchedTopics : ["회계기초"];
}

// 학습 기록에서 최근 N개 토픽 추출
export function getRecentTopics(studyLog, limit = 5) {
  if (!studyLog || studyLog.length === 0) return ["회계기초"];

  const recentEntries = studyLog.slice(-limit);
  const topics = new Set();

  recentEntries.forEach(entry => {
    const matched = findMatchingTopics(entry.topic);
    matched.forEach(t => topics.add(t));
  });

  return Array.from(topics);
}

// 토픽들에서 랜덤 문제 추출
export function getQuestionsForTopics(topics, count = 5) {
  const questions = [];

  topics.forEach(topic => {
    if (accountingQuestions[topic]) {
      questions.push(...accountingQuestions[topic]);
    }
  });

  // 셔플 후 count개 반환
  const shuffled = questions.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
