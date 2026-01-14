import React from 'react';
import { startOfYear, eachDayOfInterval, format } from 'date-fns';

export default function ContributionGraph({ data }) {
    const today = new Date();
    const start = startOfYear(today);
    const days = eachDayOfInterval({ start, end: today });

    const getColor = (date) => {
        const dayStr = format(date, 'yyyy-MM-dd');
        const hash = dayStr.split('').reduce((a, c) => a + c.charCodeAt(0), 0);

        // Using hex colors directly to ensure visibility regardless of Tailwind purge/config
        if (hash % 5 === 0) return '#e2e8f0'; // Gray 200
        if (hash % 5 === 1) return '#bbf7d0'; // Green 200
        if (hash % 5 === 2) return '#86efac'; // Green 300
        if (hash % 5 === 3) return '#4ade80'; // Green 400
        return '#22c55e'; // Green 500
    };

    return (
        <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8">
            <div className="flex items-center space-x-2 mb-6">
                <span className="text-2xl">🌱</span>
                <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">학습 잔디</h2>
            </div>

            <div className="overflow-x-auto pb-4">
                <div className="inline-block min-w-full align-middle">
                    {/* 
            Fixed height is CRITICAL for grid-flow-col + grid-rows-7 to work.
            Each square is 12px + 4px gap = 16px. 16 * 7 = 112px.
          */}
                    <div
                        className="grid grid-rows-7 grid-flow-col gap-1.5"
                        style={{ height: '120px' }}
                    >
                        {days.map(day => (
                            <div
                                key={day.toString()}
                                className="w-3.5 h-3.5 rounded-[3px] transition-all hover:scale-125 hover:z-10 cursor-pointer shadow-sm"
                                style={{ backgroundColor: getColor(day) }}
                                title={`${format(day, 'yyyy-MM-dd')}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center mt-4">
                <p className="text-xs text-gray-400 font-medium">꾸준함이 실력을 만듭니다.</p>
                <div className="flex items-center space-x-2 text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                    <span>Less</span>
                    <div className="flex space-x-1">
                        <div className="w-2.5 h-2.5 bg-gray-200 rounded-sm"></div>
                        <div className="w-2.5 h-2.5 bg-green-200 rounded-sm"></div>
                        <div className="w-2.5 h-2.5 bg-green-300 rounded-sm"></div>
                        <div className="w-2.5 h-2.5 bg-green-400 rounded-sm"></div>
                        <div className="w-2.5 h-2.5 bg-green-500 rounded-sm"></div>
                    </div>
                    <span>More</span>
                </div>
            </div>
        </div>
    );
}
