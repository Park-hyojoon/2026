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
import DailyStrategy from './components/Dashboard/DailyStrategy';
import { Layout, Calendar, Book, Trophy, Settings as SettingsIcon, Bell, Search, User, Home } from 'lucide-react';

function App() {
  const [data, setData] = useLocalStorage('amir-planner-data', initialData);
  const [activeTab, setActiveTab] = useState('projects'); // AI Hub가 기본 화면
  const [showNotification, setShowNotification] = useState(false);
  const [showReview, setShowReview] = useState(false);

  const handleUpdateTask = (subject, newHours) => {
    const todayIndex = 0;
    const updatedData = { ...data };
    const today = updatedData.currentWeek.days[todayIndex];
    today[subject].hours = parseFloat(newHours);
    today[subject].completed = today[subject].hours >= data.dailyGoals[subject];

    // Simulate notification when a goal is hit
    if (today[subject].completed) {
      setShowNotification(true);
    }

    setData(updatedData);
  };

  // Handle Metadata of uploaded files (Mock implementation)
  const handleFileUpload = (taskId, file) => {
    const updatedData = { ...data };

    // In a real app, you'd upload 'file' to a server and get a URL/ID back.
    // Here we just store the filename for UI persistence
    if (taskId === 'accounting') {
      if (!updatedData.accounting.level2.referenceMaterials) {
        updatedData.accounting.level2.referenceMaterials = [];
      }
      updatedData.accounting.level2.referenceMaterials.push({
        id: Date.now(),
        name: file.name,
        uploadedAt: new Date().toISOString()
      });

      // Trigger a "Material Analyzed" notification
      setTimeout(() => {
        setShowNotification(true);
      }, 2000);
    }
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

  // 학습 범위 저장 핸들러
  const handleTopicSubmit = (taskId, topic) => {
    const updatedData = { ...data };
    const today = new Date().toISOString().split('T')[0];

    if (taskId === 'accounting') {
      if (!updatedData.accounting.studyLog) {
        updatedData.accounting.studyLog = [];
      }
      // 같은 날짜에 이미 기록이 있으면 업데이트, 없으면 추가
      const existingIndex = updatedData.accounting.studyLog.findIndex(
        log => log.date === today
      );
      if (existingIndex >= 0) {
        updatedData.accounting.studyLog[existingIndex].topic = topic;
      } else {
        updatedData.accounting.studyLog.push({ date: today, topic });
      }
    }

    setData(updatedData);
  };

  // 오늘의 학습 범위 가져오기
  const getTodayStudyTopics = () => {
    const today = new Date().toISOString().split('T')[0];
    const topics = {};

    const accountingLog = data?.accounting?.studyLog?.find(log => log.date === today);
    if (accountingLog) {
      topics.accounting = accountingLog.topic;
    }

    return topics;
  };

  // 데이터 가져오기 핸들러
  const handleImportData = (importedData) => {
    // exportedAt, version 등 메타데이터 제거 후 저장
    const { exportedAt, version, ...cleanData } = importedData;
    setData(cleanData);
  };

  // 영어 표현 저장 핸들러
  const handleSavePhrase = (phrase) => {
    const updatedData = { ...data };

    if (!updatedData.english.targetPhrases) {
      updatedData.english.targetPhrases = [];
    }

    // 중복 체크
    const existing = updatedData.english.targetPhrases.find(
      p => p.phrase.toLowerCase() === phrase.toLowerCase()
    );

    if (!existing) {
      updatedData.english.targetPhrases.push({
        phrase,
        practiceCount: 0,
        addedAt: new Date().toISOString()
      });
    }

    setData(updatedData);
  };

  const tabs = [
    { id: 'projects', label: data.user.language === 'en' ? 'AI Hub' : 'AI Hub', icon: Book },
    { id: 'planner', label: data.user.language === 'en' ? 'Plan' : '계획', icon: Calendar },
    { id: 'roadmap', label: data.user.language === 'en' ? 'Roadmap' : '로드맵', icon: Trophy },
    { id: 'settings', label: data.user.language === 'en' ? 'Settings' : '설정', icon: SettingsIcon },
  ];

  const reviewContent = `[Study Review]
${data.user.name} 님, 오늘의 학습 피드백입니다.

* 학습 일시 : ${new Date().toLocaleDateString()}
* 수강 과목 : 회계 & 영어 & AI
* 담당 AI : Amir AI Coach

📌 수업 내용 및 전략 :
오늘 설정하신 목표를 달성하셨습니다. 특히 회계 파트에서 전산회계 1급 관련 자산 계정 과목 분류를 성공적으로 끝내셨네요.
📌 강점 및 취약점 :
자본 파트보다 자산 파트의 이해도가 20% 높게 나타납니다. 내일은 취약한 부채/자본 파트에 집중하세요.
📌 다음 숙제 :
1. 전산회계 1급 기출문제 5회차 풀기
2. 영어 Golden Phrases 3번 반복 말하기
`;

  const lang = data?.user?.language || 'ko';

  return (
    <div className="min-h-screen bg-[#fcfdfe] text-gray-900 font-['Inter'] flex flex-col md:flex-row overflow-hidden">
      {/* Review Modal */}
      {showReview && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-gray-900">
                {lang === 'en' ? 'Study Feedback' : '학습 피드백'}
              </h3>
              <button onClick={() => setShowReview(false)} className="text-gray-400 font-bold hover:text-gray-900">
                {lang === 'en' ? 'Close' : '닫기'}
              </button>
            </div>
            <div className="bg-gray-50 p-6 rounded-2xl whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-700 h-[400px] overflow-y-auto">
              {reviewContent}
            </div>
          </div>
        </div>
      )}

      {/* Premium Sidebar (Desktop) */}
      <nav className="hidden md:flex flex-col w-64 bg-white p-8 space-y-2 z-20 shadow-[20px_0_50px_rgba(0,0,0,0.02)]">
        <div className="mb-12 px-2">
          <h1 className="text-2xl font-black text-primary tracking-tighter">AMIR Planner</h1>
        </div>

        <div className="space-y-1.5">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 px-2">
            {lang === 'en' ? 'Main Menu' : '메인 메뉴'}
          </p>
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
          {/* 사용자 프로필 (클릭 시 Dashboard 이동) */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full rounded-[1.5rem] p-4 flex items-center space-x-3 transition-all duration-300 ${activeTab === 'dashboard'
              ? 'bg-primary shadow-xl shadow-primary/20'
              : 'bg-gray-50 hover:bg-gray-100'
              }`}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark"></div>
            <div className="text-left">
              <p className={`text-xs font-black tracking-tight ${activeTab === 'dashboard' ? 'text-white' : 'text-gray-900'}`}>
                {data.user.name}{lang === 'en' ? '' : '님'}
              </p>
              <p className={`text-[10px] font-bold ${activeTab === 'dashboard' ? 'text-white/70' : 'text-gray-400'}`}>
                Premium Member
              </p>
            </div>
            {activeTab === 'dashboard' && (
              <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></div>
            )}
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* Modern Header */}
        <header className="bg-white/80 backdrop-blur-md p-6 flex justify-between items-center z-10 sticky top-0 md:px-12">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setActiveTab('projects')}
              className="md:hidden p-2 rounded-xl bg-gray-50 text-gray-600 hover:text-primary transition-colors"
            >
              <Home size={24} strokeWidth={2.5} />
            </button>
            <div className="hidden md:flex items-center bg-gray-100 rounded-2xl px-4 py-2 w-96">
              <Search size={18} className="text-gray-400 mr-2" />
              <input type="text" placeholder={lang === 'en' ? "Search milestones..." : "검색..."} className="bg-transparent border-none outline-none text-sm font-medium w-full" />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                setShowReview(true);
                setShowNotification(false);
              }}
              className="p-2.5 rounded-2xl bg-gray-50 text-gray-500 hover:bg-white hover:shadow-md transition-all relative"
            >
              <Bell size={20} />
              {showNotification && (
                <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></div>
              )}
            </button>
            <button className="p-1 rounded-2xl bg-gray-100 p-1.5">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><User size={20} /></div>
            </button>
          </div>
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-1 p-6 md:p-12 pb-32 overflow-y-auto bg-[#fafbfc]">
          {activeTab === 'dashboard' && (
            <div className="max-w-[1380px] mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* 1. Daily Strategy (Replaces purple bar if enabled) */}
              {data.user.showStrategy ? (
                <DailyStrategy data={data} />
              ) : (
                <div className="pt-2" />
              )}

              {/* 2. Parallel Layout (Today Tasks + Weekly Progress) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start h-full">
                {/* Left Column: Today's Tasks */}
                <div className="h-full">
                  <TodayTasks
                    tasks={[
                      {
                        id: 'accounting',
                        name: lang === 'en' ? 'Accounting' : '회계 공부',
                        goal: data.dailyGoals.accounting,
                        current: data.currentWeek.days[0].accounting.hours,
                        emoji: '📊',
                        completed: data.currentWeek.days[0].accounting.completed,
                        uploadedFile: data.accounting?.level2?.referenceMaterials?.length > 0 ? data.accounting.level2.referenceMaterials[data.accounting.level2.referenceMaterials.length - 1].name : null
                      },
                      {
                        id: 'english',
                        name: lang === 'en' ? 'English Practice' : '영어 연습',
                        goal: data.dailyGoals.english,
                        current: data.currentWeek.days[0].english.hours,
                        emoji: '🗣️',
                        completed: data.currentWeek.days[0].english.completed
                      },
                      {
                        id: 'ai',
                        name: lang === 'en' ? 'AI Learning' : 'AI 학습',
                        goal: data.dailyGoals.ai,
                        current: data.currentWeek.days[0].ai.hours,
                        emoji: '🤖',
                        completed: data.currentWeek.days[0].ai.completed
                      },
                    ]}
                    onUpdate={handleUpdateTask}
                    onFileUpload={handleFileUpload}
                    onTopicSubmit={handleTopicSubmit}
                    savedStudyTopics={getTodayStudyTopics()}
                    lang={lang}
                  />
                </div>

                {/* Right Column: Weekly Progress */}
                <div className="h-full">
                  <WeeklyProgress weekly={data.weeklyGoals} current={data.currentWeek} lang={lang} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'planner' && (
            <div className="max-w-[1380px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
              <WeeklyPlanner
                weekData={data.currentWeek}
                onUpdate={(updatedWeek) => setData({ ...data, currentWeek: updatedWeek })}
                data={data}
              />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-[1380px] mx-auto">
              <Settings data={data} onUpdate={handleUpdateSettings} onImportData={handleImportData} />
            </div>
          )}

          {activeTab === 'projects' && (
            <AIHub data={data} onSavePhrase={handleSavePhrase} />
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
