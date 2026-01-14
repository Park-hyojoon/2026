import React, { useState } from 'react';
import { CheckCircle2, Circle, Clock, Check } from 'lucide-react';

export default function TodayTasks({ tasks, onUpdate, onFileUpload }) {
    const today = new Date().toLocaleDateString('ko-KR', {
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });

    const [isEditing, setIsEditing] = useState(null);
    const [editValue, setEditValue] = useState("");
    const [uploadState, setUploadState] = useState({}); // { [taskId]: { status: 'idle' | 'uploading' | 'done', filename: '' } }

    const handleEditStart = (taskId, currentGoal) => {
        setIsEditing(taskId);
        setEditValue(currentGoal);
    };

    const handleEditSave = (taskId) => {
        setIsEditing(null);
    };

    const handleFileChange = (taskId, e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Simulate Upload Process
        setUploadState(prev => ({ ...prev, [taskId]: { status: 'uploading', filename: file.name } }));

        setTimeout(() => {
            setUploadState(prev => ({ ...prev, [taskId]: { status: 'done', filename: file.name } }));
            if (onFileUpload) onFileUpload(taskId, file);
        }, 1500); // 1.5s simulation
    };

    return (
        <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 h-full flex flex-col">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">🎯 오늘 할 일</h2>
                    <p className="text-sm font-semibold text-primary/60">{today}</p>
                </div>
            </header>

            <div className="flex-1 space-y-4 overflow-y-auto pr-1 custom-scrollbar">
                {tasks.map(task => (
                    <div
                        key={task.id}
                        className={`group relative p-4 rounded-2xl transition-all duration-300
              ${task.completed
                                ? 'bg-gradient-to-br from-green-50 to-white'
                                : 'bg-gray-50 hover:bg-white hover:shadow-sm'
                            }`}
                    >
                        <div className="relative flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-xl transition-all duration-300 ${task.completed ? 'bg-green-500 text-white' : 'bg-white text-gray-300 shadow-sm'}`}>
                                    {task.completed ? <CheckCircle2 size={18} strokeWidth={3} /> : <Circle size={18} strokeWidth={2} />}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{task.emoji} {task.id.toUpperCase()}</span>
                                    <span className={`text-lg font-black tracking-tight ${task.completed ? 'text-green-700' : 'text-gray-800'}`}>
                                        {task.name}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="flex items-center bg-white rounded-xl px-3 py-1.5 shadow-sm">
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.1"
                                        value={task.current || 0}
                                        onChange={(e) => onUpdate(task.id, e.target.value)}
                                        className="w-12 bg-transparent text-right font-mono font-black text-gray-900 outline-none border-none text-base"
                                    />
                                    <span className="text-[10px] font-black text-gray-400 ml-1">h</span>
                                </div>
                                <span className="text-gray-300 font-bold">/</span>
                                {isEditing === task.id ? (
                                    <div className="flex items-center">
                                        <input
                                            type="number"
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            className="w-12 bg-white border border-primary/30 rounded-lg px-1 py-1 text-right font-black text-base outline-none"
                                            autoFocus
                                            onBlur={() => handleEditSave(task.id)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleEditSave(task.id)}
                                        />
                                        <span className="text-[10px] font-black text-primary ml-1">h</span>
                                    </div>
                                ) : (
                                    <div
                                        className="flex items-baseline cursor-pointer group/goal"
                                        onClick={() => handleEditStart(task.id, task.goal)}
                                    >
                                        <span className="text-base font-black text-gray-400 group-hover/goal:text-primary transition-colors">{task.goal}</span>
                                        <span className="text-[10px] font-black text-gray-300 ml-1">h</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Daily Topic & File Upload */}
                        <div className="mt-2 flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    placeholder={`무엇을 공부했나요? (예: ${task.id === 'accounting' ? '자산 부채 정의' : '비즈니스 이메일'})`}
                                    className="flex-1 bg-white/50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-medium text-gray-600 outline-none focus:border-primary/30 focus:bg-white transition-all"
                                />
                                <label className="cursor-pointer p-2 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-primary hover:border-primary/30 transition-all shadow-sm">
                                    <input type="file" className="hidden" />
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
                                </label>
                            </div>

                            {task.id === 'accounting' && (
                                <div className={`p-3 border rounded-xl transition-all duration-500 ${uploadState[task.id]?.status === 'done'
                                        ? 'bg-green-50 border-green-200 shadow-sm'
                                        : 'bg-indigo-50/50 border-indigo-100/50'
                                    }`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            {uploadState[task.id]?.status === 'done' ? (
                                                <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-white animate-in zoom-in">
                                                    <Check size={10} strokeWidth={4} />
                                                </div>
                                            ) : (
                                                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">
                                                    {uploadState[task.id]?.status === 'uploading' ? 'AI 분석 중...' : '📚 AI 학습용 자습서(PDF/IMG)'}
                                                </span>
                                            )}

                                            {uploadState[task.id]?.filename && (
                                                <span className={`text-[10px] font-bold ${uploadState[task.id]?.status === 'done' ? 'text-green-700' : 'text-indigo-600'}`}>
                                                    {uploadState[task.id].filename}
                                                    {uploadState[task.id]?.status === 'done' && <span className="ml-1 text-[9px] opacity-70">AI Confirmed</span>}
                                                </span>
                                            )}
                                        </div>

                                        {uploadState[task.id]?.status !== 'done' && (
                                            <label className={`cursor-pointer px-2 py-1 bg-white border border-indigo-100 rounded-lg text-[9px] font-black text-indigo-500 hover:bg-indigo-500 hover:text-white transition-all shadow-sm ${uploadState[task.id]?.status === 'uploading' ? 'opacity-50 pointer-events-none' : ''}`}>
                                                {uploadState[task.id]?.status === 'uploading' ? '...' : 'UPLOAD'}
                                                <input
                                                    type="file"
                                                    accept=".pdf,.txt,.md,.jpg,.png"
                                                    className="hidden"
                                                    onChange={(e) => handleFileChange(task.id, e)}
                                                />
                                            </label>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
