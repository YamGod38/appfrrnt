import { useEffect, useState } from 'react';

export default function AgentStatusWidget({ socket }) {
    const [agents, setAgents] = useState([]);

    useEffect(() => {
        if (!socket) return;
        socket.on('AGENT_STATUS_UPDATE', (data) => {
            setAgents(data);
        });
        return () => socket.off('AGENT_STATUS_UPDATE');
    }, [socket]);

    const getStatusColor = (status) => {
        switch(status) {
            case 'Online': return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]';
            case 'Break': return 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]';
            case 'Offline': return 'bg-zinc-600';
            default: return 'bg-zinc-600';
        }
    };

    return (
        <div className="flex gap-3">
            {agents.map(agent => (
                <div key={agent.id} className="flex items-center gap-2 bg-zinc-950/50 px-3 py-1.5 rounded-full border border-white/5 shadow-inner">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(agent.status)}`}></div>
                    <span className="text-xs font-medium text-zinc-300">{agent.name}</span>
                </div>
            ))}
        </div>
    );
}
