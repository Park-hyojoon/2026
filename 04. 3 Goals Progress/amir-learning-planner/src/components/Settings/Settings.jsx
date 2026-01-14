import React, { useState } from 'react';
import { Save, User, Clock, Calendar, Hash } from 'lucide-react';

export default function Settings({ data, onUpdate }) {
    const [saved, setSaved] = useState(false);

    const handleChange = (path, value) => {
        onUpdate(path, value);
        setSaved(false);
    };

    const handleSave = () => {
        // Since useLocalStorage persists immediately on change (via onUpdate), this button is mostly visual/UX.
        // We simulate a 'save' action.
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            <header className="mb-8">
                <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Settings</h2>
                <p className="text-gray-400 font-bold mt-2">나만의 학습 목표와 환경을 설정하세요.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* User Profile Section */}
                <section className="bg-white rounded-[2rem] p-8 shadow-sm">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-3 bg-primary/10 rounded-xl text-primary">
                            <User size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">기본 정보</h3>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">이름</label>
                            <input
                                type="text"
                                value={data.user.name}
                                onChange={(e) => handleChange('user.name', e.target.value)}
                                className="w-full bg-gray-50 rounded-xl px-4 py-3 font-bold text-gray-900 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>
                        <div className="pt-2">
                            <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">Language / 언어</label>
                            <select
                                value={data.user.language}
                                onChange={(e) => handleChange('user.language', e.target.value)}
                                className="w-full bg-gray-50 rounded-xl px-4 py-3 font-bold text-gray-900 outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                            >
                                <option value="ko">한국어 (Korean)</option>
                                <option value="en">English (영어)</option>
                            </select>
                        </div>
                        <div className="flex items-center justify-between pt-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-900">전략 가이드 표시</label>
                                <p className="text-xs text-gray-400 font-medium">데스크탑 상단에 일일 학습 전략을 보여줍니다.</p>
                            </div>
                            <button
                                onClick={() => handleChange('user.showStrategy', !data.user.showStrategy)}
                                className={`w-12 h-6 rounded-full transition-colors relative ${data.user.showStrategy ? 'bg-primary' : 'bg-gray-200'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${data.user.showStrategy ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>
                    </div>
                </section>

                {/* Exam Schedule Section */}
                <section className="bg-white rounded-[2rem] p-8 shadow-sm">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-3 bg-purple-100 rounded-xl text-purple-600">
                            <Calendar size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">시험 일정</h3>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">전산회계 2급</label>
                            <input
                                type="date"
                                value={data.accounting.level2.examDate}
                                onChange={(e) => handleChange('accounting.level2.examDate', e.target.value)}
                                className="w-full bg-gray-50 rounded-xl px-4 py-3 font-bold text-gray-900 outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">전산회계 1급</label>
                            <input
                                type="date"
                                value={data.accounting.level1.examDate}
                                onChange={(e) => handleChange('accounting.level1.examDate', e.target.value)}
                                className="w-full bg-gray-50 rounded-xl px-4 py-3 font-bold text-gray-900 outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                            />
                        </div>
                    </div>
                </section>

                {/* Daily Goals Section */}
                <section className="bg-white rounded-[2rem] p-8 shadow-sm">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                            <Clock size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">일일 목표 (시간)</h3>
                    </div>
                    <div className="space-y-6">
                        {Object.entries(data.dailyGoals).map(([key, value]) => (
                            <div key={key}>
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wide">{key}</label>
                                    <span className="text-sm font-black text-blue-600">{value}h</span>
                                </div>
                                <input
                                    type="range"
                                    min="0.5"
                                    max="5"
                                    step="0.5"
                                    value={value}
                                    onChange={(e) => handleChange(`dailyGoals.${key}`, parseFloat(e.target.value))}
                                    className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                />
                            </div>
                        ))}
                    </div>
                </section>

                {/* Weekly Goals Section */}
                <section className="bg-white rounded-[2rem] p-8 shadow-sm">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-3 bg-green-100 rounded-xl text-green-600">
                            <Hash size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">주간 목표 (시간)</h3>
                    </div>
                    <div className="space-y-6">
                        {Object.entries(data.weeklyGoals).map(([key, value]) => (
                            <div key={key}>
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wide">{key}</label>
                                    <span className="text-sm font-black text-green-600">{value}h</span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="20"
                                    step="0.5"
                                    value={value}
                                    onChange={(e) => handleChange(`weeklyGoals.${key}`, parseFloat(e.target.value))}
                                    className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-green-500"
                                />
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <div className="flex justify-end sticky bottom-24 md:static">
                <button
                    onClick={handleSave}
                    className={`flex items-center space-x-2 px-8 py-4 rounded-2xl font-bold shadow-xl transition-all duration-300 ${saved ? 'bg-green-500 text-white shadow-green-200' : 'bg-primary text-white shadow-primary/20 hover:scale-105'
                        }`}
                >
                    <Save size={20} />
                    <span>{saved ? '저장 완료!' : '설정 저장하기'}</span>
                </button>
            </div>
        </div>
    );
}
