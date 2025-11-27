import { GoogleGenAI } from "@google/genai";
import { AgentConfig, AgentRunState, ChatMessage } from "../types";
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

// --- Note Keeper Services ---

interface NoteKeeperParams {
  apiKey: string;
  text: string;
  action: 'format' | 'keywords' | 'entities' | 'mindmap';
  meta?: { keywords?: string; color?: string };
}

export const generateNoteAction = async ({
  apiKey,
  text,
  action,
  meta
}: NoteKeeperParams): Promise<{ text: string; error?: string }> => {
  if (!apiKey) return { text: '', error: 'API Key Missing' };

  try {
    const ai = new GoogleGenAI({ apiKey });
    let systemInstruction = '';
    let prompt = '';

    switch (action) {
      case 'format':
        systemInstruction = 'You are an expert editor. Organize the text into clean, structured Markdown. Use Headers, Bullet Points, and Bold text for emphasis. DO NOT summarize or remove any information. Keep ALL original content, just make it readable.';
        prompt = `Format the following text:\n\n${text}`;
        break;

      case 'keywords':
        systemInstruction = `You are a text highlighter. You must find the specific keywords provided by the user in the text and wrap them in HTML span tags with the color: ${meta?.color || 'yellow'}. Example: <span style="color: ${meta?.color || 'yellow'}">keyword</span>. Return the FULL text in Markdown, with the highlights applied.`;
        prompt = `Keywords to highlight: ${meta?.keywords}\n\nText:\n${text}`;
        break;

      case 'entities':
        systemInstruction = 'Extract the top 20 most important entities from the text. Return ONLY a Markdown Table with columns: | Entity | Type | Context |. Do not add conversational text.';
        prompt = `Extract entities from:\n\n${text}`;
        break;
      
      case 'mindmap':
        systemInstruction = 'Analyze the relationships in the text. Return strictly valid JSON compatible with Python NetworkX node-link format. Structure: { "nodes": [{"id": "Name"}], "links": [{"source": "Name", "target": "Name", "relationship": "label"}] }. Do not wrap in markdown code blocks, just return raw JSON.';
        prompt = `Create a network graph JSON from:\n\n${text}`;
        break;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.1,
      }
    });

    return { text: response.text || '' };

  } catch (e: any) {
    return { text: '', error: e.message };
  }
};

export const chatWithNote = async (apiKey: string, history: ChatMessage[], contextText: string): Promise<string> => {
  if (!apiKey) return 'Error: API Key Missing';
  try {
    const ai = new GoogleGenAI({ apiKey });
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: `You are a helpful assistant. Answer the user's questions based strictly on the following context note:\n\n${contextText}\n\nIf the answer is not in the note, say so.`
      },
      history: history.slice(0, -1).map(h => ({
        role: h.role,
        parts: [{ text: h.content }]
      }))
    });

    const lastMsg = history[history.length - 1].content;
    const result = await chat.sendMessage({ message: lastMsg });
    return result.text;

  } catch (e: any) {
    return `Error: ${e.message}`;
  }
}