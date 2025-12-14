import React from 'react';
import { useDebateStore } from '../store/debateStore';
import { downloadAsJSON, downloadAsMarkdown, downloadAsPDF } from '../utils/export';
import { X, Trash2, Eye, FileText, Code, FileDown } from 'lucide-react';

interface HistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose }) => {
    const { savedSessions, deleteSession, loadSession } = useDebateStore();

    if (!isOpen) return null;

    const handleLoad = (id: string) => {
        if (confirm("Loading this session will replace your current stage. Continue?")) {
            loadSession(id);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl relative animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                    <div>
                        <h2 className="text-2xl font-bold font-display text-panda-ink">Archives 📜</h2>
                        <p className="text-sm text-gray-500">Review and manage your past inquiries.</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {savedSessions.length === 0 ? (
                        <div className="text-center text-gray-400 py-10">
                            <p>No archives found.</p>
                            <p className="text-sm">Save a completed debate to see it here.</p>
                        </div>
                    ) : (
                        savedSessions.map((session) => (
                            <div key={session.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                                <div className="flex-1">
                                    <h3 className="font-bold text-panda-ink text-lg line-clamp-1">{session.topic}</h3>
                                    <div className="flex gap-4 text-xs text-gray-400 mt-1">
                                        <span>{new Date(session.date).toLocaleDateString()}</span>
                                        <span>{session.messages.length} messages</span>
                                        <span>{session.language}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleLoad(session.id)}
                                        className="btn-secondary p-2 text-sm flex items-center gap-2 hover:bg-panda-green/10 hover:text-panda-green hover:border-panda-green/20"
                                        title="Review / Open"
                                    >
                                        <Eye size={16} /> Review
                                    </button>

                                    <div className="h-6 w-px bg-gray-200 mx-1"></div>

                                    <button
                                        onClick={() => downloadAsMarkdown(session, `panda-parley-${session.date}`)}
                                        className="p-2 text-gray-400 hover:text-panda-ink transition-colors"
                                        title="Export Markdown"
                                    >
                                        <FileText size={18} />
                                    </button>
                                    <button
                                        onClick={() => downloadAsPDF(session, `panda-parley-${session.date}`)}
                                        className="p-2 text-gray-400 hover:text-panda-ink transition-colors"
                                        title="Export PDF"
                                    >
                                        <FileDown size={18} />
                                    </button>
                                    <button
                                        onClick={() => downloadAsJSON(session, `panda-parley-${session.date}`)}
                                        className="p-2 text-gray-400 hover:text-panda-ink transition-colors"
                                        title="Export JSON"
                                    >
                                        <Code size={18} />
                                    </button>

                                    <button
                                        onClick={() => {
                                            if (confirm('Delete this archive permanently?')) deleteSession(session.id);
                                        }}
                                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
