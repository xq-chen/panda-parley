import React, { useState } from 'react';
import { useDebateController } from '../hooks/useDebateController';
import { useDebateStore } from '../store/debateStore';
import { Send, Play, Pause, FastForward, Flag } from 'lucide-react';

export const ControlPanel: React.FC = () => {
    const { startDebate, nextStep, endDebate, isProcessing } = useDebateController();
    const { messages, addMessage, status, setStatus } = useDebateStore();
    const [whisper, setWhisper] = useState('');

    const handleWhisper = (e: React.FormEvent) => {
        e.preventDefault();
        if (!whisper.trim()) return;

        addMessage({
            role: 'user',
            content: whisper,
            isPrivate: true
        });
        setWhisper('');

        // If discussion was completed or paused, resume it so the facilitator can respond
        if (status === 'completed' || status === 'paused') {
            setStatus('debating');
        }
    };

    const togglePause = () => {
        if (status === 'debating') setStatus('paused');
        else setStatus('debating');
    };

    return (
        <div className="w-full p-6 glass-panel border-t border-white/30 z-20">
            <div className="max-w-4xl mx-auto flex gap-4 items-center">

                {/* Controls */}
                <div className="flex gap-2">
                    {messages.length === 0 ? (
                        <button onClick={startDebate} disabled={isProcessing} className="btn-primary flex gap-2 items-center">
                            <Play size={18} /> Start
                        </button>
                    ) : (
                        <>
                            <button onClick={togglePause} className="btn-secondary w-12 h-12 flex items-center justify-center rounded-full" title={status === 'debating' ? "Pause" : "Resume"}>
                                {status === 'debating' ? <Pause size={20} /> : <Play size={20} />}
                            </button>
                            <button onClick={nextStep} disabled={isProcessing || status === 'debating'} className="btn-secondary w-12 h-12 flex items-center justify-center rounded-full" title="Fast Forward">
                                <FastForward size={20} />
                            </button>
                            <button onClick={endDebate} disabled={isProcessing || status === 'completed'} className="btn-secondary w-12 h-12 flex items-center justify-center rounded-full text-panda-red border-panda-red/20 hover:bg-panda-red/5" title="Conclude Discussion">
                                <Flag size={20} />
                            </button>
                        </>
                    )}
                </div>

                {/* Status Indicator */}
                <div className="flex-shrink-0 text-sm font-medium w-24 text-center">
                    {isProcessing ? (
                        <span className="text-panda-green animate-pulse">Thinking...</span>
                    ) : (
                        <span className="text-gray-400 capitalize">{status}</span>
                    )}
                </div>

                {/* Whisper Input */}
                <form onSubmit={handleWhisper} className="flex-1 relative">
                    <input
                        type="text"
                        value={whisper}
                        onChange={(e) => setWhisper(e.target.value)}
                        placeholder="Whisper to the Facilitator..."
                        className="input-field pr-12 bg-white shadow-inner"
                    />
                    <button
                        type="submit"
                        disabled={!whisper}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-panda-ink/50 hover:text-panda-ink p-1"
                    >
                        <Send size={18} />
                    </button>
                </form>

            </div>
        </div>
    );
};
