import React from 'react';
import AccountingQuiz from './AccountingQuiz';
import EnglishCoach from './EnglishCoach';
import ProgressTimeline from './ProgressTimeline';
import EnglishTimeline from './EnglishTimeline';
import DailyStrategy from '../Dashboard/DailyStrategy';

export default function AIHub({ data, onSavePhrase }) {
    const lang = data?.user?.language || 'ko';

    return (
        <div className="max-w-[1380px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="text-center md:text-left mb-8">
                <h2 className="text-4xl font-black text-gray-900 tracking-tighter">
                    {lang === 'en' ? 'AI Learning Hub' : 'AI 학습 허브'}
                </h2>
                <p className="text-gray-400 font-bold mt-2">
                    {lang === 'en'
                        ? 'Analyze your learning data and provide customized coaching.'
                        : '당신의 학습 데이터를 분석하여 맞춤형 코칭을 제공합니다.'}
                </p>
            </header>

            {/* Daily Strategy Section */}
            {data.user.showStrategy && (
                <div className="mb-8">
                    <DailyStrategy data={data} />
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <AccountingQuiz data={data} />
                <EnglishCoach data={data} onSavePhrase={onSavePhrase} />

                <ProgressTimeline data={data} />
                <EnglishTimeline data={data} />
            </div>
        </div>
    );
}
