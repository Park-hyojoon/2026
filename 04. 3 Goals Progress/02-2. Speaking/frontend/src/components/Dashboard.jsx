import React, { useState, useEffect } from 'react';

const Dashboard = () => {
    const [materials, setMaterials] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Materials (Courses)
                const materialsRes = await fetch('http://localhost:8000/materials');
                if (materialsRes.ok) {
                    const materialsData = await materialsRes.json();
                    setMaterials(materialsData);
                }
            } catch (e) {
                console.error("Failed to fetch dashboard data", e);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="h-full flex flex-col animate-fade-in pr-2 overflow-y-auto pb-10">
            <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-800">Learning Dashboard</h3>
                <p className="text-xs text-gray-400 font-medium mt-1">Track your progress and consistency</p>
            </div>

            {/* My Courses Section */}
            <div className="mb-12">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-black text-gray-900">My Courses</h3>
                    <div className="flex gap-6 text-sm font-bold text-gray-400">
                        <button className="text-gray-900 border-b-2 border-yellow-400 pb-1">All</button>
                        <button className="hover:text-gray-600 transition">Active</button>
                        <button className="hover:text-gray-600 transition">Completed</button>
                        <button className="ml-4 text-xs font-black uppercase tracking-widest text-blue-500 hover:underline">See all</button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {materials.map(material => {
                        const totalPhrases = material.target_phrases?.length || 0;
                        const masteredCount = Object.values(material.progress || {}).filter(v => v === true).length;
                        const progressPercent = totalPhrases > 0 ? Math.round((masteredCount / totalPhrases) * 100) : 0;

                        return (
                            <div key={material.id} className="card-premium p-6 bg-white hover:shadow-hover transition-all group">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition">
                                        📚
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-gray-900 truncate">{material.title}</h4>
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider mt-0.5">Prof. AI Tutor</p>
                                    </div>
                                </div>

                                <div className="text-[11px] font-bold text-green-600 mb-6 px-2.5 py-1 bg-green-50 w-fit rounded-lg">
                                    Beginner level
                                </div>

                                <div className="flex items-center gap-4 mb-6 px-2">
                                    <div className="flex items-center gap-1.5 text-gray-400">
                                        <span className="text-xs">📅</span>
                                        <span className="text-[10px] font-black uppercase">15</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-gray-400">
                                        <span className="text-xs">🕒</span>
                                        <span className="text-[10px] font-black uppercase">15m</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-gray-400">
                                        <span className="text-xs">👥</span>
                                        <span className="text-[10px] font-black uppercase">{totalPhrases}</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="w-full bg-gray-50 rounded-full h-1.5 overflow-hidden">
                                        <div
                                            className="bg-gray-900 h-full rounded-full transition-all duration-1000"
                                            style={{ width: `${progressPercent}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest color-gray-400">
                                        <span>Completed:</span>
                                        <span className="text-green-600">{progressPercent}%</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {materials.length === 0 && (
                        <div className="col-span-full py-10 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200 text-center text-gray-400 font-medium italic">
                            No courses available. Create a scenario to get started!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
