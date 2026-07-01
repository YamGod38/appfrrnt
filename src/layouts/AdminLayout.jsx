import { useState, useEffect } from 'react';
import { Outlet, Navigate, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, PhoneCall, LogOut, ChevronRight, Activity, Stethoscope, Target, Power, Forward, Play, UserCheck, MessageSquare, ClipboardList } from 'lucide-react';
import { io } from 'socket.io-client';

const socket = io((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '', { auth: { token: localStorage.getItem('token') } });

export default function AdminLayout() {
    const role = localStorage.getItem('role');
    const name = localStorage.getItem('name') || 'Admin User';
    
    if (role !== 'ADMIN') {
        return <Navigate to="/login" replace />;
    }

    const [routingState, setRoutingState] = useState('live');

    useEffect(() => {
        socket.on('ROUTING_STATE_SYNC', (state) => {
            setRoutingState(state);
        });

        return () => {
            socket.off('ROUTING_STATE_SYNC');
        };
    }, []);

    const updateRoutingState = (newState) => {
        socket.emit('UPDATE_ROUTING_STATE', newState);
        setRoutingState(newState);
    };

    return (
        <div className="min-h-screen bg-[#09090b] flex selection:bg-emerald-500/30">
            {/* Sidebar */}
            <aside className="w-72 bg-[#09090b] border-r border-white/[0.05] flex flex-col relative z-20">
                <div className="p-6 flex items-center gap-3 border-b border-white/[0.02]">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                        <Activity className="w-4 h-4 text-emerald-400" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-zinc-100">Apollo <span className="text-zinc-500 font-medium">Control</span></h1>
                </div>

                <nav className="flex flex-col gap-1.5 p-4 flex-1">
                    <p className="text-[10px] uppercase tracking-widest font-semibold text-zinc-600 mb-2 px-2">Overview</p>
                    
                    <NavLink to="/admin" end className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${isActive ? 'bg-zinc-800/50 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'}`}>
                        {({ isActive }) => (
                            <>
                                <LayoutDashboard className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-zinc-500 group-hover:text-zinc-400'}`} />
                                Control Room
                                <ChevronRight className={`w-3 h-3 ml-auto transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                            </>
                        )}
                    </NavLink>
                    
                    <NavLink to="/admin/reception" className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${isActive ? 'bg-zinc-800/50 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'}`}>
                        {({ isActive }) => (
                            <>
                                <ClipboardList className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-zinc-500 group-hover:text-zinc-400'}`} />
                                Reception Metrics
                                <ChevronRight className={`w-3 h-3 ml-auto transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                            </>
                        )}
                    </NavLink>

                    <NavLink to="/admin/agents" className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${isActive ? 'bg-zinc-800/50 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'}`}>
                        {({ isActive }) => (
                            <>
                                <Users className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-zinc-500 group-hover:text-zinc-400'}`} />
                                Manage Agents
                                <ChevronRight className={`w-3 h-3 ml-auto transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                            </>
                        )}
                    </NavLink>

                    <NavLink to="/admin/doctors" className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${isActive ? 'bg-zinc-800/50 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'}`}>
                        {({ isActive }) => (
                            <>
                                <Stethoscope className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-zinc-500 group-hover:text-zinc-400'}`} />
                                Manage Doctors
                                <ChevronRight className={`w-3 h-3 ml-auto transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                            </>
                        )}
                    </NavLink>
                    
                    <NavLink to="/admin/logs" className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${isActive ? 'bg-zinc-800/50 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'}`}>
                        {({ isActive }) => (
                            <>
                                <PhoneCall className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-zinc-500 group-hover:text-zinc-400'}`} />
                                Call Logs
                                <ChevronRight className={`w-3 h-3 ml-auto transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                            </>
                        )}
                    </NavLink>
                    
                    <NavLink to="/crm/leads" className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${isActive ? 'bg-zinc-800/50 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'}`}>
                        {({ isActive }) => (
                            <>
                                <Target className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-zinc-500 group-hover:text-zinc-400'}`} />
                                Leads Pipeline (CRM)
                                <ChevronRight className={`w-3 h-3 ml-auto transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                            </>
                        )}
                    </NavLink>
                    
                    <NavLink to="/admin/attendance" className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${isActive ? 'bg-zinc-800/50 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'}`}>
                        {({ isActive }) => (
                            <>
                                <UserCheck className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-zinc-500 group-hover:text-zinc-400'}`} />
                                Attendance Logs
                                <ChevronRight className={`w-3 h-3 ml-auto transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                            </>
                        )}
                    </NavLink>

                    <NavLink to="/admin/whatsapp" className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${isActive ? 'bg-zinc-800/50 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'}`}>
                        {({ isActive }) => (
                            <>
                                <MessageSquare className={`w-4 h-4 ${isActive ? 'text-green-400' : 'text-zinc-500 group-hover:text-zinc-400'}`} />
                                WhatsApp Center
                                <ChevronRight className={`w-3 h-3 ml-auto transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                            </>
                        )}
                    </NavLink>
                </nav>

                {/* User Profile Widget */}
                <div className="p-4 border-t border-white/[0.05] bg-zinc-950/50">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-9 h-9 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-xs font-bold text-zinc-300 shadow-inner">
                            {name.charAt(0)}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-semibold text-zinc-200 truncate">{name}</p>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Manager</p>
                        </div>
                    </div>
                    <button onClick={() => {
                        localStorage.clear();
                        window.location.href = '/login';
                    }} className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest text-zinc-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 border border-transparent transition-all duration-200 group">
                        <LogOut className="w-3.5 h-3.5" />
                        Secure Logout
                    </button>
                </div>
            </aside>
            
            {/* Main Content */}
            <main className={`flex-1 flex flex-col overflow-y-auto relative transition-all duration-700 border-l ${
                routingState === 'live' ? 'border-emerald-500/20 bg-emerald-950/5' :
                routingState === 'offline' ? 'border-red-500/20 bg-red-950/5' :
                'border-blue-500/20 bg-blue-950/5'
            }`}>
                {/* Dynamic Ambient Lights */}
                <div className={`absolute top-0 right-0 w-[800px] h-[800px] rounded-full blur-[120px] pointer-events-none z-0 transition-colors duration-1000 ${
                    routingState === 'live' ? 'bg-emerald-500/10' :
                    routingState === 'offline' ? 'bg-red-500/10' :
                    'bg-blue-500/10'
                }`}></div>
                <div className={`absolute bottom-0 left-0 w-[800px] h-[800px] rounded-full blur-[120px] pointer-events-none z-0 transition-colors duration-1000 ${
                    routingState === 'live' ? 'bg-emerald-500/5' :
                    routingState === 'offline' ? 'bg-red-500/5' :
                    'bg-blue-500/5'
                }`}></div>
                
                {/* Full page flash animation on mode change */}
                <div key={routingState} className={`absolute inset-0 pointer-events-none z-50 animate-in fade-in fade-out duration-1000 ${
                    routingState === 'live' ? 'bg-emerald-500/10' :
                    routingState === 'offline' ? 'bg-red-500/10' :
                    'bg-blue-500/10'
                }`} style={{ animationFillMode: 'forwards', opacity: 0 }}></div>
                
                {/* Global Routing Toggle */}
                <div className="flex-none p-6 border-b border-white/[0.05] relative z-10 flex justify-end items-center">
                    <div className="bg-[#050505] border border-white/10 rounded-2xl p-1.5 flex items-center shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
                        <button 
                            onClick={() => updateRoutingState('offline')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${routingState === 'offline' ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            <Power className="w-3.5 h-3.5" /> Offline
                        </button>
                        <button 
                            onClick={() => updateRoutingState('live')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${routingState === 'live' ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            <Play className="w-3.5 h-3.5" /> Live
                        </button>
                        <button 
                            onClick={() => updateRoutingState('forward')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${routingState === 'forward' ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            <Forward className="w-3.5 h-3.5" /> Forward
                        </button>
                    </div>
                </div>

                <div className="flex-1 p-8 relative z-10">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
