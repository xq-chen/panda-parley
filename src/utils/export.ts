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

export async function downloadAsPDF(state: Pick<DebateState, 'topic' | 'messages' | 'personas' | 'language'>, filename: string) {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    let y = 20;

    // --- Font Selection & Loading ---
    let fontUrl = '';
    let fontName = 'Helvetica'; // Default fallback

    // Noto Sans CJK - using GitHub/jsDelivr CDN. 
    // OTF files can be problematic with jsPDF. Switching to TTF.
    if (state.language === 'Japanese') {
        // Source: GitHub notofonts/noto-cjk
        fontUrl = 'https://raw.githubusercontent.com/notofonts/noto-cjk/main/Sans/Variable/TTF/NotoSansCJKjp-VF.ttf';
        fontName = 'NotoSansJP';
    } else if (state.language === 'Chinese' || /[\u4e00-\u9fa5]/.test(state.topic)) {
        // Source: GitHub notofonts/noto-cjk
        fontUrl = 'https://raw.githubusercontent.com/notofonts/noto-cjk/main/Sans/Variable/TTF/NotoSansCJKsc-VF.ttf';
        fontName = 'NotoSansSC';
    }

    if (fontUrl) {
        try {
            const response = await fetch(fontUrl);
            if (!response.ok) throw new Error('Failed to fetch font');
            const fontBuffer = await response.arrayBuffer();

            // Convert ArrayBuffer to binary string
            const fontBytes = new Uint8Array(fontBuffer);
            let binaryString = '';
            for (let i = 0; i < fontBytes.length; i++) {
                binaryString += String.fromCharCode(fontBytes[i]);
            }

            // Add font to VFS
            // Note: jsPDF addFileToVFS expects a binary string. 
            // The previous 'btoa' fix was for when the content was NOT correctly binary string. 
            // But usually addFileToVFS takes raw binary string. 
            // However, with TTF loading in jsPDF, providing base64 is often safer if addFont takes it?
            // Actually, let's stick to the btoa fix which solved the earlier error, but now with TTF.
            const fontFileName = `${fontName}.ttf`;
            doc.addFileToVFS(fontFileName, btoa(binaryString));
            doc.addFont(fontFileName, fontName, 'normal');
            doc.setFont(fontName);
        } catch (e) {
            console.error('Font loading failed, falling back to default:', e);
            // Fallback to Helvetica is automatic if setFont fails or is skipped
        }
    }


    // --- Helper for adding text with auto-pagination ---
    const addText = (text: string, x: number, fontSize: number, fontStyle: string = 'normal', color: [number, number, number] = [0, 0, 0], align: 'left' | 'center' = 'left') => {
        doc.setFontSize(fontSize);
        // Calculate dynamic line height based on font size (approx 1.15x is standard)
        // jsPDF unit is mm, setFontSize is in pt. 1 pt = 0.352778 mm
        const fontSizeMm = fontSize * 0.352778;
        const dynamicLineHeight = fontSizeMm * 1.5;

        // Note: 'bold'/'italic' might not work with single-weight loaded custom font. 
        // We only loaded Regular, so we should stick to 'normal' for custom fonts or load bold variants too.
        // For now, we ignore fontStyle if using custom font to avoid "font not found" errors.
        if (fontUrl && fontStyle !== 'normal') {
            // If we really want bold, we'd need to fetch the Bold variant. 
            // For this implementation, we map everything to Normal to ensure characters render.
            doc.setFont(fontName, 'normal');
        } else {
            doc.setFont(fontName, fontStyle);
        }

        doc.setTextColor(color[0], color[1], color[2]);

        const splitText = doc.splitTextToSize(text, 170); // Max width 170mm (A4 is 210mm - 20mm margins)

        // Check for page break
        if (y + (splitText.length * dynamicLineHeight) > 280) {
            doc.addPage();
            y = 20;
        }

        doc.text(splitText, x, y, { align });
        y += (splitText.length * dynamicLineHeight) + (dynamicLineHeight * 0.5); // Add 0.5 line spacing after block
    };

    // --- Header ---
    // Use addText for header to ensure wrapping and correct line height
    // We pass 105 as X for centering (middle of A4 width 210mm)
    let headerStyle = 'bold';
    if (fontUrl) headerStyle = 'normal';

    addText(state.topic, 105, 18, headerStyle, [0, 0, 0], 'center');
    // y is already updated by addText

    // Metadata
    // Add visual separator spacing
    y += 5;
    addText(`Date: ${new Date().toLocaleDateString()}`, 20, 10, 'normal', [100, 100, 100]);
    addText(`Language: ${state.language}`, 20, 10, 'normal', [100, 100, 100]);
    y += 5;

    // Participants
    addText('Participants:', 20, 12, 'bold');
    addText(`- ${state.personas.facilitator.name} (Facilitator)`, 25, 10);
    addText(`- ${state.personas.expertA.name} (Expert A)`, 25, 10);
    addText(`- ${state.personas.expertB.name} (Expert B)`, 25, 10);
    y += 10;

    doc.setLineWidth(0.5);
    doc.setDrawColor(200, 200, 200);
    doc.line(20, y, 190, y);
    y += 10;

    // --- Messages ---
    state.messages.forEach((msg) => {
        if (msg.role === 'user' && msg.isPrivate) {
            // doc.setFillColor(255, 251, 230); // light yellow
            // doc.rect(15, y - 5, 180, 20 + Math.ceil(msg.content.length / 100) * 5, 'F'); // rough approx rect, maybe skip rect for simplicity or improve logic
            // Simpler: Just text
            addText('[Whisper]', 20, 10, 'bold', [212, 136, 6]);
            addText(msg.content, 20, 10, 'italic', [55, 65, 81]);
        } else {
            const roleName = msg.role === 'facilitator' ? state.personas.facilitator.name :
                msg.role === 'expertA' ? state.personas.expertA.name :
                    msg.role === 'expertB' ? state.personas.expertB.name : 'User';

            let color: [number, number, number] = [75, 85, 99]; // default gray
            if (msg.role === 'facilitator') color = [37, 99, 235]; // blue
            else if (msg.role === 'expertA') color = [22, 163, 74]; // green
            else if (msg.role === 'expertB') color = [220, 38, 38]; // red

            addText(roleName, 20, 11, 'bold', color);
            addText(msg.content, 20, 10, 'normal', [30, 30, 30]);
        }
        y += 2; // Spacing between messages (addText already adds block spacing, just a tiny bit more)
    });

    doc.save(`${filename}.pdf`);
}
