import React from 'react';
import { CheckCircle, MapPin, Sparkles } from 'lucide-react';

export default function EnglishTimeline({ data }) {
    const lang = data?.user?.language || 'ko';

    // 영어 학습 커리큘럼 (실제 비즈니스/일상 회화 단계 기반)
    const curriculum = [
        { id: 1, title: lang === 'en' ? 'Daily Logistics' : '일상 회화 기초', topics: lang === 'en' ? ['Greeting', 'Time & Date', 'Weather'] : ['인사', '시간과 날짜', '날씨'] },
        { id: 2, title: lang === 'en' ? 'Self Introduction' : '자기소개 마스터', topics: lang === 'en' ? ['Job & Career', 'Hobbies', 'Dreams'] : ['직업과 경력', '취미', '꿈'] },
        { id: 3, title: lang === 'en' ? 'Business Email' : '비즈니스 이메일', topics: lang === 'en' ? ['Inquiry', 'Follow-up', 'Scheduling'] : ['문의하기', '후속 조치', '일정 조정'] },
        { id: 4, title: lang === 'en' ? 'In the Meeting' : '회의 실전', topics: lang === 'en' ? ['Opening', 'Presenting', 'Q&A'] : ['회의 시작', '발표', '질의응답'] },
        { id: 5, title: lang === 'en' ? 'Negotiation' : '협상의 기술', topics: lang === 'en' ? ['Offering', 'Rejecting', 'Closing'] : ['제안하기', '거절하기', '마무리'] },
        { id: 6, title: lang === 'en' ? 'Travel & Social' : '여행과 사교', topics: lang === 'en' ? ['Direction', 'Dining', 'Small Talk'] : ['길 묻기', '식사', '스몰 토크'] },
        { id: 7, title: lang === 'en' ? 'Problem Solving' : '문제 해결', topics: lang === 'en' ? ['Complaints', 'Suggestions', 'Fixing'] : ['불만 제기', '해결 제안', '조치'] },
        { id: 8, title: lang === 'en' ? 'Advanced Grammar' : '고급 문법', topics: lang === 'en' ? ['Subjunctive', 'Relative Clause'] : ['가정법', '관계절'] },
        { id: 9, title: lang === 'en' ? 'Presentation' : '프레젠테이션', topics: lang === 'en' ? ['Structure', 'Hook', 'Visual Aids'] : ['구조 잡기', '주의 환기', '시각 자료'] },
        { id: 10, title: lang === 'en' ? 'Fluent Dialogue' : '자연스러운 대화', topics: lang === 'en' ? ['Nuance', 'Slang', 'Idioms'] : ['뉘앙스', '슬랭', '관용구'] },
    ];

    // 저장된 표현들에서 학습 진도 추출
    const savedPhrases = data?.english?.targetPhrases || [];
    const completedChapters = new Set();

    // 단순 시뮬레이션: 표현 개수에 따라 진도 결정
    const phraseCount = savedPhrases.length;
    let progressLevel = Math.min(Math.floor(phraseCount / 2), 10);

    for (let i = 1; i <= progressLevel; i++) {
        completedChapters.add(i);
    }

    const currentChapterId = progressLevel < 10 ? progressLevel + 1 : 10;
    const progressPercent = Math.round((completedChapters.size / curriculum.length) * 100);

    return (
        <div className="bg-white rounded-[2rem] p-6 shadow-sm w-[90%] mx-auto">
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-black text-gray-900">
                        {lang === 'en' ? '🗣️ English Fluency Path' : '🗣️ 영어 회화 마스터 경로'}
                    </h3>
                    <span className="text-sm font-bold text-emerald-600">{progressPercent}% {lang === 'en' ? 'Done' : '완성'}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 pl-4 custom-scrollbar">
                {curriculum.map((chapter, idx) => {
                    const isCompleted = completedChapters.has(chapter.id);
                    const isCurrent = currentChapterId === chapter.id;

                    return (
                        <div
                            key={chapter.id}
                            className={`relative pl-8 pb-3 ${idx !== curriculum.length - 1 ? 'border-l-2 border-gray-100' : ''}`}
                        >
                            {/* Timeline dot */}
                            <div className={`absolute left-0 -ml-[9px] w-4 h-4 rounded-full border-2 ${isCompleted
                                ? 'bg-emerald-500 border-emerald-500'
                                : isCurrent
                                    ? 'bg-emerald-500 border-emerald-500 animate-pulse'
                                    : 'bg-white border-gray-200'
                                }`}>
                                {isCurrent && (
                                    <div className="absolute -top-1 -left-1">
                                        <Sparkles size={20} className="text-emerald-500 animate-bounce" />
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className={`p-3 rounded-xl transition-all ${isCurrent
                                ? 'bg-emerald-50 border-2 border-emerald-200'
                                : isCompleted
                                    ? 'bg-emerald-50/50'
                                    : 'bg-gray-50/50'
                                }`}>
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className={`font-bold text-sm ${isCurrent ? 'text-emerald-900' : isCompleted ? 'text-emerald-800' : 'text-gray-500'}`}>
                                        Step {chapter.id}. {chapter.title}
                                    </h4>
                                    {isCompleted && <CheckCircle size={14} className="text-emerald-500" />}
                                    {isCurrent && (
                                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                                            {lang === 'en' ? 'Active' : '현재 진행'}
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {chapter.topics.map((topic, i) => (
                                        <span
                                            key={i}
                                            className={`text-[10px] px-1.5 py-0.5 rounded ${isCurrent
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : isCompleted
                                                    ? 'bg-emerald-100/50 text-emerald-600'
                                                    : 'bg-gray-100 text-gray-400'
                                                }`}
                                        >
                                            {topic}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 요약 */}
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-2 text-center">
                <div className="bg-emerald-50 rounded-lg p-2">
                    <p className="text-[10px] text-gray-500 uppercase font-bold">{lang === 'en' ? 'Phrases' : '표현 수'}</p>
                    <p className="text-lg font-black text-emerald-600">{phraseCount}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-[10px] text-gray-500 uppercase font-bold">{lang === 'en' ? 'Next Step' : '다음 단계'}</p>
                    <p className="text-sm font-black text-gray-700 truncate">{curriculum[currentChapterId - 1]?.title}</p>
                </div>
            </div>
        </div>
    );
}
