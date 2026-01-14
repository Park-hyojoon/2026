import React, { useState } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { initialData } from './utils/dataInitializer';
import TodayTasks from './components/Dashboard/TodayTasks';
import WeeklyProgress from './components/Dashboard/WeeklyProgress';
import WeeklyPlanner from './components/WeeklyPlanner/WeeklyPlanner';
import ContributionGraph from './components/Dashboard/ContributionGraph'; // Kept primarily for file history, but unused in render
import YearlyGoalGraph from './components/Dashboard/YearlyGoalGraph';
import Settings from './components/Settings/Settings';
import AIHub from './components/AIHub/AIHub';
import Roadmap from './components/Roadmap/Roadmap';

function App() {
  const [data, setData] = useLocalStorage('amir-planner-data', initialData);
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleUpdateTask = (subject, newHours) => {
    const todayIndex = 0; // Simplified for MVP
    const updatedData = { ...data };
    const today = updatedData.currentWeek.days[todayIndex];
    today[subject].hours = parseFloat(newHours);
    today[subject].completed = today[subject].hours >= data.dailyGoals[subject];
    setData(updatedData);
  };

  const handleUpdateSettings = (path, value) => {
    const updatedData = { ...data };
    const keys = path.split('.');
    let current = updatedData;

    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    setData(updatedData);
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Layout },
    { id: 'planner', label: 'Weekly Plan', icon: Calendar },
    { id: 'projects', label: 'AI Projects', icon: Book },
    { id: 'roadmap', label: 'Roadmap', icon: Trophy },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-[#fcfdfe] text-gray-900 font-['Inter'] flex flex-col md:flex-row overflow-hidden">

      {/* Premium Sidebar (Desktop) */}
      <nav className="hidden md:flex flex-col w-72 bg-white p-8 space-y-2 z-20 shadow-[20px_0_50px_rgba(0,0,0,0.02)]">
        <div className="mb-12 px-2">
        </div>

        <div className="space-y-1.5">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 px-2">Main Menu</p>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center space-x-4 p-4 rounded-2xl transition-all duration-300 group ${activeTab === tab.id
                ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >
              <tab.icon size={22} strokeWidth={activeTab === tab.id ? 2.5 : 2} className={activeTab === tab.id ? '' : 'group-hover:scale-110 transition-transform'} />
              <span className="font-bold tracking-tight">{tab.label}</span>
              {activeTab === tab.id && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></div>}
            </button>
          ))}
        </div>

        <div className="mt-auto pt-8">
          <div className="bg-gray-50 rounded-[1.5rem] p-4 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark"></div>
            <div>
              <p className="text-xs font-black text-gray-900 tracking-tight">{data.user.name}님</p>
              <p className="text-[10px] font-bold text-gray-400">Premium Member</p>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* Modern Header */}
        <header className="bg-white/80 backdrop-blur-md p-6 flex justify-between items-center z-10 sticky top-0 md:px-12">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="md:hidden p-2 rounded-xl bg-gray-50 text-gray-600 hover:text-primary transition-colors"
            >
              <Home size={24} strokeWidth={2.5} />
            </button>
            <div className="hidden md:flex items-center bg-gray-100 rounded-2xl px-4 py-2 w-80">
              <Search size={18} className="text-gray-400 mr-2" />
              <input type="text" placeholder="Search milestones..." className="bg-transparent border-none outline-none text-sm font-medium w-full" />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2.5 rounded-2xl bg-gray-50 text-gray-500 hover:bg-white hover:shadow-md transition-all relative">
              <Bell size={20} />
              <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></div>
            </button>
            <button className="p-1 rounded-2xl bg-gray-100 p-1.5">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><User size={20} /></div>
            </button>
          </div>
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-1 p-6 md:p-12 pb-32 overflow-y-auto bg-[#fafbfc]">
          {activeTab === 'dashboard' && (
            <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* 1. Yearly Goal Graph (Top) */}
              <YearlyGoalGraph data={data} />

              {/* 2. Parallel Layout (Today Tasks + Weekly Progress) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start h-full">
                {/* Left Column: Today's Tasks */}
                <div className="h-full">
                  <TodayTasks
                    tasks={[
                      { id: 'ai', name: 'AI 학습', goal: data.dailyGoals.ai, current: data.currentWeek.days[0].ai.hours, emoji: '🤖', completed: data.currentWeek.days[0].ai.completed },
                      { id: 'accounting', name: '회계 공부', goal: data.dailyGoals.accounting, current: data.currentWeek.days[0].accounting.hours, emoji: '📊', completed: data.currentWeek.days[0].accounting.completed },
                      { id: 'english', name: '영어 연습', goal: data.dailyGoals.english, current: data.currentWeek.days[0].english.hours, emoji: '🗣️', completed: data.currentWeek.days[0].english.completed },
                    ]}
                    onUpdate={handleUpdateTask}
                  />
                </div>

                {/* Right Column: Weekly Progress */}
                <div className="h-full">
                  <WeeklyProgress weekly={data.weeklyGoals} current={data.currentWeek} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'planner' && (
            <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
              <WeeklyPlanner
                weekData={data.currentWeek}
                onUpdate={(updatedWeek) => setData({ ...data, currentWeek: updatedWeek })}
              />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-7xl mx-auto">
              <Settings data={data} onUpdate={handleUpdateSettings} />
            </div>
          )}

          {activeTab === 'projects' && (
            <AIHub data={data} />
          )}

          {activeTab === 'roadmap' && (
            <Roadmap data={data} />
          )}
        </main>

        {/* Bottom Nav (Mobile) - Glassmorphism - FIXED POSITION */}
        <nav className="md:hidden fixed bottom-6 left-4 right-4 bg-white/80 backdrop-blur-xl flex justify-around p-4 rounded-[2rem] shadow-2xl z-50 animate-in slide-in-from-bottom-10 fade-in duration-700">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center p-2 transition-all duration-300 ${activeTab === tab.id ? 'text-primary scale-110' : 'text-gray-400 hover:text-gray-600'
                }`}
            >
              <tab.icon size={22} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}

export default App;
