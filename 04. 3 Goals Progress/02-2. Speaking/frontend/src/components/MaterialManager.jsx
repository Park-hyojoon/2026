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

            if (!res.ok) {
                throw new Error(`Server error: ${res.status}`);
            }

            setNewTitle('');
            setNewContent('');
            setNewAiRole('Tutor');
            setNewUserRole('Student');
            setNewTargetPhrases('');
            setIsAdding(false);
            fetchMaterials();
        } catch (e) {
            console.error("Failed to add material", e);
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
            console.error("Failed to delete material", e);
            alert("Failed to delete material");
        }
    };

    return (
        <div className="h-full flex flex-col relative overflow-hidden">
            <div className="flex justify-between items-center mb-6 z-10">
                <h3 className="font-bold text-gray-800 text-lg">Available Scenarios</h3>
                {!isAdding && (
                    <button onClick={() => setIsAdding(true)} className="btn btn-primary">
                        + New
                    </button>
                )}
            </div>

            {!isAdding ? (
                <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-4">
                    {materials.map(m => (
                        <div
                            key={m.id}
                            onClick={() => onSelectMaterial(m)}
                            className={`p-6 rounded-3xl cursor-pointer transition-all duration-300 border relative flex flex-col gap-3 shadow-sm hover:shadow-md ${activeMaterial && activeMaterial.id === m.id
                                    ? 'bg-yellow-50 border-yellow-400 ring-2 ring-yellow-200'
                                    : 'bg-gray-50 border-gray-100 hover:bg-white'
                                }`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="p-3 rounded-2xl bg-white shadow-sm text-2xl">
                                    🎭
                                </div>
                                <button
                                    onClick={(e) => handleDelete(e, m.id)}
                                    className="p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                                >
                                    ✕
                                </button>
                            </div>

                            <div>
                                <h3 className="font-bold text-lg text-gray-800 mb-1 font-display truncate">{m.title}</h3>
                                <div className="flex gap-2 text-xs text-gray-500 mb-3">
                                    <span className="bg-white px-2 py-1 rounded border border-gray-100">🤖 {m.ai_role || 'Tutor'}</span>
                                    <span className="bg-white px-2 py-1 rounded border border-gray-100">👤 {m.user_role || 'User'}</span>
                                </div>
                                <p className="text-sm text-gray-500 line-clamp-2">{m.content}</p>
                            </div>

                            {m.target_phrases && m.target_phrases.length > 0 && (
                                <div className="mt-auto pt-3 border-t border-gray-100 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                                    <div className="text-xs text-gray-600 font-medium">
                                        {m.target_phrases.length} Missions
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    {materials.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center text-gray-400 py-20">
                            <div className="text-4xl mb-4 opacity-30">📝</div>
                            <p>No scenarios yet.</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto pr-4 z-10">
                    <div className="max-w-2xl mx-auto flex flex-col gap-6 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Create New Scenario</h3>
                            <input
                                placeholder="Scenario Title (e.g., Salary Negotiation)"
                                value={newTitle}
                                onChange={e => setNewTitle(e.target.value)}
                                className="text-lg font-bold bg-gray-50"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-500 mb-2 block ml-1 font-bold">AI Role</label>
                                <input
                                    placeholder="e.g., Strict Boss"
                                    value={newAiRole}
                                    onChange={e => setNewAiRole(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 mb-2 block ml-1 font-bold">User Role</label>
                                <input
                                    placeholder="e.g., Employee"
                                    value={newUserRole}
                                    onChange={e => setNewUserRole(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-gray-500 mb-2 block ml-1 font-bold">Scenario Description</label>
                            <textarea
                                className="resize-none h-32"
                                placeholder="Describe the situation..."
                                value={newContent}
                                onChange={e => setNewContent(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="text-xs text-gray-500 mb-2 block ml-1 flex justify-between font-bold">
                                <span>🎯 Target Phrases (Missions)</span>
                                <span>One phrase per line</span>
                            </label>
                            <textarea
                                className="resize-none h-40 font-mono text-sm bg-yellow-50 border-yellow-200"
                                placeholder={"I'll have it done by Friday...\nCan we reschedule..."}
                                value={newTargetPhrases}
                                onChange={e => setNewTargetPhrases(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-3 pt-6">
                            <button onClick={handleAdd} className="btn btn-primary flex-1 py-3 text-lg">
                                Save Scenario
                            </button>
                            <button onClick={() => setIsAdding(false)} className="btn btn-secondary px-8">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MaterialManager;
