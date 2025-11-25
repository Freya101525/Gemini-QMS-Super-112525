export interface FlowerTheme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  backgroundLight: string;
  backgroundDark: string;
  textLight: string;
  textDark: string;
}

export type AgentProvider = 'gemini' | 'openai' | 'grok';
export type Language = 'en' | 'zh';

export interface AgentConfig {
  id: string;
  name: string;
  description: string;
  provider: AgentProvider;
  model: string;
  maxTokens: number;
  temperature: number;
  userPrompt: string;
  systemPromptSuffix: string;
}

export interface AgentRunState {
  status: 'idle' | 'running' | 'completed' | 'error';
  output: string;
  tokensUsed?: number;
  executionTimeMs?: number;
  error?: string;
  timestamp?: number;
}

export interface PipelineState {
  template: string;
  observations: string;
  currentStepIndex: number;
  agents: AgentConfig[];
  history: Record<string, AgentRunState>;
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
}

export interface MetricData {
  name: string;
  value: number;
}

export interface SmartReplaceState {
  templateA: string;
  listB: string;
  result: string;
  isProcessing: boolean;
  error: string | null;
}
