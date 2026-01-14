import React from 'react';
import { MessageCircle, Zap, BookOpen, Mic } from 'lucide-react';

export default function EnglishCoach({ data }) {
    // Determine feedback based on progress
    const englishGoal = data.weeklyGoals.english;
    const currentEnglish = data.currentWeek.days.reduce((acc, day) => acc + (day.english?.hours || 0), 0);
    const progressRate = (currentEnglish / englishGoal) * 100;

    let feedback = "";
    let feedbackColor = "";

    if (progressRate >= 80) {
        feedback = "Amazing consistency! You're actively building your speaking muscle.";
        feedbackColor = "text-green-600 bg-green-50";
    } else if (progressRate >= 50) {
        feedback = "Good start! Try to squeeze in one more speaking session this weekend.";
        feedbackColor = "text-orange-600 bg-orange-50";
    } else {
        feedback = "Let's pick up the pace! Even 10 minutes of listening helps.";
        feedbackColor = "text-red-500 bg-red-50";
    }

    const challenges = [
        { icon: Mic, title: "Shadowing Practice", desc: "Repeat after a 2-min TED Talk to mimic intonation." },
        { icon: BookOpen, title: "Vocab Review", desc: "Write 3 sentences using new words learned this week." },
    ];

    return (
        <div className="bg-white rounded-[2rem] p-8 shadow-sm h-full flex flex-col">
            <header className="flex items-center space-x-4 mb-8">
                <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600">
                    <MessageCircle size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900">AI English Coach</h3>
                    <p className="text-sm font-medium text-gray-400">Personalized feedback & challenges.</p>
                </div>
            </header>

            <div className="space-y-8 flex-1">
                {/* 1. Insight Card */}
                <div className={`p-6 rounded-2xl ${feedbackColor} border-l-4 border-current`}>
                    <p className="text-xs font-black uppercase tracking-widest opacity-60 mb-2">Weekly Insight</p>
                    <p className="text-lg font-bold leading-snug">"{feedback}"</p>
                </div>

                {/* 2. Challenges */}
                <div>
                    <h4 className="flex items-center gap-2 text-sm font-black text-gray-400 uppercase tracking-widest mb-4">
                        <Zap size={16} className="text-yellow-500" />
                        Suggested Challenges
                    </h4>
                    <div className="space-y-4">
                        {challenges.map((challenge, idx) => (
                            <div key={idx} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors cursor-pointer group">
                                <div className="p-3 bg-white rounded-xl text-gray-400 group-hover:text-primary group-hover:shadow-md transition-all">
                                    <challenge.icon size={20} />
                                </div>
                                <div>
                                    <h5 className="font-bold text-gray-900">{challenge.title}</h5>
                                    <p className="text-sm text-gray-500 font-medium mt-1">{challenge.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
