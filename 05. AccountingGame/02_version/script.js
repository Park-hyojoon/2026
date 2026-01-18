/**
 * Accounting Tycoon 02_version Core Logic
 * Enhanced with Tutor System, Persistence, and Dynamic Stages.
 */

const gameData = {
    units: [],
    currentUnitIndex: 0,
    theory: null,
    quiz: null,
    journal: null,
    currentSession: {
        type: null,
        questions: [],
        currentIndex: 0,
        score: 0,
        earnedMoney: 0,
        combo: 0
    },
    stats: {
        level: 1,
        exp: 0,
        money: 0,
        rank: "회계 입문자"
    }
};

// DOM Elements
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modal-body');
const closeModalBtn = document.getElementById('close-modal');
const valLevel = document.getElementById('val-level');
const valMoney = document.getElementById('val-money');

/**
 * Initialize the game
 */
function init() {
    try {
        // 1. Data Loading
        if (window.ACCOUNTING_GAME_DATA && window.ACCOUNTING_GAME_DATA.units) {
            gameData.units = window.ACCOUNTING_GAME_DATA.units;
            setUnit(0); // Default to first unit
        } else {
            throw new Error("ACCOUNTING_GAME_DATA not found or invalid format.");
        }

        // 2. Persistence Loading
        loadGame();

        // 3. Setup UI
        updateStatsUI();
        setupEventListeners();
        console.log("Tutor System Initialized:", gameData);
    } catch (err) {
        console.error("Initialization Failed:", err);
        alert("게임을 초기화하는 중 오류가 발생했습니다.");
    }
}

/**
 * Persistence: Load from Local Storage
 */
function loadGame() {
    const saved = localStorage.getItem('accounting_tycoon_save');
    if (saved) {
        const parsed = JSON.parse(saved);
        gameData.stats = { ...gameData.stats, ...parsed };
    }
}

/**
 * Persistence: Save to Local Storage
 */
function saveGame() {
    localStorage.setItem('accounting_tycoon_save', JSON.stringify(gameData.stats));
}

/**
 * UI: Update Top Bar
 */
function updateStatsUI() {
    valLevel.innerText = gameData.stats.level;
    valMoney.innerText = `$${gameData.stats.money.toLocaleString()}`;

    // Update Rank based on Level
    if (gameData.stats.level > 10) gameData.stats.rank = "회계 전문가";
    else if (gameData.stats.level > 5) gameData.stats.rank = "회계 숙련자";

    // Title update if element exists
    const rankEl = document.getElementById('val-rank');
    if (rankEl) rankEl.innerText = gameData.stats.rank;

    // Update Background based on level
    updateBackground();
}

/**
 * UI: Update Room Background based on Level
 */
function updateBackground() {
    const level = gameData.stats.level;
    const bgImg = document.getElementById('room-bg');
    let imgPath = "";

    // Mapping Levels 1-10 to User Backgrounds
    if (level <= 5) {
        // Levels 1-5: my_room01 to my_room05
        imgPath = `../_my_opinion/design_concept/my_room0${level}.png`;
    } else if (level <= 9) {
        // Levels 6-9: my_room6 to my_room9 (Note: No leading zero for these files)
        imgPath = `../_my_opinion/design_concept/my_room${level}.png`;
    } else {
        // Level 10+: my_room10
        imgPath = "../_my_opinion/design_concept/my_room10.png";
    }

    // Direct check to see if the current src is already correct
    // (Using inclusive check because src property returns full URI)
    if (!bgImg.src.includes(imgPath)) {
        console.log(`Upgrading room to Level ${level}: ${imgPath}`);
        bgImg.style.opacity = 0; // Fade out
        setTimeout(() => {
            bgImg.src = imgPath;
            bgImg.style.opacity = 1; // Fade in
        }, 300);
    }
}

/**
 * Event Listeners
 */
