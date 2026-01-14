import React from 'react';
import { CheckCircle, Circle, MapPin } from 'lucide-react';

export default function ProgressTimeline({ data }) {
    const lang = data?.user?.language || 'ko';

    // 전산회계 2급 전체 커리큘럼 (실제 시험 범위 기준)
    const curriculum = [
        { id: 1, title: lang === 'en' ? 'Accounting Basics' : '회계의 기초', topics: lang === 'en' ? ['Financial Statement', 'Income Statement', 'Accounting Equation'] : ['재무상태표', '손익계산서', '회계등식'] },
        { id: 2, title: lang === 'en' ? 'Current Assets' : '유동자산', topics: lang === 'en' ? ['Cash', 'Short-term Financial Gifts', 'Receivables'] : ['현금및현금성자산', '단기금융상품', '매출채권'] },
        { id: 3, title: lang === 'en' ? 'Inventory' : '재고자산', topics: lang === 'en' ? ['Merchandise', 'Finished Goods', 'Raw Materials'] : ['상품', '제품', '원재료', '재공품'] },
        { id: 4, title: lang === 'en' ? 'Non-current Assets' : '비유동자산', topics: lang === 'en' ? ['Tangible Assets', 'Intangible Assets', 'Investments'] : ['유형자산', '무형자산', '투자자산'] },
        { id: 5, title: lang === 'en' ? 'Current Liabilities' : '유동부채', topics: lang === 'en' ? ['Trade Payables', 'Short-term Loans', 'Accrued Expenses'] : ['매입채무', '단기차입금', '미지급금'] },
        { id: 6, title: lang === 'en' ? 'Non-current Liab. & Equity' : '비유동부채 및 자본', topics: lang === 'en' ? ['Bonds', 'Capital Stock', 'Retained Earnings'] : ['사채', '자본금', '이익잉여금'] },
        { id: 7, title: lang === 'en' ? 'Revenue & Expenses' : '수익과 비용', topics: lang === 'en' ? ['Sales', 'Cost of Goods Sold', 'SG&A'] : ['매출', '매출원가', '판매비와관리비'] },
        { id: 8, title: lang === 'en' ? 'Value Added Tax' : '부가가치세', topics: lang === 'en' ? ['Taxation', 'Output VAT', 'Input VAT'] : ['과세', '매출세액', '매입세액'] },
        { id: 9, title: lang === 'en' ? 'Closing' : '결산', topics: lang === 'en' ? ['Adjusting Entries', 'Closing Entries', 'Financial Reports'] : ['수정분개', '마감분개', '재무제표'] },
        { id: 10, title: lang === 'en' ? 'Journals & Ledgers' : '전표와 장부', topics: lang === 'en' ? ['Receipt Slips', 'Payment Slips', 'General Ledger'] : ['입금전표', '출금전표', '총계정원장'] },
    ];

    const t = {
        title: lang === 'en' ? 'Accounting Progress' : '📊 전산회계 2급 진도',
        completed: lang === 'en' ? 'Completed' : '완료',
        studying: lang === 'en' ? 'Studying' : '학습 중',
        left: lang === 'en' ? 'Chapters Left' : '남은 단원',
        done: lang === 'en' ? 'Done' : '완료'
    };

    // (Rest of the logic remains the same)
    const studyLog = data?.accounting?.studyLog || [];
    const completedTopics = new Set();
    studyLog.forEach(log => {
        const topic = log.topic.toLowerCase();
        curriculum.forEach(chapter => {
            chapter.topics.forEach(t => {
                if (topic.includes(t.toLowerCase()) || topic.includes(chapter.title.toLowerCase())) {
                    completedTopics.add(chapter.id);
                }
            });
        });
    });

    let currentChapterId = null;
    if (studyLog.length > 0) {
        const latestTopic = studyLog[studyLog.length - 1].topic.toLowerCase();
        for (let chapter of curriculum) {
            if (chapter.topics.some(t => latestTopic.includes(t.toLowerCase())) ||
                latestTopic.includes(chapter.title.toLowerCase())) {
                currentChapterId = chapter.id;
                break;
            }
        }
    }

    const progressPercent = Math.round((completedTopics.size / curriculum.length) * 100);

    return (
        <div className="bg-white rounded-[2rem] p-6 shadow-sm w-[90%] mx-auto">
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-black text-gray-900">{t.title}</h3>
                    <span className="text-sm font-bold text-indigo-600">{progressPercent}% {t.completed}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 pl-4">
                {curriculum.map((chapter, idx) => {
                    const isCompleted = completedTopics.has(chapter.id);
                    const isCurrent = currentChapterId === chapter.id;

                    return (
                        <div
                            key={chapter.id}
                            className={`relative pl-8 pb-3 ${idx !== curriculum.length - 1 ? 'border-l-2 border-gray-200' : ''
                                }`}
                        >
                            <div className={`absolute left-0 -ml-[9px] w-4 h-4 rounded-full border-2 ${isCompleted
                                ? 'bg-green-500 border-green-500'
                                : isCurrent
                                    ? 'bg-indigo-500 border-indigo-500 animate-pulse'
                                    : 'bg-white border-gray-300'
                                }`}>
                                {isCurrent && (
                                    <div className="absolute -top-1 -left-1">
                                        <MapPin size={20} className="text-indigo-500 animate-bounce" />
                                    </div>
                                )}
                            </div>

                            <div className={`p-3 rounded-xl transition-all ${isCurrent
                                ? 'bg-indigo-50 border-2 border-indigo-200'
                                : isCompleted
                                    ? 'bg-green-50'
                                    : 'bg-gray-50'
                                }`}>
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className={`font-bold text-sm ${isCurrent ? 'text-indigo-900' : isCompleted ? 'text-green-900' : 'text-gray-700'
                                        }`}>
                                        {chapter.id}. {chapter.title}
                                    </h4>
                                    {isCompleted && <CheckCircle size={16} className="text-green-500" />}
                                    {isCurrent && (
                                        <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                                            {t.studying}
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {chapter.topics.map((topic, i) => (
                                        <span
                                            key={i}
                                            className={`text-xs px-2 py-0.5 rounded ${isCurrent
                                                ? 'bg-indigo-100 text-indigo-700'
                                                : isCompleted
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-100 text-gray-500'
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

            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-3 gap-2 text-center">
                <div className="bg-green-50 rounded-lg p-2">
                    <p className="text-xs text-gray-500">{t.done}</p>
                    <p className="text-lg font-black text-green-600">{completedTopics.size}</p>
                </div>
                <div className="bg-indigo-50 rounded-lg p-2">
                    <p className="text-xs text-gray-500">{t.studying}</p>
                    <p className="text-lg font-black text-indigo-600">{currentChapterId ? 1 : 0}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-xs text-gray-500">{t.left}</p>
                    <p className="text-lg font-black text-gray-600">{curriculum.length - completedTopics.size}</p>
                </div>
            </div>
        </div>
    );
}
