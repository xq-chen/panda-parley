import React, { useEffect, useRef } from 'react';
import { useDebateStore } from '../store/debateStore';
import { ChatMessage } from './ChatMessage';


export const DebateStage: React.FC = () => {
    const { messages, personas } = useDebateStore();
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const ExpertCard = ({ role, align }: { role: 'expertA' | 'expertB', align: 'left' | 'right' }) => (
        <div className={`flex flex-col items-center p-4 w-64 hidden md:flex ${align === 'left' ? 'order-first' : 'order-last'}`}>
            <div className={`w-32 h-32 rounded-full mb-4 shadow-lg flex items-center justify-center text-4xl border-4 ${align === 'left' ? 'bg-blue-100 border-blue-300' : 'bg-red-100 border-red-300'}`}>
                {personas[role].icon || (role === 'expertA' ? '🦄' : '🐉')}
            </div>
            <h3 className="font-bold text-xl">{personas[role].name}</h3>
            <p className="text-xs text-center opacity-70 mt-2">{personas[role].roleDescription}</p>
        </div>
    );

    return (
        <div className="flex flex-1 h-full overflow-hidden relative">
            <ExpertCard role="expertA" align="left" />

            <div className="flex-1 h-full relative flex flex-col mx-4">
                {/* Chat Stream */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar scroll-smooth pb-6"
                >
                    {messages.length === 0 && (
                        <div className="text-center text-gray-400 mt-20">The stage is set. The debate will begin shortly...</div>
                    )}
                    {messages.map((msg) => (
                        <ChatMessage key={msg.id} message={msg} />
                    ))}
                </div>
            </div>

            <ExpertCard role="expertB" align="right" />
        </div>
    );
};
