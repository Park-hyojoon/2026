import React from 'react';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

export default function TodayTasks({ tasks, onUpdate }) {
    const today = new Date().toLocaleDateString('ko-KR', {
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });

    const [isEditing, setIsEditing] = React.useState(null);
    const [editValue, setEditValue] = React.useState("");

    const handleEditStart = (taskId, currentGoal) => {
        setIsEditing(taskId);
        setEditValue(currentGoal);
    };

    const handleEditSave = (taskId) => {
        // Here you would optimally lift this state up to App.jsx to update 'dailyGoals'
        // For now, we will just exit edit mode as visual demo 
        // (Real implementation requires changing App.js to support updating dailyGoals)
        // onUpdateGoal(taskId, editValue); <-- Need to implement this prop
        setIsEditing(null);
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

                        {/* Daily Topic Input - For AI Analysis */}
                        <div className="mt-2">
                            <input
                                type="text"
                                placeholder={`무엇을 공부했나요? (예: ${task.id === 'accounting' ? '자산 부채 정의' : task.id === 'english' ? '비즈니스 이메일' : 'React Hooks'})`}
                                className="w-full bg-white/50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-medium text-gray-600 outline-none focus:border-primary/30 focus:bg-white transition-all"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
