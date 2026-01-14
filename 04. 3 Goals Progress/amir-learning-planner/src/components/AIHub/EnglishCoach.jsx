import React, { useState } from 'react';
import { MessageCircle, Zap, BookOpen, Mic, LineChart, Sparkles, RefreshCw, Send, Quote } from 'lucide-react';

export default function EnglishCoach({ data }) {
    const [view, setView] = useState('dashboard'); // dashboard, chat
    const [targetPhrases, setTargetPhrases] = useState([]);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [newPhraseInput, setNewPhraseInput] = useState("");

    // --- Mock Data & Logic ---
    const englishGoal = data.weeklyGoals.english;
    const currentEnglish = data.currentWeek.days.reduce((acc, day) => acc + (day.english?.hours || 0), 0);
    const progressRate = (currentEnglish / englishGoal) * 100;

    const startSession = (phrases) => {
        setTargetPhrases(phrases);
        setView('chat');
        setMessages([
            { role: 'ai', text: `Hi Amir! Let's practice using: "${phrases.join(', ')}". I'll ask questions to help you use them naturally. Ready?` }
        ]);
    };

    const handleSendMessage = () => {
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput("");

        // Simple mock AI response logic to simulate "Elicitation"
        setTimeout(() => {
            let aiResponse = "That's interesting! Tell me more.";

            // Very basic keyword detection simulation
            if (targetPhrases.some(p => userMsg.includes(p))) {
                aiResponse = "Great usage! You nailed that phrase. What about the next one?";
            } else {
                if (targetPhrases[0] === 'kick off') aiResponse = "So, when do you plan to start the new project?";
                else aiResponse = "Can you try using our target phrase in your next sentence?";
            }

            setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
        }, 1000);
    };

    // --- Render ---
    if (view === 'chat') {
        return (
            <div className="bg-white rounded-[2rem] p-6 shadow-sm h-full flex flex-col">
                <header className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600">
                            <Mic size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Live Practice</h3>
                            <p className="text-xs text-emerald-600 font-bold">Target: {targetPhrases.join(', ')}</p>
                        </div>
                    </div>
                    <button onClick={() => setView('dashboard')} className="text-xs font-bold text-gray-400 hover:text-gray-600">Exit</button>
                </header>

                <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1 custom-scrollbar">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-2xl text-sm font-medium ${msg.role === 'user'
                                    ? 'bg-emerald-500 text-white rounded-br-none'
                                    : 'bg-gray-100 text-gray-800 rounded-bl-none'
                                }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type your answer..."
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                    />
                    <button
                        onClick={handleSendMessage}
                        className="p-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-200"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[2rem] p-8 shadow-sm h-full flex flex-col">
            <header className="flex items-center space-x-4 mb-8">
                <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600">
                    <MessageCircle size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900">AI English Coach</h3>
                    <p className="text-sm font-medium text-gray-400">Target Expression Training</p>
                </div>
            </header>

            <div className="flex-1 space-y-6">
                {/* Input Target Phrases */}
                <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center space-x-2 text-emerald-700 mb-2">
                        <Quote size={18} />
                        <h4 className="font-black text-sm uppercase tracking-wider">Golden Phrases</h4>
                    </div>
                    <p className="text-sm text-gray-500 font-medium">연습하고 싶은 핵심 표현을 입력하세요.</p>

                    <div className="flex space-x-2">
                        <input
                            type="text"
                            value={newPhraseInput}
                            onChange={(e) => setNewPhraseInput(e.target.value)}
                            placeholder="e.g., kick off, catch up"
                            className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 focus:outline-none focus:border-emerald-500"
                        />
                        <button
                            onClick={() => {
                                if (newPhraseInput) {
                                    startSession([newPhraseInput]);
                                    setNewPhraseInput("");
                                }
                            }}
                            className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-200"
                        >
                            Start
                        </button>
                    </div>
                </div>

                {/* Quick Suggestions */}
                <div>
                    <h4 className="flex items-center gap-2 text-sm font-black text-gray-400 uppercase tracking-widest mb-4 px-1">
                        <Zap size={16} className="text-yellow-500" />
                        Today's Suggestions
                    </h4>
                    <div className="space-y-3">
                        {['kick off', 'touch base', 'look into'].map((phrase, idx) => (
                            <button
                                key={idx}
                                onClick={() => startSession([phrase])}
                                className="w-full flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:border-emerald-200 hover:shadow-md transition-all group"
                            >
                                <span className="font-bold text-gray-700 group-hover:text-emerald-600">{phrase}</span>
                                <Mic size={18} className="text-gray-300 group-hover:text-emerald-500" />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
