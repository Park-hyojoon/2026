import React, { useState, useEffect } from 'react';

const MaterialManager = ({ onSelectMaterial }) => {
    const [materials, setMaterials] = useState([]);
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
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
        if (!newTitle || !newContent) return;
        try {
            await fetch('http://localhost:8000/materials', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newTitle, content: newContent })
            });
            setNewTitle('');
            setNewContent('');
            setIsAdding(false);
            fetchMaterials();
        } catch (e) {
            console.error("Failed to add material", e);
        }
    };

    return (
        <div className="glass-panel p-6 h-full flex flex-col">
            <h2 className="text-xl font-bold mb-4 gradient-text">Learning Materials</h2>

            {!isAdding ? (
                <>
                    <button onClick={() => setIsAdding(true)} className="btn btn-secondary mb-4 w-full">
                        + Add New Material
                    </button>
                    <div className="flex-1 overflow-y-auto space-y-2">
                        {materials.map(m => (
                            <div
                                key={m.id}
                                onClick={() => onSelectMaterial(m)}
                                className="p-3 bg-gray-800 rounded hover:bg-gray-700 cursor-pointer transition"
                            >
                                <h3 className="font-bold text-white">{m.title}</h3>
                                <p className="text-xs text-gray-400 truncate">{m.content.substring(0, 50)}...</p>
                            </div>
                        ))}
                        {materials.length === 0 && <p className="text-gray-500 text-center">No materials yet.</p>}
                    </div>
                </>
            ) : (
                <div className="flex flex-col gap-4 h-full">
                    <input
                        placeholder="Title (e.g., Business Meeting Intro)"
                        value={newTitle}
                        onChange={e => setNewTitle(e.target.value)}
                    />
                    <textarea
                        className="flex-1 resize-none"
                        placeholder="Paste text here..."
                        value={newContent}
                        onChange={e => setNewContent(e.target.value)}
                    />
                    <div className="flex gap-2">
                        <button onClick={handleAdd} className="btn btn-primary flex-1">Save</button>
                        <button onClick={() => setIsAdding(false)} className="btn btn-secondary">Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MaterialManager;
