import React from 'react';
import { Calendar, Clock, Target, TrendingUp } from 'lucide-react';

export default function ExamCountdown({ data }) {
    const exams = [
        {
            name: '전산회계 2급',
            date: data.accounting?.level2?.examDate,
            color: 'indigo',
            targetHours: 100, // 목표 학습 시간
        },
        {
            name: '전산회계 1급',
            date: data.accounting?.level1?.examDate,
            color: 'purple',
            targetHours: 150,
        }
    ];

    // 총 학습 시간 계산 (현재 주 기준)
    const totalStudiedHours = data.currentWeek?.days?.reduce((acc, day) => {
        return acc + (day.accounting?.hours || 0);
    }, 0) || 0;

    const calculateDaysLeft = (dateStr) => {
        if (!dateStr) return null;
        const examDate = new Date(dateStr);
        const today = new Date();
        const diffTime = examDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const calculateWeeksLeft = (days) => {
        if (!days) return null;
        return Math.ceil(days / 7);
    };

    return (
        <div className="space-y-6">
            <header className="mb-6">
                <h3 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                    <Target className="text-red-500" size={24} />
                    시험 D-Day
                </h3>
                <p className="text-gray-500 text-sm mt-1">목표까지 남은 시간을 확인하세요</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {exams.map((exam, idx) => {
                    const daysLeft = calculateDaysLeft(exam.date);
                    const weeksLeft = calculateWeeksLeft(daysLeft);
                    const isUrgent = daysLeft && daysLeft <= 30;
                    const isPast = daysLeft && daysLeft < 0;

                    return (
                        <div
                            key={idx}
                            className={`rounded-2xl p-6 ${
                                isPast
                                    ? 'bg-gray-100'
                                    : isUrgent
                                        ? 'bg-red-50 border-2 border-red-200'
                                        : `bg-${exam.color}-50`
                            }`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="text-lg font-black text-gray-900">{exam.name}</h4>
                                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                        <Calendar size={14} />
                                        {exam.date || '날짜 미설정'}
                                    </p>
                                </div>
                                {daysLeft !== null && !isPast && (
                                    <div className={`text-right ${isUrgent ? 'text-red-600' : `text-${exam.color}-600`}`}>
                                        <p className="text-4xl font-black">D-{daysLeft}</p>
                                        <p className="text-xs font-bold opacity-70">{weeksLeft}주 남음</p>
                                    </div>
                                )}
                                {isPast && (
                                    <div className="text-gray-400 text-right">
                                        <p className="text-2xl font-black">완료</p>
                                    </div>
                                )}
                            </div>

                            {!isPast && (
                                <div className="space-y-3 pt-4 border-t border-gray-200">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 flex items-center gap-1">
                                            <Clock size={14} />
                                            주당 필요 학습
                                        </span>
                                        <span className="font-bold text-gray-900">
                                            {weeksLeft ? Math.ceil(exam.targetHours / weeksLeft) : '-'}시간
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 flex items-center gap-1">
                                            <TrendingUp size={14} />
                                            이번 주 학습
                                        </span>
                                        <span className="font-bold text-gray-900">
                                            {totalStudiedHours.toFixed(1)}시간
                                        </span>
                                    </div>
                                    {isUrgent && (
                                        <div className="mt-3 p-3 bg-red-100 rounded-xl">
                                            <p className="text-xs font-bold text-red-700">
                                                시험이 한 달 이내입니다! 집중하세요!
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
