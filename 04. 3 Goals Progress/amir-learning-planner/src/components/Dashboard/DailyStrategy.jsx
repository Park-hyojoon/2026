import React from 'react';
import { Target, Zap, Rocket, ChevronRight } from 'lucide-react';

export default function DailyStrategy({ data }) {
    const lang = data?.user?.language || 'ko';

    // Simulated dynamic strategy based on study data
    const getStrategy = () => {
        const accountingProgress = data.currentWeek.days[0].accounting.hours;
        if (accountingProgress === 0) {
            return {
                title: lang === 'en' ? "Today's Key Strategy: 'Back to Basics'" : "오늘의 핵심 전략: '기초 다지기'",
                instruction: lang === 'en'
                    ? "You finished the accounting concepts yesterday. Today's priority is solving 3 past exam questions."
                    : "어제 회계 원리 개념을 마무리하셨네요. 오늘은 관련 기출문제 3개를 풀면서 실전 감각을 익히는 것이 우선순위입니다.",
                points: lang === 'en'
                    ? ["Review Accounting Cycle", "Solve Exam Q1-Q3", "Organize Error Notes"]
                    : ["회계 순환 과정 복습", "기출문제 1~3번 풀이", "오답 노트 정리"],
                icon: Rocket,
                color: "from-blue-600 to-indigo-500"
            };
        }
        return {
            title: lang === 'en' ? "Maximize Efficiency Strategy" : "공부 효율 극대화 전략",
            instruction: lang === 'en'
                ? "Your accounting progress is excellent! Let's focus more on English today."
                : "현재 회계 공부 진도가 아주 좋습니다! 영어를 조금 더 보강하여 밸런스를 맞추는 날로 정해볼까요?",
            points: lang === 'en'
                ? ["Speak 3 Key Phrases", "Deep Dive Accounting", "Log AI Study"]
                : ["영어 핵심 구문 3번 말하기", "회계 심화 문제풀이", "AI 학습 로그 남기기"],
            icon: Zap,
            color: "from-purple-600 to-pink-500"
        };
    };

    const strategy = getStrategy();

    return (
        <div className={`bg-gradient-to-r ${strategy.color} rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-100 mb-10 relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-1000`}>
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-10 -translate-y-10">
                <strategy.icon size={200} />
            </div>

            <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                        <Target size={20} />
                    </div>
                    <h3 className="text-xl font-black tracking-tight">{strategy.title}</h3>
                </div>

                <p className="text-white/90 font-bold text-lg mb-6 leading-relaxed max-w-2xl">
                    "{strategy.instruction}"
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {strategy.points.map((pt, i) => (
                        <div key={i} className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 hover:bg-white/20 transition-all cursor-pointer group">
                            <div className="w-1.5 h-1.5 bg-white rounded-full group-hover:scale-150 transition-transform" />
                            <span className="text-sm font-black tracking-tight">{pt}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
