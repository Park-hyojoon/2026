import React from 'react';
import { Flag, CheckCircle, Circle, ArrowRight } from 'lucide-react';

export default function Roadmap({ data }) {
    // Mock roadmap data structure (In a real app, this might come from 'data.roadmap')
    const roadmapData = [
        {
            year: '2026',
            quarters: [
                {
                    id: 'q1', period: 'Q1 (1-3월)', title: '기초 다지기',
                    items: [
                        { id: 1, text: 'React 기본 완전 마스터', completed: true, type: 'ai' },
                        { id: 2, text: '전산회계 2급 자격증 취득', completed: false, type: 'accounting' },
                        { id: 3, text: '영어 학습 습관 형성', completed: true, type: 'english' }
                    ]
                },
                {
                    id: 'q2', period: 'Q2 (4-6월)', title: '심화 학습 및 적용',
                    items: [
                        { id: 4, text: 'AI 에이전트 프로토타입 제작', completed: false, type: 'ai' },
                        { id: 5, text: '전산회계 1급 시험 준비', completed: false, type: 'accounting' },
                        { id: 6, text: '영어 회화 B1 레벨 도달', completed: false, type: 'english' }
                    ]
                },
                {
                    id: 'q3', period: 'Q3 (7-9월)', title: '확장 및 성장',
                    items: [
                        { id: 7, text: '첫 SAAS 제품 배포', completed: false, type: 'ai' },
                        { id: 8, text: '세무회계 기초 학습', completed: false, type: 'accounting' },
                    ]
                }
            ]
        }
    ];

    const getTypeColor = (type) => {
        switch (type) {
            case 'ai': return 'text-blue-500 bg-blue-100';
            case 'accounting': return 'text-purple-500 bg-purple-100';
            case 'english': return 'text-emerald-500 bg-emerald-100';
            default: return 'text-gray-500 bg-gray-100';
        }
    };

    return (
        <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            <header className="mb-12 text-center md:text-left">
                <h2 className="text-4xl font-black text-gray-900 tracking-tighter">2026 Roadmap</h2>
                <p className="text-gray-400 font-bold mt-2">큰 꿈을 향한 구체적인 이정표를 확인하세요.</p>
            </header>

            <div className="space-y-12">
                {roadmapData.map((yearGroup, yIdx) => (
                    <div key={yIdx} className="relative">
                        {/* Timeline Line */}
                        <div className="absolute left-8 top-0 bottom-0 w-1 bg-gray-100 hidden md:block"></div>

                        <div className="space-y-8">
                            {yearGroup.quarters.map((quarter, qIdx) => (
                                <div key={qIdx} className="relative md:pl-24">
                                    {/* Timeline Node */}
                                    <div className="hidden md:flex absolute left-0 top-0 w-16 h-16 bg-white border-4 border-gray-100 rounded-full items-center justify-center font-black text-gray-300 z-10">
                                        {quarter.period.split(' ')[0]}
                                    </div>

                                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                                            <div>
                                                <div className="text-xs font-black text-primary uppercase tracking-widest mb-1">{quarter.period}</div>
                                                <h3 className="text-2xl font-black text-gray-900">{quarter.title}</h3>
                                            </div>
                                            <div className="mt-4 md:mt-0 px-4 py-2 bg-gray-50 rounded-2xl text-xs font-bold text-gray-400">
                                                {quarter.items.filter(i => i.completed).length} / {quarter.items.length} Completed
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            {quarter.items.map((item, iIdx) => (
                                                <div key={iIdx} className="flex items-center p-4 bg-gray-50 rounded-2xl group hover:bg-white border-2 border-transparent hover:border-gray-100 transition-all">
                                                    <div className={`mr-4 ${item.completed ? 'text-green-500' : 'text-gray-300'}`}>
                                                        {item.completed ? <CheckCircle size={24} strokeWidth={3} /> : <Circle size={24} strokeWidth={2} />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className={`font-bold text-lg ${item.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{item.text}</p>
                                                    </div>
                                                    <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${getTypeColor(item.type)}`}>
                                                        {item.type}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-12 p-8 bg-gradient-to-r from-gray-900 to-gray-800 rounded-[2.5rem] text-white text-center">
                <Flag size={48} className="mx-auto mb-4 text-primary" />
                <h3 className="text-2xl font-black mb-2">Keep Moving Forward</h3>
                <p className="text-gray-400 font-medium">"미래는 준비하는 자의 것입니다."</p>
            </div>
        </div>
    );
}
