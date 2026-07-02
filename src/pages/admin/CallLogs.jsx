import React, { useState } from 'react';
import { PhoneCall, Search, Filter, Download, PlayCircle, PauseCircle, PhoneIncoming, PhoneOutgoing, PhoneMissed, ChevronDown, ChevronUp, Bot, User } from 'lucide-react';
import AudioPlayer from '../../components/dashboard/AudioPlayer';

export default function CallLogs() {
    const [search, setSearch] = useState('');
    const [selectedAgent, setSelectedAgent] = useState('All');
    const [selectedDate, setSelectedDate] = useState('');
    const [expandedLog, setExpandedLog] = useState(null);
    const [aiSummary, setAiSummary] = useState({});
    const [playingId, setPlayingId] = useState(null);
    
    // Mock Data for Call Logs
    const logs = [
        { id: 'CALL-9021', type: 'inbound', agent: 'Priya Desai', customer: '+91 98765 43210', duration: '04:12', status: 'Completed', date: 'Oct 24, 10:42 AM', recording: true },
        { id: 'CALL-9020', type: 'outbound', agent: 'Arjun Reddy', customer: '+91 87654 32109', duration: '12:05', status: 'Completed', date: 'Oct 24, 10:15 AM', recording: true },
        { id: 'CALL-9019', type: 'missed', agent: 'Unassigned', customer: '+91 76543 21098', duration: '00:00', status: 'Missed', date: 'Oct 24, 09:30 AM', recording: false },
        { id: 'CALL-9018', type: 'inbound', agent: 'Sneha Kapoor', customer: '+91 99887 76655', duration: '01:45', status: 'Completed', date: 'Oct 24, 09:12 AM', recording: true },
        { id: 'CALL-9017', type: 'inbound', agent: 'Ravi Kumar', customer: '+91 88776 65544', duration: '08:22', status: 'Completed', date: 'Oct 24, 08:55 AM', recording: true },
        { id: 'CALL-9016', type: 'outbound', agent: 'Priya Desai', customer: '+91 77665 54433', duration: '03:10', status: 'Completed', date: 'Oct 23, 04:30 PM', recording: true },
        { id: 'CALL-9015', type: 'missed', agent: 'Unassigned', customer: '+91 66554 43322', duration: '00:00', status: 'Abandoned', date: 'Oct 23, 03:15 PM', recording: false },
    ];

    const agentsList = ['All', ...new Set(logs.map(log => log.agent))];

    const handleExpand = async (logId) => {
        if (expandedLog === logId) {
            setExpandedLog(null);
            return;
        }
        setExpandedLog(logId);
        
        if (!aiSummary[logId]) {
            try {
                const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + `/api/ai/summarize/${logId}`);
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

    const togglePlay = (logId) => {
        if (playingId === logId) {
            setPlayingId(null);
        } else {
            setPlayingId(logId);
        }
    };

    const handleExport = async () => {
        try {
            const queryParams = new URLSearchParams();
            if (selectedAgent && selectedAgent !== 'All') queryParams.append('agent', selectedAgent);
            if (selectedDate) queryParams.append('date', selectedDate);
            
            const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + `/api/calls/export?${queryParams.toString()}`);
            if (!res.ok) throw new Error('Export failed');
            
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `call_logs_${new Date().toISOString().slice(0,10)}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error(err);
            alert('Failed to export logs');
        }
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.id.toLowerCase().includes(search.toLowerCase()) || 
                              log.agent.toLowerCase().includes(search.toLowerCase()) || 
                              log.customer.includes(search);
        const matchesAgent = selectedAgent === 'All' || log.agent === selectedAgent;
        const matchesDate = selectedDate === '' || log.date.toLowerCase().includes(selectedDate.toLowerCase()) || new Date(log.date).toISOString().slice(0, 10) === selectedDate;
        return matchesSearch && matchesAgent && matchesDate;
    });

    const getCallIcon = (type) => {
        switch(type) {
            case 'inbound': return <PhoneIncoming className="w-4 h-4 text-emerald-400" />;
            case 'outbound': return <PhoneOutgoing className="w-4 h-4 text-blue-400" />;
            case 'missed': return <PhoneMissed className="w-4 h-4 text-red-400" />;
            default: return <PhoneCall className="w-4 h-4 text-zinc-400" />;
        }
    };

    const getStatusBadge = (status) => {
        switch(status) {
            case 'Completed': return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest">Completed</span>;
            case 'Missed': return <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest">Missed</span>;
            case 'Abandoned': return <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest">Abandoned</span>;
            default: return <span className="bg-zinc-800 text-zinc-400 border border-white/5 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest">{status}</span>;
        }
    }

    return (
        <div className="flex flex-col gap-6 h-full max-w-7xl mx-auto w-full relative z-10 animate-in fade-in duration-500">
            <header className="flex justify-between items-end pb-6 border-b border-white/[0.05] sticky top-0 bg-[#09090b]/90 backdrop-blur-md z-20">
                <div>
                    <h2 className="text-3xl font-bold text-zinc-100 tracking-tight flex items-center gap-3">
                        Historical Call Logs
                        <PhoneCall className="w-6 h-6 text-blue-500" />
                    </h2>
                    <p className="text-zinc-500 mt-2 text-sm">Deep dive into historical interaction logs, recordings, and AI transcripts.</p>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-3">
                    <div className="relative group/search">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <Search className="w-4 h-4 text-zinc-500 group-focus-within/search:text-blue-400 transition-colors" />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Search by ID, Agent, or Number..." 
                            className="bg-black/20 text-zinc-100 placeholder-zinc-600 rounded-2xl pl-10 pr-4 py-2.5 border border-white/[0.02] shadow-inner backdrop-blur-md focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm w-64"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <select 
                            className="appearance-none bg-black/20 hover:bg-black/40 shadow-inner backdrop-blur-md text-zinc-300 px-4 py-2.5 pl-10 pr-10 rounded-2xl border border-white/[0.02] transition-colors text-sm font-bold focus:outline-none"
                            value={selectedAgent}
                            onChange={(e) => setSelectedAgent(e.target.value)}
                        >
                            {agentsList.map(agent => (
                                <option key={agent} value={agent}>{agent}</option>
                            ))}
                        </select>
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                    </div>
                    <input 
                        type="date"
                        className="bg-black/20 shadow-inner backdrop-blur-md text-zinc-300 rounded-2xl px-4 py-2.5 border border-white/[0.02] focus:outline-none focus:border-blue-500/50 text-sm font-bold [color-scheme:dark]"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                    />
                    <button onClick={handleExport} className="flex items-center gap-2 bg-blue-600/90 hover:bg-blue-500 text-white px-4 py-2.5 rounded-2xl shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all active:scale-95 text-sm font-bold">
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto custom-scrollbar pb-10">
                <div className="bg-zinc-900/40 border border-white/[0.05] rounded-2xl overflow-hidden backdrop-blur-sm shadow-2xl">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/[0.05] text-zinc-500 text-[10px] font-bold uppercase tracking-widest bg-zinc-950/50">
                                <th className="px-6 py-4">Call ID</th>
                                <th className="px-6 py-4">Direction</th>
                                <th className="px-6 py-4">Agent</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Date & Time</th>
                                <th className="px-6 py-4">Duration</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Recording</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.map(log => (
                                <React.Fragment key={log.id}>
                                <tr className="border-b border-white/[0.02] hover:bg-zinc-800/20 transition-colors group">
                                    <td className="px-6 py-4 font-mono text-xs font-bold text-blue-400">{log.id}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-zinc-300 text-sm">
                                            {getCallIcon(log.type)}
                                            <span className="capitalize">{log.type}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-zinc-200">{log.agent}</td>
                                    <td className="px-6 py-4 font-mono text-sm text-zinc-400">{log.customer}</td>
                                    <td className="px-6 py-4 text-sm text-zinc-400">{log.date}</td>
                                    <td className="px-6 py-4 font-mono text-sm text-zinc-300">{log.duration}</td>
                                    <td className="px-6 py-4">{getStatusBadge(log.status)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            {log.recording ? (
                                                <button 
                                                    onClick={() => togglePlay(log.id)}
                                                    className={`transition-colors flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${playingId === log.id ? 'text-emerald-400' : 'text-zinc-500 hover:text-emerald-400'}`}
                                                >
                                                    {playingId === log.id ? (
                                                        <span className="flex items-center gap-1.5">
                                                            <div className="flex gap-0.5 items-end h-3">
                                                                <div className="w-0.5 bg-emerald-400 animate-[bounce_1s_infinite] h-full"></div>
                                                                <div className="w-0.5 bg-emerald-400 animate-[bounce_1.2s_infinite] h-1/2"></div>
                                                                <div className="w-0.5 bg-emerald-400 animate-[bounce_0.8s_infinite] h-3/4"></div>
                                                                <div className="w-0.5 bg-emerald-400 animate-[bounce_1.5s_infinite] h-2/3"></div>
                                                            </div>
                                                            Playing <PauseCircle className="w-4 h-4" />
                                                        </span>
                                                    ) : (
                                                        <>Play <PlayCircle className="w-4 h-4" /></>
                                                    )}
                                                </button>
                                            ) : (
                                                <span className="text-zinc-700 text-[10px] font-bold uppercase tracking-widest">N/A</span>
                                            )}
                                            <button 
                                                onClick={() => handleExpand(log.id)}
                                                className={`p-1.5 rounded-md transition-colors ${expandedLog === log.id ? 'bg-blue-500/20 text-blue-400' : 'text-zinc-500 hover:text-blue-400 hover:bg-zinc-800'}`}
                                                title="AI Summary"
                                            >
                                                {expandedLog === log.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                {expandedLog === log.id && (
                                    <tr className="bg-blue-500/[0.02] border-b border-white/[0.05]">
                                        <td colSpan="8" className="px-6 py-6">
                                            <div className="flex items-start gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                                                    <Bot className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h4 className="text-blue-400 font-bold text-sm mb-2 uppercase tracking-widest flex items-center gap-2">
                                                        AI Call Summary
                                                    </h4>
                                                    {aiSummary[log.id] ? (
                                                        <p className="text-zinc-300 text-sm leading-relaxed max-w-4xl">
                                                            {aiSummary[log.id]}
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
                                {playingId === log.id && (
                                    <tr className="bg-emerald-500/[0.02] border-b border-white/[0.05]">
                                        <td colSpan="8" className="p-4">
                                            <AudioPlayer log={log} onClose={() => setPlayingId(null)} />
                                        </td>
                                    </tr>
                                )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
