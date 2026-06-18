import { PhoneIncoming, PhoneOutgoing, PhoneMissed, Clock, CheckCircle2, User } from 'lucide-react';

export default function CallHistory() {
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
                            <tr key={call.id} className="border-b border-white/[0.02] hover:bg-zinc-800/20 transition-colors group/row">
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
                                    {call.status === 'completed' ? (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                                            <CheckCircle2 className="w-3 h-3" /> Completed
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-widest">
                                            Missed
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
