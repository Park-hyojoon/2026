import React from 'react';
import AccountingQuiz from './AccountingQuiz';
import EnglishCoach from './EnglishCoach';

export default function AIHub({ data, onSavePhrase }) {
    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="text-center md:text-left">
                <h2 className="text-4xl font-black text-gray-900 tracking-tighter">AI Learning Hub</h2>
                <p className="text-gray-400 font-bold mt-2">당신의 학습 데이터를 분석하여 맞춤형 코칭을 제공합니다.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-auto lg:h-[600px]">
                {/* Left: Accounting Agent */}
                <AccountingQuiz data={data} />

                {/* Right: English Coach */}
                <EnglishCoach data={data} onSavePhrase={onSavePhrase} />
            </div>
        </div>
    );
}
