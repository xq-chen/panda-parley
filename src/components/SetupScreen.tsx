import React, { useState } from 'react';
import { useDebateStore } from '../store/debateStore';
import { motion } from 'framer-motion';
import { Settings, Sparkles, Loader2 } from 'lucide-react';
import { SettingsModal } from './SettingsModal';
import { PRESET_EXPERTS } from '../data/personas';
import { LLMService } from '../services/llm';
import { SYSTEM_PROMPTS } from '../utils/prompts';

import { ExpertSelector } from './ExpertSelector';

export const SetupScreen: React.FC = () => {
    const { setTopic, setStatus, provider, topic, updatePersona, providerConfigs } = useDebateStore();

    const [topicInput, setTopicInput] = useState(topic || '');
    const [showSettings, setShowSettings] = useState(false);

    // Auto Selection State
    const [expertAId, setExpertAId] = useState<string>('auto'); // Default to Auto
    const [expertBId, setExpertBId] = useState<string>('auto');
    const [isCasting, setIsCasting] = useState(false);

    const handleStart = async () => {
        if (!topicInput) return;

        // Validation for Gemini (or others needing keys)
        const currentConfig = useDebateStore.getState().providerConfigs[provider];
        if (provider === 'gemini' && !currentConfig.apiKey) {
            alert("Please configure your Gemini API Key in Settings.");
            setShowSettings(true);
            return;
        }

        // 1. Check if we need to Cast experts
        if (expertAId === 'auto' || expertBId === 'auto') {
            setIsCasting(true);
            try {
                const config = providerConfigs[provider];
                const llm = new LLMService(config, provider);
                const castingPrompt = SYSTEM_PROMPTS.casting(topicInput, PRESET_EXPERTS);

                const response = await llm.generateCompletion([
                    { role: 'user', content: castingPrompt }
                ]);

                // Extract JSON
                const jsonMatch = response.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const castData = JSON.parse(jsonMatch[0]);

                    // Apply Expert A
                    if (expertAId === 'auto' && castData.expertAId) {
                        const expert = PRESET_EXPERTS.find(p => p.id === castData.expertAId);
                        if (expert) updatePersona('expertA', expert);
                    } else if (expertAId !== 'auto') {
                        const expert = PRESET_EXPERTS.find(p => p.id === expertAId);
                        if (expert) updatePersona('expertA', expert);
                    }

                    // Apply Expert B
                    if (expertBId === 'auto' && castData.expertBId) {
                        const expert = PRESET_EXPERTS.find(p => p.id === castData.expertBId);
                        if (expert) updatePersona('expertB', expert);
                    } else if (expertBId !== 'auto') {
                        const expert = PRESET_EXPERTS.find(p => p.id === expertBId);
                        if (expert) updatePersona('expertB', expert);
                    }
                }
            } catch (err) {
                console.error("Casting failed, falling back to Analyst/Visionary", err);
                // Fallbacks are already default in store, or we force defaults
                if (expertAId === 'auto') updatePersona('expertA', PRESET_EXPERTS[0]); // Analyst
                if (expertBId === 'auto') updatePersona('expertB', PRESET_EXPERTS[1]); // Visionary
            } finally {
                setIsCasting(false);
            }
        } else {
            // Manual selection update (if changed from defaults but not auto)
            // We can just rely on the onChange handlers of the selectors if strictly manual,
            // but here our Selector local state might need to push to store if we didn't do it instantly.
            // Actually, simplest is to push manual choices instantly, and auto only on start.
            const ea = PRESET_EXPERTS.find(p => p.id === expertAId);
            if (ea) updatePersona('expertA', ea);

            const eb = PRESET_EXPERTS.find(p => p.id === expertBId);
            if (eb) updatePersona('expertB', eb);
        }

        setTopic(topicInput);
        setStatus('paused');
    };



    return (
        <div className="relative w-full max-w-2xl mx-auto">
            {/* Settings Button */}


            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 glass-panel rounded-3xl"
            >
                <div className="text-center mb-10 relative">
                    <button
                        onClick={() => setShowSettings(true)}
                        className="absolute top-0 right-0 p-2 text-gray-400 hover:text-panda-ink transition-colors"
                        title="Configure AI Model"
                    >
                        <Settings size={24} />
                    </button>
                    <h1 className="text-5xl font-bold mb-4 font-display text-panda-ink">PandaParley 🐼</h1>
                    <p className="text-panda-charcoal/70 text-lg">Two AI experts. One deep inquiry. Guided by you.</p>
                </div>

                <div className="space-y-8">

                    {/* Language Selector */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Language</label>
                        <select
                            value={useDebateStore.getState().language}
                            onChange={(e) => useDebateStore.getState().setLanguage(e.target.value)}
                            className="w-full p-4 rounded-xl bg-white border-2 border-transparent focus:border-panda-green outline-none text-lg shadow-sm transition-all appearance-none cursor-pointer hover:bg-gray-50"
                        >
                            <option value="English">🇬🇧 English</option>
                            <option value="Chinese">🇨🇳 Chinese (中文)</option>
                            <option value="Japanese">🇯🇵 Japanese (日本語)</option>
                            <option value="Spanish">🇪🇸 Spanish (Español)</option>
                        </select>
                    </div>

                    {/* Topic Input */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Topic of Inquiry</label>
                        <textarea
                            value={topicInput}
                            onChange={(e) => setTopicInput(e.target.value)}
                            className="w-full p-4 rounded-xl bg-white border-2 border-transparent focus:border-panda-green outline-none text-xl shadow-sm transition-all min-h-[120px] resize-none"
                            placeholder="e.g. Is it better to be feared or loved?"
                        />
                    </div>

                    {/* Expert Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ExpertSelector
                            role="expertA"
                            label="Expert A (Left)"
                            value={expertAId}
                            onChange={setExpertAId}
                        />
                        <ExpertSelector
                            role="expertB"
                            label="Expert B (Right)"
                            value={expertBId}
                            onChange={setExpertBId}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col md:flex-row gap-4 pt-4">
                        <button
                            onClick={handleStart}
                            disabled={!topicInput || isCasting}
                            className="btn-primary flex-1 py-4 text-xl font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
                        >
                            {isCasting ? (
                                <>
                                    <Loader2 className="animate-spin" />
                                    Casting Experts...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={24} />
                                    Begin the Deep Dive
                                </>
                            )}
                        </button>


                    </div>
                </div>
            </motion.div>

            <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
        </div>
    );
};
