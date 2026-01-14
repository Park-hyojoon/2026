import React, { useState } from 'react';
import { MessageCircle, Zap, BookOpen, Mic, LineChart, Sparkles, RefreshCw } from 'lucide-react';

export default function EnglishCoach({ data }) {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisDone, setAnalysisDone] = useState(false);

    // Determine feedback based on progress
    const englishGoal = data.weeklyGoals.english;
    const currentEnglish = data.currentWeek.days.reduce((acc, day) => acc + (day.english?.hours || 0), 0);
    const progressRate = (currentEnglish / englishGoal) * 100;

    const runAnalysis = () => {
        setIsAnalyzing(true);
        setTimeout(() => {
            setIsAnalyzing(false);
            setAnalysisDone(true);
        }, 2000);
    };

    const getInsight = () => {
        if (progressRate >= 80) return "학습량이 매우 우수합니다! 특히 스피킹 근육이 잘 형성되고 있어요. 지금처럼 매일 20분씩 쉐도잉을 유지하면 한 달 뒤 원어민과의 대화가 훨씬 부드러워질 거예요.";
        if (progressRate >= 50) return "꾸준히 노력하고 계시네요. 다만, 이번 주엔 스피킹보다 리스닝 비중이 큽니다. 주말에는 'Shadowing Challenge'를 통해 입을 더 열어보는 것을 추천해요.";
        return "학습량이 조금 부족합니다. 영어는 짧게라도 '매일' 하는 것이 중요해요. 오늘 잠들기 전 10분만 팝송 가사를 따라 적어보는 건 어떨까요?";
    };

    const challenges = [
        { icon: Mic, title: "Shadowing Practice", desc: "Repeat after a 2-min TED Talk to mimic intonation.", type: "Speaking" },
        { icon: BookOpen, title: "Vocab Journal", desc: "Write 3 sentences using new expressions from today.", type: "Writing" },
    ];

    return (
        <div className="bg-white rounded-[2rem] p-8 shadow-sm h-full flex flex-col">
            <header className="flex items-center space-x-4 mb-8">
                <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600">
                    <MessageCircle size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900">AI English Coach</h3>
                    <p className="text-sm font-medium text-gray-400">Personalized feedback & insights.</p>
                </div>
            </header>

            {!analysisDone && !isAnalyzing ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="p-6 bg-emerald-50 rounded-full">
                        <LineChart size={48} className="text-emerald-500 opacity-60" />
                    </div>
                    <div>
                        <h4 className="text-xl font-black text-gray-900">학습 패턴 분석</h4>
                        <p className="text-sm text-gray-500 mt-2 font-medium">당신의 이번 주 영어 학습량과 패턴을 분석하여<br />최적의 피드백을 제공합니다.</p>
                    </div>
                    <button
                        onClick={runAnalysis}
                        className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-emerald-200"
                    >
                        <Sparkles size={20} />
                        <span>분석 시작하기</span>
                    </button>
                </div>
            ) : isAnalyzing ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                    <RefreshCw size={40} className="text-emerald-500 animate-spin" />
                    <p className="font-bold text-gray-900">최근 공부 기록을 읽어오는 중...</p>
                </div>
            ) : (
                <div className="space-y-8 flex-1 animate-in fade-in slide-in-from-right-4 duration-500">
                    {/* Insight Card */}
                    <div className="p-6 bg-emerald-50 rounded-3xl border-l-4 border-emerald-500 relative overflow-hidden">
                        <Sparkles className="absolute right-[-10px] top-[-10px] w-20 h-20 text-emerald-500 opacity-5" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2">AI Coaching Insight</p>
                        <p className="text-base font-bold text-emerald-900 leading-relaxed">
                            "{getInsight()}"
                        </p>
                    </div>

                    {/* Challenges */}
                    <div className="space-y-4">
                        <h4 className="flex items-center gap-2 text-sm font-black text-gray-400 uppercase tracking-widest px-1">
                            <Zap size={16} className="text-yellow-500" />
                            Suggested Challenges
                        </h4>
                        <div className="space-y-3">
                            {challenges.map((challenge, idx) => (
                                <div key={idx} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-2xl hover:bg-white border border-transparent hover:border-emerald-100 transition-all cursor-pointer group">
                                    <div className="p-3 bg-white rounded-xl text-gray-400 group-hover:text-emerald-500 group-hover:shadow-md transition-all">
                                        <challenge.icon size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center">
                                            <h5 className="font-bold text-gray-900">{challenge.title}</h5>
                                            <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">{challenge.type}</span>
                                        </div>
                                        <p className="text-sm text-gray-500 font-medium mt-1">{challenge.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={() => setAnalysisDone(false)}
                        className="text-xs font-bold text-gray-400 hover:text-emerald-600 transition-colors mx-auto block"
                    >
                        다시 분석하기
                    </button>
                </div>
            )}
        </div>
    );
}
