import React, { useState, useEffect } from 'react';

const MaterialManager = ({ onSelectMaterial, activeMaterial }) => {
    const [materials, setMaterials] = useState([]);
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [newAiRole, setNewAiRole] = useState('Tutor');
    const [newUserRole, setNewUserRole] = useState('Student');
    const [newTargetPhrases, setNewTargetPhrases] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        try {
            const res = await fetch('http://localhost:8000/materials');
            const data = await res.json();
            setMaterials(data);
        } catch (e) {
            console.error("Failed to fetch materials", e);
        }
    };

    const handleAdd = async () => {
        if (!newTitle || !newContent) {
            alert("Please fill in both title and content.");
            return;
        }
        try {
            const phrasesList = newTargetPhrases.split('\n').map(p => p.trim()).filter(p => p);

            const res = await fetch('http://localhost:8000/materials', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: newTitle,
                    content: newContent,
                    ai_role: newAiRole,
                    user_role: newUserRole,
                    target_phrases: phrasesList
                })
            });

            if (!res.ok) throw new Error(`Server error: ${res.status}`);

            setNewTitle('');
            setNewContent('');
            setNewAiRole('Tutor');
            setNewUserRole('Student');
            setNewTargetPhrases('');
            setIsAdding(false);
            fetchMaterials();
        } catch (e) {
            alert(`Failed to save material: ${e.message}`);
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!confirm('Delete this scenario?')) return;
        try {
            await fetch(`http://localhost:8000/materials/${id}`, { method: 'DELETE' });
            fetchMaterials();
        } catch (e) {
            alert("Failed to delete material");
        }
    };

    return (
        <div className="h-full flex flex-col animate-fade-in">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <h3 className="text-xl font-bold text-gray-800">Available Scenarios</h3>
                    <span className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full font-bold">{materials.length} courses</span>
                </div>
                {!isAdding && (
                    <button onClick={() => setIsAdding(true)} className="btn-premium btn-yellow shadow-md">
                        + Create New
                    </button>
                )}
            </div>

            {!isAdding ? (
                <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
                    {materials.map(m => (
                        <div
                            key={m.id}
                            onClick={() => onSelectMaterial(m)}
                            className={`card-premium p-8 cursor-pointer relative flex flex-col gap-5 ${activeMaterial && activeMaterial.id === m.id
                                    ? 'ring-4 ring-yellow-400 ring-offset-4 bg-yellow-50/30'
                                    : ''
                                }`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="p-4 rounded-2xl bg-gray-50 text-3xl shadow-inner group-hover:scale-110 transition">
                                    🎭
                                </div>
                                <button
                                    onClick={(e) => handleDelete(e, m.id)}
                                    className="p-2 rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 transition"
                                >
                                    ✕
                                </button>
                            </div>

                            <div>
                                <p className="text-yellow-600 text-xs font-bold uppercase tracking-widest mb-2">{m.ai_role || 'Tutor'} Role</p>
                                <h3 className="font-extrabold text-xl text-gray-900 mb-3 leading-tight truncate">{m.title}</h3>
                                <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mb-4">{m.content}</p>

                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-blue-400 h-full rounded-full" style={{ width: '30%' }}></div>
                                    </div>
                                    <span className="text-[10px] font-black text-gray-400">30%</span>
                                </div>
                            </div>

                            <div className="mt-auto pt-5 border-t border-gray-50 flex justify-between items-center">
                                <div className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
                                    🎯 {m.target_phrases?.length || 0} Missions
                                </div>
                                <div className="text-xs font-bold text-blue-500 bg-blue-50 px-3 py-1 rounded-full">
                                    Advanced level
                                </div>
                            </div>
                        </div>
                    ))}
                    {materials.length === 0 && (
                        <div className="col-span-full py-32 text-center">
                            <div className="text-6xl mb-6 opacity-20">📂</div>
                            <h3 className="text-xl font-bold text-gray-400">No scenarios found</h3>
                            <p className="text-gray-300">Start by creating your first role-play scenario!</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto pr-4">
                    <div className="max-w-2xl mx-auto bg-white p-10 rounded-[2.5rem] shadow-2xl border border-gray-100 mb-10">
                        <h3 className="text-2xl font-black text-gray-900 mb-8 border-b border-gray-50 pb-6">Create New Scenario</h3>

                        <div className="space-y-6">
                            <div>
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 block">Scenario Title</label>
                                <input
                                    placeholder="e.g., Job Interview at Google"
                                    value={newTitle}
                                    onChange={e => setNewTitle(e.target.value)}
                                    className="premium-input w-full font-bold text-lg"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 block">AI Role</label>
                                    <input
                                        placeholder="e.g., Hiring Manager"
                                        value={newAiRole}
                                        onChange={e => setNewAiRole(e.target.value)}
                                        className="premium-input w-full"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 block">User Role</label>
                                    <input
                                        placeholder="e.g., Candidate"
                                        value={newUserRole}
                                        onChange={e => setNewUserRole(e.target.value)}
                                        className="premium-input w-full"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 block">Context & Situation</label>
                                <textarea
                                    className="premium-input w-full h-32 resize-none"
                                    placeholder="Describe the setting, the mood, and the objective..."
                                    value={newContent}
                                    onChange={e => setNewContent(e.target.value)}
                                />
                            </div>

                            <div className="bg-yellow-50/50 p-6 rounded-3xl border border-yellow-100">
                                <label className="text-xs font-black text-yellow-700 uppercase tracking-widest mb-3 flex justify-between">
                                    <span>🎯 Target Phrases (Missions)</span>
                                    <span className="text-[10px] normal-case opacity-60">One phrase per line</span>
                                </label>
                                <textarea
                                    className="premium-input w-full h-40 resize-none font-mono text-sm bg-white border-yellow-200"
                                    placeholder={"I'm looking forward to...\nMy greatest strength is...\n..."}
                                    value={newTargetPhrases}
                                    onChange={e => setNewTargetPhrases(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button onClick={handleAdd} className="btn-premium btn-yellow flex-1 py-4 text-lg">
                                    Save & Launch
                                </button>
                                <button onClick={() => setIsAdding(false)} className="btn-premium btn-ghost px-10">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MaterialManager;
