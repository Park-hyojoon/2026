import React, { useState } from 'react';
import MaterialManager from './components/MaterialManager';
import ExpressionManager from './components/ExpressionManager';
import TutorInterface from './components/TutorInterface';
import TutorInterface from './components/TutorInterface';

function App() {
  const [activeTab, setActiveTab] = useState('tutor');
  const [activeMaterial, setActiveMaterial] = useState(null);

  const handleSelectMaterial = (material) => {
    setActiveMaterial(material);
    setActiveTab('tutor');
  };

  return (
    <div className="app-container">
      <div className="inner-container">
        {/* 1. Sidebar Navigation */}
        <aside className="nav-sidebar">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center text-xl font-extrabold shadow-sm">
              A
            </div>
            <h1 className="text-xl font-extrabold tracking-tight">English Academy</h1>
          </div>

          <nav className="flex flex-col gap-2">
            <NavLink
              label="Speaking Session"
              icon="💬"
              active={activeTab === 'tutor'}
              onClick={() => setActiveTab('tutor')}
            />
            <NavLink
              label="My Scenarios"
              icon="📚"
              active={activeTab === 'materials'}
              onClick={() => setActiveTab('materials')}
            />
            <NavLink
              label="Expression Bank"
              icon="🧠"
              active={activeTab === 'expressions'}
              onClick={() => setActiveTab('expressions')}
            />
          </nav>

        </aside>

        {/* 2. Main Workspace */}
        <main className="main-workspace">
          <header className="flex justify-between items-center mb-10">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-1">Hello Student 👋</p>
              <h2 className="text-3xl font-extrabold tracking-tight">
                {activeTab === 'tutor' && "Speaking Session"}
                {activeTab === 'materials' && "My Scenarios"}
                {activeTab === 'expressions' && "Expression Bank"}
              </h2>
            </div>
          </header>

          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            {activeTab === 'tutor' && <TutorInterface activeMaterial={activeMaterial} />}
            {activeTab === 'materials' && <MaterialManager onSelectMaterial={handleSelectMaterial} activeMaterial={activeMaterial} />}
            {activeTab === 'expressions' && <ExpressionManager />}
          </div>
        </main>

        {/* 3. Side Panel (Profile/Calendar) */}
        <aside className="side-panel">
          <div className="mt-4">
            <div className="mt-4">
            </div>
          </div>

        </aside>
      </div>
    </div>
  );
}

const NavLink = ({ label, icon, active, onClick }) => (
  <button
    onClick={onClick}
    className={`nav-link ${active ? 'active' : ''}`}
  >
    <span className="text-xl opacity-80">{icon}</span>
    <span className="font-semibold">{label}</span>
  </button>
);

const ScheduleItem = ({ time, title, sub, color }) => (
  <div className={`p-5 rounded-3xl border-l-4 shadow-sm flex items-center gap-4 transition-transform hover:scale-[1.02] cursor-pointer ${color === 'yellow' ? 'bg-yellow-50/50 border-yellow-400' : 'bg-blue-50/50 border-blue-400'
    }`}>
    <div className="text-center">
      <div className="text-xs font-black text-gray-900">{time}</div>
    </div>
    <div className="flex-1">
      <div className="font-bold text-sm text-gray-800">{title}</div>
      <div className="text-[10px] text-gray-500 font-medium">{sub}</div>
    </div>
  </div>
);

export default App;
