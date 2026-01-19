import React, { useState } from 'react';
import MaterialManager from './components/MaterialManager';
import ExpressionManager from './components/ExpressionManager';
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
              label="Dashboard"
              icon="🏠"
              active={activeTab === 'dashboard'}
              onClick={() => setActiveTab('dashboard')}
            />
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

          <div className="mt-auto">
            <div className="bg-gray-900 p-6 rounded-[2rem] text-white relative overflow-hidden group cursor-pointer">
              <div className="relative z-10">
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold mb-3 group-hover:scale-110 transition">?</div>
                <h4 className="font-bold mb-1">Help center</h4>
                <p className="text-xs text-gray-400 mb-4 leading-relaxed">Have a problem?<br />Send us a message!</p>
                <button className="w-full bg-white text-black py-2.5 rounded-xl text-xs font-bold hover:bg-gray-100 transition">Go to help center</button>
              </div>
              <div className="absolute -bottom-8 -right-8 w-28 h-28 bg-yellow-400 rounded-full opacity-10 blur-xl"></div>
            </div>
          </div>
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
                {activeTab === 'dashboard' && "Skill Dashboard"}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                <input
                  type="text"
                  placeholder="Search for lessons..."
                  className="premium-input pl-11 w-64 bg-gray-50 border-none"
                />
              </div>
              <button className="w-12 h-12 bg-white rounded-2xl border border-gray-100 flex items-center justify-center text-xl shadow-sm hover:bg-gray-50 transition relative">
                🔔
                <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
            </div>
          </header>

          <div className="flex-1 min-h-0">
            {activeTab === 'tutor' && <TutorInterface activeMaterial={activeMaterial} />}
            {activeTab === 'materials' && <MaterialManager onSelectMaterial={handleSelectMaterial} activeMaterial={activeMaterial} />}
            {activeTab === 'expressions' && <ExpressionManager />}
            {activeTab === 'dashboard' && <div className="text-center py-20 text-gray-400">Dashboard statistics coming soon!</div>}
          </div>
        </main>

        {/* 3. Side Panel (Profile/Calendar) */}
        <aside className="side-panel">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl">Profile</h3>
            <button className="text-gray-400 hover:text-black">✏️</button>
          </div>

          <div className="flex flex-col items-center py-6">
            <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center text-5xl shadow-inner border-4 border-white mb-4">
              🎓
            </div>
            <h3 className="text-xl font-bold">Standard User</h3>
            <p className="text-sm text-gray-400 font-medium">user@example.com</p>
          </div>

          <div className="mt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl">Schedule</h3>
              <button className="text-xs font-bold text-gray-400 hover:text-black uppercase tracking-wider">See all</button>
            </div>
            <div className="space-y-4">
              <ScheduleItem time="12:00" title="Business English" sub="Negotiation Practice" color="yellow" />
              <ScheduleItem time="14:30" title="Daily Speaking" sub="At the Restaurant" color="blue" />
            </div>
          </div>

          <div className="mt-10">
            <h3 className="text-xl mb-4">Learning Progress</h3>
            <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold">Overall Mastery</span>
                <span className="text-sm font-bold text-yellow-600">75%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-400 h-full rounded-full" style={{ width: '75%' }}></div>
              </div>
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