function setupEventListeners() {
    document.getElementById('hitbox-theory').addEventListener('click', () => openStageSetup('theory'));
    document.getElementById('hitbox-quiz').addEventListener('click', () => openStageSetup('quiz'));
    document.getElementById('hitbox-journal').addEventListener('click', () => openStageSetup('journal'));
    closeModalBtn.addEventListener('click', () => modal.classList.add('hidden'));
}

/**
 * UI: Set Current Unit
 */
window.setUnit = (index) => {
    gameData.currentUnitIndex = index;
    const unit = gameData.units[index];
    gameData.theory = unit.theory;
    gameData.quiz = unit.quiz;
    gameData.journal = unit.journal;

    // Update Topic Display in Top Bar
    const topicEl = document.getElementById('val-topic');
    if (topicEl) topicEl.innerText = unit.title;

    // If modal is open during setup, refresh it
    if (!modal.classList.contains('hidden')) {
        openStageSetup(gameData.currentSession.type || 'theory');
    }
};

/**
 * Stage Flow: Setup Screen
 */
function openStageSetup(type) {
    gameData.currentSession.type = type;
    modal.classList.remove('hidden');
    modalBody.innerHTML = '';

    const data = gameData[type];
    const totalAvailable = type === 'theory' ? 1 : (type === 'quiz' ? data.questions.length : data.practice.length);

    // Topic Selection UI
    let unitOptions = gameData.units.map((u, i) =>
        `<option value="${i}" ${i === gameData.currentUnitIndex ? 'selected' : ''}>${u.title}</option>`
    ).join('');

    let html = `
        <div class="setup-screen">
            <div class="topic-selector-container">
                <label for="topic-select">📑 학습 주제 선택:</label>
                <select id="topic-select" onchange="setUnit(parseInt(this.value))">
                    ${unitOptions}
                </select>
            </div>
            <hr>
            <h2>${data.title}</h2>
            <p class="tutor-tip">"학습은 꾸준함이 생명입니다. 오늘 몇 가지 과제를 해결해 보시겠습니까?"</p>
            <div class="setup-options">
                ${type === 'theory' ?
            `<button class="start-btn" onclick="startStage('theory', 1)">이론 학습 시작</button>` :
            `
                    <p>문제 수 선택 (최대 ${totalAvailable}개):</p>
                    <div class="count-selector">
                        <button class="count-btn" onclick="startStage('${type}', 1)">1개 (쪽지시험)</button>
                        ${totalAvailable >= 3 ? `<button class="count-btn" onclick="startStage('${type}', 3)">3개 (보통)</button>` : ''}
                        ${totalAvailable >= 5 ? `<button class="count-btn" onclick="startStage('${type}', 5)">5개 (열공)</button>` : ''}
                    </div>
                    `
        }
            </div>
        </div>
    `;
    modalBody.innerHTML = html;
}

/**
 * Stage Flow: Start Stage
 */
window.startStage = (type, count) => {
    const session = gameData.currentSession;
    session.type = type;
    session.currentIndex = 0;
    session.score = 0;
    session.earnedMoney = 0;
    session.combo = 0;

    if (type === 'theory') {
        session.questions = gameData.theory.content;
        renderTheory();
    } else {
        const pool = type === 'quiz' ? gameData.quiz.questions : gameData.journal.practice;
        // Shuffle and Slice
        session.questions = pool.sort(() => 0.5 - Math.random()).slice(0, count);
        renderCurrentQuestion();
    }
};

/**
 * Render Logic: Theory
 */
function renderTheory() {
    const data = gameData.theory;
    let html = `<h2>${data.title}</h2>`;
    data.content.forEach(section => {
        html += `
            <div class="theory-section">
                <h3>${section.heading}</h3>
                <p>${section.text}</p>
                ${section.items ? `<ul>${section.items.map(item => `<li>${item}</li>`).join('')}</ul>` : ''}
                ${section.critical_point ? `<div class="alert">📢 ${section.critical_point}</div>` : ''}
            </div>
        `;
    });
    html += `<button class="start-btn" onclick="finishStage()">학습 완료</button>`;
    modalBody.innerHTML = html;
}

