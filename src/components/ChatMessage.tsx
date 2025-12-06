import React from 'react';
import Markdown from 'markdown-to-jsx';
import { motion } from 'framer-motion';
import type { Message } from '../store/debateStore';
import { useDebateStore } from '../store/debateStore';
import clsx from 'clsx';

interface ChatMessageProps {
    message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
    const { personas } = useDebateStore();
    const isUser = message.role === 'user';
    const isFacilitator = message.role === 'facilitator';
    const isExpertA = message.role === 'expertA';

    // ... (keep default vars)

    // Helper to get name safely
    const roleName = message.role === 'user' ? 'You' : personas[message.role]?.name || message.role;

    // ... logic for styles ...



    // Styles
    const bubbleClass = clsx(
        "p-4 rounded-2xl max-w-[80%] shadow-sm backdrop-blur-sm",
        {
            "bg-panda-base border border-panda-ink/10 text-panda-ink rounded-bl-none": isExpertA, // Expert A (Left)
            "bg-panda-ink text-white rounded-br-none": message.role === 'expertB', // Expert B (Right) - Inverted
            "bg-panda-green/20 border border-panda-green/40 text-panda-darkgreen mx-auto max-w-[90%] w-full text-center italic": isFacilitator, // Center
            "bg-yellow-100 border border-yellow-300 text-yellow-900 text-sm": isUser && message.isPrivate // Whisper
        }
    );

    const containerClass = clsx(
        "flex w-full mb-4",
        {
            "justify-start": isExpertA,
            "justify-end": message.role === 'expertB',
            "justify-center": isFacilitator || (isUser && message.isPrivate),
        }
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={containerClass}
        >
            <div className={bubbleClass}>
                {message.role !== 'user' && (
                    <div className="text-xs font-bold mb-1 opacity-70 uppercase tracking-widest">
                        {roleName}
                    </div>
                )}
                <div className="prose prose-sm max-w-none dark:prose-invert leading-relaxed">
                    <Markdown>{message.content}</Markdown>
                </div>
            </div>
        </motion.div>
    );
};
