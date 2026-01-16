
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
    gameState.questions = [
        {
            "id": 1,
            "type": "theory",
            "question": "다음 중 회계상 '현금'으로 처리하지 않는 것은?",
            "options": ["동전 (주화)", "타인발행 당좌수표", "우표", "자기앞수표"],
            "answer": 2,
            "explanation": "우표는 '현금'이 아니라 '통신비'라는 비용으로 처리해야 합니다. 우표가 돈은 아니니까요!"
        },
        {
            "id": 2,
            "type": "calc",
            "question": "쓰레기통에서 다음 항목들을 발견했습니다. 회계상 '현금'은 총 얼마일까요?\n- 지폐: 200,000원\n- 거래처 발행 수표: 450,000원\n- 동전: 50,000원",
            "options": ["250,000원", "650,000원", "700,000원", "200,000원"],
            "answer": 2,
            "explanation": "정답: 700,000원\n지폐(20만) + 수표(45만) + 동전(5만) = 70만원.\n남이 발행한 수표(타인발행수표)는 언제든 돈으로 바꿀 수 있어서 현금입니다!"
        },
        {
            "id": 3,
            "type": "journal",
            "question": "거래처에 상품(붕어빵)을 1,000원에 팔고 대금은 '현금'으로 받았습니다. 올바른 분개는?",
            "options": [
                "(차) 현금 1,000   /   (대) 당좌예금 1,000",
                "(차) 현금 1,000   /   (대) 상품매출 1,000",
                "(차) 상품매출 1,000   /   (대) 현금 1,000",
                "(차) 현금 1,000   /   (대) 단기차입금 1,000"
            ],
            "answer": 1,
            "explanation": "돈이 들어왔으니 차변에 '현금'! 물건을 팔아서 돈을 벌었으니 대변에 '상품매출'! (자산의 증가 / 수익의 발생)"
        }
    ];


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
