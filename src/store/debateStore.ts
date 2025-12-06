import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LLMConfig, LLMProvider } from '../services/llm';

export interface Message {
    id: string;
    role: 'expertA' | 'expertB' | 'facilitator' | 'user';
    content: string;
    timestamp: number;
    isPrivate?: boolean; // For facilitator-user whispers
    isHandled?: boolean; // Track if the processed by the system
}

export interface Persona {
    name: string;
    roleDescription: string;
    avatar?: string;
    color?: string;
    icon?: string;
}

export interface SavedSession {
    id: string;
    topic: string;
    date: number;
    messages: Message[];
    personas: DebateState['personas'];
    language: string;
}

export interface DebateState {
    status: 'idle' | 'debating' | 'paused' | 'error' | 'completed';
    sessionId: string; // Unique ID for the current session
    messages: Message[];
    topic: string;
    language: string;

    // History
    savedSessions: SavedSession[];

    // Configuration
    provider: LLMProvider;
    providerConfigs: Record<LLMProvider, LLMConfig>;

    personas: {
        expertA: Persona;
        expertB: Persona;
        facilitator: Persona;
    };

    // Actions
    setTopic: (topic: string) => void;
    setLanguage: (lang: string) => void;
    setProvider: (provider: LLMProvider) => void;
    updateProviderConfig: (provider: LLMProvider, config: Partial<LLMConfig>) => void;
    setStatus: (status: DebateState['status']) => void;
    addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
    markMessageHandled: (id: string) => void;
    updatePersona: (role: 'expertA' | 'expertB' | 'facilitator', data: Partial<Persona>) => void;
    clearMessages: () => void;
    resetSession: () => void;

    // History Actions
    archiveSession: () => void;
    deleteSession: (id: string) => void;
    loadSession: (id: string) => void;
}

export const useDebateStore = create<DebateState>()(
    persist(
        (set) => ({
            status: 'idle',
            sessionId: Date.now().toString(),
            messages: [],
            savedSessions: [],
            topic: '',
            language: 'English',
            provider: 'gemini',

            providerConfigs: {
                gemini: { apiKey: '' },
                openrouter: { apiKey: '', baseUrl: 'https://openrouter.ai/api/v1', modelName: 'mistralai/mistral-7b-instruct' },
                modelscope: { apiKey: '', baseUrl: 'https://api-inference.modelscope.cn/v1', modelName: 'qwen-turbo' },
                openai: { apiKey: '', baseUrl: 'https://api.openai.com/v1', modelName: 'gpt-3.5-turbo' }
            },

            personas: {
                expertA: { name: 'The Analyst', roleDescription: 'Logical, data-driven, and focused on deconstructing arguments to find core truths.', color: 'bg-blue-100', icon: '🦄' },
                expertB: { name: 'The Visionary', roleDescription: 'Intuitive, holistic, and focused on connecting disparate ideas to see the big picture.', color: 'bg-red-100', icon: '🐉' },
                facilitator: { name: 'The Guide', roleDescription: 'A wise moderator who guides the group past surface-level answers to deeper understanding.', color: 'bg-gray-100', icon: '🐼' }
            },

            setTopic: (topic) => set({ topic }),
            setLanguage: (language) => set({ language }),
            setProvider: (provider) => set({ provider }),

            updateProviderConfig: (provider, config) => set((state) => ({
                providerConfigs: {
                    ...state.providerConfigs,
                    [provider]: { ...state.providerConfigs[provider], ...config }
                }
            })),

            setStatus: (status) => set({ status }),

            addMessage: (msg) => set((state) => ({
                messages: [
                    ...state.messages,
                    {
                        ...msg,
                        id: Math.random().toString(36).substring(7),
                        timestamp: Date.now()
                    }
                ]
            })),

            markMessageHandled: (id) => set((state) => ({
                messages: state.messages.map(msg =>
                    msg.id === id ? { ...msg, isHandled: true } : msg
                )
            })),

            updatePersona: (role, data) => set((state) => ({
                personas: {
                    ...state.personas,
                    [role]: { ...state.personas[role], ...data }
                }
            })),

            resetSession: () => set({
                status: 'idle',
                messages: [],
                topic: '',
                sessionId: Date.now().toString() // New ID for new session
            }),

            clearMessages: () => set({ messages: [] }),

            archiveSession: () => set((state) => {
                // Check if session already exists in history
                const existingIndex = state.savedSessions.findIndex(s => s.id === state.sessionId);

                const sessionData: SavedSession = {
                    id: state.sessionId,
                    topic: state.topic,
                    date: Date.now(), // Update timestamp on save
                    messages: state.messages,
                    personas: state.personas,
                    language: state.language
                };

                let newSessions;
                if (existingIndex >= 0) {
                    // Update existing
                    newSessions = [...state.savedSessions];
                    newSessions[existingIndex] = sessionData;
                } else {
                    // Create new
                    newSessions = [sessionData, ...state.savedSessions];
                }

                return { savedSessions: newSessions };
            }),

            deleteSession: (id) => set((state) => ({
                savedSessions: state.savedSessions.filter(s => s.id !== id)
            })),

            loadSession: (id) => set((state) => {
                const session = state.savedSessions.find(s => s.id === id);
                if (!session) return {};
                return {
                    sessionId: session.id, // Important: Resume using the old ID
                    messages: session.messages,
                    topic: session.topic,
                    personas: session.personas,
                    language: session.language,
                    status: 'paused'
                };
            })
        }),
        {
            name: 'panda-parley-storage',
            partialize: (state) => ({
                provider: state.provider,
                providerConfigs: state.providerConfigs,
                personas: state.personas,
                savedSessions: state.savedSessions,
                sessionId: state.sessionId, // Persist current ID
            }),
        }
    )
);
