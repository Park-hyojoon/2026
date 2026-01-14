import React from 'react';
import DayCard from './DayCard';

export default function WeeklyPlanner({ weekData, onUpdate }) {
    const days = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'];

    return (
        <div className="space-y-6">
            <header className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800">📅 주간 플래너</h2>
                <p className="text-gray-600">
                    {weekData.startDate} ~ {weekData.endDate}
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {weekData.days.map((dayData, index) => (
                    <DayCard
                        key={index}
                        dayName={days[index]}
                        data={dayData}
                        isSunday={index === 6}
                        onUpdate={(updatedDay) => {
                            const newDays = [...weekData.days];
                            newDays[index] = updatedDay;
                            onUpdate({ ...weekData, days: newDays });
                        }}
                    />
                ))}
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 mt-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">📝 이번 주 회고</h3>
                <textarea
                    className="w-full h-32 p-4 rounded-xl bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:bg-white outline-none transition-all resize-none"
                    placeholder="이번 주 학습에 대한 소감을 적어보세요..."
                    value={weekData.retrospective}
                    onChange={(e) => onUpdate({ ...weekData, retrospective: e.target.value })}
                />
            </div>
        </div>
    );
}
