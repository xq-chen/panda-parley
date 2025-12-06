import { useState, useCallback, useRef } from 'react';
import { useDebateStore } from '../store/debateStore';
import { LLMService } from '../services/llm';
import { SYSTEM_PROMPTS } from '../utils/prompts';
import { optimizeContext, formatContext } from '../utils/contextManager';

export function useDebateController() {
    const {
        messages,
        personas,
        topic,
        language,
        status,
        provider,
        providerConfigs,
        addMessage,
        markMessageHandled,
        setStatus,
        archiveSession
    } = useDebateStore();

    const [isProcessing, setIsProcessing] = useState(false);
    const turnCount = useRef(0);

    // Initialize LLM Service with ACTIVE provider config
    const activeConfig = providerConfigs[provider];
    const llm = new LLMService(activeConfig, provider);

    const processTurn = useCallback(async (nextRole: 'expertA' | 'expertB' | 'facilitator', isClosing: boolean = false) => {
        turnCount.current += 1; // Increment turn count for every turn processed
        if (!activeConfig.apiKey && provider === 'gemini') {
            setStatus('error');
            addMessage({ role: 'facilitator', content: 'System: API Key missing. Please configure settings.' });
            return;
        }

        setIsProcessing(true);

        let systemPrompt = '';

        try {
            // 1. Prepare Context
            const recentMessages = optimizeContext(messages);
            const historyText = formatContext(recentMessages);

            if (nextRole === 'facilitator') {
                systemPrompt = SYSTEM_PROMPTS.facilitator(personas.facilitator, personas.expertA, personas.expertB, topic, language, turnCount.current);
            } else if (nextRole === 'expertA') {
                systemPrompt = SYSTEM_PROMPTS.expert(personas.expertA, topic, personas.expertB.name, language);
            } else {
                systemPrompt = SYSTEM_PROMPTS.expert(personas.expertB, topic, personas.expertA.name, language);
            }

            // Check for user whisper (if facilitator turn)
            const reversedMessages = [...messages].reverse();
            // Find the most recent UNHANDLED user whisper
            const activeWhisper = reversedMessages.find(m => m.role === 'user' && m.isPrivate && !m.isHandled);

            if (nextRole === 'facilitator' && activeWhisper) {
                // Inject the whisper into the system prompt or as a specific context injection
                systemPrompt += `\n\n[IMPORTANT] The user whispered: "${activeWhisper.content}". Use this to guide your next output implicitly.`;

                // Mark as handled so we don't use it again
                // We need to do this immediately or after success? 
                // Best to mark it now to avoid double-processing if re-renders occur, 
                // but strictly we should mark it when we successfully "commit" this turn.
                // However, since we are inside processTurn which leads to addMessage, let's defer marking 
                // until we add the message, OR just rely on the fact that the next re-render will see the new state.
                // Actually, we can just call the store action here? 
                // Wait, processTurn is async. If we mark it now, and LLM fails, we might lose the whisper.
                // But for now, let's mark it as handled *after* successful generation or right here if we assume success.
                // Better safety: Mark it handled effectively by "consuming" it into the context. 
                // Realistically, to update the UI/Store, we must call the action.
            }

            if (isClosing) {
                systemPrompt += `\n\n[IMPORTANT] The user has requested to CONCLUDE this session. Please provide a comprehensive summary of the discussion so far, highlight the key insights from both experts, and offer a final synthesizing thought or "truth". Then, bid farewell to the user.`;
            }

            // 2. Call LLM
            const response = await llm.generateCompletion([
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Current Debate History:\n${historyText}\n\nYour turn. Respond as ${nextRole}.` }
            ]);

            if (isClosing) {
                setStatus('completed');
                archiveSession();
            }

            // 3. Check for specific control tags
            let finalContent = response;
            let shouldConclude = false;

            if (nextRole === 'facilitator' && response.includes('[CONCLUDED]')) {
                shouldConclude = true;
                finalContent = response.replace('[CONCLUDED]', '').trim();
            }

            // 4. Update State
            addMessage({
                role: nextRole,
                content: finalContent,
                isPrivate: false
            });

            // If we used a whisper, mark it handled now
            if (nextRole === 'facilitator' && activeWhisper) {
                markMessageHandled(activeWhisper.id);
            }

            if (isClosing || shouldConclude) {
                setStatus('completed');
                archiveSession();
            }

        } catch (error: any) {
            console.error('Turn Error:', error);

            // Auto-recovery: If error suggests context length issues, retry with aggressive pruning
            const errorMessage = error.message || '';
            if ((errorMessage.includes('400') || errorMessage.includes('context') || errorMessage.includes('argument')) && !isProcessing) {
                console.log("Attempting auto-recovery with pruned context...");
                try {
                    // Aggressive pruning: 1000 tokens only
                    const tinyContext = optimizeContext(messages, 1000);
                    const tinyHistory = formatContext(tinyContext);

                    const recoveryResponse = await llm.generateCompletion([
                        { role: 'system', content: systemPrompt }, // Keep system prompt full
                        { role: 'user', content: `[System: Previous context was too long. Summarized history:]\n...\n${tinyHistory}\n\nYour turn. Respond as ${nextRole}.` }
                    ]);

                    addMessage({ role: nextRole, content: recoveryResponse, isPrivate: false });
                    return;

                } catch (retryError) {
                    console.error("Retry failed:", retryError);
                }
            }

            setStatus('error');
            addMessage({ role: 'facilitator', content: `System Error: ${error.message}. Use "Start Over" if stuck.` });
        } finally {
            setIsProcessing(false);
        }
    }, [messages, personas, topic, activeConfig, provider, addMessage, setStatus, archiveSession]);

    const startDebate = useCallback(() => {
        if (status === 'debating') return;
        setStatus('debating');
        turnCount.current = 0;
        // Initial turn: Facilitator introduces
        processTurn('facilitator');
    }, [status, setStatus, processTurn]);

    const nextStep = useCallback(() => {
        if (status !== 'debating' || isProcessing) return;

        // Determine who spoke last
        const lastMsg = messages[messages.length - 1];
        if (!lastMsg) {
            processTurn('facilitator');
            return;
        }

        if (lastMsg.role === 'facilitator') {
            processTurn('expertA');
        } else if (lastMsg.role === 'expertA') {
            processTurn('expertB');
        } else if (lastMsg.role === 'expertB') {
            processTurn('facilitator');
        } else if (lastMsg.role === 'user') {
            // User whispered, so Facilitator should respond/guide next
            processTurn('facilitator');
        }
    }, [status, isProcessing, messages, processTurn]);

    // Loop effect could be here, or triggered by UI "Next" button, or auto-play
    // For MVP, we might want an auto-play effect if status matches

    const endDebate = useCallback(() => {
        if (status === 'completed' || isProcessing) return;

        // Force Facilitator to wrap up
        // We use a special flag or just call processTurn with a "closing" argument?
        // Let's modify processTurn to accept an optional 'instruction' override or strict mode,
        // or just handle it here by manually invoking logic similar to processTurn but with specific prompt.

        turnCount.current = 0; // Reset or irrelevant
        setStatus('debating'); // Ensure we are running to process this last turn

        // We call processTurn but we need it to know it's a wrap-up.
        // Quickest way: append a special flag to processTurn?
        // Or just hack the system prompt inside processTurn if we detect a specific "intent"?
        // Better: Let's explicitly call a "wrapUp" variant or pass a param.
        // Since processTurn is complex, let's keep it simple:
        // We will make processTurn accept an optional 'overridePrompt' argument.
        processTurn('facilitator', true);
    }, [status, isProcessing, setStatus, processTurn]);

    return {
        startDebate,
        nextStep,
        endDebate,
        isProcessing
    };
}
