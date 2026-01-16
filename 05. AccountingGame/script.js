
const gameState = {
    money: 0,
    currentQuestionIndex: 0,
    questions: []
};

// DOM Elements
const introScreen = document.getElementById('intro-screen');
const gameContainer = document.getElementById('game-container');
const startBtn = document.getElementById('start-btn');
const moneyDisplay = document.getElementById('money-display');
const questionText = document.getElementById('question-text');
const optionsArea = document.getElementById('options-area');
const explanationArea = document.getElementById('explanation-area');
const feedbackOverlay = document.getElementById('feedback-overlay');
const feedbackText = document.getElementById('feedback-text');


// Initialize Game
document.addEventListener('DOMContentLoaded', () => {
    // [FIX] Security Clearance: Data embedded directly to bypass browser restrictions
    // [FIX] Load Data from Parser
    if (window.generatedQuestions && window.generatedQuestions.length > 0) {
        gameState.questions = window.generatedQuestions;
        console.log(`Loaded ${gameState.questions.length} questions from parser.`);
    } else {
        // Fallback or Alert
        console.warn("No generated questions found. Using default.");
        gameState.questions = [
            {
                "id": 0,
                "type": "theory",
                "question": "데이터를 불러오지 못했습니다. 'python data_parser.py'를 실행했는지 확인하세요.",
                "options": ["확인", "취소", "재시도", "문의"],
                "answer": 0,
                "explanation": "00.Data 폴더에 텍스트 파일이 있는지 확인해주세요."
            }
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
    if (locDiner) locDiner.onclick = () => alert('준비 중입니다! (Coming Soon)');

    // Add Reset Button for debugging/testing
    const resetBtn = document.createElement('button');
    resetBtn.textContent = '🔄 RESET DATA';
    resetBtn.style.position = 'fixed';
    resetBtn.style.bottom = '10px';
    resetBtn.style.right = '10px';
    resetBtn.style.opacity = '0.5';
    resetBtn.onclick = () => {
        if (confirm('모든 데이터를 초기화하시겠습니까?')) {
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
            if (gameState.currentQuestionIndex === 0) {
                startGame();
            } else {
                // Resume
                updateStats();
                renderQuestion();
            }
        });
    } else {
        startGame();
    }
});

/* Persistence */
function saveGame() {
    localStorage.setItem('accGame_save', JSON.stringify({
        money: gameState.money,
        currentQuestionIndex: gameState.currentQuestionIndex
    }));
}

function loadGame() {
    const savedData = localStorage.getItem('accGame_save');
    if (savedData) {
        const parsed = JSON.parse(savedData);
        gameState.money = parsed.money;
        gameState.currentQuestionIndex = parsed.currentQuestionIndex;
    }
}

/* 
async function loadQuestions() {
    try {
        const response = await fetch('data/questions.json');
        const data = await response.json();
        gameState.questions = data;
        startGame();
    } catch (error) {
        console.error('Error loading questions:', error);
        questionText.textContent = "Error: 서류를 찾을 수 없습니다. (questions.json)";
    }
}
*/

function startGame() {
    // If loading for the first time
    if (!localStorage.getItem('accGame_save')) {
        gameState.money = 0;
        gameState.currentQuestionIndex = 0;
    }
    updateStats();
    renderQuestion();
}

function updateStats() {
    moneyDisplay.textContent = `$${gameState.money.toLocaleString()}`;
    saveGame(); // Auto-save on stat update
}

function showOptions(currentQ) {
    // Create Buttons
    currentQ.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.textContent = option;
        button.onclick = () => checkAnswer(index, currentQ.answer, currentQ.explanation);
        optionsArea.appendChild(button);
    });
}

function renderQuestion() {
    if (gameState.currentQuestionIndex >= gameState.questions.length) {
        questionText.textContent = "오늘의 업무 끝! (All Tasks Completed)";
        optionsArea.innerHTML = "<h3>정산 완료. 퇴근하십시오.</h3>";
        explanationArea.classList.add('hidden');
        return;
    }

    const currentQ = gameState.questions[gameState.currentQuestionIndex];

    // Reset UI
    explanationArea.classList.add('hidden');
    optionsArea.innerHTML = '';

    // Typewriter Effect
    questionText.innerHTML = '<span class="typewriter-cursor"></span>';
    let charIndex = 0;
    const text = `Q${gameState.currentQuestionIndex + 1}. ${currentQ.question}`;

    function typeChar() {
        if (charIndex < text.length) {
            questionText.textContent = text.substring(0, charIndex + 1);
            questionText.innerHTML += '<span class="typewriter-cursor"></span>';
            charIndex++;
            setTimeout(typeChar, 30); // Typing speed
        } else {
            // Remove cursor after typing
            questionText.innerHTML = text;
            showOptions(currentQ);
        }
    }
    typeChar();
}

function checkAnswer(selectedIndex, correctIndex, explanation) {
    // Disable all buttons
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(btn => btn.disabled = true);

    if (selectedIndex === correctIndex) {
        // Correct
        showFeedback("PROFIT!!", true);
        gameState.money += 1000;
    } else {
        // Wrong
        showFeedback("AUDIT!!", false);
        gameState.money -= 500; // Penalty
    }

    updateStats();

    // Show Explanation
    explanationArea.textContent = explanation;
    explanationArea.classList.remove('hidden');

    // Next Question Button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'option-btn';
    nextBtn.style.marginTop = '20px';
    nextBtn.style.background = '#4caf50';
    nextBtn.style.color = 'white';
    nextBtn.textContent = 'NEXT FILE >>';
    nextBtn.onclick = nextQuestion;
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

function nextQuestion() {
    gameState.currentQuestionIndex++;
    if (gameState.currentQuestionIndex >= gameState.questions.length) {
        // Game Over / Win
        questionText.textContent = "오늘의 업무 끝! (All Tasks Completed)";
        optionsArea.innerHTML = "<h3>정산 완료. 퇴근하십시오.</h3>";
        explanationArea.classList.add('hidden');
    } else {
        renderQuestion();
    }
}

/* Screen Management */
function switchScreen(screenId) {
    const screens = ['office-screen', 'city-screen', 'shop-screen', 'home-screen'];

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
        if (confirm(`'${item}'을(를) 구매하시겠습니까? (-$${price})`)) {
            gameState.money -= price;
            updateStats();
            alert('구매 완료! (Purchased!)');
            // Effect logic here (e.g. change outfit)
        }
    } else {
        alert('잔고가 부족합니다! (Not enough cash!)');
    }
}
