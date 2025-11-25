import React from 'react';
import { Settings, Terminal, Key, Sun, Moon, Save, Upload, Languages } from 'lucide-react';
import { FlowerTheme, LogEntry, AgentConfig, Language } from '../types';
import { FLOWER_THEMES, UI_LABELS } from '../constants';

interface SidebarProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  currentThemeId: string;
  setThemeId: (id: string) => void;
  logs: LogEntry[];
  agents: AgentConfig[];
  onLoadAgents: (agents: AgentConfig[]) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  apiKey,
  setApiKey,
  isDarkMode,
  toggleDarkMode,
  currentThemeId,
  setThemeId,
  logs,
  agents,
  onLoadAgents,
  language,
  setLanguage
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const labels = UI_LABELS[language];

  const handleSavePipeline = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(agents, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "pipeline_config.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleLoadPipeline = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const loadedAgents = JSON.parse(e.target?.result as string);
          if (Array.isArray(loadedAgents)) {
            onLoadAgents(loadedAgents);
          }
        } catch (error) {
          alert("Invalid JSON file");
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className={`w-80 flex flex-col h-full border-r transition-colors duration-300 ${isDarkMode ? 'bg-[#1a1a1a] border-[#333]' : 'bg-gray-50 border-gray-200'}`}>
      <div className="p-4 border-b border-inherit">
        <h1 className="text-xl font-bold flex items-center gap-2 text-[var(--color-primary)]">
          <Settings className="w-6 h-6" />
          {labels.title}
        </h1>
        <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {labels.subtitle}
        </p>
      </div>

      <div className="p-4 space-y-6 flex-1 overflow-y-auto">
        
        {/* Language Selector */}
        <div className="space-y-2">
          <label className={`text-sm font-medium flex items-center gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <Languages className="w-4 h-4" /> Language / 語言
          </label>
          <div className="flex gap-2">
            <button 
                onClick={() => setLanguage('en')}
                className={`flex-1 py-1 px-2 text-xs rounded border ${language === 'en' ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : isDarkMode ? 'bg-[#2a2a2a] border-[#444] text-gray-300' : 'bg-white border-gray-300'}`}
            >
                English
            </button>
            <button 
                onClick={() => setLanguage('zh')}
                className={`flex-1 py-1 px-2 text-xs rounded border ${language === 'zh' ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : isDarkMode ? 'bg-[#2a2a2a] border-[#444] text-gray-300' : 'bg-white border-gray-300'}`}
            >
                繁體中文
            </button>
          </div>
        </div>

        {/* API Key */}
        <div className="space-y-2">
          <label className={`text-sm font-medium flex items-center gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <Key className="w-4 h-4" /> {labels.apiKey}
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter Gemini API Key"
            className={`w-full p-2 rounded border text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] ${isDarkMode ? 'bg-[#2a2a2a] border-[#444] text-white' : 'bg-white border-gray-300'}`}
          />
        </div>

        {/* Theme Selector */}
        <div className="space-y-2">
          <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {labels.theme}
          </label>
          <select
            value={currentThemeId}
            onChange={(e) => setThemeId(e.target.value)}
            className={`w-full p-2 rounded border text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] ${isDarkMode ? 'bg-[#2a2a2a] border-[#444] text-white' : 'bg-white border-gray-300'}`}
          >
            {FLOWER_THEMES.map((theme) => (
              <option key={theme.id} value={theme.id}>
                {theme.name}
              </option>
            ))}
          </select>
        </div>

        {/* Pipeline Management */}
        <div className="space-y-2 pt-2 border-t border-inherit">
             <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {labels.pipelineConfig}
          </label>
          <div className="flex gap-2">
            <button
              onClick={handleSavePipeline}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-white rounded bg-[var(--color-secondary)] hover:opacity-90 transition"
            >
              <Save className="w-3 h-3" /> {labels.save}
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium rounded border transition ${isDarkMode ? 'border-[#444] hover:bg-[#333] text-gray-300' : 'border-gray-300 hover:bg-gray-100 text-gray-700'}`}
            >
              <Upload className="w-3 h-3" /> {labels.load}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleLoadPipeline}
              className="hidden"
              accept=".json"
            />
          </div>
        </div>

        {/* Logs Console */}
        <div className="flex flex-col h-64">
          <label className={`text-sm font-medium mb-2 flex items-center gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <Terminal className="w-4 h-4" /> {labels.systemLogs}
          </label>
          <div className={`flex-1 rounded p-2 overflow-y-auto font-mono text-xs ${isDarkMode ? 'bg-black text-green-400' : 'bg-gray-900 text-green-400'}`}>
            {logs.length === 0 && <span className="opacity-50">System ready...</span>}
            {logs.slice().reverse().map((log) => (
              <div key={log.id} className="mb-1">
                <span className="opacity-50">[{log.timestamp.toLocaleTimeString()}]</span>{' '}
                <span className={log.level === 'error' ? 'text-red-400' : log.level === 'warning' ? 'text-yellow-400' : ''}>
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-inherit">
        <button
          onClick={toggleDarkMode}
          className={`w-full flex items-center justify-center gap-2 p-2 rounded transition ${isDarkMode ? 'bg-[#333] hover:bg-[#444] text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