/**
 * Render Logic: Current Question/Practice
 */
function renderCurrentQuestion() {
    const session = gameData.currentSession;
    const q = session.questions[session.currentIndex];
    const type = session.type;

    let html = `
        <div class="progress-bar">문제 ${session.currentIndex + 1} / ${session.questions.length}</div>
        <div class="q-card">
            <div class="difficulty-tag ${q.difficulty}">${q.difficulty.toUpperCase()}</div>
    `;

    if (type === 'quiz') {
        html += `
            <p class="q-text">${q.question.replace(/\n/g, '<br>')}</p>
            <div class="options-grid">
                ${q.options.map(opt => `<button class="opt-btn" onclick="checkAnswer('${opt}')">${opt}</button>`).join('')}
            </div>
        `;
    } else {
        html += `
            <p class="q-text"><strong>거래 상황:</strong><br>${q.scenario}</p>
            <div class="journal-input">
                <div class="input-headers">
                    <span>구분</span><span>계정과목</span><span>금액</span>
                </div>
                <div class="input-row">
                    <span>차변1)</span> <input type="text" placeholder="계정과목" id="db-acc-1"> 
                    <input type="number" placeholder="금액" id="db-amt-1">
                </div>
                ${q.solution.debit.additional ? `
                <div class="input-row">
                    <span>차변2)</span> <input type="text" placeholder="계정과목" id="db-acc-2"> 
                    <input type="number" placeholder="금액" id="db-amt-2">
                </div>
                ` : ''}
                <div class="input-row">
                    <span>대변1)</span> <input type="text" placeholder="계정과목" id="cr-acc-1"> 
                    <input type="number" placeholder="금액" id="cr-amt-1">
                </div>
                ${q.solution.credit.additional ? `
                <div class="input-row">
                    <span>대변2)</span> <input type="text" placeholder="계정과목" id="cr-acc-2"> 
                    <input type="number" placeholder="금액" id="cr-amt-2">
                </div>
                ` : ''}
                <button class="submit-btn" onclick="checkJournal()">장부 기록</button>
            </div>
        `;
    }

    html += `<div id="feedback" class="feedback hidden"></div></div>`;
    modalBody.innerHTML = html;
}

/**
 * Verification: Quiz Answer
 */
window.checkAnswer = (selected) => {
    const session = gameData.currentSession;
    const q = session.questions[session.currentIndex];
    const feedback = document.getElementById('feedback');
    feedback.classList.remove('hidden');

    if (selected === q.answer) {
        processRightAnswer(q);
        feedback.innerHTML = `✅ 정답! (+ $${q.reward})<br><small>${q.explanation}</small>`;
        feedback.className = "feedback correct";
    } else {
        processWrongAnswer();
        feedback.innerHTML = `❌ 오답: ${q.explanation}`;
        feedback.className = "feedback wrong";
    }

    addNextButton();
};

/**
 * Verification: Journal
 */
window.checkJournal = () => {
    const session = gameData.currentSession;
    const q = session.questions[session.currentIndex];

    // Get values
    const dbAcc1 = document.getElementById('db-acc-1').value.trim();
    const dbAmt1 = parseInt(document.getElementById('db-amt-1').value);
    const crAcc1 = document.getElementById('cr-acc-1').value.trim();
    const crAmt1 = parseInt(document.getElementById('cr-amt-1').value);

    const feedback = document.getElementById('feedback');
    feedback.classList.remove('hidden');

    let isCorrect =
        dbAcc1 === q.solution.debit.account &&
        dbAmt1 === q.solution.debit.amount &&
        crAcc1 === q.solution.credit.account &&
        crAmt1 === q.solution.credit.amount;

    // Check additional debit if it exists
    if (q.solution.debit.additional) {
        const dbAcc2 = document.getElementById('db-acc-2').value.trim();
        const dbAmt2 = parseInt(document.getElementById('db-amt-2').value);
        isCorrect = isCorrect &&
            dbAcc2 === q.solution.debit.additional &&
            dbAmt2 === q.solution.debit.additional_amount;
    }

    // Check additional credit if it exists
    if (q.solution.credit.additional) {
        const crAcc2 = document.getElementById('cr-acc-2').value.trim();
        const crAmt2 = parseInt(document.getElementById('cr-amt-2').value);
        isCorrect = isCorrect &&
            crAcc2 === q.solution.credit.additional &&
            crAmt2 === q.solution.credit.additional_amount;
    }

    if (isCorrect) {
        processRightAnswer(q);
        feedback.innerHTML = `✅ 완벽한 분개입니다! (+ $${q.reward})`;
        feedback.className = "feedback correct";
    } else {
        processWrongAnswer();
        feedback.innerHTML = `❌ 틀렸습니다. 힌트: ${q.hint}`;
        feedback.className = "feedback wrong";
    }

    addNextButton();
};

