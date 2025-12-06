import React from 'react';
import { useDebateStore } from '../store/debateStore';
import { PRESET_EXPERTS } from '../data/personas';
import { ChevronDown } from 'lucide-react';

interface ExpertSelectorProps {
    role: 'expertA' | 'expertB';
    label: string;
    value: string;
    onChange: (val: string) => void;
}

export const ExpertSelector: React.FC<ExpertSelectorProps> = ({ role, label, value, onChange }) => {
    const { personas } = useDebateStore();
    const current = personas[role];
    const isAuto = value === 'auto';

    return (
        <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">{label}</label>
            <div className="relative group">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={`w-full p-3 pl-12 rounded-xl border-2 outline-none appearance-none cursor-pointer shadow-sm transition-all font-medium ${isAuto ? 'bg-panda-green/10 border-panda-green text-panda-darkgreen' : 'bg-white border-transparent hover:bg-gray-50 text-panda-ink'}`}
                >
                    <option value="auto">✨ Auto (AI Choice)</option>
                    <hr />
                    {PRESET_EXPERTS.map(p => (
                        <option key={p.id} value={p.id}>
                            {p.name}
                        </option>
                    ))}
                </select>
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-2xl pointer-events-none">
                    {isAuto ? '✨' : (current.icon || '👤')}
                </div>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-panda-green transition-colors">
                    <ChevronDown size={20} />
                </div>
            </div>
            <p className="text-xs text-gray-500 h-8 line-clamp-2 leading-tight">
                {isAuto ? "The AI will select the perfect expert for your topic." : current.roleDescription}
            </p>
        </div>
    );
};
