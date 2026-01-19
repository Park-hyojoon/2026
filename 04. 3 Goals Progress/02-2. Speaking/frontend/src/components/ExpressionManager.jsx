import React, { useState, useEffect } from 'react';

const ExpressionManager = () => {
    const [expressions, setExpressions] = useState([]);
    const [stats, setStats] = useState({ total: 0, mastered: 0, learning: 0, new: 0, due_today: 0 });
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ expression: '', meaning: '', example: '', category: 'expression' });

    useEffect(() => {
        fetchExpressions();
        fetchStats();
    }, []);

    const fetchExpressions = async () => {
        try {
            const res = await fetch('http://localhost:8000/expressions');
            const data = await res.json();
            setExpressions(data);
        } catch (e) {
            console.error("Failed to fetch expressions", e);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await fetch('http://localhost:8000/expressions/stats');
            const data = await res.json();
            setStats(data);
        } catch (e) {
            console.error("Failed to fetch stats", e);
        }
    };

    const handleSubmit = async () => {
        if (!form.expression || !form.meaning) return;

        try {
            const url = editingId
                ? `http://localhost:8000/expressions/${editingId}`
                : 'http://localhost:8000/expressions';

            await fetch(url, {
                method: editingId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            resetForm();
            fetchExpressions();
            fetchStats();
        } catch (e) {
            console.error("Failed to save expression", e);
        }
    };

    const handleEdit = (expr) => {
        setForm({
            expression: expr.expression,
            meaning: expr.meaning,
            example: expr.example,
            category: expr.category
        });
        setEditingId(expr.id);
        setIsAdding(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this expression?')) return;
        try {
            await fetch(`http://localhost:8000/expressions/${id}`, { method: 'DELETE' });
            fetchExpressions();
            fetchStats();
        } catch (e) {
            console.error("Failed to delete expression", e);
        }
    };

    const resetForm = () => {
        setForm({ expression: '', meaning: '', example: '', category: 'expression' });
        setIsAdding(false);
        setEditingId(null);
    };

    const getMasteryColor = (level) => {
        const colors = {
            0: 'bg-red-50 text-red-500',
            1: 'bg-yellow-50 text-yellow-600',
            2: 'bg-blue-50 text-blue-600',
            3: 'bg-green-50 text-green-600'
        };
        return colors[level] || 'bg-gray-50 text-gray-500';
    };

    return (
        <div className="h-full flex flex-col animate-fade-in">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="text-xl font-bold text-gray-800">Expression Bank</h3>
                    <p className="text-xs text-gray-400 font-medium mt-1">Manage your active vocabulary and idioms</p>
                </div>
                {!isAdding && (
                    <button onClick={() => setIsAdding(true)} className="btn-premium btn-yellow shadow-md">
                        + New Expression
                    </button>
                )}
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-5 gap-4 mb-10">
                <StatBox label="Total" count={stats.total} />
                <StatBox label="New" count={stats.new} color="red" />
                <StatBox label="Learning" count={stats.learning} color="orange" />
                <StatBox label="Mastered" count={stats.mastered} color="green" />
                <StatBox label="Due Today" count={stats.due_today} color="yellow" />
            </div>

            {!isAdding ? (
                <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
                    {expressions.map(expr => (
                        <div key={expr.id} className="card-premium p-6 flex flex-col group">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${getMasteryColor(expr.mastery_level)}`}>
                                    Level {expr.mastery_level}
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEdit(expr)} className="text-gray-300 hover:text-blue-500 transition">✏️</button>
                                    <button onClick={() => handleDelete(expr.id)} className="text-gray-300 hover:text-red-500 transition">✕</button>
                                </div>
                            </div>

                            <h3 className="text-xl font-extrabold text-gray-900 mb-2 truncate">{expr.expression}</h3>
                            <p className="text-sm font-medium text-gray-500 mb-4 line-clamp-2">{expr.meaning}</p>

                            {expr.example && (
                                <div className="bg-gray-50 p-4 rounded-2xl mb-4 border border-gray-100/50">
                                    <p className="text-xs text-gray-400 italic">"{expr.example}"</p>
                                </div>
                            )}

                            <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <span>{expr.category}</span>
                                <span>Next: {expr.next_review}</span>
                            </div>
                        </div>
                    ))}
                    {expressions.length === 0 && (
                        <div className="col-span-full py-20 text-center opacity-30 italic font-medium">
                            No expressions found. Start building your bank!
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-xl mx-auto bg-white p-10 rounded-[2.5rem] shadow-2xl border border-gray-100 animate-fade-in mt-4">
                        <h3 className="text-2xl font-black text-gray-900 mb-10 border-b border-gray-50 pb-6">
                            {editingId ? 'Edit Expression' : 'Add to Bank'}
                        </h3>

                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Expression / Phrase</label>
                                <input
                                    className="premium-input w-full font-bold text-lg"
                                    placeholder="e.g., Get the ball rolling"
                                    value={form.expression}
                                    onChange={e => setForm({ ...form, expression: e.target.value })}
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Meaning (Korean/Simple English)</label>
                                <input
                                    className="premium-input w-full"
                                    placeholder="e.g., 일을 시작하다"
                                    value={form.meaning}
                                    onChange={e => setForm({ ...form, meaning: e.target.value })}
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Context Example</label>
                                <textarea
                                    className="premium-input w-full h-24 resize-none"
                                    placeholder="Use it in a sentence..."
                                    value={form.example}
                                    onChange={e => setForm({ ...form, example: e.target.value })}
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Category</label>
                                <select
                                    value={form.category}
                                    onChange={e => setForm({ ...form, category: e.target.value })}
                                    className="premium-input w-full appearance-none bg-gray-50 border-none cursor-pointer"
                                >
                                    <option value="expression">Conversation Expression</option>
                                    <option value="idiom">Idiomatic Phrase</option>
                                    <option value="phrasal_verb">Phrasal Verb</option>
                                </select>
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button onClick={handleSubmit} className="btn-premium btn-yellow flex-1 py-4 text-lg">
                                    {editingId ? 'Update & Save' : 'Add to Bank'}
                                </button>
                                <button onClick={resetForm} className="btn-premium btn-ghost px-10">Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatBox = ({ label, count, color }) => {
    const colors = {
        red: 'text-red-500 bg-red-50',
        orange: 'text-orange-500 bg-orange-50',
        green: 'text-green-500 bg-green-50',
        yellow: 'text-yellow-600 bg-yellow-50',
        default: 'text-gray-400 bg-gray-50'
    };
    return (
        <div className={`p-4 rounded-[1.5rem] border border-gray-100/50 flex flex-col items-center justify-center transition-transform hover:scale-105 ${colors[color] || colors.default}`}>
            <div className="text-2xl font-black mb-1">{count}</div>
            <div className="text-[10px] font-black uppercase tracking-widest opacity-60">{label}</div>
        </div>
    );
};

export default ExpressionManager;
