import type { Message } from '../store/debateStore';

// Simple heuristic for token counting (4 chars ~= 1 token)
// In production, use tiktoken or similar
export function estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
}

export function formatContext(messages: Message[]): string {
    return messages
        .filter(m => !m.isPrivate) // Hide whispers from public context
        .map(m => `${m.role.toUpperCase()}: ${m.content}`)
        .join('\n\n');
}

export function optimizeContext(messages: Message[], maxTokens: number = 2500): Message[] {
    // Always keep the last N messages + system prompt (handled outside)
    // For now, simple sliding window
    let currentTokens = 0;
    const reversed = [...messages].reverse();
    const kept: Message[] = [];

    for (const msg of reversed) {
        const tokens = estimateTokens(msg.content);
        if (currentTokens + tokens > maxTokens) {
            break;
        }
        currentTokens += tokens;
        kept.unshift(msg);
    }

    return kept;
}
