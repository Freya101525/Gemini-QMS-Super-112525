import React, { useState } from 'react';
import { Play, CheckCircle, AlertCircle, Clock, Edit2, Save, X, FileText, Download } from 'lucide-react';
import { AgentConfig, PipelineState, AgentRunState } from '../types';
import { generateAuditContent } from '../services/geminiService';
import { AVAILABLE_MODELS } from '../constants';

interface PipelineTabProps {
  apiKey: string;
  pipelineState: PipelineState;
  setPipelineState: React.Dispatch<React.SetStateAction<PipelineState>>;
  addLog: (level: 'info' | 'warning' | 'error' | 'success', message: string) => void;
  isDarkMode: boolean;
}

const PipelineTab: React.FC<PipelineTabProps> = ({
  apiKey,
  pipelineState,
  setPipelineState,
  addLog,
  isDarkMode,
}) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string>(pipelineState.agents[0]?.id || '');
  const [isEditingResult, setIsEditingResult] = useState(false);
  const [editBuffer, setEditBuffer] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const currentAgentIndex = pipelineState.agents.findIndex((a) => a.id === selectedAgentId);
  const currentAgent = pipelineState.agents[currentAgentIndex];
  const runState = pipelineState.history[selectedAgentId];

  // Helper to update specific agent config
  const updateAgentConfig = (key: keyof AgentConfig, value: any) => {
    if (!currentAgent) return;
    setPipelineState((prev) => ({
      ...prev,
      agents: prev.agents.map((a) => (a.id === selectedAgentId ? { ...a, [key]: value } : a)),
    }));
  };

  const handleRunAgent = async () => {
    if (!currentAgent) return;
    if (!apiKey) {
      addLog('error', 'Cannot run agent: API Key missing');
      return;
    }

    setIsRunning(true);
    addLog('info', `Starting agent: ${currentAgent.name}...`);

    // Update status to running
    setPipelineState((prev) => ({
      ...prev,
      history: {
        ...prev.history,
        [currentAgent.id]: { status: 'running', output: '' },
      },
    }));

    // Determine input context
    let prevOutput = null;
    if (currentAgentIndex > 0) {
      const prevAgentId = pipelineState.agents[currentAgentIndex - 1].id;
      prevOutput = pipelineState.history[prevAgentId]?.output || '';
    }

    const result = await generateAuditContent({
      apiKey,
      agent: currentAgent,
      template: pipelineState.template,
      observations: pipelineState.observations,
      previousOutput: prevOutput,
    });

    setPipelineState((prev) => ({
      ...prev,
      history: {
        ...prev.history,
        [currentAgent.id]: result,
      },
      currentStepIndex: currentAgentIndex + 1 // Advance suggestion
    }));

    if (result.status === 'completed') {
      addLog('success', `Agent ${currentAgent.name} finished in ${result.executionTimeMs}ms`);
    } else {
      addLog('error', `Agent ${currentAgent.name} failed: ${result.error}`);
    }

    setIsRunning(false);
  };

  const startEditing = () => {
    if (runState?.output) {
      setEditBuffer(runState.output);
      setIsEditingResult(true);
    }
  };

  const saveEditing = () => {
    setPipelineState((prev) => ({
      ...prev,
      history: {
        ...prev.history,
        [selectedAgentId]: { ...prev.history[selectedAgentId], output: editBuffer },
      },
    }));
    setIsEditingResult(false);
    addLog('info', `Manually updated output for ${currentAgent.name}`);
  };

  const exportResult = () => {
      if (!runState?.output) return;
      const blob = new Blob([runState.output], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentAgent.name}_output.md`;
      a.click();
      URL.revokeObjectURL(url);
      addLog('success', 'Report exported');
  };

  return (
    <div className="flex h-full">
      {/* Agent List (Left) */}
      <div className={`w-1/3 border-r flex flex-col ${isDarkMode ? 'border-[#333]' : 'border-gray-200'}`}>
        <div className={`p-4 font-bold border-b ${isDarkMode ? 'border-[#333] text-gray-200' : 'border-gray-200 text-gray-700'}`}>
          Pipeline Sequence
        </div>
        <div className="overflow-y-auto flex-1">
          {pipelineState.agents.map((agent, idx) => {
            const status = pipelineState.history[agent.id]?.status || 'idle';
            return (
              <div
                key={agent.id}
                onClick={() => setSelectedAgentId(agent.id)}
                className={`p-4 border-b cursor-pointer transition-all flex items-center justify-between
                  ${selectedAgentId === agent.id 
                    ? `bg-[var(--color-primary)] bg-opacity-10 border-l-4 border-l-[var(--color-primary)]` 
                    : isDarkMode ? 'border-[#333] hover:bg-[#252525]' : 'border-gray-100 hover:bg-gray-50'}
                `}
              >
                <div className="flex flex-col">
                    <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        {idx + 1}. {agent.name}
                    </span>
                    <span className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {agent.model}
                    </span>
                </div>
                <div>
                  {status === 'idle' && <Clock className="w-4 h-4 text-gray-400" />}
                  {status === 'running' && <div className="w-4 h-4 rounded-full border-2 border-t-transparent border-[var(--color-primary)] animate-spin" />}
                  {status === 'completed' && <CheckCircle className="w-4 h-4 text-green-500" />}
                  {status === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Workspace (Right) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Agent Configuration Header */}
        <div className={`p-4 border-b space-y-4 ${isDarkMode ? 'bg-[#1a1a1a] border-[#333]' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex justify-between items-start">
             <div>
                <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{currentAgent?.name} Configuration</h2>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{currentAgent?.description}</p>
             </div>
             <button
                onClick={handleRunAgent}
                disabled={isRunning}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 text-white font-medium shadow-md transition transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
                style={{ backgroundColor: 'var(--color-primary)' }}
             >
                {isRunning ? 'Running...' : <><Play className="w-4 h-4" /> Run Agent</>}
             </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Model</label>
                <select 
                    value={currentAgent?.model}
                    onChange={(e) => updateAgentConfig('model', e.target.value)}
                    className={`text-sm rounded border p-1 focus:ring-1 focus:ring-[var(--color-primary)] outline-none ${isDarkMode ? 'bg-[#2a2a2a] border-[#444] text-white' : 'bg-white border-gray-300'}`}
                >
                    {AVAILABLE_MODELS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
             </div>
             <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Temp</label>
                <input 
                    type="number" 
                    step="0.1" 
                    min="0" 
                    max="1" 
                    value={currentAgent?.temperature}
                    onChange={(e) => updateAgentConfig('temperature', parseFloat(e.target.value))}
                    className={`text-sm rounded border p-1 outline-none ${isDarkMode ? 'bg-[#2a2a2a] border-[#444] text-white' : 'bg-white border-gray-300'}`}
                />
             </div>
             <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Max Tokens</label>
                <input 
                    type="number" 
                    step="100" 
                    value={currentAgent?.maxTokens}
                    onChange={(e) => updateAgentConfig('maxTokens', parseInt(e.target.value))}
                    className={`text-sm rounded border p-1 outline-none ${isDarkMode ? 'bg-[#2a2a2a] border-[#444] text-white' : 'bg-white border-gray-300'}`}
                />
             </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Prompt</label>
                <input 
                    type="text" 
                    value={currentAgent?.userPrompt}
                    onChange={(e) => updateAgentConfig('userPrompt', e.target.value)}
                    className={`text-sm rounded border p-1 outline-none ${isDarkMode ? 'bg-[#2a2a2a] border-[#444] text-white' : 'bg-white border-gray-300'}`}
                />
             </div>
          </div>
        </div>

        {/* Output Area */}
        <div className={`flex-1 p-6 overflow-hidden flex flex-col relative ${isDarkMode ? 'bg-[#111]' : 'bg-white'}`}>
          {isRunning && (
            <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center backdrop-blur-sm">
                <div className="bg-white dark:bg-[#2a2a2a] p-6 rounded-lg shadow-xl flex flex-col items-center">
                    <div className="w-10 h-10 border-4 border-gray-200 border-t-[var(--color-primary)] rounded-full animate-spin mb-4"></div>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Processing...</p>
                </div>
            </div>
          )}

          <div className="flex justify-between items-center mb-2">
            <h3 className={`font-bold flex items-center gap-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                <FileText className="w-4 h-4" /> Agent Output
            </h3>
            <div className="flex gap-2">
                {runState?.output && !isEditingResult && (
                    <>
                    <button onClick={exportResult} className="text-xs flex items-center gap-1 px-2 py-1 rounded bg-blue-500 text-white hover:bg-blue-600">
                         <Download className="w-3 h-3" /> Export
                    </button>
                    <button onClick={startEditing} className="text-xs flex items-center gap-1 px-2 py-1 rounded bg-gray-500 text-white hover:bg-gray-600">
                        <Edit2 className="w-3 h-3" /> Edit
                    </button>
                    </>
                )}
                {isEditingResult && (
                    <>
                    <button onClick={saveEditing} className="text-xs flex items-center gap-1 px-2 py-1 rounded bg-green-500 text-white hover:bg-green-600">
                        <Save className="w-3 h-3" /> Save
                    </button>
                    <button onClick={() => setIsEditingResult(false)} className="text-xs flex items-center gap-1 px-2 py-1 rounded bg-red-500 text-white hover:bg-red-600">
                        <X className="w-3 h-3" /> Cancel
                    </button>
                    </>
                )}
            </div>
          </div>

          <div className={`flex-1 rounded-lg border overflow-hidden ${isDarkMode ? 'border-[#333] bg-[#1a1a1a]' : 'border-gray-200 bg-gray-50'}`}>
            {isEditingResult ? (
                <textarea 
                    className={`w-full h-full p-4 resize-none focus:outline-none font-mono text-sm ${isDarkMode ? 'bg-[#1a1a1a] text-gray-300' : 'bg-gray-50 text-gray-800'}`}
                    value={editBuffer}
                    onChange={(e) => setEditBuffer(e.target.value)}
                />
            ) : (
                <div className={`w-full h-full p-4 overflow-y-auto whitespace-pre-wrap font-mono text-sm ${!runState?.output && !runState?.error ? 'flex items-center justify-center opacity-40' : ''} ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                     {runState?.status === 'error' ? (
                        <div className="text-red-500 p-4 border border-red-500/20 rounded bg-red-500/10">
                            <p className="font-bold mb-2 flex items-center gap-2"><AlertCircle className="w-4 h-4"/> Execution Failed</p>
                            <p>{runState.error || "Unknown error"}</p>
                        </div>
                    ) : (
                        runState?.output || "Waiting for execution..."
                    )}
                </div>
            )}
          </div>
          
          {runState?.executionTimeMs && !runState.error && (
             <div className="mt-2 text-xs text-right opacity-60">
                Processed in {runState.executionTimeMs}ms • ~{runState.tokensUsed} tokens
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PipelineTab;