import React, { useState } from 'react';
import { Brain, Calculator, ChevronRight, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

export default function AccountingQuiz({ data }) {
    const [quizState, setQuizState] = useState('idle'); // idle, loading, active, review
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showResult, setShowResult] = useState(false);

    // Mock AI generated questions
    const mockQuestions = [
        {
            id: 1,
            question: "재무상태표의 기본 등식으로 올바른 것은?",
            options: ["자산 + 부채 = 자본", "자산 = 부채 + 자본", "자산 - 자본 = 부채", "자본 = 자산 + 부채"],
            correct: 1,
            explanation: "재무상태표의 기본 등식은 '자산 = 부채 + 자본'입니다. 이는 회계의 가장 기초적인 원리입니다."
        },
        {
            id: 2,
            question: "다음 중 유동자산에 해당하지 않는 것은?",
            options: ["현금", "보통예금", "토지", "외상매출금"],
            correct: 2,
            explanation: "토지는 비유동자산(유형자산)에 해당합니다. 나머지는 모두 유동자산(당좌자산)입니다."
        },
        {
            id: 3,
            question: "회계기간 동안의 경영성과를 나타내는 보고서는?",
            options: ["재무상태표", "손익계산서", "현금흐름표", "자본변동표"],
            correct: 1,
            explanation: "손익계산서(I/S)는 일정 기간 동안 기업의 경영성과(수익과 비용)를 나타내는 재무제표입니다."
        }
    ];

    const startQuiz = () => {
        setQuizState('loading');
        // Simulate AI generation delay
        setTimeout(() => {
            setQuizState('active');
            setCurrentQuestion(0);
            setScore(0);
            setShowResult(false);
            setSelectedAnswer(null);
        }, 1500);
    };

    const handleAnswer = (index) => {
        setSelectedAnswer(index);
        setShowResult(true);
        if (index === mockQuestions[currentQuestion].correct) {
            setScore(s => s + 1);
        }
    };

    const nextQuestion = () => {
        if (currentQuestion < mockQuestions.length - 1) {
            setCurrentQuestion(c => c + 1);
            setSelectedAnswer(null);
            setShowResult(false);
        } else {
            setQuizState('review');
        }
    };

    return (
        <div className="bg-white rounded-[2rem] p-8 shadow-sm h-full flex flex-col">
            <header className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600">
                    <Calculator size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900">AI 회계 튜터</h3>
                    <p className="text-sm font-medium text-gray-400">이번 주 학습 내용을 바탕으로 퀴즈를 생성합니다.</p>
                </div>
            </header>

            <div className="flex-1 flex flex-col justify-center">
                {quizState === 'idle' && (
                    <div className="text-center space-y-6">
                        <div className="w-32 h-32 bg-indigo-50 rounded-full mx-auto flex items-center justify-center">
                            <Brain size={64} className="text-indigo-500 opacity-50" />
                        </div>
                        <div>
                            <h4 className="text-2xl font-black text-gray-900">준비 되셨나요?</h4>
                            <p className="text-gray-500 mt-2">AI가 학습 이력을 분석하여<br />맞춤형 문제를 출제합니다.</p>
                        </div>
                        <button
                            onClick={startQuiz}
                            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                        >
                            퀴즈 시작하기
                        </button>
                    </div>
                )}

                {quizState === 'loading' && (
                    <div className="text-center space-y-6 animate-pulse">
                        <div className="w-20 h-20 bg-indigo-100 rounded-full mx-auto flex items-center justify-center animate-spin">
                            <RefreshCw size={32} className="text-indigo-600" />
                        </div>
                        <h4 className="text-xl font-bold text-gray-900">문제를 생성하고 있습니다...</h4>
                    </div>
                )}

                {quizState === 'active' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="flex justify-between items-center text-sm font-bold text-gray-400 uppercase tracking-widest">
                            <span>Question {currentQuestion + 1} / {mockQuestions.length}</span>
                            <span>Score: {score}</span>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-xl font-black text-gray-900 leading-relaxed">
                                {mockQuestions[currentQuestion].question}
                            </h4>

                            <div className="space-y-3">
                                {mockQuestions[currentQuestion].options.map((option, idx) => (
                                    <button
                                        key={idx}
                                        disabled={showResult}
                                        onClick={() => handleAnswer(idx)}
                                        className={`w-full p-4 rounded-xl text-left font-bold transition-all border-2 
                                            ${showResult
                                                ? idx === mockQuestions[currentQuestion].correct
                                                    ? 'border-green-500 bg-green-50 text-green-700'
                                                    : idx === selectedAnswer
                                                        ? 'border-red-500 bg-red-50 text-red-700'
                                                        : 'border-transparent bg-gray-50 text-gray-400'
                                                : 'border-transparent bg-gray-50 hover:bg-indigo-50 hover:border-indigo-200 text-gray-700'
                                            }
                                        `}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span>{option}</span>
                                            {showResult && idx === mockQuestions[currentQuestion].correct && <CheckCircle size={20} className="text-green-500" />}
                                            {showResult && idx === selectedAnswer && idx !== mockQuestions[currentQuestion].correct && <XCircle size={20} className="text-red-500" />}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {showResult && (
                            <div className="bg-indigo-50 p-4 rounded-xl space-y-3 animate-in fade-in slide-in-from-bottom-2">
                                <p className="text-sm font-bold text-indigo-900">
                                    <span className="inline-block px-2 py-0.5 bg-indigo-200 rounded text-xs mr-2">해설</span>
                                    {mockQuestions[currentQuestion].explanation}
                                </p>
                                <button
                                    onClick={nextQuestion}
                                    className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700"
                                >
                                    {currentQuestion < mockQuestions.length - 1 ? '다음 문제' : '결과 보기'}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {quizState === 'review' && (
                    <div className="text-center space-y-8 animate-in zoom-in duration-300">
                        <div className="inline-block p-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] text-white shadow-xl shadow-indigo-200">
                            <p className="text-sm font-bold opacity-80 uppercase tracking-widest mb-1">Final Score</p>
                            <p className="text-5xl font-black">{score} / {mockQuestions.length}</p>
                        </div>
                        <div>
                            <h4 className="text-2xl font-black text-gray-900">
                                {score === mockQuestions.length ? "완벽합니다! 🎉" : "수고하셨습니다! 💪"}
                            </h4>
                            <p className="text-gray-500 mt-2 font-medium">
                                {score === mockQuestions.length
                                    ? "이번 주 학습 내용을 완벽하게 이해하셨네요."
                                    : "틀린 문제를 다시 한 번 복습해보세요."}
                            </p>
                        </div>
                        <button
                            onClick={startQuiz}
                            className="flex items-center justify-center space-x-2 w-full py-4 bg-gray-100 text-gray-900 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                        >
                            <RefreshCw size={20} />
                            <span>다시 풀기</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