function processRightAnswer(q) {
    const session = gameData.currentSession;
    session.score++;
    session.combo++;

    // Reward with Combo Multiplier
    let bonus = session.combo >= 3 ? 1.2 : 1.0;
    let finalReward = Math.floor(q.reward * bonus);

    session.earnedMoney += finalReward;
    gameData.stats.money += finalReward;
    gameData.stats.exp += 20;

    // Level Up Logic
    if (gameData.stats.exp >= gameData.stats.level * 100) {
        gameData.stats.level++;
        gameData.stats.exp = 0;
    }
}

function processWrongAnswer() {
    gameData.currentSession.combo = 0;
}

function addNextButton() {
    const session = gameData.currentSession;
    const isLast = session.currentIndex === session.questions.length - 1;
    const btnText = isLast ? "결과 보기" : "다음 문제";
    const btnFn = isLast ? "finishStage()" : "nextQuestion()";

    const existingBtn = document.querySelector('.next-btn');
    if (!existingBtn) {
        modalBody.insertAdjacentHTML('beforeend', `<button class="next-btn" onclick="${btnFn}">${btnText}</button>`);
    }
}

window.nextQuestion = () => {
    gameData.currentSession.currentIndex++;
    renderCurrentQuestion();
};

/**
 * Stage Flow: Finish & Report
 */
window.finishStage = () => {
    const session = gameData.currentSession;
    const stats = gameData.stats;
    saveGame();
    updateStatsUI();
    document.getElementById('val-topic').innerText = "오피스 대기 중";

    let tutorComment = "";
    const ratio = session.score / session.questions.length;

    if (session.type === 'theory') {
        tutorComment = "기초가 튼튼해야 실무에서도 흔들리지 않습니다. 고생하셨습니다!";
    } else if (ratio === 1) {
        tutorComment = "대단합니다! 회계 천재 아니신가요? 모든 문제를 완벽하게 해결하셨습니다.";
    } else if (ratio >= 0.6) {
        tutorComment = "좋은 성적입니다. 틀린 부분만 다시 복습하면 완벽해질 것 같군요.";
    } else {
        tutorComment = "아직은 낯선 개념들이 많은 것 같습니다. 이론 학습(Stage 1)을 한 번 더 읽어보시는 건 어떨까요?";
    }

    modalBody.innerHTML = `
        <div class="summary-report">
            <h2>학습 결과 보고서</h2>
            <div class="report-grid">
                <div class="report-item"><span>정답률</span><strong>${session.type === 'theory' ? '완료' : Math.round(ratio * 100) + '%'}</strong></div>
                <div class="report-item"><span>획득 금액</span><strong>$${session.earnedMoney.toLocaleString()}</strong></div>
                <div class="report-item"><span>현재 레벨</span><strong>LV. ${stats.level}</strong></div>
            </div>
            <div class="tutor-feedback">
                <img src="../assets/tutor_icon.png" onerror="this.style.display='none'">
                <p>"${tutorComment}"</p>
            </div>
            <button class="start-btn" onclick="modal.classList.add('hidden')">사무실로 돌아가기</button>
        </div>
    `;
};

// Start the game
init();
