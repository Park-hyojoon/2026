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
        if (!newTitle || !newContent) {
            alert("Please fill in both title and content.");
            return;
        }
        try {
            const res = await fetch('http://localhost:8000/materials', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newTitle, content: newContent })
            });

            if (!res.ok) {
                throw new Error(`Server error: ${res.status}`);
            }

            setNewTitle('');
            setNewContent('');
            setIsAdding(false);
            fetchMaterials();
            alert("Material saved successfully!");
        } catch (e) {
            console.error("Failed to add material", e);
            alert(`Failed to save material: ${e.message}`);
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation(); // Prevent selecting the material
        if (!confirm('Delete this material?')) return;
        try {
            await fetch(`http://localhost:8000/materials/${id}`, { method: 'DELETE' });
            fetchMaterials();
            if (activeMaterial && activeMaterial.id === id) {
                // Ideally cancel selection if the deleted one was selected
                // For now, parent handles selection, so we can't easily deselect without parent prop
                // But it's fine.
            }
        } catch (e) {
            console.error("Failed to delete material", e);
            alert("Failed to delete material");
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
                                className="p-3 bg-gray-800 rounded hover:bg-gray-700 cursor-pointer transition flex justify-between items-start"
                            >
                                <div className="flex-1 min-w-0 mr-2">
                                    <h3 className="font-bold text-white truncate">{m.title}</h3>
                                    <p className="text-xs text-gray-400 truncate">{m.content.substring(0, 50)}...</p>
                                </div>
                                <button
                                    onClick={(e) => handleDelete(e, m.id)}
                                    className="text-gray-500 hover:text-red-400 px-2"
                                >
                                    X
                                </button>
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
