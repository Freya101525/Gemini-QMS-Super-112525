import React from 'react';
import { PipelineState } from '../types';

interface InputTabProps {
  pipelineState: PipelineState;
  setPipelineState: React.Dispatch<React.SetStateAction<PipelineState>>;
  isDarkMode: boolean;
}

const InputTab: React.FC<InputTabProps> = ({ pipelineState, setPipelineState, isDarkMode }) => {
  return (
    <div className="flex flex-col h-full gap-4 p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        <div className="flex flex-col">
          <label className={`mb-2 font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
            Markdown Template
          </label>
          <textarea
            className={`flex-1 w-full p-4 rounded-lg border focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none resize-none font-mono text-sm shadow-sm transition-colors ${
              isDarkMode ? 'bg-[#2a2a2a] border-[#444] text-gray-200' : 'bg-white border-gray-200 text-gray-800'
            }`}
            value={pipelineState.template}
            onChange={(e) =>
              setPipelineState((prev) => ({ ...prev, template: e.target.value }))
            }
            placeholder="# Enter your audit report structure here..."
          />
        </div>

        <div className="flex flex-col">
          <label className={`mb-2 font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
            Raw Observations
          </label>
          <textarea
            className={`flex-1 w-full p-4 rounded-lg border focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none resize-none font-mono text-sm shadow-sm transition-colors ${
              isDarkMode ? 'bg-[#2a2a2a] border-[#444] text-gray-200' : 'bg-white border-gray-200 text-gray-800'
            }`}
            value={pipelineState.observations}
            onChange={(e) =>
              setPipelineState((prev) => ({ ...prev, observations: e.target.value }))
            }
            placeholder="- Paste raw unstructured notes here..."
          />
        </div>
      </div>
    </div>
  );
};

export default InputTab;
