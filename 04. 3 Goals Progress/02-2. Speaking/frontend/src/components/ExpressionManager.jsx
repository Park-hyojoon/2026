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
            0: '#ef4444', // red - new
            1: '#f59e0b', // yellow - learning
            2: '#3b82f6', // blue - familiar
            3: '#22c55e'  // green - mastered
        };
        return colors[level] || '#6b7280';
    };

    const getMasteryLabel = (level) => {
        const labels = { 0: 'New', 1: 'Learning', 2: 'Familiar', 3: 'Mastered' };
        return labels[level] || 'Unknown';
    };

    const getCategoryLabel = (cat) => {
        const labels = {
            idiom: 'Idiom',
            phrasal_verb: 'Phrasal Verb',
            expression: 'Expression'
        };
        return labels[cat] || cat;
    };

    return (
        <div className="glass-panel p-6 h-full flex flex-col">
            <h2 className="text-xl font-bold mb-4 gradient-text">My Expressions</h2>

            {/* Stats Bar */}
            <div className="grid grid-cols-5 gap-2 mb-4 text-center text-xs">
                <div className="bg-gray-800 rounded p-2">
                    <div className="text-lg font-bold">{stats.total}</div>
                    <div className="text-gray-400">Total</div>
                </div>
                <div className="bg-gray-800 rounded p-2">
                    <div className="text-lg font-bold text-red-400">{stats.new}</div>
                    <div className="text-gray-400">New</div>
                </div>
                <div className="bg-gray-800 rounded p-2">
                    <div className="text-lg font-bold text-yellow-400">{stats.learning}</div>
                    <div className="text-gray-400">Learning</div>
                </div>
                <div className="bg-gray-800 rounded p-2">
                    <div className="text-lg font-bold text-green-400">{stats.mastered}</div>
                    <div className="text-gray-400">Mastered</div>
                </div>
                <div className="bg-gray-800 rounded p-2">
                    <div className="text-lg font-bold text-accent-primary">{stats.due_today}</div>
                    <div className="text-gray-400">Due</div>
                </div>
            </div>

            {!isAdding ? (
                <>
                    <button onClick={() => setIsAdding(true)} className="btn btn-secondary mb-4 w-full">
                        + Add Expression
                    </button>
                    <div className="flex-1 overflow-y-auto space-y-2">
                        {expressions.map(expr => (
                            <div key={expr.id} className="p-3 bg-gray-800 rounded hover:bg-gray-700 transition">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-white">{expr.expression}</h3>
                                            <span
                                                className="text-xs px-2 py-0.5 rounded"
                                                style={{ backgroundColor: getMasteryColor(expr.mastery_level), color: 'white' }}
                                            >
                                                {getMasteryLabel(expr.mastery_level)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-300">{expr.meaning}</p>
                                        {expr.example && (
                                            <p className="text-xs text-gray-500 mt-1 italic">"{expr.example}"</p>
                                        )}
                                        <div className="flex gap-2 mt-2 text-xs text-gray-500">
                                            <span>{getCategoryLabel(expr.category)}</span>
                                            <span>|</span>
                                            <span>Next: {expr.next_review}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleEdit(expr)}
                                            className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(expr.id)}
                                            className="text-xs px-2 py-1 bg-red-900 hover:bg-red-800 rounded"
                                        >
                                            X
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {expressions.length === 0 && (
                            <p className="text-gray-500 text-center py-8">
                                No expressions yet. Add your first expression!
                            </p>
                        )}
                    </div>
                </>
            ) : (
                <div className="flex flex-col gap-4 h-full">
                    <input
                        placeholder="Expression (e.g., break the ice)"
                        value={form.expression}
                        onChange={e => setForm({...form, expression: e.target.value})}
                    />
                    <input
                        placeholder="Meaning"
                        value={form.meaning}
                        onChange={e => setForm({...form, meaning: e.target.value})}
                    />
                    <input
                        placeholder="Example sentence (optional)"
                        value={form.example}
                        onChange={e => setForm({...form, example: e.target.value})}
                    />
                    <select
                        value={form.category}
                        onChange={e => setForm({...form, category: e.target.value})}
                        className="bg-gray-800 border border-gray-600 rounded p-2"
                    >
                        <option value="expression">Expression</option>
                        <option value="idiom">Idiom</option>
                        <option value="phrasal_verb">Phrasal Verb</option>
                    </select>
                    <div className="flex gap-2 mt-auto">
                        <button onClick={handleSubmit} className="btn btn-primary flex-1">
                            {editingId ? 'Update' : 'Save'}
                        </button>
                        <button onClick={resetForm} className="btn btn-secondary">Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExpressionManager;
