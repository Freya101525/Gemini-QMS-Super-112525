import { AgentConfig, FlowerTheme } from "./types";

export const FLOWER_THEMES: FlowerTheme[] = [
  { id: 'sakura', name: 'Sakura', primary: '#ffb7b2', secondary: '#ff6961', backgroundLight: '#fff0f5', backgroundDark: '#2d1b2e', textLight: '#4a4a4a', textDark: '#ffd1dc' },
  { id: 'lavender', name: 'Lavender', primary: '#e6e6fa', secondary: '#9370db', backgroundLight: '#f8f8ff', backgroundDark: '#1a1a2e', textLight: '#2e2e2e', textDark: '#e6e6fa' },
  { id: 'sunflower', name: 'Sunflower', primary: '#ffcc00', secondary: '#cc9900', backgroundLight: '#ffffe0', backgroundDark: '#2c2c1e', textLight: '#333333', textDark: '#ffffcc' },
  { id: 'mint', name: 'Mint', primary: '#98ff98', secondary: '#3cb371', backgroundLight: '#f0fff0', backgroundDark: '#0f2b1d', textLight: '#1a1a1a', textDark: '#e0ffe0' },
  { id: 'rose', name: 'Rose', primary: '#ff007f', secondary: '#c71585', backgroundLight: '#ffe4e1', backgroundDark: '#2b0f15', textLight: '#2b1b17', textDark: '#ffd6e0' },
  { id: 'ocean', name: 'Ocean Bloom', primary: '#00bfff', secondary: '#1e90ff', backgroundLight: '#f0f8ff', backgroundDark: '#0a192f', textLight: '#1c1c1c', textDark: '#e0f7fa' },
  { id: 'lilac', name: 'Lilac', primary: '#c8a2c8', secondary: '#800080', backgroundLight: '#faf0e6', backgroundDark: '#1f101f', textLight: '#2f2f2f', textDark: '#f5e6f5' },
  { id: 'jasmine', name: 'Jasmine', primary: '#f8de7e', secondary: '#d4af37', backgroundLight: '#fffffa', backgroundDark: '#262620', textLight: '#3d3d3d', textDark: '#fffdd0' },
  { id: 'orchid', name: 'Orchid', primary: '#da70d6', secondary: '#9932cc', backgroundLight: '#fff5ee', backgroundDark: '#1f0d1f', textLight: '#292929', textDark: '#eee0ee' },
  { id: 'tulip', name: 'Tulip', primary: '#ff4500', secondary: '#b22222', backgroundLight: '#fffaf0', backgroundDark: '#2b120a', textLight: '#361500', textDark: '#ffebd7' },
  { id: 'lotus', name: 'Lotus', primary: '#ffc0cb', secondary: '#e05a85', backgroundLight: '#fff9fa', backgroundDark: '#2e1a20', textLight: '#2e2e2e', textDark: '#ffe4e1' },
  { id: 'daisy', name: 'Daisy', primary: '#ffffff', secondary: '#ffd700', backgroundLight: '#f5f5f5', backgroundDark: '#222222', textLight: '#111111', textDark: '#ffffff' },
  { id: 'hibiscus', name: 'Hibiscus', primary: '#ea4c89', secondary: '#d4145a', backgroundLight: '#fff0f6', backgroundDark: '#290e16', textLight: '#333333', textDark: '#ffd1e6' },
  { id: 'peony', name: 'Peony', primary: '#fbaed2', secondary: '#ff63a5', backgroundLight: '#fff5f9', backgroundDark: '#2b121b', textLight: '#2b1b17', textDark: '#ffd6e0' },
  { id: 'magnolia', name: 'Magnolia', primary: '#f8f4ff', secondary: '#dcd0ff', backgroundLight: '#fafaff', backgroundDark: '#1e1e24', textLight: '#333333', textDark: '#eeeeee' },
  { id: 'camellia', name: 'Camellia', primary: '#e4717a', secondary: '#b91e2e', backgroundLight: '#fff5f5', backgroundDark: '#2b0a0d', textLight: '#2e1a1a', textDark: '#ffdede' },
  { id: 'dahlia', name: 'Dahlia', primary: '#ff8c00', secondary: '#8b0000', backgroundLight: '#fff8e1', backgroundDark: '#2b1400', textLight: '#361d00', textDark: '#ffecb3' },
  { id: 'marigold', name: 'Marigold', primary: '#ffa500', secondary: '#d2691e', backgroundLight: '#fffaf0', backgroundDark: '#2e1b05', textLight: '#3d2600', textDark: '#ffe0b2' },
  { id: 'violet', name: 'Violet', primary: '#8a2be2', secondary: '#4b0082', backgroundLight: '#f3e5f5', backgroundDark: '#120024', textLight: '#1a0033', textDark: '#e1bee7' },
  { id: 'iris', name: 'Iris', primary: '#5d3fd3', secondary: '#3f2a99', backgroundLight: '#ecebff', backgroundDark: '#0d0824', textLight: '#120d30', textDark: '#d6d1ff' },
];

export const AVAILABLE_MODELS = [
  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
  { value: 'gemini-3-pro-preview', label: 'Gemini 3.0 Pro' },
  { value: 'gemini-2.5-flash-lite-latest', label: 'Gemini Flash Lite' },
];

