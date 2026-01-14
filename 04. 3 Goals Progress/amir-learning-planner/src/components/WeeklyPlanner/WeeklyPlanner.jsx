import React, { useState } from 'react';
import DayCard from './DayCard';
import ExamCountdown from './ExamCountdown';
import { Calendar, CalendarDays, CalendarRange } from 'lucide-react';

export default function WeeklyPlanner({ weekData, onUpdate, data }) {
    const [activeView, setActiveView] = useState('weekly'); // weekly, monthly, yearly
    const days = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'];

    const views = [
        { id: 'weekly', label: '주간', icon: Calendar },
        { id: 'monthly', label: '월간', icon: CalendarDays },
        { id: 'yearly', label: '연간', icon: CalendarRange },
    ];

    // 월간 뷰용 데이터 계산
    const getMonthlyStats = () => {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const daysPassed = today.getDate();
        const daysRemaining = daysInMonth - daysPassed;

        // 이번 달 목표 (주간 목표 * 4)
        const monthlyGoals = {
            accounting: (data?.weeklyGoals?.accounting || 8.5) * 4,
            english: (data?.weeklyGoals?.english || 6.5) * 4,
            ai: (data?.weeklyGoals?.ai || 9.5) * 4,
        };

        return { daysInMonth, daysPassed, daysRemaining, monthlyGoals, currentMonth, currentYear };
    };

    // 연간 뷰용 데이터 계산
    const getYearlyStats = () => {
        const today = new Date();
        const currentYear = today.getFullYear();
        const startOfYear = new Date(currentYear, 0, 1);
        const endOfYear = new Date(currentYear, 11, 31);
        const daysPassed = Math.floor((today - startOfYear) / (1000 * 60 * 60 * 24));
        const totalDays = 365;
        const daysRemaining = totalDays - daysPassed;
        const progressPercent = Math.round((daysPassed / totalDays) * 100);

        return { currentYear, daysPassed, daysRemaining, totalDays, progressPercent };
    };

    const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

    return (
        <div className="space-y-6">
            <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">📅 플래너</h2>
                    <p className="text-gray-600">
                        {activeView === 'weekly' && `${weekData.startDate} ~ ${weekData.endDate}`}
                        {activeView === 'monthly' && `${new Date().getFullYear()}년 ${monthNames[new Date().getMonth()]}`}
                        {activeView === 'yearly' && `${new Date().getFullYear()}년`}
                    </p>
                </div>

                {/* View Tabs */}
                <div className="flex bg-gray-100 rounded-xl p-1">
                    {views.map(view => (
                        <button
                            key={view.id}
                            onClick={() => setActiveView(view.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                                activeView === view.id
                                    ? 'bg-white text-primary shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <view.icon size={16} />
                            {view.label}
                        </button>
                    ))}
                </div>
            </header>

            {/* Weekly View */}
            {activeView === 'weekly' && (
                <>
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
                </>
            )}

            {/* Monthly View */}
            {activeView === 'monthly' && (
                <div className="space-y-6">
                    {(() => {
                        const stats = getMonthlyStats();
                        return (
                            <>
                                {/* 시험 D-Day */}
                                {data && <ExamCountdown data={data} />}

                                {/* 월간 진행 상황 */}
                                <div className="bg-white rounded-2xl p-6 shadow-sm">
                                    <h3 className="text-xl font-black text-gray-900 mb-4">📊 이번 달 진행 상황</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                        <div className="bg-gray-50 rounded-xl p-4 text-center">
                                            <p className="text-3xl font-black text-gray-900">{stats.daysPassed}</p>
                                            <p className="text-sm text-gray-500">지난 일수</p>
                                        </div>
                                        <div className="bg-primary/10 rounded-xl p-4 text-center">
                                            <p className="text-3xl font-black text-primary">{stats.daysRemaining}</p>
                                            <p className="text-sm text-gray-500">남은 일수</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-xl p-4 text-center">
                                            <p className="text-3xl font-black text-gray-900">{stats.daysInMonth}</p>
                                            <p className="text-sm text-gray-500">총 일수</p>
                                        </div>
                                    </div>

                                    {/* 월간 목표 */}
                                    <h4 className="text-lg font-bold text-gray-800 mb-3">월간 학습 목표</h4>
                                    <div className="space-y-3">
                                        {[
                                            { key: 'accounting', name: '회계', emoji: '📊', goal: stats.monthlyGoals.accounting },
                                            { key: 'english', name: '영어', emoji: '🗣️', goal: stats.monthlyGoals.english },
                                            { key: 'ai', name: 'AI', emoji: '🤖', goal: stats.monthlyGoals.ai },
                                        ].map(item => (
                                            <div key={item.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                                <span className="font-bold text-gray-700">{item.emoji} {item.name}</span>
                                                <span className="font-black text-primary">{item.goal}시간</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        );
                    })()}
                </div>
            )}

            {/* Yearly View */}
            {activeView === 'yearly' && (
                <div className="space-y-6">
                    {(() => {
                        const stats = getYearlyStats();
                        return (
                            <>
                                {/* 시험 D-Day */}
                                {data && <ExamCountdown data={data} />}

                                {/* 연간 진행 상황 */}
                                <div className="bg-white rounded-2xl p-6 shadow-sm">
                                    <h3 className="text-xl font-black text-gray-900 mb-4">📈 {stats.currentYear}년 진행 상황</h3>

                                    {/* Progress Bar */}
                                    <div className="mb-6">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="font-bold text-gray-600">{stats.progressPercent}% 완료</span>
                                            <span className="text-gray-400">{stats.daysRemaining}일 남음</span>
                                        </div>
                                        <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full transition-all duration-500"
                                                style={{ width: `${stats.progressPercent}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-gray-50 rounded-xl p-4 text-center">
                                            <p className="text-3xl font-black text-gray-900">{stats.daysPassed}</p>
                                            <p className="text-sm text-gray-500">지난 일수</p>
                                        </div>
                                        <div className="bg-primary/10 rounded-xl p-4 text-center">
                                            <p className="text-3xl font-black text-primary">{stats.daysRemaining}</p>
                                            <p className="text-sm text-gray-500">남은 일수</p>
                                        </div>
                                        <div className="bg-green-50 rounded-xl p-4 text-center">
                                            <p className="text-3xl font-black text-green-600">{Math.ceil(stats.daysRemaining / 7)}</p>
                                            <p className="text-sm text-gray-500">남은 주</p>
                                        </div>
                                    </div>
                                </div>

                                {/* 연간 목표 요약 */}
                                <div className="bg-white rounded-2xl p-6 shadow-sm">
                                    <h3 className="text-xl font-black text-gray-900 mb-4">🎯 연간 목표</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-4 bg-indigo-50 rounded-xl">
                                            <h4 className="font-bold text-indigo-700 mb-2">📊 전산회계</h4>
                                            <ul className="text-sm text-gray-600 space-y-1">
                                                <li>• 전산회계 2급: {data?.accounting?.level2?.examDate || '날짜 미설정'}</li>
                                                <li>• 전산회계 1급: {data?.accounting?.level1?.examDate || '날짜 미설정'}</li>
                                            </ul>
                                        </div>
                                        <div className="p-4 bg-emerald-50 rounded-xl">
                                            <h4 className="font-bold text-emerald-700 mb-2">🗣️ 영어</h4>
                                            <ul className="text-sm text-gray-600 space-y-1">
                                                <li>• 주당 목표: {data?.weeklyGoals?.english || 6.5}시간</li>
                                                <li>• Target Phrases 학습</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </>
                        );
                    })()}
                </div>
            )}
        </div>
    );
}
