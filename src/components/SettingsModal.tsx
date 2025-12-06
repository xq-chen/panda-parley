import React, { useState, useEffect } from 'react';
import { useDebateStore } from '../store/debateStore';
import { X, Save } from 'lucide-react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const { provider, providerConfigs, setProvider, updateProviderConfig } = useDebateStore();

    // Local state for form fields
    const [localProvider, setLocalProvider] = useState(provider);

    // Config values for the CURRENTLY selected localProvider tab
    const [apiKey, setApiKey] = useState('');
    const [baseUrl, setBaseUrl] = useState('');
    const [modelName, setModelName] = useState('');

    // When modal opens, sync localProvider to active provider
    useEffect(() => {
        if (isOpen) {
            setLocalProvider(provider);
        }
    }, [isOpen, provider]);

    // When localProvider tab changes (or modal opens), load configs for that provider
    useEffect(() => {
        const config = providerConfigs[localProvider];
        setApiKey(config?.apiKey || '');
        setBaseUrl(config?.baseUrl || '');
        setModelName(config?.modelName || '');
    }, [localProvider, providerConfigs]);

    const handleSave = () => {
        // Validation logic if needed
        if (localProvider === 'gemini' && !apiKey) {
            alert("API Key is required for Google Gemini.");
            return;
        }

        const isCompatible = localProvider === 'openai' || localProvider === 'openrouter' || localProvider === 'modelscope';

        // 1. Update the config for the selected provider
        updateProviderConfig(localProvider, {
            apiKey: apiKey,
            baseUrl: localProvider === 'openai' ? baseUrl : undefined, // Only OpenAI really uses custom BaseURL via input UI currently
            modelName: isCompatible ? modelName : undefined
        });

        // 2. Set this provider as active
        setProvider(localProvider);

        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-bold font-display text-panda-ink mb-6">Settings ⚙️</h2>

                <div className="space-y-5">

                    {/* Provider Selection */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">AI Model Provider</label>
                        <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-lg">
                            <button
                                onClick={() => setLocalProvider('gemini')}
                                className={`py-2 text-sm font-medium rounded-md transition-all ${localProvider === 'gemini' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Google Gemini
                            </button>
                            <button
                                onClick={() => {
                                    setLocalProvider('openrouter');
                                    if (!modelName || modelName.includes('llama')) setModelName('mistralai/mistral-7b-instruct');
                                }}
                                className={`py-2 text-sm font-medium rounded-md transition-all ${localProvider === 'openrouter' ? 'bg-white shadow text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                OpenRouter
                            </button>
                            <button
                                onClick={() => {
                                    setLocalProvider('modelscope');
                                    if (!modelName || modelName.includes('llama')) setModelName('qwen-turbo');
                                }}
                                className={`py-2 text-sm font-medium rounded-md transition-all ${localProvider === 'modelscope' ? 'bg-white shadow text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                ModelScope
                            </button>
                            <button
                                onClick={() => setLocalProvider('openai')}
                                className={`py-2 text-sm font-medium rounded-md transition-all ${localProvider === 'openai' ? 'bg-white shadow text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Local / OpenAI
                            </button>
                        </div>
                    </div>

                    {/* Gemini Settings */}
                    {localProvider === 'gemini' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Gemini API Key</label>
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-panda-green focus:ring-2 focus:ring-panda-green/20 outline-none transition-all"
                                placeholder="AIzaSy..."
                            />
                            <p className="text-xs text-gray-400 mt-1">Key is stored locally in your browser.</p>
                        </div>
                    )}

                    {/* OpenAI / Local / Compatible Settings */}
                    {(localProvider === 'openai' || localProvider === 'openrouter' || localProvider === 'modelscope') && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    API Key {localProvider === 'openai' ? '(Optional for Local)' : ''}
                                </label>
                                <input
                                    type="password"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-panda-green focus:ring-2 focus:ring-panda-green/20 outline-none transition-all"
                                    placeholder={localProvider === 'openrouter' ? 'sk-or-...' : 'sk-...'}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Model Name</label>
                                <input
                                    type="text"
                                    value={modelName}
                                    onChange={(e) => setModelName(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-panda-green focus:ring-2 focus:ring-panda-green/20 outline-none transition-all text-sm font-mono text-gray-600"
                                    placeholder={
                                        localProvider === 'openrouter' ? 'mistralai/mistral-7b-instruct' :
                                            localProvider === 'modelscope' ? 'qwen-turbo' :
                                                'gpt-3.5-turbo'
                                    }
                                />
                                {localProvider === 'openrouter' && <p className="text-xs text-gray-400 mt-1">Check OpenRouter for model IDs.</p>}
                                {localProvider === 'modelscope' && <p className="text-xs text-gray-400 mt-1">e.g. qwen-max, qwen-plus</p>}
                            </div>

                            {/* Base URL (Hidden for OpneRouter/ModelScope unless advanced? Or assume default?) 
                                Actually, user might want to override. Let's keep it but optional/pre-filled logic?
                                For simplicity, we hide Base URL for OpenRouter/ModelScope to reduce clutter, 
                                as we hardcoded the defaults in `llm.ts`. 
                                IF they want custom, they can use "Local / OpenAI" mode.
                            */}
                            {localProvider === 'openai' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Base URL</label>
                                    <input
                                        type="text"
                                        value={baseUrl}
                                        onChange={(e) => setBaseUrl(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-panda-green focus:ring-2 focus:ring-panda-green/20 outline-none transition-all text-sm font-mono text-gray-600"
                                        placeholder="http://localhost:1234/v1"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                </div>

                <div className="mt-8 pt-4 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={handleSave}
                        className="btn-primary px-6 py-2 flex items-center gap-2"
                    >
                        <Save size={18} />
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
};
