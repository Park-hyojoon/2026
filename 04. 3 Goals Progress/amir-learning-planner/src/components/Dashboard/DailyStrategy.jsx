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
        <div className="bg-white border text-gray-900 rounded-[2rem] p-8 shadow-sm mb-6 relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-1000">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                <div>
                    <div className="flex items-center space-x-3 mb-2">
                        <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                            <Target size={20} />
                        </div>
                        <h3 className="text-lg font-black tracking-tight text-gray-900">{strategy.title}</h3>
                    </div>
                    <p className="text-gray-600 font-bold text-sm leading-relaxed">
                        "{strategy.instruction}"
                    </p>
                </div>

                <div className="flex flex-col gap-2 min-w-[300px]">
                    {strategy.points.map((pt, i) => (
                        <div key={i} className="flex items-center space-x-3 bg-gray-50 rounded-xl px-4 py-2.5">
                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                            <span className="text-xs font-bold tracking-tight text-gray-700">{pt}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
