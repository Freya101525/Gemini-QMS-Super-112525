import React from 'react';
import { PipelineState, AgentRunState } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface DashboardTabProps {
  pipelineState: PipelineState;
  isDarkMode: boolean;
}

const DashboardTab: React.FC<DashboardTabProps> = ({ pipelineState, isDarkMode }) => {
  const historyValues = Object.values(pipelineState.history) as AgentRunState[];
  const totalAgents = pipelineState.agents.length;
  const completedSteps = historyValues.filter((h) => h.status === 'completed').length;
  const totalTokens = historyValues.reduce((acc, curr) => acc + (curr.tokensUsed || 0), 0);
  const totalTime = historyValues.reduce((acc, curr) => acc + (curr.executionTimeMs || 0), 0);

  const data = pipelineState.agents.map((agent) => ({
    name: agent.name.split(' ')[0], // Short name
    tokens: pipelineState.history[agent.id]?.tokensUsed || 0,
    time: (pipelineState.history[agent.id]?.executionTimeMs || 0) / 1000, // in seconds
  }));

  const MetricCard = ({ title, value, subtext }: { title: string; value: string | number; subtext: string }) => (
    <div className={`p-6 rounded-lg border shadow-sm ${isDarkMode ? 'bg-[#2a2a2a] border-[#444]' : 'bg-white border-gray-100'}`}>
      <h3 className={`text-sm font-semibold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{title}</h3>
      <div className={`text-3xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{value}</div>
      <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{subtext}</div>
    </div>
  );

  return (
    <div className="p-8 h-full overflow-y-auto">
      <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Audit Execution Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard 
            title="Progress" 
            value={`${Math.round(totalAgents > 0 ? (completedSteps / totalAgents) * 100 : 0)}%`} 
            subtext={`${completedSteps} / ${totalAgents} Agents`} 
        />
        <MetricCard 
            title="Total Tokens" 
            value={totalTokens.toLocaleString()} 
            subtext="Estimated usage" 
        />
        <MetricCard 
            title="Total Runtime" 
            value={`${(totalTime / 1000).toFixed(2)}s`} 
            subtext="Cumulative AI processing" 
        />
        <MetricCard 
            title="Efficiency" 
            value={completedSteps > 0 ? (totalTokens / completedSteps).toFixed(0) : 0} 
            subtext="Avg tokens per agent" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-96">
        <div className={`p-6 rounded-lg border shadow-sm flex flex-col ${isDarkMode ? 'bg-[#2a2a2a] border-[#444]' : 'bg-white border-gray-100'}`}>
          <h3 className={`font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>Token Consumption by Agent</h3>
          <div className="flex-1 w-full min-h-0">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#444' : '#eee'} />
                  <XAxis dataKey="name" stroke={isDarkMode ? '#888' : '#666'} fontSize={12} />
                  <YAxis stroke={isDarkMode ? '#888' : '#666'} fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: isDarkMode ? '#333' : '#fff', borderColor: isDarkMode ? '#555' : '#ccc', color: isDarkMode ? '#fff' : '#000' }}
                  />
                  <Bar dataKey="tokens" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
             </ResponsiveContainer>
          </div>
        </div>

        <div className={`p-6 rounded-lg border shadow-sm flex flex-col ${isDarkMode ? 'bg-[#2a2a2a] border-[#444]' : 'bg-white border-gray-100'}`}>
          <h3 className={`font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>Execution Time (Seconds)</h3>
           <div className="flex-1 w-full min-h-0">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#444' : '#eee'} />
                  <XAxis dataKey="name" stroke={isDarkMode ? '#888' : '#666'} fontSize={12} />
                  <YAxis stroke={isDarkMode ? '#888' : '#666'} fontSize={12} />
                  <Tooltip 
                     contentStyle={{ backgroundColor: isDarkMode ? '#333' : '#fff', borderColor: isDarkMode ? '#555' : '#ccc', color: isDarkMode ? '#fff' : '#000' }}
                  />
                  <Bar dataKey="time" fill="var(--color-secondary)" radius={[4, 4, 0, 0]} />
                </BarChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;