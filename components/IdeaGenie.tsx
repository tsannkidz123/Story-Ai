import { Character, OutlinePoint, StoryConcept } from "../types";

const apiKey = ""; 
const apiUrlBase = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

const characterSchema = {
    type: "ARRAY",
    items: {
        type: "OBJECT",
        properties: {
            name: { type: "STRING" },
            conflict: { type: "STRING", description: "Internal or external conflict driving the character" },
            obstacle: { type: "STRING", description: "Main forces opposing the character" },
            action: { type: "STRING", description: "Key actions taken by the character" },
            ending: { type: "STRING", description: "Projected or actual resolution for the character" },
            role: { type: "STRING", description: "Protagonist, Antagonist, Supporting, etc." }
        },
        required: ["name", "conflict", "obstacle", "action", "ending"],
    },
};

const characterAnalysisSchema = {
    type: "OBJECT",
    properties: {
        name: { type: "STRING" },
        role: { type: "STRING" },
        description: { type: "STRING" },
        conflict: { type: "STRING" },
        obstacle: { type: "STRING" },
        action: { type: "STRING" },
        ending: { type: "STRING" },
        appearance: { type: "STRING" },
        growthArc: { type: "STRING" },
    },
    required: ["name", "role", "conflict", "obstacle", "action"]
};

// 大纲 Schema
const outlineSchema = {
    type: "ARRAY",
    items: {
        type: "OBJECT",
        properties: {
            stage: { type: "STRING", description: "Name of the plot stage (e.g. Setup, Climax)" },
            tension: { type: "INTEGER", description: "Narrative tension level from 0 to 100" },
            description: { type: "STRING", description: "Summary of events at this stage" }
        },
        required: ["stage", "tension", "description"]
    }
};

const conceptSchema = {
    type: "OBJECT",
    properties: {
        title: { type: "STRING" },
        synopsis: { type: "STRING" },
        characterName: { type: "STRING" },
        characterRole: { type: "STRING" },
        characterDesc: { type: "STRING" },
        characterConflict: { type: "STRING" },
    },
    required: ["title", "synopsis", "characterName", "characterRole", "characterDesc", "characterConflict"]
};

async function callGeminiApi<T>(
    prompt: string,
    schema?: any,
    history: { role: 'user' | 'model', parts: { text: string }[] }[] = [],
    systemInstruction?: string,
): Promise<T | string> {
    const contents = [...history, { role: 'user' as const, parts: [{ text: prompt }] }];
    
    const payload: any = {
        contents: contents,
    };
    
    if (schema) {
        payload.generationConfig = {
            responseMimeType: "application/json",
            responseSchema: schema,
        };
    }
    
    if (systemInstruction) {
        payload.systemInstruction = { parts: [{ text: systemInstruction }] };
    }

    for (let attempt = 0; attempt < 4; attempt++) {
        try {
            const response = await fetch(apiUrlBase, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                if (response.status === 429 && attempt < 3) {
                    const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue; // 重试
                }
                throw new Error(`API call failed with status: ${response.status}`);
            }

            const result = await response.json();
            const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

            if (schema) {
                if (text) {
                    try {
                        return JSON.parse(text) as T;
                    } catch (e) {
                        console.error("Failed to parse JSON response:", text);
                        throw new Error("AI returned invalid JSON structure.");
                    }
                }
                throw new Error("AI did not return content or JSON text.");
            }
            
            return text || "";
            
        } catch (error) {
            if (attempt === 3) {
                throw error; 
            }
            const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    throw new Error("Max retries reached. Failed to call AI API.");
}

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
        
        return await callGeminiApi<string>(prompt);
    } catch (error) {
        console.error("Error continuing story:", error);
        throw new Error("无法继续故事。");
    }
};

export const extractCharactersFromText = async (text: string): Promise<Partial<Character>[]> => {
    try {
        const prompt = `
          Analyze the following story text and extract key characters.
          Focus on their core narrative elements: Conflict, Obstacle, Action, and Ending (if apparent or implied).
          
          Text:
          ${text.slice(0, 15000)}
        `;
        
        return await callGeminiApi<Partial<Character>[]>(prompt, characterSchema);
    } catch (error) {
        console.error("Error extracting characters:", error);
        return [];
    }
};

export const analyzeCharacterBio = async (bio: string): Promise<Partial<Character> | null> => {
    try {
        const prompt = `
          Read the following character biography/notes and extract structured character data.
          Infer missing fields if necessary based on the context.
          
          Biography:
          ${bio}
        `;
        
        return await callGeminiApi<Partial<Character>>(prompt, characterAnalysisSchema);
    } catch (error) {
        console.error("Error analyzing bio:", error);
        return null;
    }
}

export const generateOutlineFromText = async (text: string): Promise<OutlinePoint[]> => {
    try {
        const prompt = `
          Analyze the following story text and create a narrative arc outline.
          Map the story progression to a "Growth/Tension Curve".
          Provide 5-8 key plot points.
          
          Text:
          ${text.slice(0, 15000)}
        `;

        return await callGeminiApi<OutlinePoint[]>(prompt, outlineSchema);
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

        return await callGeminiApi<StoryConcept>(prompt, conceptSchema);
    } catch (error) {
        console.error("Error generating concept:", error);
        return null;
    }
}

export const assistantChat = async (history: {role: string, parts: {text: string}[]}[], message: string): Promise<string> => {
    try {
        const systemInstruction = "You are a helpful, creative writing assistant. Help with research, synonyms, plot holes, and world-building.";
        
        const lastUserMessage = message; 

        const formattedHistory = history.map(msg => ({
            role: msg.role === 'model' ? 'model' : 'user',
            parts: msg.parts,
        }));

        return await callGeminiApi<string>(lastUserMessage, undefined, formattedHistory, systemInstruction);

    } catch (error) {
        console.error("Chat error:", error);
        return "抱歉，我暂时无法连接到灵感源泉。";
    }
};
