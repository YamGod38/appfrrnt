import { CalendarClock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export default function FollowUps() {
    const mockTasks = [
        { id: 1, type: 'callback', patient: 'Michael Chang', number: '+1 (555) 123-0099', time: 'Today, 2:30 PM', priority: 'high', status: 'pending', notes: 'Check if fever subsided after prescribed antibiotics.' },
        { id: 2, type: 'booking', patient: 'Emma Watson', number: '+1 (555) 882-3341', time: 'Today, 4:00 PM', priority: 'medium', status: 'pending', notes: 'Needs to reschedule cardiology appointment.' },
        { id: 3, type: 'document', patient: 'David Smith', number: '+1 (555) 991-2233', time: 'Tomorrow, 10:00 AM', priority: 'low', status: 'pending', notes: 'Missing insurance documents for surgery prep.' },
        { id: 4, type: 'callback', patient: 'Sarah Connor', number: '+1 (555) 777-8888', time: 'Yesterday', priority: 'high', status: 'completed', notes: 'Confirmed post-op recovery is going well.' },
    ];

    return (
        <div className="bg-[#050505] rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,1)] border border-white/[0.05] w-full h-full flex flex-col relative overflow-hidden group">
            {/* Header */}
            <div className="p-8 pb-4 border-b border-white/[0.05] bg-gradient-to-b from-white/[0.02] to-transparent flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500 tracking-tight">
                        Follow Ups
                    </h2>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                        <CalendarClock className="w-4 h-4 text-pink-500" />
                        Scheduled Actions
                    </p>
                </div>
                <button className="bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 border border-pink-500/20 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all">
                    + New Task
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                <div className="grid gap-4">
                    {mockTasks.map(task => (
                        <div key={task.id} className={`p-5 rounded-2xl border transition-all ${task.status === 'completed' ? 'bg-zinc-900/30 border-white/[0.02] opacity-60' : 'bg-zinc-900/80 border-white/[0.05] hover:border-white/10 hover:bg-zinc-800/80'}`}>
                            <div className="flex justify-between items-start">
                                <div className="flex gap-4 items-start">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                                        task.status === 'completed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                                        task.priority === 'high' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                                        task.priority === 'medium' ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' :
                                        'bg-blue-500/10 border-blue-500/20 text-blue-500'
                                    }`}>
                                        {task.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                    </div>
                                    
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h4 className={`text-lg font-bold ${task.status === 'completed' ? 'text-zinc-400 line-through' : 'text-zinc-100'}`}>{task.patient}</h4>
                                            <span className="text-[10px] font-mono text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded border border-white/5">{task.number}</span>
                                        </div>
                                        <p className="text-sm text-zinc-400">{task.notes}</p>
                                    </div>
                                </div>
                                
                                <div className="text-right flex flex-col items-end gap-3">
                                    <span className="text-xs font-bold text-zinc-300 bg-zinc-950 px-3 py-1 rounded-full border border-white/5">{task.time}</span>
                                    {task.status !== 'completed' && (
                                        <button className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors">
                                            Resolve <ArrowRight className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
