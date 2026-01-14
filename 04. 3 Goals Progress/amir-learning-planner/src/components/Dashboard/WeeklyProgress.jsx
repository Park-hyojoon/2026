import React from 'react';
import { TrendingUp, Award } from 'lucide-react';

export default function WeeklyProgress({ weekly, current }) {
    const subjects = [
        { key: 'accounting', name: 'Accounting', emoji: '📊', colors: 'from-purple-500 to-pink-400', shadow: 'shadow-purple-200' },
        { key: 'english', name: 'English Coach', emoji: '🗣️', colors: 'from-emerald-500 to-green-400', shadow: 'shadow-emerald-200' },
        { key: 'ai', name: 'AI Mastery', emoji: '🤖', colors: 'from-blue-500 to-cyan-400', shadow: 'shadow-blue-200' }
    ];

    const calculateActual = (key) => {
        return current.days.reduce((sum, day) => sum + (day[key]?.hours || 0), 0);
    };

    return (
        <div className="bg-white rounded-[2rem] p-8">
            <header className="flex justify-between items-start mb-10">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">📈 주간 진행률</h2>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Consistency is Key</p>
                </div>
                <div className="p-3 bg-primary/5 rounded-2xl text-primary">
                    <TrendingUp size={24} strokeWidth={3} />
                </div>
            </header>

            <div className="space-y-6">
                {subjects.map(subject => {
                    const actual = calculateActual(subject.key);
                    const goal = weekly[subject.key];
                    const percentage = Math.min(100, (actual / goal) * 100);

                    return (
                        <div key={subject.key} className="group">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center space-x-3">
                                    <span className="text-2xl transition-transform duration-500 group-hover:scale-125 group-hover:rotate-12">{subject.emoji}</span>
                                    <span className="text-lg font-black text-gray-800 tracking-tight">{subject.name}</span>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-baseline space-x-1">
                                        <span className="text-xl font-black text-gray-900">{actual.toFixed(1)}</span>
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">/ {goal}h</span>
                                    </div>
                                    <div className="text-[10px] font-black text-primary tracking-widest uppercase mt-0.5">{percentage.toFixed(0)}% Efficiency</div>
                                </div>
                            </div>

                            <div className="relative w-full bg-gray-50 rounded-full h-4 overflow-hidden p-0.5">
                                <div
                                    className={`absolute top-0.5 left-0.5 h-3 rounded-full bg-gradient-to-r ${subject.colors} ${subject.shadow} shadow-lg transition-all duration-1000 ease-out`}
                                    style={{ width: `calc(${percentage}% - 4px)` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
