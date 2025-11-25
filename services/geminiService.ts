import { GoogleGenAI } from "@google/genai";
import { AgentConfig, AgentRunState } from "../types";
import { BASE_SYSTEM_PROMPT_ZH } from "../constants";

interface GenerateContentParams {
  apiKey: string;
  agent: AgentConfig;
  template: string;
  observations: string;
  previousOutput: string | null;
}

export const generateAuditContent = async ({
  apiKey,
  agent,
  template,
  observations,
  previousOutput,
}: GenerateContentParams): Promise<AgentRunState> => {
  if (!apiKey) {
    return {
      status: 'error',
      output: '',
      error: 'API Key is missing.',
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // Construct the context-heavy prompt
    const contextParts = [
      `[Template]\n${template}\n`,
      `[Observations]\n${observations}\n`,
    ];

    if (previousOutput) {
      contextParts.push(`[Previous Agent Output]\n${previousOutput}\n`);
    }

    contextParts.push(`[Agent-Specific Instructions]\n${agent.userPrompt}\n`);

    const fullSystemInstruction = `${BASE_SYSTEM_PROMPT_ZH}\n\nAdditional Instructions: ${agent.systemPromptSuffix}`;
    const fullContent = contextParts.join('\n');

    const startTime = Date.now();

    const response = await ai.models.generateContent({
      model: agent.model,
      contents: fullContent,
      config: {
        systemInstruction: fullSystemInstruction,
        temperature: agent.temperature,
        maxOutputTokens: agent.maxTokens,
      },
    });

    const endTime = Date.now();
    const outputText = response.text;
    
    if (!outputText) {
        return {
          status: 'error',
          output: '',
          error: 'No text generated. Possible safety filter trigger or empty response.',
          timestamp: Date.now(),
        };
    }
    
    const tokensUsed = outputText.length / 4;

    return {
      status: 'completed',
      output: outputText,
      executionTimeMs: endTime - startTime,
      tokensUsed: Math.ceil(tokensUsed),
      timestamp: Date.now(),
    };

  } catch (error: any) {
    console.error("Gemini Service Error:", error);
    return {
      status: 'error',
      output: '',
      error: error.message || "Unknown error occurred during AI generation.",
      timestamp: Date.now(),
    };
  }
};

interface SmartReplaceParams {
  apiKey: string;
  templateA: string;
  listB: string;
  model: string;
}

export const generateSmartReplacement = async ({
  apiKey,
  templateA,
  listB,
  model
}: SmartReplaceParams): Promise<{ text: string; error?: string }> => {
  if (!apiKey) return { text: '', error: 'API Key Missing' };

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const systemPrompt = `
    Role: Expert Document Editor and Localizer.
    Task: You will receive Template A (Markdown structure) and List B (Data/Content).
    Your goal is to replace the content in Template A with the relevant information from List B.
    
    CRITICAL RULES:
    1. PRESERVE STRUCTURE: Do not change the markdown headers, tables, or layout of Template A. Only change the content values.
    2. LANGUAGE: The output must be in Traditional Chinese (Taiwan). Translate List B content if necessary.
    3. HIGHLIGHTING: ANY text that you insert, replace, or translate from List B MUST be wrapped in an HTML span tag with coral color: <span style="color: coral">INSERTED_TEXT</span>.
    4. UNTOUCHED TEXT: Text from Template A that was not replaced should remain exactly as is (no color tags).
    5. MISSING DATA: If List B does not have data for a section in Template A, leave the placeholder or original text of Template A alone.
    `;

    const userContent = `
    [Template A]
    ${templateA}

    [List B]
    ${listB}

    [Instruction]
    Perform the replacement and highlighting now.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: userContent,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.2, // Low temp for precision
      }
    });

    return { text: response.text || '' };

  } catch (e: any) {
    return { text: '', error: e.message };
  }
};
