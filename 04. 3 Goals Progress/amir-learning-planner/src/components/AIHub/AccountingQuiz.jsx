import React, { useState, useMemo } from 'react';
import { Brain, Calculator, ChevronRight, CheckCircle, XCircle, RefreshCw, BookOpen } from 'lucide-react';
import { getRecentTopics, getQuestionsForTopics } from '../../utils/questionBank';

export default function AccountingQuiz({ data }) {
    const [quizState, setQuizState] = useState('idle'); // idle, loading, active, review
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [questions, setQuestions] = useState([]);

    // 언어 설정
    const lang = data?.user?.language || 'ko';

    // 최근 학습 범위에서 토픽 추출
    const studyLog = data?.accounting?.studyLog || [];
    const recentTopics = useMemo(() => getRecentTopics(studyLog, 5), [studyLog]);

    // 학습 범위가 없으면 기초 문제 출제
    const hasStudyLog = studyLog.length > 0;

    // 현재 학습 중인 단원 (가장 최근 학습 기록)
    const currentStudyTopic = studyLog.length > 0
        ? studyLog[studyLog.length - 1].topic
        : (lang === 'en' ? 'No study records' : '학습 기록 없음');

    const t = {
        title: lang === 'en' ? 'AI Accounting Tutor' : 'AI 회계 튜터',
        subtitle: lang === 'en' ? 'Generate quizzes based on this week\'s learning content.' : '이번 주 학습 내용을 바탕으로 퀴즈를 생성합니다.',
        currentlyStudying: lang === 'en' ? 'Currently Studying' : '현재 학습 중',
        ready: lang === 'en' ? 'Are you ready?' : '준비 되셨나요?',
        basedOnRecent: lang === 'en' ? 'Quizzes are generated based on your recent study topics.' : '최근 학습 범위를 기반으로 문제를 출제합니다.',
        noStudyLog: lang === 'en' ? 'Please enter your study topics first!' : '학습 범위를 먼저 입력해주세요!',
        whereToInput: lang === 'en' ? 'Dashboard > Accounting > "What did you study?"' : '현황 > 회계 공부 > "무엇을 공부했나요?"',
        startQuiz: lang === 'en' ? 'Start Quiz' : '퀴즈 시작하기',
        generating: lang === 'en' ? 'Generating questions...' : '문제를 생성하고 있습니다...',
        question: lang === 'en' ? 'Question' : '문제',
        score: lang === 'en' ? 'Score' : '점수',
        explanation: lang === 'en' ? 'Explanation' : '해설',
        next: lang === 'en' ? 'Next' : '다음 문제',
        viewResults: lang === 'en' ? 'View Results' : '결과 보기',
        finalScore: lang === 'en' ? 'Final Score' : '최종 점수',
        perfect: lang === 'en' ? 'Perfect! 🎉' : '완벽합니다! 🎉',
        goodJob: lang === 'en' ? 'Good job! 💪' : '수고하셨습니다! 💪',
        perfectMsg: lang === 'en' ? 'You have a perfect understanding of this week\'s content.' : '이번 주 학습 내용을 완벽하게 이해하셨네요.',
        revMsg: lang === 'en' ? 'Try reviewing the questions you missed.' : '틀린 문제를 다시 한 번 복습해보세요.',
        retry: lang === 'en' ? 'Retry' : '다시 풀기'
    };

    const startQuiz = () => {
        setQuizState('loading');
        // 학습 범위 기반 문제 생성
        setTimeout(() => {
            const generatedQuestions = getQuestionsForTopics(recentTopics, 5);
            setQuestions(generatedQuestions);
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
        if (index === questions[currentQuestion].correct) {
            setScore(s => s + 1);
        }
    };

    const nextQuestion = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(c => c + 1);
            setSelectedAnswer(null);
            setShowResult(false);
        } else {
            setQuizState('review');
        }
    };

    return (
        <div className="bg-white rounded-[2rem] p-8 shadow-sm flex flex-col w-[90%] mx-auto h-full" style={{ minHeight: '400px' }}>
            <header className="space-y-3 mb-6">
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600">
                        <Calculator size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">
                            {t.title}
                        </h3>
                        <p className="text-sm font-medium text-gray-400">
                            {t.subtitle}
                        </p>
                    </div>
                </div>
                {/* 현재 학습 단원 표시 */}
                {hasStudyLog && (
                    <div className="bg-indigo-50 rounded-xl p-3 border-l-4 border-indigo-500">
                        <p className="text-xs font-bold text-indigo-600 uppercase tracking-wide mb-1">
                            {t.currentlyStudying}
                        </p>
                        <p className="text-sm font-bold text-indigo-900">{currentStudyTopic}</p>
                    </div>
                )}
            </header>

            <div className="flex-1 flex flex-col justify-center">
                {quizState === 'idle' && (
                    <div className="text-center space-y-6">
                        <div className="w-32 h-32 bg-indigo-50 rounded-full mx-auto flex items-center justify-center">
                            <Brain size={64} className="text-indigo-500 opacity-50" />
                        </div>
                        <div>
                            <h4 className="text-2xl font-black text-gray-900">{t.ready}</h4>
                            {hasStudyLog ? (
                                <div className="mt-3 space-y-2">
                                    <p className="text-gray-500 text-sm">{t.basedOnRecent}</p>
                                    <div className="flex flex-wrap justify-center gap-2 mt-2">
                                        {recentTopics.slice(0, 3).map((topic, idx) => (
                                            <span key={idx} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">
                                                {topic}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500 mt-2">
                                    <span className="text-amber-600 font-bold">{t.noStudyLog}</span><br />
                                    <span className="text-sm">{t.whereToInput}</span>
                                </p>
                            )}
                        </div>
                        <button
                            onClick={startQuiz}
                            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                        >
                            {t.startQuiz}
                        </button>
                    </div>
                )}

                {quizState === 'loading' && (
                    <div className="text-center space-y-6 animate-pulse">
                        <div className="w-20 h-20 bg-indigo-100 rounded-full mx-auto flex items-center justify-center animate-spin">
                            <RefreshCw size={32} className="text-indigo-600" />
                        </div>
                        <h4 className="text-xl font-bold text-gray-900">{t.generating}</h4>
                    </div>
                )}

                {quizState === 'active' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="flex justify-between items-center text-sm font-bold text-gray-400 uppercase tracking-widest">
                            <span>{t.question} {currentQuestion + 1} / {questions.length}</span>
                            <span>{t.score}: {score}</span>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-xl font-black text-gray-900 leading-relaxed">
                                {questions[currentQuestion].question}
                            </h4>

                            <div className="space-y-3">
                                {questions[currentQuestion].options.map((option, idx) => (
                                    <button
                                        key={idx}
                                        disabled={showResult}
                                        onClick={() => handleAnswer(idx)}
                                        className={`w-full p-4 rounded-xl text-left font-bold transition-all border-2 
                                            ${showResult
                                                ? idx === questions[currentQuestion].correct
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
                                            {showResult && idx === questions[currentQuestion].correct && <CheckCircle size={20} className="text-green-500" />}
                                            {showResult && idx === selectedAnswer && idx !== questions[currentQuestion].correct && <XCircle size={20} className="text-red-500" />}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {showResult && (
                            <div className="bg-indigo-50 p-4 rounded-xl space-y-3 animate-in fade-in slide-in-from-bottom-2">
                                <p className="text-sm font-bold text-indigo-900">
                                    <span className="inline-block px-2 py-0.5 bg-indigo-200 rounded text-xs mr-2">{t.explanation}</span>
                                    {questions[currentQuestion].explanation}
                                </p>
                                <button
                                    onClick={nextQuestion}
                                    className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700"
                                >
                                    {currentQuestion < questions.length - 1 ? t.next : t.viewResults}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {quizState === 'review' && (
                    <div className="text-center space-y-8 animate-in zoom-in duration-300">
                        <div className="inline-block p-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] text-white shadow-xl shadow-indigo-200">
                            <p className="text-sm font-bold opacity-80 uppercase tracking-widest mb-1">{t.finalScore}</p>
                            <p className="text-5xl font-black">{score} / {questions.length}</p>
                        </div>
                        <div>
                            <h4 className="text-2xl font-black text-gray-900">
                                {score === questions.length ? t.perfect : t.goodJob}
                            </h4>
                            <p className="text-gray-500 mt-2 font-medium">
                                {score === questions.length
                                    ? t.perfectMsg
                                    : t.revMsg}
                            </p>
                        </div>
                        <button
                            onClick={startQuiz}
                            className="flex items-center justify-center space-x-2 w-full py-4 bg-gray-100 text-gray-900 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                        >
                            <RefreshCw size={20} />
                            <span>{t.retry}</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
