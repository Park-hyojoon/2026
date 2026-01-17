/**
 * Accounting Tycoon 02_version Core Logic
 */

const gameData = {
    theory: null,
    quiz: null,
    journal: null,
    stats: {
        level: 0,
        money: 0
    }
};

// DOM Elements
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modal-body');
const closeModalBtn = document.getElementById('close-modal');

/**
 * Initialize the game
 */
function init() {
    try {
        // Load All Data from window object (embedded in data.js)
        if (window.ACCOUNTING_GAME_DATA) {
            gameData.theory = window.ACCOUNTING_GAME_DATA.theory;
            gameData.quiz = window.ACCOUNTING_GAME_DATA.quiz;
            gameData.journal = window.ACCOUNTING_GAME_DATA.journal;

            console.log("Game Data Loaded from window.ACCOUNTING_GAME_DATA:", gameData);
            setupEventListeners();
        } else {
            throw new Error("ACCOUNTING_GAME_DATA not found. Make sure data.js is loaded.");
        }
    } catch (err) {
        console.error("Critical error loading game data:", err);
        alert("데이터를 불러오는 중 오류가 발생했습니다. data.js 파일이 올바른지 확인해주세요.");
    }
}

/**
 * Setup Event Listeners
 */
function setupEventListeners() {
    // Hitboxes
    document.getElementById('hitbox-theory').addEventListener('click', () => showContent('theory'));
    document.getElementById('hitbox-quiz').addEventListener('click', () => showContent('quiz'));
    document.getElementById('hitbox-journal').addEventListener('click', () => showContent('journal'));

    // Modal
    closeModalBtn.addEventListener('click', () => modal.classList.add('hidden'));
}

/**
 * Show Content in Modal
 * @param {string} type 
 */
function showContent(type) {
    modal.classList.remove('hidden');
    modalBody.innerHTML = ''; // Clear previous content

    const data = gameData[type];
    if (!data) return;

    let html = `<h2>${data.title}</h2><hr style="margin:20px 0; opacity:0.3;">`;

    if (type === 'theory') {
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
    } else if (type === 'quiz') {
        data.questions.forEach((q, idx) => {
            html += `
                <div class="quiz-item">
                    <p><strong>Q${idx + 1}. ${q.question}</strong></p>
                    <div class="options-grid">
                        ${q.options.map(opt => `<button class="opt-btn" onclick="checkAnswer('${type}', ${idx}, '${opt}')">${opt}</button>`).join('')}
                    </div>
                    <div id="feedback-${type}-${idx}" class="feedback hidden"></div>
                </div>
            `;
        });
    } else if (type === 'journal') {
        data.practice.forEach((p, idx) => {
            html += `
                <div class="journal-item">
                    <p><strong>거래 ${idx + 1}: ${p.scenario}</strong></p>
                    <div id="journal-input-${idx}">
                        <input type="text" placeholder="차변 계정" id="db-acc-${idx}"> <input type="number" placeholder="금액" id="db-amt-${idx}"><br>
                        <input type="text" placeholder="대변 계정" id="cr-acc-${idx}"> <input type="number" placeholder="금액" id="cr-amt-${idx}">
                        <button onclick="checkJournal(${idx})">기록하기</button>
                    </div>
                    <div id="feedback-journal-${idx}" class="feedback hidden"></div>
                </div>
            `;
        });
    }

    modalBody.innerHTML = html;
}

/**
 * Answer Checking Logic
 */
window.checkAnswer = (type, qIdx, selected) => {
    const q = gameData[type].questions[qIdx];
    const feedback = document.getElementById(`feedback-${type}-${qIdx}`);
    feedback.classList.remove('hidden');

    if (selected === q.answer) {
        feedback.innerHTML = `✅ 정답! ${q.explanation}`;
        feedback.style.color = "#4caf50";
        addStats(100, 10); // Reward
    } else {
        feedback.innerHTML = `❌ 오답: 다시 생각해보세요.`;
        feedback.style.color = "#f44336";
    }
};

/**
 * Journaling Verification Logic
 */
window.checkJournal = (idx) => {
    const p = gameData.journal.practice[idx];
    const dbAcc = document.getElementById(`db-acc-${idx}`).value.trim();
    const dbAmt = parseInt(document.getElementById(`db-amt-${idx}`).value);
    const crAcc = document.getElementById(`cr-acc-${idx}`).value.trim();
    const crAmt = parseInt(document.getElementById(`cr-amt-${idx}`).value);

    const feedback = document.getElementById(`feedback-journal-${idx}`);
    feedback.classList.remove('hidden');

    const isCorrect =
        dbAcc === p.solution.debit.account &&
        dbAmt === p.solution.debit.amount &&
        crAcc === p.solution.credit.account &&
        crAmt === p.solution.credit.amount;

    if (isCorrect) {
        feedback.innerHTML = `✅ 완벽합니다! 장부 기록이 정확합니다.`;
        feedback.style.color = "#4caf50";
        addStats(500, 50); // Higher reward for journaling
    } else {
        feedback.innerHTML = `❌ 기록이 틀렸습니다. 힌트: ${p.hint}`;
        feedback.style.color = "#f44336";
    }
};

/**
 * Stats Management
 */
function addStats(money, exp) {
    gameData.stats.money += money;
    document.getElementById('val-money').innerText = `$${gameData.stats.money}`;
}



// Start the game
init();
