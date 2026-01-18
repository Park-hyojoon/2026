import React, { useState } from 'react';
import TutorInterface from './components/TutorInterface';
import MaterialManager from './components/MaterialManager';
import ExpressionManager from './components/ExpressionManager';

function App() {
  const [activeMaterial, setActiveMaterial] = useState(null);
  const [activeTab, setActiveTab] = useState('materials'); // 'materials' or 'expressions'

  // When a material is selected, we could potentially feed it into the Tutor context
  // For now, let's just display it so the user can see it while talking.

  return (
    <div className="min-h-screen p-4 flex flex-col gap-4">
      <header className="glass-panel p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold gradient-text">AI English Tutor</h1>
        <div className="text-sm text-gray-400">Connected to Local Ollama</div>
      </header>

      <main className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-8rem)]">
        {/* Left Panel: Tab Navigation + Content */}
        <div className="md:col-span-1 h-full flex flex-col">
          {/* Tab Buttons */}
          <div className="flex gap-1 mb-2">
            <button
              onClick={() => setActiveTab('materials')}
              className={`flex-1 py-2 px-4 rounded-t text-sm font-medium transition ${
                activeTab === 'materials'
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-900 text-gray-400 hover:text-white'
              }`}
            >
              Materials
            </button>
            <button
              onClick={() => setActiveTab('expressions')}
              className={`flex-1 py-2 px-4 rounded-t text-sm font-medium transition ${
                activeTab === 'expressions'
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-900 text-gray-400 hover:text-white'
              }`}
            >
              Expressions
            </button>
          </div>
          {/* Tab Content */}
          <div className="flex-1 min-h-0">
            {activeTab === 'materials' ? (
              <MaterialManager onSelectMaterial={setActiveMaterial} />
            ) : (
              <ExpressionManager />
            )}
          </div>
        </div>

        {/* Center/Right Panel: Chat & Practice */}
        <div className="md:col-span-2 h-full flex flex-col gap-4">
          {activeMaterial ? (
            <div className="glass-panel p-4 h-1/3 overflow-y-auto">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-accent-primary">{activeMaterial.title}</h3>
                <button onClick={() => setActiveMaterial(null)} className="text-xs text-gray-400 hover:text-white">Close</button>
              </div>
              <p className="whitespace-pre-wrap text-lg leading-relaxed">{activeMaterial.content}</p>
            </div>
          ) : (
            <div className="glass-panel p-4 h-1/3 flex items-center justify-center text-gray-500">
              Select a material to practice specific text, or just chat below.
            </div>
          )}

          <div className="flex-1 relative">
            <TutorInterface />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
