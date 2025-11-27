import React, { useState } from 'react';
import { 
    AlignLeft, 
    Highlighter, 
    Table, 
    MessageSquare, 
    Network, 
    Send, 
    ArrowRight,
    Loader2,
    Eye,
    Code
} from 'lucide-react';
import { Language, NoteKeeperState } from '../types';
import { UI_LABELS } from '../constants';
import { generateNoteAction, chatWithNote } from '../services/geminiService';

interface NoteKeeperTabProps {
  apiKey: string;
  language: Language;
  isDarkMode: boolean;
  addLog: (level: 'info' | 'warning' | 'error' | 'success', message: string) => void;
}

const NoteKeeperTab: React.FC<NoteKeeperTabProps> = ({ apiKey, language, isDarkMode, addLog }) => {
  const labels = UI_LABELS[language];
  const [state, setState] = useState<NoteKeeperState>({
    inputText: '',
    outputText: '',
    mode: 'markdown',
    chatHistory: [],
    isLoading: false,
    activeAction: null,
  });

  const [keywordInput, setKeywordInput] = useState('');
  const [keywordColor, setKeywordColor] = useState('#ff7f50'); // coral default
  const [chatInput, setChatInput] = useState('');

  const executeAction = async (action: 'format' | 'keywords' | 'entities' | 'mindmap') => {
    if (!state.inputText) {
      addLog('warning', 'Please enter some text first.');
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, activeAction: action, mode: action === 'mindmap' ? 'json' : 'markdown' }));
    
    const result = await generateNoteAction({
      apiKey,
      text: state.inputText,
      action,
      meta: action === 'keywords' ? { keywords: keywordInput, color: keywordColor } : undefined
    });

    if (result.error) {
      addLog('error', result.error);
      setState(prev => ({ ...prev, isLoading: false, activeAction: null }));
    } else {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        outputText: result.text, 
        activeAction: null,
        mode: action === 'mindmap' ? 'json' : 'markdown'
      }));
      addLog('success', `${action} completed.`);
    }
  };

  const handleChat = async () => {
    if (!chatInput.trim()) return;
    
    const newHistory = [...state.chatHistory, { role: 'user', content: chatInput } as const];
    setState(prev => ({ ...prev, chatHistory: newHistory, isLoading: true, mode: 'chat' }));
    setChatInput('');

    const response = await chatWithNote(apiKey, newHistory, state.inputText);
    
    setState(prev => ({ 
      ...prev, 
      chatHistory: [...newHistory, { role: 'model', content: response }],
      isLoading: false
    }));
  };

  return (
    <div className="flex flex-col h-full bg-inherit">
      {/* Header & Toolbar */}
      <div className={`p-4 border-b space-y-4 ${isDarkMode ? 'border-[#333]' : 'border-gray-200'}`}>
        <div>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{labels.nkTitle}</h2>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{labels.nkDesc}</p>
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          {/* Format */}
          <button 
            onClick={() => executeAction('format')}
            disabled={state.isLoading}
            className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition ${isDarkMode ? 'bg-[#2a2a2a] hover:bg-[#333] text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
          >
            {state.activeAction === 'format' ? <Loader2 className="w-4 h-4 animate-spin"/> : <AlignLeft className="w-4 h-4"/>}
            {labels.nkFormat}
          </button>

          {/* Keywords Group */}
          <div className={`flex items-center gap-2 px-2 py-1 rounded border ${isDarkMode ? 'border-[#444] bg-[#2a2a2a]' : 'border-gray-200 bg-gray-50'}`}>
            <Highlighter className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}/>
            <input 
              type="text" 
              placeholder="Keywords..." 
              value={keywordInput}
              onChange={e => setKeywordInput(e.target.value)}
              className={`w-24 text-sm bg-transparent outline-none ${isDarkMode ? 'text-white' : 'text-black'}`}
            />
            <input 
              type="color" 
              value={keywordColor} 
              onChange={e => setKeywordColor(e.target.value)}
              className="w-6 h-6 rounded cursor-pointer border-none bg-transparent"
            />
            <button 
                onClick={() => executeAction('keywords')}
                disabled={state.isLoading || !keywordInput}
                className="text-xs px-2 py-1 rounded bg-[var(--color-primary)] text-white hover:opacity-90 disabled:opacity-50"
            >
                {state.activeAction === 'keywords' ? <Loader2 className="w-3 h-3 animate-spin"/> : <ArrowRight className="w-3 h-3"/>}
            </button>
          </div>

          {/* Entities */}
          <button 
            onClick={() => executeAction('entities')}
            disabled={state.isLoading}
            className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition ${isDarkMode ? 'bg-[#2a2a2a] hover:bg-[#333] text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
          >
            {state.activeAction === 'entities' ? <Loader2 className="w-4 h-4 animate-spin"/> : <Table className="w-4 h-4"/>}
            {labels.nkEntities}
          </button>

          {/* Mindmap */}
          <button 
            onClick={() => executeAction('mindmap')}
            disabled={state.isLoading}
            className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition ${isDarkMode ? 'bg-[#2a2a2a] hover:bg-[#333] text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
          >
            {state.activeAction === 'mindmap' ? <Loader2 className="w-4 h-4 animate-spin"/> : <Network className="w-4 h-4"/>}
            {labels.nkMindmap}
          </button>

          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2"></div>

           {/* Chat Mode Toggle */}
           <button 
            onClick={() => setState(prev => ({ ...prev, mode: 'chat' }))}
            className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition ${state.mode === 'chat' ? 'bg-[var(--color-secondary)] text-white' : isDarkMode ? 'bg-[#2a2a2a] text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            <MessageSquare className="w-4 h-4"/>
            {labels.nkChat}
          </button>
        </div>
      </div>

      {/* Main Split Content */}
      <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
        
        {/* Left: Input */}
        <div className={`flex-1 flex flex-col border-r ${isDarkMode ? 'border-[#333]' : 'border-gray-200'}`}>
            <div className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'bg-[#1a1a1a] text-gray-400' : 'bg-gray-50 text-gray-500'}`}>
                Source Text
            </div>
            <textarea
                value={state.inputText}
                onChange={e => setState(prev => ({ ...prev, inputText: e.target.value }))}
                placeholder={labels.nkInputPlaceholder}
                className={`flex-1 p-4 resize-none focus:outline-none font-mono text-sm ${isDarkMode ? 'bg-[#0a0a0a] text-gray-200 placeholder-gray-600' : 'bg-white text-gray-800 placeholder-gray-400'}`}
            />
        </div>

        {/* Right: Output / Chat */}
        <div className="flex-1 flex flex-col min-w-0">
            <div className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider flex justify-between items-center ${isDarkMode ? 'bg-[#1a1a1a] text-gray-400' : 'bg-gray-50 text-gray-500'}`}>
                <span>{state.mode === 'chat' ? 'Assistant' : state.mode === 'json' ? 'NetworkX JSON' : 'Markdown View'}</span>
                {state.mode !== 'chat' && (
                    <div className="flex gap-2">
                        <button onClick={() => setState(prev => ({...prev, mode: 'markdown'}))} className={state.mode === 'markdown' ? 'text-[var(--color-primary)]' : ''}><Eye className="w-3 h-3"/></button>
                        <button onClick={() => setState(prev => ({...prev, mode: 'json'}))} className={state.mode === 'json' ? 'text-[var(--color-primary)]' : ''}><Code className="w-3 h-3"/></button>
                    </div>
                )}
            </div>

            <div className={`flex-1 overflow-y-auto p-4 ${isDarkMode ? 'bg-[#111]' : 'bg-white'}`}>
                {/* Mode: Markdown */}
                {state.mode === 'markdown' && (
                    <div 
                        className={`prose prose-sm max-w-none ${isDarkMode ? 'prose-invert' : ''}`}
                        dangerouslySetInnerHTML={{ __html: (state.outputText || '*No output generated yet*').replace(/\n/g, '<br/>') }}
                    />
                )}

                {/* Mode: JSON */}
                {state.mode === 'json' && (
                    <pre className={`text-xs font-mono p-2 rounded overflow-x-auto ${isDarkMode ? 'bg-[#1a1a1a] text-green-400' : 'bg-gray-900 text-green-400'}`}>
                        {state.outputText || '// JSON output will appear here'}
                    </pre>
                )}

                {/* Mode: Chat */}
                {state.mode === 'chat' && (
                    <div className="flex flex-col h-full">
                        <div className="flex-1 space-y-4 mb-4">
                            {state.chatHistory.length === 0 && (
                                <div className="text-center opacity-40 mt-10">Start chatting with your note...</div>
                            )}
                            {state.chatHistory.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] rounded-lg p-3 text-sm ${msg.role === 'user' ? 'bg-[var(--color-primary)] text-white' : isDarkMode ? 'bg-[#2a2a2a] text-gray-200' : 'bg-gray-100 text-gray-800'}`}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {state.isLoading && (
                                <div className="flex justify-start">
                                    <div className={`max-w-[80%] rounded-lg p-3 text-sm flex items-center gap-2 ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-gray-100'}`}>
                                        <Loader2 className="w-4 h-4 animate-spin"/> Thinking...
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-2 pt-2 border-t border-inherit">
                            <input 
                                type="text"
                                value={chatInput}
                                onChange={e => setChatInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleChat()}
                                placeholder={labels.nkChatPlaceholder}
                                className={`flex-1 p-2 rounded border focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] ${isDarkMode ? 'bg-[#2a2a2a] border-[#444] text-white' : 'bg-white border-gray-300'}`}
                            />
                            <button 
                                onClick={handleChat}
                                disabled={state.isLoading || !chatInput}
                                className="p-2 rounded bg-[var(--color-secondary)] text-white hover:opacity-90 disabled:opacity-50"
                            >
                                <Send className="w-4 h-4"/>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default NoteKeeperTab;