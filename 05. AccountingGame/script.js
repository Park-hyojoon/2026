
const gameState = {
    money: 0,
    energy: 100, // [NEW] Energy System
    level: 1,    // [NEW] Level (Title)
    unlockedChapters: ["01. 회계 기초"], // [NEW] Unlocked Progress
    currentQuestionIndex: 0,
    questions: []
};

// DOM Elements
const introScreen = document.getElementById('intro-screen');
const gameContainer = document.getElementById('game-container');
const startBtn = document.getElementById('start-btn');
const moneyDisplay = document.getElementById('money-display');
const energyDisplay = document.getElementById('energy-display'); // [NEW]
const levelDisplay = document.getElementById('level-display');   // [NEW]
const questionText = document.getElementById('question-text');
const optionsArea = document.getElementById('options-area');
const explanationArea = document.getElementById('explanation-area');
const feedbackOverlay = document.getElementById('feedback-overlay');
const feedbackText = document.getElementById('feedback-text');


// Initialize Game
document.addEventListener('DOMContentLoaded', () => {
    // Load Data from Parser
    if (window.generatedQuestions && window.generatedQuestions.length > 0) {
        gameState.questions = window.generatedQuestions;
        console.log(`Loaded ${gameState.questions.length} questions from parser.`);
    } else {
        console.warn("No generated questions found. Using default.");
        gameState.questions = [
            { "id": 0, "type": "theory", "question": "데이터 로드 실패. 관리자에게 문의하세요.", "options": ["확인"], "answer": 0, "explanation": "시스템 오류" }
        ];
    }

    // Navigation Buttons
    const btnMap = document.getElementById('btn-map');
    const btnHome = document.getElementById('btn-home');
    if (btnMap) btnMap.onclick = () => switchScreen('city-screen');
    if (btnHome) btnHome.onclick = () => switchScreen('home-screen');

    // Map Locations
    const locOffice = document.getElementById('loc-office');
    const locTailor = document.getElementById('loc-tailor');
    const locDiner = document.getElementById('loc-diner');
    if (locOffice) locOffice.onclick = () => switchScreen('office-screen');
    if (locTailor) locTailor.onclick = () => switchScreen('shop-screen');
    if (locDiner) locDiner.onclick = () => switchScreen('diner-screen'); // [NEW] Open Diner

    // Add Reset Button
    const resetBtn = document.createElement('button');
    resetBtn.textContent = '🔄 RESET DATA';
    resetBtn.style.position = 'fixed';
    resetBtn.style.bottom = '10px';
    resetBtn.style.right = '10px';
    resetBtn.style.opacity = '0.5';
    resetBtn.onclick = () => {
        if (confirm('모든 데이터를 초기화하시겠습니까? (Return to Poverty)')) {
            localStorage.clear();
            location.reload();
        }
    };
    document.body.appendChild(resetBtn);

    // Load Data
    loadGame();

    // Wait for Start Button
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            introScreen.classList.add('hidden');
            gameContainer.classList.remove('hidden');
            startGame();
        });
    } else {
        startGame();
    }
});

/* Persistence */
function saveGame() {
    localStorage.setItem('accGame_save_v2', JSON.stringify({
        money: gameState.money,
        energy: gameState.energy,
        level: gameState.level,
        unlockedChapters: gameState.unlockedChapters
    }));
}

function loadGame() {
    const savedData = localStorage.getItem('accGame_save_v2');
    if (savedData) {
        const parsed = JSON.parse(savedData);
        gameState.money = parsed.money || 0;
        gameState.energy = parsed.energy !== undefined ? parsed.energy : 100;
        gameState.level = parsed.level || 1;
        gameState.unlockedChapters = parsed.unlockedChapters || ["01. 회계 기초"];
    }
}

function startGame() {
    updateStats();
    renderQuestion();
}

function updateStats() {
    if (moneyDisplay) moneyDisplay.textContent = `$${gameState.money.toLocaleString()}`;
    if (energyDisplay) energyDisplay.textContent = `⚡ ${gameState.energy}%`;

    // Update Title based on Level
    const titles = { 1: "JANITOR (청소부)", 2: "INTERN (수습)", 3: "STAFF (정직원)" };
    if (levelDisplay) levelDisplay.textContent = titles[gameState.level] || "CPA (회계사)";

    saveGame();
}

