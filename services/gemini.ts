const ENV_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export async function callGeminiApi(
    systemPrompt: string,
    userQuery: string,
    useGrounding: boolean,
    responseSchema?: any,
    maxRetries = 5
) {

    const apiKey = ENV_API_KEY || "AIzaSyBoq1JlAo-u4M4gdL0RINCtp7T0VBRPRe8"; 

    if (!apiKey) {
        console.error("Gemini API Key is missing. Please set the VITE_GEMINI_API_KEY environment variable.");
        throw new Error("API Key configuration error.");
    }

    const model = 'gemini-2.5-flash-preview-09-2025';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const payload: any = {
        contents: [{ parts: [{ text: userQuery }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
    };
    
    if (useGrounding) {
        payload.tools = [{ "google_search": {} }];
    }
    
    const headers: HeadersInit = { 'Content-Type': 'application/json' };

    if (responseSchema) {
        payload.generationConfig = {
            responseMimeType: "application/json",
            responseSchema: responseSchema
        };
    }
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                if (response.status === 429 || response.status >= 500) {
                    throw new Error(`API Error: ${response.statusText}`, { cause: response.status });
                }
                const errorBody = await response.json();
                throw new Error(errorBody.error?.message || `API Request Failed, status: ${response.status}`);
            }

            const result = await response.json();
            const candidate = result.candidates?.[0];

            if (candidate && candidate.content?.parts?.[0]?.text) {
                const text = candidate.content.parts[0].text;
                let sources: any[] = [];
                
                const groundingMetadata = candidate.groundingMetadata;
                if (groundingMetadata && groundingMetadata.groundingAttributions) {
                    sources = groundingMetadata.groundingAttributions
                        .map((attribution: any) => ({
                            uri: attribution.web?.uri,
                            title: attribution.web?.title,
                        }))
                        .filter((source: any) => source.uri && source.title);
                }

                if (responseSchema) {
                    return JSON.parse(text);
                }

                return { text, sources };
            } else {
                throw new Error("AI did not return content.");
            }
        } catch (error) {
            if ((error as any).cause === 429 || (error as any).cause >= 500) {
                const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
                if (attempt < maxRetries - 1) {
                    await new Promise(resolve => setTimeout(resolve, delay));
                } else {
                    throw new Error("API call failed after multiple retries.");
                }
            } else {
                throw error;
            }
        }
    }
    throw new Error("API call failed after multiple retries.");
}