export const BASE_SYSTEM_PROMPT_ZH = `
Role: You are an expert Medical Device Audit Report Specialist strictly adhering to ISO 13485 and GMP standards.
Task: Your job is to restructure unstructured observation notes into a formal audit report based on a provided template.
Rules:
1. Do not fabricate facts. If information is missing, use placeholders like [MISSING_DATA].
2. Preserve original text intent.
3. Maintain a professional, objective tone.
4. Output must be in Traditional Chinese (Taiwan) unless the input implies otherwise.
`;

export const DEFAULT_AGENTS: AgentConfig[] = [
  {
    id: 'agent_layout',
    name: 'Layout Mapper',
    description: 'Structure Alignment: Maps raw observations to the template sections.',
    provider: 'gemini',
    model: 'gemini-2.5-flash',
    maxTokens: 4000,
    temperature: 0.1,
    userPrompt: 'Please parse the raw observations and map them into the provided Markdown template structure. Ensure every observation is categorized correctly. Do not summarize yet, just place the content.',
    systemPromptSuffix: 'Focus on structural integrity.',
  },
  {
    id: 'agent_car',
    name: 'CAR Extractor',
    description: 'Compliance Check: Identifies and lists Corrective Action Requests.',
    provider: 'gemini',
    model: 'gemini-2.5-flash',
    maxTokens: 2000,
    temperature: 0.0,
    userPrompt: 'Analyze the structured text. Identify any non-conformities that require a Corrective Action Request (CAR). List them specifically with reference to ISO 13485 clauses if possible.',
    systemPromptSuffix: 'Be strict about non-conformities.',
  },
  {
    id: 'agent_polish',
    name: 'Polisher',
    description: 'Refinement: Smooths transitions and ensures professional tone.',
    provider: 'gemini',
    model: 'gemini-3-pro-preview',
    maxTokens: 8192,
    temperature: 0.7,
    userPrompt: 'Review the entire report. Polish the language for a professional medical device audit report. Ensure flow between sections is smooth. Attach the original raw logs as an appendix at the end.',
    systemPromptSuffix: 'Professional tone, high readability.',
  },
];

export const MOCK_TEMPLATE = `# Medical Device Audit Report
## 1. Audit Summary
[Summary Here]

## 2. Observations
### 2.1 Quality Management System
[QMS Findings]

### 2.2 Production Control
[Production Findings]

## 3. Non-Conformities
[List of CARs]
`;

export const MOCK_OBSERVATIONS = `
- Visited the cleanroom. Found that the pressure gauge was not calibrated. Last calibration date was 2022.
- Reviewed the QMS manual. Section 4.2 is compliant.
- Interviewed the production manager. He could not produce the training records for operator John Doe.
- The packaging area was clean and organized.
`;

export const UI_LABELS = {
  en: {
    title: 'AuditFlow AI',
    subtitle: 'Medical Audit Restructuring',
    apiKey: 'API Key',
    theme: 'Flower Theme',
    pipelineConfig: 'Pipeline Config',
    save: 'Save',
    load: 'Load',
    systemLogs: 'System Logs',
    inputs: 'Inputs',
    pipeline: 'Pipeline',
    dashboard: 'Dashboard',
    smartReplace: 'Smart Replace',
    markdownTemplate: 'Markdown Template',
    rawObservations: 'Raw Observations',
    agentSequence: 'Pipeline Sequence',
    runAgent: 'Run Agent',
    running: 'Running...',
    agentOutput: 'Agent Output',
    export: 'Export',
    edit: 'Edit',
    cancel: 'Cancel',
    analytics: 'Audit Execution Analytics',
    progress: 'Progress',
    totalTokens: 'Total Tokens',
    totalRuntime: 'Total Runtime',
    efficiency: 'Efficiency',
    replaceTitle: 'Smart Replacement',
    replaceDesc: 'Replace template content with list data while preserving structure.',
    templateA: 'Template A (Structure)',
    listB: 'List B (Data)',
    executeReplace: 'Execute Replacement',
    preview: 'Preview',
    raw: 'Raw Markdown'
  },
  zh: {
    title: 'AuditFlow AI 稽核流',
    subtitle: '醫療器材稽核報告自動化',
    apiKey: 'API 金鑰',
    theme: '花卉主題',
    pipelineConfig: '流程設定',
    save: '儲存',
    load: '載入',
    systemLogs: '系統日誌',
    inputs: '輸入資料',
    pipeline: '執行流程',
    dashboard: '儀表板',
    smartReplace: '智慧置換',
    markdownTemplate: 'Markdown 模板',
    rawObservations: '原始觀察紀錄',
    agentSequence: '代理人序列',
    runAgent: '執行代理人',
    running: '執行中...',
    agentOutput: '代理人產出',
    export: '匯出',
    edit: '編輯',
    cancel: '取消',
    analytics: '稽核執行分析',
    progress: '進度',
    totalTokens: '總 Token 用量',
    totalRuntime: '總執行時間',
    efficiency: '效率',
    replaceTitle: '智慧置換功能',
    replaceDesc: '保留模板結構並置換清單資料，變更處將以珊瑚色標記。',
    templateA: '模板 A (結構)',
    listB: '清單 B (資料)',
    executeReplace: '執行置換',
    preview: '預覽',
    raw: '原始 Markdown'
  }
};
