import { StoryInputs, StoryConcept, Message, Character, OutlinePoint } from '../types';

const MODEL_NAME = 'gemini-2.5-flash-preview-09-2025';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=`;
const API_KEY = ""; 

async function fetchWithRetry(url: string, payload: any, retries: number = 3): Promise<any> {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url + API_KEY, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                return response.json();
            } else if (response.status === 429 && i < retries - 1) {
                const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                const errorBody = await response.text();
                throw new Error(`API error: ${response.status} - ${errorBody}`);
            }
        } catch (error) {
            if (i === retries - 1) {
                throw error;
            }
        }
    }
}

export async function generateStoryConcept(inputs: StoryInputs): Promise<StoryConcept | null> {
    const userPrompt = `基于以下要素，为一部小说生成一个详细的故事概念：
    - 故事类型 (Genre): ${inputs.genre}
    - 核心点子/梗概 (Theme): ${inputs.theme}
    - 主角特征 (Protagonist): ${inputs.hero}
    - 故事背景 (Setting): ${inputs.setting}
    
    请确保故事标题引人入胜，梗概充满张力，并提供一个鲜明的主角形象和核心冲突。
    `;

    const payload = {
        contents: [{ parts: [{ text: userPrompt }] }],
        systemInstruction: {
            parts: [{ text: "你是一位世界顶级的小说概念设计师。你必须严格按照提供的 JSON 模式输出中文结果，不得包含任何解释性文本或 Markdown 格式化。所有字段都必须填充。" }]
        },
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: "OBJECT",
                properties: {
                    "title": { "type": "STRING", "description": "引人入胜的故事标题" },
                    "synopsis": { "type": "STRING", "description": "一段简洁、抓人的故事梗概" },
                    "characterName": { "type": "STRING", "description": "主角的名字" },
                    "characterRole": { "type": "STRING", "description": "主角的角色定位 (例如：落魄侦探、天才科学家)" },
                    "characterDesc": { "type": "STRING", "description": "主角的简短背景和描述" },
                    "characterConflict": { "type": "STRING", "description": "主角面临的核心冲突或挑战" }
                },
                "required": ["title", "synopsis", "characterName", "characterRole", "characterDesc", "characterConflict"],
                "propertyOrdering": ["title", "synopsis", "characterName", "characterRole", "characterDesc", "characterConflict"]
            }
        }
    };

    try {
        const result = await fetchWithRetry(API_URL, payload);
        const jsonText = result?.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (jsonText) {
            const concept = JSON.parse(jsonText);
            if (concept && concept.title) {
                return concept as StoryConcept;
            }
        }
    } catch (e) {
        console.error("Error generating story concept:", e);
    }

    return null;
}

export async function continueStory(currentText: string): Promise<string> {
    const userPrompt = `请作为一位专业的小说家，根据以下文本的语气、风格和故事线索，精彩地续写 150-200 字左右的内容。请直接输出续写后的文本，不要包含任何标题或解释：\n\n${currentText}`;

    const payload = {
        contents: [{ parts: [{ text: userPrompt }] }],
        systemInstruction: {
            parts: [{ text: "你是一位经验丰富的小说家，擅长保持故事连贯性和风格一致性。请用中文直接提供文本续写。" }]
        },
    };

    try {
        const result = await fetchWithRetry(API_URL, payload);
        return result?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } catch (e) {
        console.error("Error continuing story:", e);
        return "// AI 续写失败。请检查网络或重试。";
    }
}

export async function extractStoryElements(currentText: string): Promise<{ characters: Partial<Character>[], outlinePoints: OutlinePoint[] } | null> {
    const userPrompt = `请分析以下故事文本，提取出潜在的角色卡片信息和大纲关键点。
    - 提取 1-3 个主要角色或重要配角的名字、角色定位、冲突或简要描述。只提取部分字段即可 (name, role, conflict, description)。
    - 提取 3-5 个关键剧情阶段，提供阶段描述 (stage, description) 和一个 0-100 的紧张度评分 (tension)。
    
    文本内容：\n\n${currentText}`;

    const schema = {
        type: "OBJECT",
        properties: {
            "characters": {
                "type": "ARRAY",
                "description": "提取出的潜在角色列表",
                "items": {
                    "type": "OBJECT",
                    "properties": {
                        "name": { "type": "STRING", "description": "角色名字" },
                        "role": { "type": "STRING", "description": "角色定位 (例如：主角、反派、配角)" },
                        "conflict": { "type": "STRING", "description": "角色面临的冲突或动机" },
                        "description": { "type": "STRING", "description": "角色的简要描述" }
                    },
                    "required": ["name", "role"]
                }
            },
            "outlinePoints": {
                "type": "ARRAY",
                "description": "提取出的关键大纲点列表",
                "items": {
                    "type": "OBJECT",
                    "properties": {
                        "stage": { "type": "STRING", "description": "剧情阶段名称 (例如：开端、转折、高潮)" },
                        "tension": { "type": "NUMBER", "description": "当前阶段的紧张度评分 (0-100)" },
                        "description": { "type": "STRING", "description": "阶段事件总结" }
                    },
                    "required": ["stage", "tension", "description"]
                }
            }
        },
        "required": ["characters", "outlinePoints"]
    };

    const payload = {
        contents: [{ parts: [{ text: userPrompt }] }],
        systemInstruction: {
            parts: [{ text: "你是一位优秀的故事分析师。请严格按照提供的 JSON 模式输出中文结果，不得包含任何解释性文本或 Markdown 格式化。所有字段都必须填充。" }]
        },
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: schema
        }
    };

    try {
        const result = await fetchWithRetry(API_URL, payload);
        const jsonText = result?.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (jsonText) {
            const data = JSON.parse(jsonText);
            if (data && data.characters && data.outlinePoints) {
                return data as { characters: Partial<Character>[], outlinePoints: OutlinePoint[] };
            }
        }
    } catch (e) {
        console.error("Error extracting story elements:", e);
    }

    return null;
}

export async function assistantChat(storyContext: string, chatHistory: Message[], userMessage: string): Promise<{ text: string, sources: any[] }> {

    const contents = chatHistory.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
    }));
 
    contents.push({
        role: 'user',
        parts: [{ text: userMessage }]
    });

    const systemPrompt = `你是一个专业的写作助手，正在帮助一位作家创作一部小说。
    当前的写作上下文是: ${storyContext}。
    请根据上下文和你的知识，用中文简洁、专业地回答作家的提问。如果需要搜索最新资料，请使用工具。`;
    
    const payload = {
        contents: contents,
        tools: [{ "google_search": {} }], 
        systemInstruction: {
            parts: [{ text: systemPrompt }]
        },
    };

    try {
        const result = await fetchWithRetry(API_URL, payload);
        const candidate = result.candidates?.[0];
        const text = candidate?.content?.parts?.[0]?.text || "抱歉，我暂时无法回答这个问题。";
        let sources: any[] = [];
        const groundingMetadata = candidate?.groundingMetadata;
        if (groundingMetadata && groundingMetadata.groundingAttributions) {
            sources = groundingMetadata.groundingAttributions
                .map((attribution: any) => ({
                    uri: attribution.web?.uri,
                    title: attribution.web?.title,
                }))
                .filter((source: any) => source.uri && source.title);
        }

        return { text, sources };
    } catch (e) {
        console.error("Error in assistant chat:", e);
        return { text: "抱歉，连接助手失败，请检查网络或重试。", sources: [] };
    }
}
