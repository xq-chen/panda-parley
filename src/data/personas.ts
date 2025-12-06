import type { Persona } from '../store/debateStore';

export interface PresetPersona extends Persona {
    id: string;
    icon: string;
}

export const PRESET_EXPERTS: PresetPersona[] = [
    {
        id: 'analyst',
        name: 'The Analyst',
        roleDescription: 'Logical, data-driven, and focused on deconstructing arguments to find core truths.',
        color: 'bg-blue-100',
        icon: '🦄'
    },
    {
        id: 'visionary',
        name: 'The Visionary',
        roleDescription: 'Intuitive, holistic, and focused on connecting disparate ideas to see the big picture.',
        color: 'bg-red-100',
        icon: '🐉'
    },
    {
        id: 'skeptic',
        name: 'The Skeptic',
        roleDescription: 'Questions every assumption, demands evidence, and plays devil\'s advocate.',
        color: 'bg-orange-100',
        icon: '🤔'
    },
    {
        id: 'historian',
        name: 'The Historian',
        roleDescription: 'Contextualizes the topic by drawing parallels to past events and human history.',
        color: 'bg-amber-100',
        icon: '📜'
    },
    {
        id: 'ethicist',
        name: 'The Ethicist',
        roleDescription: 'Evaluates the moral implications, fairness, and human impact of the topic.',
        color: 'bg-purple-100',
        icon: '⚖️'
    },
    {
        id: 'realist',
        name: 'The Realist',
        roleDescription: 'Pragmatic, grounded, and focused on practical implementation and constraints.',
        color: 'bg-slate-100',
        icon: '🛠️'
    },
    {
        id: 'futurist',
        name: 'The Futurist',
        roleDescription: 'Speculates on long-term consequences, technological trends, and future scenarios.',
        color: 'bg-cyan-100',
        icon: '🚀'
    },
    {
        id: 'philosopher',
        name: 'The Philosopher',
        roleDescription: 'Examines the fundamental nature of the topic, questioning definitions and existence.',
        color: 'bg-emerald-100',
        icon: '🦉'
    }
];
