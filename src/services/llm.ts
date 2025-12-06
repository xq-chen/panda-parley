export interface LLMMessage {
    role: 'user' | 'model' | 'system';
    content: string;
}

export interface LLMConfig {
    apiKey: string;
    baseUrl?: string; // Optional for custom endpoints
    modelName?: string;
}

export type LLMProvider = 'gemini' | 'openai' | 'openrouter' | 'modelscope';

export class LLMService {
    private config: LLMConfig;
    private provider: LLMProvider;

    constructor(config: LLMConfig, provider: LLMProvider = 'gemini') {
        this.config = config;
        this.provider = provider;
    }

    async generateCompletion(messages: LLMMessage[]): Promise<string> {
        if (this.provider === 'gemini') {
            if (!this.config.apiKey) throw new Error("API Key is missing for Google Gemini");
            return this.callGemini(messages);
        }

        // OpenAI Compatible Providers (OpenAI, OpenRouter, ModelScope, Local)
        return this.callOpenAICompatible(messages);
    }

    private getProviderDefaults(): { baseUrl: string; model: string } {
        switch (this.provider) {
            case 'openrouter':
                return { baseUrl: 'https://openrouter.ai/api/v1', model: 'mistralai/mistral-7b-instruct' };
            case 'modelscope':
                return { baseUrl: 'https://api-inference.modelscope.cn/v1', model: 'qwen-turbo' };
            case 'openai': // Covers Local too if user changes URL
            default:
                return { baseUrl: 'https://api.openai.com/v1', model: 'gpt-3.5-turbo' };
        }
    }



    private async callGemini(messages: LLMMessage[]): Promise<string> {
        // Basic mapping to Gemini API rest format or using SDK if available.
        // Using fetch for zero-dependency simplicity in this demo.
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.config.apiKey}`;

        // Transform messages to Gemini format
        // Gemini uses "user" and "model". System instructions are passed differently or prepended.
        const contents = messages.map(m => ({
            role: m.role === 'system' ? 'user' : m.role, // Hack: Gemini Pro often treats first user msg as system or use systemInstruction
            parts: [{ text: m.content }]
        }));

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || 'Gemini API Error');
        }

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    }

    private async callOpenAICompatible(messages: LLMMessage[]): Promise<string> {
        const defaults = this.getProviderDefaults();

        // Use user config if present, else defaults
        let endpoint = this.config.baseUrl || defaults.baseUrl;
        const model = this.config.modelName || defaults.model;

        // Clean endpoint
        if (endpoint.endsWith('/')) endpoint = endpoint.slice(0, -1);
        if (!endpoint.endsWith('/chat/completions')) {
            endpoint += '/chat/completions';
        }

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey || ''}`
        };

        // OpenRouter specific headers
        if (this.provider === 'openrouter') {
            headers['HTTP-Referer'] = 'https://github.com/xq-chen/panda-parley';
            headers['X-Title'] = 'PandaParley';
        }

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    model: model,
                    messages: messages.map(m => ({
                        role: m.role === 'model' ? 'assistant' : m.role,
                        content: m.content
                    })),
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.error?.message || `API Error (${this.provider}): ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data.choices?.[0]?.message?.content || "";
        } catch (error) {
            console.error(`LLM Error (${this.provider}):`, error);
            throw error;
        }
    }
}
