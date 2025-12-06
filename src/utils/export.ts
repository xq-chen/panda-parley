import type { DebateState, Message } from '../store/debateStore';

export function downloadAsJSON(data: any, filename: string) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export function downloadAsMarkdown(state: Pick<DebateState, 'topic' | 'messages' | 'personas' | 'language'>, filename: string) {
    let md = `# ${state.topic}\n\n`;
    md += `**Date**: ${new Date().toLocaleDateString()}\n`;
    md += `**Language**: ${state.language}\n`;
    md += `**Participants**:\n`;
    md += `- **${state.personas.facilitator.name}** (Facilitator)\n`;
    md += `- **${state.personas.expertA.name}** (Expert A)\n`;
    md += `- **${state.personas.expertB.name}** (Expert B)\n\n`;
    md += `---\n\n`;

    state.messages.forEach((msg: Message) => {
        if (msg.role === 'user' && msg.isPrivate) {
            md += `> *[Whisper] ${msg.content}*\n\n`;
        } else {
            const roleName = msg.role === 'facilitator' ? state.personas.facilitator.name :
                msg.role === 'expertA' ? state.personas.expertA.name :
                    msg.role === 'expertB' ? state.personas.expertB.name : 'User';

            md += `### ${roleName}\n${msg.content}\n\n`;
        }
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
