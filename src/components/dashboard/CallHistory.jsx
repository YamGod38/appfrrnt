import React, { useState } from 'react';
import { PhoneIncoming, PhoneOutgoing, PhoneMissed, Clock, CheckCircle2, ChevronDown, ChevronUp, Bot, PhoneCall } from 'lucide-react';

export default function CallHistory() {
    const [expandedLog, setExpandedLog] = useState(null);
    const [aiSummary, setAiSummary] = useState({});
    const mockCalls = [
        { id: 1, type: 'incoming', number: '+1 (555) 019-2834', status: 'completed', duration: '05:23', time: '10:45 AM', date: 'Today', agent: 'Sarah Jenkins' },
        { id: 2, type: 'outgoing', number: '+1 (555) 832-1192', status: 'completed', duration: '12:01', time: '09:15 AM', date: 'Today', agent: 'Sarah Jenkins' },
        { id: 3, type: 'missed', number: '+1 (555) 743-9921', status: 'missed', duration: '00:00', time: '08:30 AM', date: 'Today', agent: 'Sarah Jenkins' },
        { id: 4, type: 'incoming', number: '+1 (555) 123-4567', status: 'completed', duration: '02:45', time: '04:20 PM', date: 'Yesterday', agent: 'Sarah Jenkins' },
        { id: 5, type: 'incoming', number: '+1 (555) 987-6543', status: 'completed', duration: '15:10', time: '11:10 AM', date: 'Yesterday', agent: 'Sarah Jenkins' },
    ];

    const getIcon = (type) => {
        switch (type) {
            case 'incoming': return <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400"><PhoneIncoming className="w-4 h-4" /></div>;
            case 'outgoing': return <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400"><PhoneOutgoing className="w-4 h-4" /></div>;
            case 'missed': return <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-400"><PhoneMissed className="w-4 h-4" /></div>;
            default: return null;
        }
    };

    const handleExpand = async (logId) => {
        if (expandedLog === logId) {
            setExpandedLog(null);
            return;
        }
        setExpandedLog(logId);
        
        if (!aiSummary[logId]) {
            try {
                // Mock log IDs need 'CALL-' prefix to mimic db format or pass as is
                const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + `/api/ai/summarize/CALL-${logId}`);
                const data = await res.json();
                if (data.success) {
                    setAiSummary(prev => ({ ...prev, [logId]: data.data.summary }));
                }
            } catch (err) {
                console.error('Failed to fetch summary');
                setAiSummary(prev => ({ ...prev, [logId]: 'Failed to generate AI Summary.' }));
            }
        }
    };

    return (
        <div className="bg-[#050505] rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,1)] border border-white/[0.05] w-full h-full flex flex-col relative overflow-hidden group">
            {/* Header */}
            <div className="p-8 pb-4 border-b border-white/[0.05] bg-gradient-to-b from-white/[0.02] to-transparent">
                <h2 className="text-3xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500 tracking-tight">
                    Call History
                </h2>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-500" />
                    Your Interaction Log
                </p>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/[0.05] text-zinc-500 text-[10px] font-bold uppercase tracking-widest bg-zinc-950/50">
                            <th className="px-6 py-4 rounded-tl-xl">Type</th>
                            <th className="px-6 py-4">Number</th>
                            <th className="px-6 py-4">Date & Time</th>
                            <th className="px-6 py-4">Duration</th>
                            <th className="px-6 py-4 rounded-tr-xl text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockCalls.map((call, idx) => (
                            <React.Fragment key={call.id}>
                            <tr className="border-b border-white/[0.02] hover:bg-zinc-800/20 transition-colors group/row">
                                <td className="px-6 py-4">{getIcon(call.type)}</td>
                                <td className="px-6 py-4">
                                    <span className="text-sm font-bold text-zinc-200 font-mono tracking-tight">{call.number}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-sm text-zinc-300 font-medium">{call.date}</span>
                                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{call.time}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm font-mono text-zinc-400">{call.duration}</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-3">
                                        {call.status === 'completed' ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                                                <CheckCircle2 className="w-3 h-3" /> Completed
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-widest">
                                                Missed
                                            </span>
                                        )}
                                        <button 
                                            onClick={() => alert(`Dialing callback for ${call.number}...`)}
                                            className="p-1.5 rounded-md text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors"
                                            title="Callback"
                                        >
                                            <PhoneCall className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleExpand(call.id)}
                                            className={`p-1.5 rounded-md transition-colors ${expandedLog === call.id ? 'bg-blue-500/20 text-blue-400' : 'text-zinc-500 hover:text-blue-400 hover:bg-zinc-800'}`}
                                            title="AI Summary"
                                        >
                                            {expandedLog === call.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            {expandedLog === call.id && (
                                <tr className="bg-blue-500/[0.02] border-b border-white/[0.05]">
                                    <td colSpan="5" className="px-6 py-6">
                                        <div className="flex items-start gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                                                <Bot className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="text-blue-400 font-bold text-sm mb-2 uppercase tracking-widest flex items-center gap-2">
                                                    AI Call Summary
                                                </h4>
                                                {aiSummary[call.id] ? (
                                                    <p className="text-zinc-300 text-sm leading-relaxed max-w-4xl">
                                                        {aiSummary[call.id]}
                                                    </p>
                                                ) : (
                                                    <div className="flex items-center gap-3 text-zinc-500 text-sm">
                                                        <div className="w-4 h-4 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin"></div>
                                                        Generating summary...
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
