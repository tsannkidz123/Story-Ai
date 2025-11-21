
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { OutlinePoint, Character, StoryConcept } from "../types";

const apiKey = process.env.API_KEY || ''; // Ensure environment variable is handled
const ai = new GoogleGenAI({ apiKey });

const modelFlash = 'gemini-2.5-flash';

// --- Schemas ---

const characterSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING },
      conflict: { type: Type.STRING, description: "Internal or external conflict driving the character" },
      obstacle: { type: Type.STRING, description: "Main forces opposing the character" },
      action: { type: Type.STRING, description: "Key actions taken by the character" },
      ending: { type: Type.STRING, description: "Projected or actual resolution for the character" },
      role: { type: Type.STRING, description: "Protagonist, Antagonist, Supporting, etc." }
    },
    required: ["name", "conflict", "obstacle", "action", "ending"],
  },
};

const outlineSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      stage: { type: Type.STRING, description: "Name of the plot stage (e.g. Setup, Climax)" },
      tension: { type: Type.INTEGER, description: "Narrative tension level from 0 to 100" },
      description: { type: Type.STRING, description: "Summary of events at this stage" }
    },
    required: ["stage", "tension", "description"]
  }
};

const conceptSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    synopsis: { type: Type.STRING },
    characterName: { type: Type.STRING },
    characterRole: { type: Type.STRING },
    characterDesc: { type: Type.STRING },
    characterConflict: { type: Type.STRING },
  },
  required: ["title", "synopsis", "characterName", "characterRole", "characterDesc", "characterConflict"]
};

// --- API Calls ---

export const continueStory = async (
  previousContext: string, 
  currentContext: string, 
  styleInstructions: string = "Maintain the tone and style."
): Promise<string> => {
  try {
    const prompt = `
      You are a co-writer for a novel.
      
      Previous Context:
      ${previousContext.slice(-1000)}
      
      Current Writing:
      ${currentContext.slice(-500)}
      
      Instructions:
      ${styleInstructions}
      Continue the story naturally from the last sentence. Write about 200-300 words.
    `;

    const response = await ai.models.generateContent({
      model: modelFlash,
      contents: prompt,
    });

    return response.text || "";
  } catch (error) {
    console.error("Error continuing story:", error);
    throw error;
  }
};

export const extractCharactersFromText = async (text: string): Promise<Partial<Character>[]> => {
  try {
    const prompt = `
      Analyze the following story text and extract key characters.
      Focus on their core narrative elements: Conflict, Obstacle, Action, and Ending (if apparent or implied).
      
      Text:
      ${text.slice(0, 15000)} // Limit context window usage reasonably
    `;

    const response = await ai.models.generateContent({
      model: modelFlash,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: characterSchema,
      }
    });

    const jsonText = response.text;
    if (!jsonText) return [];
    return JSON.parse(jsonText) as Partial<Character>[];
  } catch (error) {
    console.error("Error extracting characters:", error);
    return [];
  }
};

export const generateOutlineFromText = async (text: string): Promise<OutlinePoint[]> => {
  try {
    const prompt = `
      Analyze the following story text and create a narrative arc outline.
      Map the story progression to a "Growth/Tension Curve".
      Provide 5-8 key plot points.
      
      Text:
      ${text.slice(0, 15000)}
    `;

    const response = await ai.models.generateContent({
      model: modelFlash,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: outlineSchema,
      }
    });

    const jsonText = response.text;
    if (!jsonText) return [];
    return JSON.parse(jsonText) as OutlinePoint[];
  } catch (error) {
    console.error("Error generating outline:", error);
    return [];
  }
};

export const generateStoryConcept = async (inputs: { genre: string, theme: string, hero: string, setting: string }): Promise<StoryConcept | null> => {
  try {
    const prompt = `
      Act as a professional story consultant. Based on the following inputs, brainstorm a compelling story concept.
      
      Genre: ${inputs.genre}
      Theme/Core Idea: ${inputs.theme}
      Protagonist: ${inputs.hero}
      Setting: ${inputs.setting}
      
      Create a creative title, a 100-word synopsis, and define the main character with their core conflict.
    `;

    const response = await ai.models.generateContent({
      model: modelFlash,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: conceptSchema,
      }
    });

    const jsonText = response.text;
    if (!jsonText) return null;
    return JSON.parse(jsonText) as StoryConcept;
  } catch (error) {
    console.error("Error generating concept:", error);
    return null;
  }
}

export const assistantChat = async (history: {role: string, parts: {text: string}[]}[], message: string) => {
  try {
    const chat = ai.chats.create({
      model: modelFlash,
      history: history as any,
      config: {
        systemInstruction: "You are a helpful, creative writing assistant. Help with research, synonyms, plot holes, and world-building.",
      }
    });

    const result = await chat.sendMessage({ message });
    return result.text;
  } catch (error) {
    console.error("Chat error:", error);
    return "抱歉，我暂时无法连接到灵感源泉。";
  }
};
