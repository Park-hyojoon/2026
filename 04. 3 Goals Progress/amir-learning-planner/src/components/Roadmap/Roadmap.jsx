import React from 'react';
import { Flag, CheckCircle, Circle, ArrowRight } from 'lucide-react';

import TodayTasks from '../Dashboard/TodayTasks';
import WeeklyProgress from '../Dashboard/WeeklyProgress';

export default function Roadmap({ data, onUpdate, onFileUpload, onTopicSubmit, savedStudyTopics }) {
    const lang = data?.user?.language || 'ko';

    const t = {
        yearlyStatus: lang === 'en' ? '📈 Yearly Progress' : '📈 연간 진행 상황',
        completed: lang === 'en' ? 'Completed' : '완료',
        left: lang === 'en' ? 'Left' : '남음',
        daysPassed: lang === 'en' ? 'Days Passed' : '지난 일수',
        daysRemaining: lang === 'en' ? 'Days Left' : '남은 일수',
        weeksLeft: lang === 'en' ? 'Weeks Left' : '남은 주',
        yearlyGoals: lang === 'en' ? '🎯 Annual Goals' : '🎯 연간 목표',
        accounting: lang === 'en' ? 'Accounting' : '회계',
        english: lang === 'en' ? 'English' : '영어',
        hoursLabel: lang === 'en' ? 'h' : '시간',
        examNotSet: lang === 'en' ? 'Date not set' : '날짜 미설정',
        todaySection: lang === 'en' ? 'Current Focus' : '오늘의 집중'
    };

    // 연간 뷰용 데이터 계산
    const getYearlyStats = () => {
        const today = new Date();
        const currentYear = today.getFullYear();
        const startOfYear = new Date(currentYear, 0, 1);
        const daysPassed = Math.floor((today - startOfYear) / (1000 * 60 * 60 * 24));
        const totalDays = 365;
        const daysRemaining = totalDays - daysPassed;
        const progressPercent = Math.round((daysPassed / totalDays) * 100);

        return { currentYear, daysPassed, daysRemaining, totalDays, progressPercent };
    };

    // --- Dynamic Roadmap Logic ---
    const roadmapData = React.useMemo(() => {
        // 1. Accounting Progress Calculation (Curriculum Mastery)
        const curriculum = [
            { id: 1, topics: ['재무상태표', '손익계산서', '회계등식', 'Financial Statement'] },
            { id: 2, topics: ['현금및현금성자산', '단기금융상품', '매출채권', 'Current Assets'] },
            { id: 3, topics: ['상품', '제품', '원재료', '재공품', 'Inventory'] },
            { id: 4, topics: ['유형자산', '무형자산', '투자자산', 'Non-current Assets'] },
            { id: 5, topics: ['매입채무', '단기차입금', '미지급금', 'Current Liabilities'] },
            { id: 6, topics: ['사채', '자본금', '이익잉여금', 'Non-current Liab'] },
            { id: 7, topics: ['매출', '매출원가', '판매비와관리비', 'Revenue'] },
            { id: 8, topics: ['과세', '매출세액', '매입세액', 'VAT'] },
            { id: 9, topics: ['수정분개', '마감분개', '재무제표', 'Closing'] },
            { id: 10, topics: ['입금전표', '출금전표', '총계정원장', 'Journals'] },
        ];
        const studyLog = data?.accounting?.studyLog || [];
        const completedTopics = new Set();
        studyLog.forEach(log => {
            const topic = log.topic.toLowerCase();
            curriculum.forEach(chapter => {
                chapter.topics.forEach(t => {
                    if (topic.includes(t.toLowerCase())) {
                        completedTopics.add(chapter.id);
                    }
                });
            });
        });
        const accountingMastery = Math.round((completedTopics.size / curriculum.length) * 100);

        // 2. English Progress Calculation (Proficiency B2 Target)
        const savedPhrases = data?.english?.targetPhrases || [];
        // Target: 60 phrases for "Tech Comm (B1)", 100 for "Global Collab (B2)"
        const englishB1Progress = Math.min(Math.round((savedPhrases.length / 60) * 100), 100);
        const englishB2Progress = Math.min(Math.round((savedPhrases.length / 100) * 100), 100);

        return [
            {
                year: '2026',
                quarters: [
                    {
                        id: 'q1',
                        period: lang === 'en' ? 'Q1 (Jan-Mar)' : 'Q1 (1-3월)',
                        title: lang === 'en' ? 'Building Foundations' : '기초 다지기',
                        items: [
                            {
                                id: 1,
                                text: lang === 'en' ? 'Master React Basics' : 'React 기본 완전 마스터',
                                completed: true,
                                progress: 100,
                                type: 'ai'
                            },
                            {
                                id: 2,
                                text: lang === 'en' ? 'Level 2 Curriculum Mastery' : '전산회계 2급 이론 완벽 이해',
                                completed: accountingMastery >= 90,
                                progress: accountingMastery,
                                type: 'accounting',
                                detail: `${accountingMastery}% Mastered`
                            },
                            {
                                id: 3,
                                text: lang === 'en' ? 'English Learning Habit' : '영어 학습 루틴 정착',
                                completed: savedPhrases.length >= 10,
                                progress: Math.min((savedPhrases.length / 10) * 100, 100),
                                type: 'english',
                                detail: `Habit Formed`
                            }
                        ]
                    },
                    {
                        id: 'q2',
                        period: lang === 'en' ? 'Q2 (Apr-Jun)' : 'Q2 (4-6월)',
                        title: lang === 'en' ? 'Application & Tech Comm' : '심화 학습 및 기술 소통',
                        items: [
                            {
                                id: 4,
                                text: lang === 'en' ? 'Build AI Agent Prototype' : 'AI 에이전트 프로토타입 제작',
                                completed: false,
                                progress: 20,
                                type: 'ai'
                            },
                            {
                                id: 5,
                                text: lang === 'en' ? 'Level 1 Core Concepts' : '전산회계 1급 핵심 개념 정복',
                                completed: false,
                                progress: 0,
                                type: 'accounting'
                            },
                            {
                                id: 6,
                                text: lang === 'en' ? 'Tech Communication (B1+)' : '개발자 기술 영어 (B1+)',
                                completed: englishB1Progress >= 100,
                                progress: englishB1Progress,
                                type: 'english',
                                detail: `Biz/Tech Patterns`
                            }
                        ]
                    },
                    {
                        id: 'q3',
                        period: lang === 'en' ? 'Q3 (Jul-Sep)' : 'Q3 (7-9월)',
                        title: lang === 'en' ? 'Global Collaboration' : '글로벌 협업 준비',
                        items: [
                            { id: 7, text: lang === 'en' ? 'Deploy SAAS Product' : 'SAAS 제품 배포', completed: false, progress: 0, type: 'ai' },
                            {
                                id: 8,
                                text: lang === 'en' ? 'Global Collab Ready (B2)' : '글로벌 협업 레벨 (B2) 달성',
                                completed: englishB2Progress >= 100,
                                progress: englishB2Progress,
                                type: 'english',
                                detail: 'Fluent Communication'
                            },
                        ]
                    }
                ]
            }
        ];
    }, [data, lang]);

    const getTypeColor = (type) => {
        switch (type) {
            case 'ai': return 'text-blue-500 bg-blue-100';
            case 'accounting': return 'text-purple-500 bg-purple-100';
            case 'english': return 'text-emerald-500 bg-emerald-100';
            default: return 'text-gray-500 bg-gray-100';
        }
    };

    const stats = getYearlyStats();

    // Calculate current status for Dashboard
    const accountingStatus = (data?.accounting?.studyLog || []).length > 0
        ? Math.min(Math.round(((data?.accounting?.studyLog || []).length / 20) * 100), 100)
        : 0;

    const currentAccountingMastery = roadmapData[0].quarters[0].items[1].progress;
    const currentEnglishB2 = Math.min(Math.round(((data?.english?.targetPhrases || []).length / 100) * 100), 100);

    return (
        <div className="max-w-[1380px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32">

            {/* 1. Daily & Weekly Section (Moved from App.jsx) */}
            <section className="mb-20">
                <header className="mb-8 text-center md:text-left">
                    <h2 className="text-3xl font-black text-gray-900 tracking-tighter mb-2">
                        {t.todaySection}
                    </h2>
                    <p className="text-gray-400 font-bold">
                        {lang === 'en' ? 'Small steps lead to big changes.' : '작은 실천이 모여 큰 변화를 만듭니다.'}
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start h-full">
                    {/* Left Column: Today's Tasks */}
                    <div className="h-full">
                        <TodayTasks
                            tasks={[
                                {
                                    id: 'accounting',
                                    name: lang === 'en' ? 'Accounting' : '회계 공부',
                                    goal: data?.dailyGoals?.accounting,
                                    current: data?.currentWeek?.days?.[0]?.accounting?.hours,
                                    emoji: '📊',
                                    completed: data?.currentWeek?.days?.[0]?.accounting?.completed,
                                    uploadedFile: data?.accounting?.level2?.referenceMaterials?.length > 0 ? data.accounting.level2.referenceMaterials[data.accounting.level2.referenceMaterials.length - 1].name : null
                                },
                                {
                                    id: 'english',
                                    name: lang === 'en' ? 'English Practice' : '영어 연습',
                                    goal: data?.dailyGoals?.english,
                                    current: data?.currentWeek?.days?.[0]?.english?.hours,
                                    emoji: '🗣️',
                                    completed: data?.currentWeek?.days?.[0]?.english?.completed
                                },
                                {
                                    id: 'ai',
                                    name: lang === 'en' ? 'AI Learning' : 'AI 학습',
                                    goal: data?.dailyGoals?.ai,
                                    current: data?.currentWeek?.days?.[0]?.ai?.hours,
                                    emoji: '🤖',
                                    completed: data?.currentWeek?.days?.[0]?.ai?.completed
                                },
                            ]}
                            onUpdate={onUpdate}
                            onFileUpload={onFileUpload}
                            onTopicSubmit={onTopicSubmit}
                            savedStudyTopics={savedStudyTopics}
                            lang={lang}
                        />
                    </div>

                    {/* Right Column: Weekly Progress */}
                    <div className="h-full">
                        <WeeklyProgress weekly={data.weeklyGoals} current={data.currentWeek} lang={lang} />
                    </div>
                </div>
            </section>

            {/* 2. 2026 Roadmap Section */}
            <section>
                <header className="mb-12 text-center md:text-left">
                    <h2 className="text-4xl font-black text-gray-900 tracking-tighter">2026 Roadmap</h2>
                    <p className="text-gray-400 font-bold mt-2">
                        {lang === 'en' ? 'Focus on Proficiency & Real-world Skills' : '단순 시간 채우기가 아닌, 진짜 실력을 완성하는 여정입니다.'}
                    </p>
                </header>

                {/* Grid Layout: Dashboard (Left) vs Timeline (Right) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

                    {/* Left Column: Yearly Dashboard */}
                    <div className="space-y-6 h-full">

                        {/* 연간 진행 상황 (Time) */}
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm h-fit">
                            <h3 className="text-xl font-black text-gray-900 mb-6">{t.yearlyStatus}</h3>

                            {/* Progress Bar (Time) */}
                            <div className="mb-4">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="font-bold text-gray-600">{stats.progressPercent}% {lang === 'en' ? 'Time Passed' : '시간 경과'}</span>
                                    <span className="text-gray-400">{stats.daysRemaining} {lang === 'en' ? 'days left' : '일 남음'}</span>
                                </div>
                                <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-gray-300 to-gray-400 rounded-full"
                                        style={{ width: `${stats.progressPercent}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Proficiency & Mastery Dashboard */}
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm h-fit">
                            <h3 className="text-xl font-black text-gray-900 mb-6">{lang === 'en' ? '🎯 Skill Mastery Goals' : '🎯 핵심 역량 마스터리'}</h3>
                            <div className="grid grid-cols-1 gap-6">

                                {/* Accounting Mastery */}
                                <div className="p-6 bg-indigo-50 rounded-2xl relative overflow-hidden">
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="font-bold text-indigo-900 text-lg">{lang === 'en' ? '📊 Accounting Mastery' : '📊 회계 완전 정복'}</h4>
                                            <span className="text-2xl font-black text-indigo-600">{currentAccountingMastery}%</span>
                                        </div>
                                        <p className="text-sm text-indigo-700/80 font-medium mb-4">
                                            {lang === 'en' ? 'Level 2 Curriculum Coverage' : '전산회계 2급 커리큘럼 완성도'}
                                        </p>
                                        <div className="h-3 bg-white/50 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                                                style={{ width: `${currentAccountingMastery}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-indigo-400 mt-2 font-bold text-right">
                                            {lang === 'en' ? 'Target: Complete Understanding' : '목표: 개념 완벽 이해'}
                                        </p>
                                    </div>
                                </div>

                                {/* English Proficiency */}
                                <div className="p-6 bg-emerald-50 rounded-2xl relative overflow-hidden">
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="font-bold text-emerald-900 text-lg">{lang === 'en' ? '🗣️ English Proficiency' : '🗣️ 영어 구사 능력'}</h4>
                                            <span className="text-2xl font-black text-emerald-600">B2</span>
                                        </div>
                                        <p className="text-sm text-emerald-700/80 font-medium mb-4">
                                            {lang === 'en' ? 'Global Collaboration Ready' : '글로벌 협업 준비 완료'}
                                        </p>

                                        {/* Proficiency Steps */}
                                        <div className="flex justify-between items-end h-16 mb-2 space-x-2">
                                            <div className="w-1/3 flex flex-col items-center gap-1">
                                                <div className="w-full h-8 bg-emerald-200 rounded-t-lg"></div>
                                                <span className="text-xs font-bold text-emerald-600">A2 (Habit)</span>
                                            </div>
                                            <div className="w-1/3 flex flex-col items-center gap-1">
                                                <div className={`w-full bg-emerald-300 rounded-t-lg transition-all duration-1000 ${currentEnglishB2 >= 30 ? 'h-12' : 'h-12 opacity-30'}`}></div>
                                                <span className="text-xs font-bold text-emerald-600">B1 (Tech)</span>
                                            </div>
                                            <div className="w-1/3 flex flex-col items-center gap-1">
                                                <div className={`w-full bg-emerald-500 rounded-t-lg transition-all duration-1000 shadow-lg ${currentEnglishB2 >= 80 ? 'h-16' : 'h-16 opacity-30'}`}></div>
                                                <span className="text-xs font-black text-emerald-800">B2 (Global)</span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-emerald-500 mt-2 font-bold text-center">
                                            {lang === 'en' ? `Current Progress: ${currentEnglishB2}% to B2` : `현재 진행률: B2까지 ${currentEnglishB2}%`}
                                        </p>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>

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
                                                        {quarter.items.filter(i => i.completed).length} / {quarter.items.length} {lang === 'en' ? 'Completed' : '완료됨'}
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    {quarter.items.map((item, iIdx) => (
                                                        <div key={iIdx} className="flex flex-col p-4 bg-gray-50 rounded-2xl group hover:bg-white border-2 border-transparent hover:border-gray-100 transition-all">
                                                            <div className="flex items-center justify-between w-full mb-2">
                                                                <div className="flex items-center flex-1">
                                                                    <div className={`mr-4 ${item.completed ? 'text-green-500' : 'text-gray-300'}`}>
                                                                        {item.completed ? <CheckCircle size={24} strokeWidth={3} /> : <Circle size={24} strokeWidth={2} />}
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <p className={`font-bold text-lg ${item.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{item.text}</p>
                                                                    </div>
                                                                </div>
                                                                <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ml-4 ${getTypeColor(item.type)}`}>
                                                                    {item.type}
                                                                </div>
                                                            </div>

                                                            {/* Progress Bar & Details */}
                                                            <div className="w-full pl-10 pr-2">
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <span className="text-xs font-bold text-gray-400">
                                                                        {item.detail || (item.completed ? '100%' : `${item.progress || 0}%`)}
                                                                    </span>
                                                                </div>
                                                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                                    <div
                                                                        className={`h-full rounded-full transition-all duration-1000 ${item.type === 'ai' ? 'bg-blue-500' :
                                                                            item.type === 'accounting' ? 'bg-purple-500' : 'bg-emerald-500'
                                                                            }`}
                                                                        style={{ width: `${item.progress}%` }}
                                                                    ></div>
                                                                </div>
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
                </div>
                {/* End of Grid Layout */}

                <div className="mt-12 p-8 bg-gradient-to-r from-gray-900 to-gray-800 rounded-[2.5rem] text-white text-center">
                    <Flag size={48} className="mx-auto mb-4 text-primary" />
                    <h3 className="text-2xl font-black mb-2">Keep Moving Forward</h3>
                    <p className="text-gray-400 font-medium">
                        {lang === 'en' ? '"The future belongs to those who prepare for it."' : '"미래는 준비하는 자의 것입니다."'}
                    </p>
                </div>
            </section>
        </div>
    );
}
