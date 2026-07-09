import { useState, useEffect } from 'react';
import { Outlet, Navigate, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, PhoneCall, LogOut, ChevronRight, Activity, Stethoscope, Target, Power, Forward, Play, UserCheck, MessageSquare, ClipboardList, Database, CalendarDays, Phone, BookOpen } from 'lucide-react';
import { io } from 'socket.io-client';

const socket = io((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '', { auth: { token: localStorage.getItem('token') } });

export default function AdminLayout() {
    const role = localStorage.getItem('role');
    const name = localStorage.getItem('name') || 'Admin User';
    
    if (role !== 'ADMIN') {
        return <Navigate to="/login" replace />;
    }

    const [routingState, setRoutingState] = useState('live');
    const [emergencyAlert, setEmergencyAlert] = useState(null);
    const [activeAdminCall, setActiveAdminCall] = useState(null);
    const [adminCallDuration, setAdminCallDuration] = useState(0);

    useEffect(() => {
        let interval;
        if (activeAdminCall) {
            interval = setInterval(() => {
                setAdminCallDuration(prev => prev + 1);
            }, 1000);
        } else {
            setAdminCallDuration(0);
        }
        return () => clearInterval(interval);
    }, [activeAdminCall]);

    useEffect(() => {
        socket.on('ROUTING_STATE_SYNC', (state) => {
            setRoutingState(state);
        });

        socket.on('EMERGENCY_ESCALATION', (data) => {
            setEmergencyAlert(data);
            const audio = new Audio('/siren.mp3'); 
            audio.play().catch(e => console.log('Audio autoplay prevented'));
        });

        return () => {
            socket.off('ROUTING_STATE_SYNC');
            socket.off('EMERGENCY_ESCALATION');
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
                    
                    <NavLink to="/admin/bookings" className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${isActive ? 'bg-zinc-800/50 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'}`}>
                        {({ isActive }) => (
                            <>
                                <CalendarDays className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-zinc-500 group-hover:text-zinc-400'}`} />
                                Booking Logs
                                <ChevronRight className={`w-3 h-3 ml-auto transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                            </>
                        )}
                    </NavLink>
                    
                    <p className="text-[10px] uppercase tracking-widest font-semibold text-zinc-600 mt-4 mb-2 px-2">CRM Module</p>
                    <NavLink to="/admin/leads" className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${isActive ? 'bg-zinc-800/50 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'}`}>
                        {({ isActive }) => (
                            <>
                                <Target className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-zinc-500 group-hover:text-zinc-400'}`} />
                                Leads Pipeline
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

                    <NavLink to="/admin/services" className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${isActive ? 'bg-zinc-800/50 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'}`}>
                        {({ isActive }) => (
                            <>
                                <Activity className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-zinc-500 group-hover:text-zinc-400'}`} />
                                Services & Pricing
                                <ChevronRight className={`w-3 h-3 ml-auto transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                            </>
                        )}
                    </NavLink>

                    <NavLink to="/admin/patients" className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${isActive ? 'bg-zinc-800/50 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'}`}>
                        {({ isActive }) => (
                            <>
                                <Database className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-zinc-500 group-hover:text-zinc-400'}`} />
                                Userbase
                                <ChevronRight className={`w-3 h-3 ml-auto transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                            </>
                        )}
                    </NavLink>

                    <NavLink to="/admin/whatsapp" className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${isActive ? 'bg-zinc-800/50 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'}`}>
                        {({ isActive }) => (
                            <>
                                <MessageSquare className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-zinc-500 group-hover:text-zinc-400'}`} />
                                WhatsApp Integration
                                <ChevronRight className={`w-3 h-3 ml-auto transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                            </>
                        )}
                    </NavLink>
                    
                    <NavLink to="/admin/knowledge" className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${isActive ? 'bg-zinc-800/50 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'}`}>
                        {({ isActive }) => (
                            <>
                                <BookOpen className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-zinc-500 group-hover:text-zinc-400'}`} />
                                Knowledge Base
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

            {/* MASSIVE EMERGENCY MODAL */}
            {emergencyAlert && emergencyAlert.department !== 'Manager / Shift Supervisor' && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-red-950/90 backdrop-blur-3xl p-6">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.2)_0%,transparent_70%)] animate-pulse pointer-events-none"></div>
                    <div className="absolute inset-0 bg-red-500/10 mix-blend-overlay animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                    
                    <div className="relative z-10 bg-[#050505] border-4 border-red-500 rounded-[3rem] p-12 max-w-3xl w-full text-center shadow-[0_0_150px_rgba(239,68,68,0.6)] animate-in zoom-in-75 duration-300">
                        <div className="w-32 h-32 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
                            <Activity className="w-16 h-16 text-red-500" />
                        </div>
                        
                        <h1 className="text-6xl font-black text-white tracking-tighter uppercase mb-4 text-shadow-sm">Code Red</h1>
                        <h2 className="text-3xl font-bold text-red-400 mb-8 uppercase tracking-widest">Immediate Escalation Required</h2>
                        
                        <div className="bg-red-950/50 border border-red-500/30 rounded-3xl p-8 mb-10 text-left">
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <p className="text-red-500 font-bold uppercase tracking-widest text-xs mb-2">Reported By</p>
                                    <p className="text-xl font-bold text-white">{emergencyAlert.agentName}</p>
                                </div>
                                <div>
                                    <p className="text-red-500 font-bold uppercase tracking-widest text-xs mb-2">Target Department</p>
                                    <p className="text-xl font-bold text-white">{emergencyAlert.department}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-red-500 font-bold uppercase tracking-widest text-xs mb-2">Patient Symptoms / AI Parse</p>
                                    <p className="text-2xl font-semibold text-red-100 leading-tight">"{emergencyAlert.symptoms || 'No context provided'}"</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex gap-4 justify-center">
                            <button 
                                onClick={() => setEmergencyAlert(null)}
                                className="px-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl font-bold uppercase tracking-widest text-sm transition-all"
                            >
                                Acknowledge & Mute
                            </button>
                            <button 
                                onClick={() => {
                                    alert('Dispatching ER Team...');
                                    setEmergencyAlert(null);
                                }}
                                className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-bold uppercase tracking-widest text-sm transition-all shadow-[0_0_40px_rgba(220,38,38,0.5)]"
                            >
                                Dispatch ER Team
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* INCOMING CALL ESCALATION UI (PREMIUM) */}
            {emergencyAlert && emergencyAlert.department === 'Manager / Shift Supervisor' && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020817]/90 backdrop-blur-[40px] p-6 overflow-hidden">
                    {/* Dynamic Background Glows */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse pointer-events-none"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-400/20 rounded-full blur-[80px] mix-blend-screen animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] pointer-events-none"></div>
                    
                    <div className="relative z-10 bg-[#09090b]/80 border border-blue-500/30 rounded-[2.5rem] p-12 max-w-xl w-full text-center shadow-[0_0_100px_rgba(59,130,246,0.15),inset_0_0_80px_rgba(59,130,246,0.05)] backdrop-blur-3xl animate-in zoom-in-[0.98] duration-500">
                        
                        {/* Ringing Avatar/Icon */}
                        <div className="relative mx-auto w-32 h-32 mb-10">
                            {/* Ripple effects */}
                            <div className="absolute inset-0 border-2 border-blue-500/50 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                            <div className="absolute inset-0 border-2 border-cyan-400/30 rounded-full animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite] delay-300"></div>
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-full shadow-[0_0_40px_rgba(59,130,246,0.6)] flex items-center justify-center z-10">
                                <Phone className="w-14 h-14 text-white animate-bounce shadow-black drop-shadow-lg" />
                            </div>
                        </div>
                        
                        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200 tracking-tighter uppercase mb-3">Priority Escalation</h1>
                        
                        <div className="flex items-center justify-center gap-3 mb-10">
                            <span className="flex h-3 w-3 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                            </span>
                            <h2 className="text-sm font-black text-blue-400 uppercase tracking-[0.3em]">Agent {(emergencyAlert.agentName || 'Unknown').split(' ')[0]} is calling</h2>
                        </div>
                        
                        <div className="mb-12 text-left">
                            {/* Patient Profile Section */}
                            {emergencyAlert.patientProfile && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                                    <div className="col-span-2 sm:col-span-3 bg-[#050505]/60 border border-white/5 rounded-2xl p-4 flex flex-col justify-center relative overflow-hidden group-hover:border-white/10 transition-colors">
                                        {emergencyAlert.patientProfile.vip_status && (
                                            <div className="absolute top-0 right-0 w-10 h-10 bg-amber-500/10 rounded-bl-2xl flex items-center justify-center">
                                                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
                                            </div>
                                        )}
                                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Patient</p>
                                        <p className={`text-lg font-bold ${emergencyAlert.patientProfile.vip_status ? 'text-amber-400' : 'text-zinc-100'}`}>
                                            {emergencyAlert.patientProfile.full_name || 'Unknown Patient'}
                                        </p>
                                    </div>
                                    <div className="bg-[#050505]/60 border border-white/5 rounded-2xl p-4 flex flex-col justify-center">
                                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Age / Gender</p>
                                        <p className="text-sm font-semibold text-zinc-200">
                                            {emergencyAlert.patientProfile.age || '--'} yrs • {emergencyAlert.patientProfile.gender || '--'}
                                        </p>
                                    </div>
                                    <div className="bg-[#050505]/60 border border-white/5 rounded-2xl p-4 flex flex-col justify-center">
                                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Blood</p>
                                        <p className="text-sm font-bold text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]">
                                            {emergencyAlert.patientProfile.blood_type || 'N/A'}
                                        </p>
                                    </div>
                                    <div className="bg-[#050505]/60 border border-white/5 rounded-2xl p-4 flex flex-col justify-center">
                                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Risk</p>
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]"></span>
                                            <p className="text-sm font-bold text-zinc-200">Critical</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Transfer Context Card */}
                            <div className="bg-black/40 border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:border-blue-500/30 transition-colors shadow-inner">
                                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-cyan-400"></div>
                                <div className="pl-4">
                                    <p className="text-blue-400 font-bold uppercase tracking-widest text-[10px] mb-2 flex items-center gap-2">
                                        <Activity className="w-3 h-3 text-blue-500" />
                                        Transfer Context & Symptoms
                                    </p>
                                    <p className="text-lg font-medium text-zinc-200 leading-relaxed">
                                        {(emergencyAlert.symptoms || 'No context provided').replace(/"/g, '')}
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex gap-4 justify-center">
                            <button 
                                onClick={() => setEmergencyAlert(null)}
                                className="flex-1 py-5 bg-zinc-900 hover:bg-red-950 text-zinc-400 hover:text-red-400 border border-zinc-800 hover:border-red-500/50 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all transform hover:-translate-y-1 active:translate-y-0"
                            >
                                Decline
                            </button>
                            <button 
                                onClick={() => {
                                    setActiveAdminCall(emergencyAlert);
                                    setEmergencyAlert(null);
                                }}
                                className="flex-[2] py-5 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-emerald-950 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:shadow-[0_0_60px_rgba(16,185,129,0.6)] transform hover:-translate-y-1 active:translate-y-0"
                            >
                                Accept Transfer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ACTIVE ADMIN CALL WIDGET */}
            {activeAdminCall && (
                <div className="fixed bottom-8 right-8 z-[90] w-96 bg-[#0a0a0a] border border-blue-500/30 rounded-3xl shadow-[0_20px_50px_-15px_rgba(0,0,0,1),0_0_30px_rgba(59,130,246,0.15)] overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-400"></div>
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center animate-pulse">
                                    <Phone className="w-4 h-4 text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Active Call</h3>
                                    <p className="text-xs text-blue-400 font-mono">
                                        {Math.floor(adminCallDuration / 60).toString().padStart(2, '0')}:
                                        {(adminCallDuration % 60).toString().padStart(2, '0')}
                                    </p>
                                </div>
                            </div>
                            <div className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></span> Live
                            </div>
                        </div>

                        <div className="bg-white/5 rounded-2xl p-4 mb-6 border border-white/5">
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Transferred By</p>
                            <p className="text-sm font-semibold text-white mb-4">{activeAdminCall.agentName}</p>
                            
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Context</p>
                            <p className="text-xs text-zinc-300 leading-relaxed">{(activeAdminCall.symptoms || 'No context provided').replace(/"/g, '')}</p>
                        </div>

                        <button 
                            onClick={() => setActiveAdminCall(null)}
                            className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-xl font-black uppercase tracking-[0.2em] text-xs transition-all shadow-[0_0_30px_rgba(220,38,38,0.3)] hover:shadow-[0_0_50px_rgba(220,38,38,0.5)] flex items-center justify-center gap-2"
                        >
                            <Phone className="w-4 h-4 rotate-[135deg]" /> End Call
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
