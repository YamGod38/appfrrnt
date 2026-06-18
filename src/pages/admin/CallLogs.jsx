import { useState } from 'react';
import { PhoneCall, Search, Filter, Download, PlayCircle, PhoneIncoming, PhoneOutgoing, PhoneMissed } from 'lucide-react';

export default function CallLogs() {
    const [search, setSearch] = useState('');
    
    // Mock Data for Call Logs
    const logs = [
        { id: 'CALL-9021', type: 'inbound', agent: 'Sarah Jenkins', customer: '+1 (555) 019-2834', duration: '04:12', status: 'Completed', date: 'Oct 24, 10:42 AM', recording: true },
        { id: 'CALL-9020', type: 'outbound', agent: 'David Chen', customer: '+1 (555) 837-9912', duration: '12:05', status: 'Completed', date: 'Oct 24, 10:15 AM', recording: true },
        { id: 'CALL-9019', type: 'missed', agent: 'Unassigned', customer: '+1 (555) 234-5678', duration: '00:00', status: 'Missed', date: 'Oct 24, 09:30 AM', recording: false },
        { id: 'CALL-9018', type: 'inbound', agent: 'Emily Ross', customer: '+1 (555) 987-6543', duration: '01:45', status: 'Completed', date: 'Oct 24, 09:12 AM', recording: true },
        { id: 'CALL-9017', type: 'inbound', agent: 'Marcus Thorne', customer: '+1 (555) 112-3344', duration: '08:22', status: 'Completed', date: 'Oct 24, 08:55 AM', recording: true },
        { id: 'CALL-9016', type: 'outbound', agent: 'Sarah Jenkins', customer: '+1 (555) 556-7788', duration: '03:10', status: 'Completed', date: 'Oct 23, 04:30 PM', recording: true },
        { id: 'CALL-9015', type: 'missed', agent: 'Unassigned', customer: '+1 (555) 998-8877', duration: '00:00', status: 'Abandoned', date: 'Oct 23, 03:15 PM', recording: false },
    ];

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
                            className="bg-zinc-900/50 text-zinc-100 placeholder-zinc-600 rounded-xl pl-10 pr-4 py-2.5 border border-white/5 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm w-64"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button className="flex items-center gap-2 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300 px-4 py-2.5 rounded-xl border border-white/5 transition-colors text-sm font-bold">
                        <Filter className="w-4 h-4" /> Filter
                    </button>
                    <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all active:scale-95 text-sm font-bold">
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
                            {logs.map(log => (
                                <tr key={log.id} className="border-b border-white/[0.02] hover:bg-zinc-800/20 transition-colors group">
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
                                        {log.recording ? (
                                            <button className="text-zinc-500 hover:text-emerald-400 transition-colors flex items-center justify-end w-full gap-2 text-xs font-bold uppercase tracking-widest">
                                                Play <PlayCircle className="w-5 h-5" />
                                            </button>
                                        ) : (
                                            <span className="text-zinc-700 text-xs font-bold uppercase tracking-widest">N/A</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