/* Question Logic */
function renderQuestion() {
    // [NEW] Energy Check
    if (gameState.energy <= 0) {
        questionText.textContent = "배가 너무 고파서 글씨가 안 보입니다... (Energy Depleted)";
        optionsArea.innerHTML = "<button class='option-btn' onclick=\"switchScreen('diner-screen')\">🍔 식당으로 기어가기</button>";
        explanationArea.classList.add('hidden');
        return;
    }

    // [NEW] Filter Questions by Unlocked Chapters
    const availableQuestions = gameState.questions.filter(q => {
        // Check if question category starts with any unlocked chapter string
        return gameState.unlockedChapters.some(chap => q.category && q.category.includes(chap));
    });

    if (availableQuestions.length === 0) {
        questionText.textContent = "풀 수 있는 문제가 없습니다. (No Questions Available)";
        return;
    }

    // Pick Random Question from pool
    const randIdx = Math.floor(Math.random() * availableQuestions.length);
    const currentQ = availableQuestions[randIdx];

    // Reset UI
    explanationArea.classList.add('hidden');
    optionsArea.innerHTML = '';

    // Typewriter Effect
    questionText.innerHTML = '<span class="typewriter-cursor"></span>';
    let charIndex = 0;
    const text = currentQ.question;

    function typeChar() {
        if (charIndex < text.length) {
            questionText.textContent = text.substring(0, charIndex + 1);
            questionText.innerHTML += '<span class="typewriter-cursor"></span>';
            charIndex++;
            setTimeout(typeChar, 20);
        } else {
            questionText.innerHTML = text;
            showOptions(currentQ);
        }
    }
    typeChar();
}

function showOptions(currentQ) {
    currentQ.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.textContent = option;
        // Use 1-based index matching for answer checking if data uses 1-4
        button.onclick = () => checkAnswer(index + 1, currentQ.answer, currentQ.explanation);
        optionsArea.appendChild(button);
    });
}

function checkAnswer(selectedIndex, correctIndex, explanation) {
    // Deduct Energy
    gameState.energy = Math.max(0, gameState.energy - 10); // cost 10 energy

    // Disable buttons
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(btn => btn.disabled = true);

    if (selectedIndex === correctIndex) {
        showFeedback("PROFIT!!", true);
        // Reward based on level
        const reward = gameState.level * 100; // Lv1: $100, Lv2: $200
        gameState.money += reward;
    } else {
        showFeedback("AUDIT!!", false);
        // Penalty
        gameState.money = Math.max(0, gameState.money - 50);
    }

    updateStats();

    // Show Explanation
    explanationArea.textContent = explanation;
    explanationArea.classList.remove('hidden');

    // Next Button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'option-btn';
    nextBtn.style.marginTop = '20px';
    nextBtn.style.background = '#4caf50';
    nextBtn.style.color = 'white';
    nextBtn.textContent = 'NEXT TASK >>';
    nextBtn.onclick = () => {
        renderQuestion(); // Load next random question
    };
    explanationArea.appendChild(nextBtn);
}

function showFeedback(text, isSuccess) {
    feedbackText.textContent = text;
    feedbackText.style.color = isSuccess ? '#4caf50' : '#f44336';
    feedbackOverlay.classList.remove('hidden');

    setTimeout(() => {
        feedbackOverlay.classList.add('hidden');
    }, 1000);
}


/* Screen Management */
function switchScreen(screenId) {
    const screens = ['office-screen', 'city-screen', 'shop-screen', 'diner-screen', 'home-screen'];

    screens.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (id === screenId) {
                el.classList.remove('hidden');
            } else {
                el.classList.add('hidden');
            }
        }
    });
}

/* Shop Logic */
function buyItem(item, price) {
    if (gameState.money >= price) {
        if (confirm(`Purchase this item for -$${price}?`)) {

            // Execute Effect
            if (item === 'suit') {
                alert('명품 양복을 샀습니다! (Swag +100)');
            } else if (item === 'coffee') {
                gameState.energy = Math.min(100, gameState.energy + 10);
                gameState.money -= price;
                alert('커피를 마셨습니다. (Energy +10)');
            } else if (item === 'sandwich') {
                gameState.energy = Math.min(100, gameState.energy + 30);
                gameState.money -= price;
                alert('샌드위치를 먹었습니다. (Energy +30)');
            } else if (item === 'textbook_2') {
                if (gameState.level >= 2) {
                    alert("이미 구매한 책입니다.");
                    return;
                }
                gameState.money -= price;
                gameState.level = 2;
                gameState.unlockedChapters.push("01. 유동(당좌자신)_현금 및 현금성자산"); // Unlock Ch.2
                alert('승진했습니다! (Level Up: Intern!)\n이제 [현금 및 현금성자산] 업무를 처리합니다.');
            }

            updateStats();
        }
    } else {
        alert('잔고가 부족합니다! (Not enough cash!)');
    }
}
