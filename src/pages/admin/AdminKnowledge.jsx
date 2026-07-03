import React from 'react';
import KnowledgeBase from '../../components/knowledge-base/KnowledgeBase';

export default function AdminKnowledge() {
    return (
        <div className="flex flex-col h-full max-w-7xl mx-auto w-full relative z-10 animate-in fade-in duration-500">
            <header className="flex justify-between items-end pb-6 border-b border-white/[0.05] mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-zinc-100 tracking-tight flex items-center gap-3">
                        Knowledge Base
                    </h2>
                    <p className="text-zinc-500 mt-2 text-sm">Access clinical guidelines, hospital protocols, and standard operating procedures.</p>
                </div>
            </header>
            <div className="flex-1 min-h-0 bg-[#09090b]/80 border border-white/[0.05] rounded-2xl shadow-[0_10px_30px_-15px_rgba(0,0,0,1)] backdrop-blur-xl p-6 overflow-hidden">
                <KnowledgeBase />
            </div>
        </div>
    );
}
