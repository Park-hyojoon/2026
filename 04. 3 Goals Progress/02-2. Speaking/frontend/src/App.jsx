import React, { useState } from 'react';
import MaterialManager from './components/MaterialManager';
import ExpressionManager from './components/ExpressionManager';
import TutorInterface from './components/TutorInterface';

function App() {
  const [activeTab, setActiveTab] = useState('tutor'); // 'tutor', 'materials', 'expressions'
  const [activeMaterial, setActiveMaterial] = useState(null);

  const handleSelectMaterial = (material) => {
    setActiveMaterial(material);
    setActiveTab('tutor');
  };

  return (
    <div className="dashboard-layout">
      {/* 1. Sidebar */}
      <div className="sidebar">
        <div className="flex items-center gap-3 px-2 mb-10">
          <div className="w-10 h-10 bg-yellow-300 rounded-xl flex items-center justify-center text-xl font-bold">
            AI
          </div>
          <div>
            <h1 className="font-bold text-xl leading-none">English<br />Academy</h1>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          <button
            className={`nav-item ${activeTab === 'tutor' ? 'active' : ''}`}
            onClick={() => setActiveTab('tutor')}
          >
            <span className="text-xl">💬</span> Speaking
          </button>
          <button
            className={`nav-item ${activeTab === 'materials' ? 'active' : ''}`}
            onClick={() => setActiveTab('materials')}
          >
            <span className="text-xl">📁</span> Scenarios
          </button>
          <button
            className={`nav-item ${activeTab === 'expressions' ? 'active' : ''}`}
            onClick={() => setActiveTab('expressions')}
          >
            <span className="text-xl">📝</span> Expressions
          </button>
        </nav>

        <div className="mt-auto p-6 bg-gray-900 rounded-3xl text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold mb-3">?</div>
            <h4 className="font-bold mb-1">Help Center</h4>
            <p className="text-xs text-gray-400 mb-3">Need help speaking?</p>
            <button className="bg-white text-black text-xs font-bold py-2 px-4 rounded-full">Go to help</button>
          </div>
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-yellow-400 rounded-full opacity-20"></div>
        </div>
      </div>

      {/* 2. Main Content */}
      <div className="main-content">
        <header className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">
              {activeTab === 'tutor' && "Speaking Session"}
              {activeTab === 'materials' && "My Scenarios"}
              {activeTab === 'expressions' && "Expression Bank"}
            </h2>
            <p className="text-gray-500 text-sm">Let's learn something new today!</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Search simulation */}
            <div className="bg-white px-4 py-2 rounded-full border border-gray-200 text-gray-400 text-sm w-64 flex items-center gap-2">
              <span>🔍</span> Search...
            </div>
            <button className="w-10 h-10 bg-white rounded-full border border-gray-200 flex items-center justify-center text-gray-500">
              🔔
            </button>
          </div>
        </header>

        <div className="flex-1 bg-white rounded-[2rem] p-6 shadow-sm overflow-hidden relative border border-gray-100">
          {activeTab === 'tutor' && (
            <TutorInterface activeMaterial={activeMaterial} />
          )}
          {activeTab === 'materials' && (
            <MaterialManager onSelectMaterial={handleSelectMaterial} activeMaterial={activeMaterial} />
          )}
          {activeTab === 'expressions' && (
            <ExpressionManager />
          )}
        </div>
      </div>

      {/* 3. Right Panel (Profile & Stats) */}
      <div className="right-panel">
        {/* Profile */}
        <div className="flex flex-col items-center p-6 bg-white rounded-3xl shadow-sm border border-gray-100">
          <div className="w-20 h-20 bg-blue-100 rounded-full mb-3 flex items-center justify-center text-4xl overflow-hidden">
            🧑‍🎓
          </div>
          <h3 className="font-bold text-lg">Student</h3>
          <p className="text-sm text-gray-400">Level: Intermediate</p>
        </div>

        {/* Calendar/Stats Widget */}
        <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold mb-4">Schedule</h3>
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 rounded-2xl border-l-4 border-yellow-400">
              <div className="text-xs text-gray-500 mb-1">Today, 12:00</div>
              <div className="font-bold">Business English</div>
              <div className="text-xs text-gray-500">Role-Play: Negotiation</div>
            </div>
            <div className="p-4 bg-blue-50 rounded-2xl border-l-4 border-blue-400">
              <div className="text-xs text-gray-500 mb-1">Tomorrow, 10:00</div>
              <div className="font-bold">Casual Talk</div>
              <div className="text-xs text-gray-500">Topic: Travel</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
