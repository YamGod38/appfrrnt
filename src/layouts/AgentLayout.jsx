import { useState, useEffect } from 'react';
import { Outlet, Navigate, NavLink } from 'react-router-dom';
import { Activity, LogOut, Phone, FileText } from 'lucide-react';
import { io } from 'socket.io-client';

const socket = io((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '', { auth: { token: localStorage.getItem('token') } });

export default function AgentLayout() {
    const role = localStorage.getItem('role');
    const [agentStatus, setAgentStatus] = useState('Online');
    const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);

    const handleStatusChange = (status) => {
        setAgentStatus(status);
        setIsStatusMenuOpen(false);
        socket.emit('AGENT_STATUS_UPDATE', { 
            id: localStorage.getItem('agentId') || 'agent-1', 
            name: localStorage.getItem('name') || 'Agent Alpha', 
            status: status 
        });
    };
    
    if (role !== 'AGENT') {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="min-h-screen bg-[#09090b] flex flex-col print:h-auto print:block print:bg-white">
            {/* Premium Topbar */}
            <header className="relative bg-[#09090b]/80 backdrop-blur-xl border-b border-white/[0.05] px-6 py-4 flex justify-between items-center z-40 shadow-[0_4px_30px_rgba(0,0,0,0.5)] print:hidden">
                {/* Neon light edge */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-50"></div>

                <NavLink to="/agent" end className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-white/10 flex items-center justify-center shadow-inner">
                        <Activity className="w-4 h-4 text-zinc-300" />
                    </div>
                    <h1 className="text-lg font-bold tracking-tight text-zinc-100">Apollo <span className="text-zinc-500 font-medium">| Agent Workspace</span></h1>
                </NavLink>

                <div className="flex items-center gap-6">
                    <NavLink 
                        to="/agent" 
                        end
                        className={({ isActive }) => `flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors ${isActive ? 'text-emerald-400' : 'text-zinc-400 hover:text-zinc-200'}`}
                    >
                        <Phone className="w-3.5 h-3.5" />
                        Workspace
                    </NavLink>
                    <NavLink 
                        to="/agent/services" 
                        className={({ isActive }) => `flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors ${isActive ? 'text-emerald-400' : 'text-zinc-400 hover:text-zinc-200'}`}
                    >
                        <FileText className="w-3.5 h-3.5" />
                        Services & Pricing
                    </NavLink>
                    <div className="w-px h-6 bg-white/10"></div>
                    <div className="relative">
                        <button 
                            onClick={() => setIsStatusMenuOpen(!isStatusMenuOpen)}
                            className="flex items-center gap-2.5 bg-zinc-950 px-4 py-2 rounded-full border border-white/[0.05] shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] hover:border-white/10 transition-colors"
                        >
                            <div className={`w-2 h-2 rounded-full ${agentStatus === 'Online' ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)] animate-pulse' : agentStatus === 'Break' ? 'bg-yellow-500 shadow-[0_0_12px_rgba(234,179,8,0.8)]' : 'bg-zinc-500 shadow-[0_0_12px_rgba(113,113,122,0.8)]'}`}></div>
                            <span className="text-zinc-300 text-xs font-bold uppercase tracking-widest">{agentStatus === 'Break' ? 'On Break' : agentStatus}</span>
                        </button>

                        {isStatusMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsStatusMenuOpen(false)}></div>
                                <div className="absolute top-full right-0 mt-2 w-40 bg-zinc-950/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_50px_-15px_rgba(0,0,0,1)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="p-1.5">
                                        {['Online', 'Break', 'Offline'].map((status) => (
                                            <button
                                                key={status}
                                                onClick={() => handleStatusChange(status)}
                                                className={`w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-widest transition-all rounded-xl flex items-center gap-3 ${agentStatus === status ? 'bg-white/10 text-white' : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'}`}
                                            >
                                                <div className={`w-1.5 h-1.5 rounded-full ${status === 'Online' ? 'bg-emerald-500' : status === 'Break' ? 'bg-yellow-500' : 'bg-zinc-500'}`}></div>
                                                {status === 'Break' ? 'On Break' : status}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                    <button onClick={() => {
                        localStorage.clear();
                        window.location.href = '/login';
                    }} className="flex items-center gap-2 text-zinc-500 hover:text-red-400 text-xs font-bold uppercase tracking-widest transition-colors group">
                        <LogOut className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                        Logout
                    </button>
                </div>
            </header>
            
            {/* Main Content Area */}
            <main className="flex-1 p-6 overflow-y-auto relative custom-scrollbar print:overflow-visible print:h-auto print:block print:p-0">
                {/* Ambient backdrop */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none print:hidden"></div>
                <Outlet />
            </main>
        </div>
    );
}
