import React from 'react';
import { Flag, Trophy, Star } from 'lucide-react';

export default function YearlyGoalGraph({ data }) {
    // 2026 Total Goal Hours Calculation (Mock logic for now)
    // Assuming 1 year = 52 weeks
    const weeksInYear = 52;
    const totalGoalHours = (data.weeklyGoals.ai + data.weeklyGoals.accounting + data.weeklyGoals.english) * weeksInYear;

    // Simulate current progress (mock data since we don't have full history yet)
    // In a real app, this would be sum of all historical logs
    const currentTotalHours = 45; // Just an example value

    const percentage = Math.min(100, (currentTotalHours / totalGoalHours) * 100);

    return (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-200 mb-10 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-10 -translate-y-10">
                <Trophy size={180} />
            </div>

            <div className="relative z-10">
                <div className="w-full bg-black/10 rounded-full h-4 p-1 backdrop-blur-sm">
                    <div
                        className="h-2 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)] transition-all duration-1000 ease-out"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
