import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

export default function DayCard({ dayName, data, isSunday, onUpdate, lang = 'ko' }) {
    const subjects = [
        { key: 'accounting', name: lang === 'en' ? 'Accounting' : '회계', emoji: '📊', duration: '1.5h' },
        { key: 'english', name: lang === 'en' ? 'English' : '영어', emoji: '🗣️', duration: '1h' },
        { key: 'ai', name: 'AI', emoji: '🤖', duration: '1.5h' }
    ];

    const handleToggle = (key) => {
        const hours = { ai: 1.5, accounting: 1.5, english: 1 };
        const isCompleted = !data[key].completed;
        onUpdate({
            ...data,
            [key]: {
                completed: isCompleted,
                hours: isCompleted ? hours[key] : 0
            }
        });
    };

    if (isSunday) {
        return (
            <div className="bg-primary/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-2">
                <span className="text-3xl">🌴</span>
                <h3 className="text-lg font-bold text-primary">{dayName}</h3>
                <p className="text-sm text-gray-600 font-medium">
                    {lang === 'en' ? 'Full Rest' : '완전한 휴식'}
                </p>
                <p className="text-xs text-gray-400">
                    {lang === 'en' ? 'Family Time, Jogging, Review' : '가족 시간, 조깅, 회고 작성'}
                </p>
            </div>
        );
    }

    const allDone = subjects.every(s => data[s.key].completed);

    return (
        <div className={`rounded-2xl p-5 transition-all duration-300 ${allDone ? 'bg-green-50 shadow-sm' : 'bg-white shadow-sm hover:shadow-md'
            }`}>
            <h3 className="text-lg font-bold text-gray-800 mb-4">{dayName}</h3>
            <div className="space-y-3">
                {subjects.map(subject => (
                    <div
                        key={subject.key}
                        onClick={() => handleToggle(subject.key)}
                        className="flex items-center space-x-3 cursor-pointer group"
                    >
                        <div className={`transition-colors ${data[subject.key].completed ? 'text-success' : 'text-gray-300 group-hover:text-primary/50'}`}>
                            {data[subject.key].completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                        </div>
                        <span className={`text-sm font-medium ${data[subject.key].completed ? 'text-success line-through' : 'text-gray-600'}`}>
                            {subject.emoji} {subject.name} ({subject.duration})
                        </span>
                    </div>
                ))}
            </div>
            {allDone && (
                <div className="mt-4 text-center">
                    <span className="text-[10px] font-black text-success tracking-widest uppercase">Perfect Day</span>
                </div>
            )}
        </div>
    );
}
