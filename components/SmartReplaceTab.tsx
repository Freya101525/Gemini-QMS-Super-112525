import React, { useState } from 'react';
import { RefreshCw, Eye, Code, AlertCircle } from 'lucide-react';
import { Language } from '../types';
import { UI_LABELS } from '../constants';
import { generateSmartReplacement } from '../services/geminiService';

interface SmartReplaceTabProps {
  apiKey: string;
  language: Language;
  isDarkMode: boolean;
  addLog: (level: 'info' | 'warning' | 'error' | 'success', message: string) => void;
}

const SmartReplaceTab: React.FC<SmartReplaceTabProps> = ({ apiKey, language, isDarkMode, addLog }) => {
  const [templateA, setTemplateA] = useState('');
  const [listB, setListB] = useState('');
  const [result, setResult] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [viewMode, setViewMode] = useState<'raw' | 'preview'>('preview');
  const labels = UI_LABELS[language];

  const handleExecute = async () => {
    if (!templateA.trim() || !listB.trim()) {
      addLog('warning', 'Template A and List B are required.');
      return;
    }
    if (!apiKey) {
      addLog('error', 'API Key is missing.');
      return;
    }

    setIsProcessing(true);
    addLog('info', 'Starting Smart Replacement...');

    const response = await generateSmartReplacement({
      apiKey,
      templateA,
      listB,
      model: 'gemini-2.5-flash'
    });

    if (response.error) {
      addLog('error', `Smart Replace Failed: ${response.error}`);
    } else {
      setResult(response.text);
      addLog('success', 'Replacement completed.');
    }
    setIsProcessing(false);
  };

  return (
    <div className="flex flex-col h-full p-6 gap-4">
      {/* Header */}
      <div className="flex justify-between items-end border-b pb-4 border-inherit">
        <div>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            {labels.replaceTitle}
          </h2>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {labels.replaceDesc}
          </p>
        </div>
        <button
          onClick={handleExecute}
          disabled={isProcessing}
          className={`px-6 py-2 rounded-lg flex items-center gap-2 text-white font-medium shadow-md transition transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
          style={{ backgroundColor: 'var(--color-secondary)' }}
        >
          {isProcessing ? (
             <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : <RefreshCw className="w-4 h-4" />}
          {labels.executeReplace}
        </button>
      </div>

      {/* Main Split View */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
        
        {/* Inputs Column */}
        <div className="flex-1 flex flex-col gap-4 min-h-0">
          <div className="flex-1 flex flex-col">
            <label className={`mb-2 font-semibold text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {labels.templateA}
            </label>
            <textarea
              value={templateA}
              onChange={(e) => setTemplateA(e.target.value)}
              placeholder="# Template Content..."
              className={`flex-1 w-full p-3 rounded-lg border focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none resize-none font-mono text-sm shadow-sm ${isDarkMode ? 'bg-[#2a2a2a] border-[#444] text-gray-200' : 'bg-white border-gray-200 text-gray-800'}`}
            />
          </div>
          <div className="flex-1 flex flex-col">
            <label className={`mb-2 font-semibold text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {labels.listB}
            </label>
            <textarea
              value={listB}
              onChange={(e) => setListB(e.target.value)}
              placeholder="- Data Item 1..."
              className={`flex-1 w-full p-3 rounded-lg border focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none resize-none font-mono text-sm shadow-sm ${isDarkMode ? 'bg-[#2a2a2a] border-[#444] text-gray-200' : 'bg-white border-gray-200 text-gray-800'}`}
            />
          </div>
        </div>

        {/* Output Column */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex justify-between items-center mb-2">
            <label className={`font-semibold text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Result / 結果
            </label>
            <div className={`flex rounded overflow-hidden border ${isDarkMode ? 'border-[#444]' : 'border-gray-300'}`}>
                <button 
                    onClick={() => setViewMode('preview')}
                    className={`px-3 py-1 text-xs flex items-center gap-1 ${viewMode === 'preview' ? 'bg-[var(--color-primary)] text-white' : isDarkMode ? 'bg-[#222] text-gray-400 hover:bg-[#333]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                    <Eye className="w-3 h-3"/> {labels.preview}
                </button>
                <button 
                    onClick={() => setViewMode('raw')}
                    className={`px-3 py-1 text-xs flex items-center gap-1 ${viewMode === 'raw' ? 'bg-[var(--color-primary)] text-white' : isDarkMode ? 'bg-[#222] text-gray-400 hover:bg-[#333]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                    <Code className="w-3 h-3"/> {labels.raw}
                </button>
            </div>
          </div>
          
          <div className={`flex-1 rounded-lg border overflow-hidden relative ${isDarkMode ? 'bg-[#111] border-[#333]' : 'bg-white border-gray-200'}`}>
            {isProcessing && (
                 <div className="absolute inset-0 z-10 bg-black/10 dark:bg-black/50 backdrop-blur-[1px] flex items-center justify-center">
                    <div className="bg-white dark:bg-[#333] px-6 py-4 rounded shadow-lg flex flex-col items-center">
                         <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mb-2"></div>
                         <span className="text-sm font-medium dark:text-white">Generating...</span>
                    </div>
                 </div>
            )}
            
            {!result && !isProcessing ? (
                <div className="h-full flex items-center justify-center opacity-40 text-sm italic">
                    <AlertCircle className="w-4 h-4 mr-2"/> Ready to process
                </div>
            ) : (
                viewMode === 'raw' ? (
                    <textarea 
                        readOnly
                        value={result}
                        className={`w-full h-full p-4 resize-none font-mono text-sm focus:outline-none ${isDarkMode ? 'bg-[#111] text-gray-300' : 'bg-white text-gray-800'}`}
                    />
                ) : (
                    <div 
                        className={`w-full h-full p-4 overflow-y-auto prose prose-sm max-w-none ${isDarkMode ? 'prose-invert text-gray-300' : 'text-gray-800'}`}
                        // Using dangerouslySetInnerHTML to allow the coral spans to render. 
                        // Input comes from Gemini which is relatively safe text, but in production use a sanitizer.
                        dangerouslySetInnerHTML={{ __html: result.replace(/\n/g, '<br/>') }} 
                    />
                )
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SmartReplaceTab;
