import React, { useState, useEffect } from 'react';
import { 
  FileInput, 
  Workflow, 
  LayoutDashboard,
  Replace,
  BookOpen
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import InputTab from './components/InputTab';
import PipelineTab from './components/PipelineTab';
import DashboardTab from './components/DashboardTab';
import SmartReplaceTab from './components/SmartReplaceTab';
import NoteKeeperTab from './components/NoteKeeperTab';
import { AgentConfig, PipelineState, LogEntry, Language } from './types';
import { FLOWER_THEMES, DEFAULT_AGENTS, MOCK_TEMPLATE, MOCK_OBSERVATIONS, UI_LABELS } from './constants';

const generateId = () => Math.random().toString(36).substr(2, 9);

const App: React.FC = () => {
  // --- Global State ---
  const [apiKey, setApiKey] = useState<string>('');
  const [currentThemeId, setThemeId] = useState<string>('sakura');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [language, setLanguage] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState<'input' | 'pipeline' | 'dashboard' | 'smart_replace' | 'note_keeper'>('input');
  
  // --- Pipeline State ---
  const [pipelineState, setPipelineState] = useState<PipelineState>({
    template: MOCK_TEMPLATE,
    observations: MOCK_OBSERVATIONS,
    currentStepIndex: 0,
    agents: DEFAULT_AGENTS,
    history: {}
  });

  // --- Logs ---
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = (level: 'info' | 'warning' | 'error' | 'success', message: string) => {
    setLogs((prev) => [
      ...prev,
      { id: generateId(), timestamp: new Date(), level, message }
    ]);
  };

  // --- Theme Application ---
  useEffect(() => {
    const theme = FLOWER_THEMES.find((t) => t.id === currentThemeId) || FLOWER_THEMES[0];
    const root = document.documentElement;
    root.style.setProperty('--color-primary', theme.primary);
    root.style.setProperty('--color-secondary', theme.secondary);
    
    // Set background classes via body for global feel
    document.body.style.backgroundColor = isDarkMode ? theme.backgroundDark : theme.backgroundLight;
    document.body.style.color = isDarkMode ? theme.textDark : theme.textLight;
  }, [currentThemeId, isDarkMode]);

  // --- Handlers ---
  const handleLoadAgents = (newAgents: AgentConfig[]) => {
    setPipelineState(prev => ({ ...prev, agents: newAgents }));
    addLog('success', 'Pipeline configuration loaded successfully');
  };

  const labels = UI_LABELS[language];

  return (
    <div className={`flex h-screen w-screen overflow-hidden font-sans transition-colors duration-300 ${isDarkMode ? 'dark bg-[#0a0a0a]' : 'bg-white'}`}>
      
      {/* Sidebar */}
      <Sidebar
        apiKey={apiKey}
        setApiKey={setApiKey}
        isDarkMode={isDarkMode}
        toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        currentThemeId={currentThemeId}
        setThemeId={setThemeId}
        logs={logs}
        agents={pipelineState.agents}
        onLoadAgents={handleLoadAgents}
        language={language}
        setLanguage={setLanguage}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Navigation Tabs */}
        <div className={`flex items-center px-4 pt-2 border-b overflow-x-auto ${isDarkMode ? 'border-[#333]' : 'border-gray-200'}`}>
          <button
            onClick={() => setActiveTab('input')}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium transition-all whitespace-nowrap ${
              activeTab === 'input' 
                ? 'border-[var(--color-primary)] text-[var(--color-primary)]' 
                : 'border-transparent text-gray-400 hover:text-gray-500'
            }`}
          >
            <FileInput className="w-4 h-4" /> {labels.inputs}
          </button>
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium transition-all whitespace-nowrap ${
              activeTab === 'pipeline' 
                ? 'border-[var(--color-primary)] text-[var(--color-primary)]' 
                : 'border-transparent text-gray-400 hover:text-gray-500'
            }`}
          >
            <Workflow className="w-4 h-4" /> {labels.pipeline}
          </button>
          <button
            onClick={() => setActiveTab('smart_replace')}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium transition-all whitespace-nowrap ${
              activeTab === 'smart_replace' 
                ? 'border-[var(--color-primary)] text-[var(--color-primary)]' 
                : 'border-transparent text-gray-400 hover:text-gray-500'
            }`}
          >
            <Replace className="w-4 h-4" /> {labels.smartReplace}
          </button>
          <button
            onClick={() => setActiveTab('note_keeper')}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium transition-all whitespace-nowrap ${
              activeTab === 'note_keeper' 
                ? 'border-[var(--color-primary)] text-[var(--color-primary)]' 
                : 'border-transparent text-gray-400 hover:text-gray-500'
            }`}
          >
            <BookOpen className="w-4 h-4" /> {labels.noteKeeper}
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium transition-all whitespace-nowrap ${
              activeTab === 'dashboard' 
                ? 'border-[var(--color-primary)] text-[var(--color-primary)]' 
                : 'border-transparent text-gray-400 hover:text-gray-500'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" /> {labels.dashboard}
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden relative">
          {activeTab === 'input' && (
            <InputTab 
                pipelineState={pipelineState} 
                setPipelineState={setPipelineState}
                isDarkMode={isDarkMode}
            />
          )}
          {activeTab === 'pipeline' && (
            <PipelineTab 
                apiKey={apiKey}
                pipelineState={pipelineState}
                setPipelineState={setPipelineState}
                addLog={addLog}
                isDarkMode={isDarkMode}
            />
          )}
          {activeTab === 'smart_replace' && (
            <SmartReplaceTab
                apiKey={apiKey}
                language={language}
                isDarkMode={isDarkMode}
                addLog={addLog}
            />
          )}
          {activeTab === 'note_keeper' && (
            <NoteKeeperTab 
                apiKey={apiKey}
                language={language}
                isDarkMode={isDarkMode}
                addLog={addLog}
            />
          )}
          {activeTab === 'dashboard' && (
            <DashboardTab 
                pipelineState={pipelineState}
                isDarkMode={isDarkMode}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default App;