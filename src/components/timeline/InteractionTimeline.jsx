import { useEffect, useState } from 'react';

export default function InteractionTimeline({ activeCall }) {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!activeCall || !activeCall.callerNumber) {
                setLogs([]);
                return;
            }
            
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}` + `/api/patients/${encodeURIComponent(activeCall.callerNumber)}/history`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await res.json();
                if (Array.isArray(data)) {
                    setLogs(data);
                } else {
                    console.error('API returned non-array:', data);
                    setLogs([]);
                }
            } catch (err) {
                console.error('Failed to fetch patient history', err);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [activeCall]);

    return (
        <div className="bg-zinc-900/80 p-6 rounded-2xl shadow-xl shadow-black/60 border border-white/5 backdrop-blur-lg flex-1 overflow-y-auto custom-scrollbar flex flex-col h-full">
            <h2 className="text-xl font-bold mb-6 text-zinc-100 sticky top-0 bg-zinc-900/80 pb-2 z-10 flex items-center justify-between">
                <span>Interaction Timeline</span>
                <span className="text-xs font-medium text-zinc-500 bg-zinc-800 px-2 py-1 rounded-md">Patient History</span>
            </h2>
            <div className="relative border-l border-zinc-700 ml-3 space-y-6 flex-1 pt-2">
                {logs.map(log => (
                    <div key={log.id} className="pl-6 relative">
                        <div className={`absolute -left-1.5 top-1.5 w-3 h-3 rounded-full ${log.type === 'call' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]'}`}></div>
                        <p className="text-[11px] text-zinc-500 font-mono mb-1.5 uppercase tracking-wider">{log.date}</p>
                        <div className="bg-zinc-950/50 p-4 rounded-xl border border-white/5 shadow-inner">
                            {log.type === 'call' ? (
                                <>
                                    <p className="text-sm text-zinc-300 leading-relaxed">{log.summary}</p>
                                    <p className="text-xs text-zinc-600 mt-3 font-medium border-t border-white/5 pt-2">Agent: {log.agent}</p>
                                </>
                            ) : (
                                <p className="text-sm text-blue-300 leading-relaxed">{log.note}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
