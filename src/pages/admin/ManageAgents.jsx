import { useState } from 'react';
import { ShieldCheck, Activity, Users, Headset, Clock, Star, Plus, Shield, Headphones, Calendar, CheckCircle2, Settings, X } from 'lucide-react';
import LiveAnalytics from '../../components/admin/LiveAnalytics';

export default function ManageAgents() {
    const [activeTab, setActiveTab] = useState('roster'); // roster, analytics, provisioning
    const [editingAgent, setEditingAgent] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    
    // Mock Agent Data
    const mockAgents = [
        { id: 1, name: 'Sarah Jenkins', email: 'sarah.j@apollo.com', status: 'IN_CALL', duration: '04:12', skills: ['Clinic', 'Booking'], csat: 4.8 },
        { id: 2, name: 'David Chen', email: 'david.c@apollo.com', status: 'ONLINE', duration: '00:00', skills: ['Hotel', 'Support'], csat: 4.9 },
        { id: 3, name: 'Emily Ross', email: 'emily.r@apollo.com', status: 'WRAP_UP', duration: '01:30', skills: ['Clinic', 'Support'], csat: 4.5 },
        { id: 4, name: 'Marcus Thorne', email: 'marcus.t@apollo.com', status: 'OFFLINE', duration: '00:00', skills: ['Hotel', 'Booking'], csat: 4.2 }
    ];

    const getStatusBadge = (status) => {
        switch (status) {
            case 'IN_CALL': return <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>In Call</span>;
            case 'ONLINE': return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Online</span>;
            case 'WRAP_UP': return <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>Wrap Up</span>;
            case 'OFFLINE': return <span className="bg-zinc-800 text-zinc-400 border border-white/5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-zinc-500"></span>Offline</span>;
            default: return null;
        }
    };

    return (
        <div className="flex flex-col gap-6 h-full max-w-7xl mx-auto w-full relative z-10 animate-in fade-in duration-500">
            <header className="flex justify-between items-end pb-6 border-b border-white/[0.05] sticky top-0 bg-[#09090b]/90 backdrop-blur-md z-20">
                <div>
                    <h2 className="text-3xl font-bold text-zinc-100 tracking-tight flex items-center gap-3">
                        Manage Agents
                        <ShieldCheck className="w-6 h-6 text-emerald-500" />
                    </h2>
                    <p className="text-zinc-500 mt-2 text-sm">Real-time monitoring, analytics, and workforce provisioning.</p>
                </div>
                
                {/* Tabs */}
                <div className="flex items-center gap-2 bg-black/20 p-1.5 rounded-2xl border border-white/[0.02] shadow-inner backdrop-blur-md overflow-x-auto">
                    <button onClick={() => setActiveTab('roster')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'roster' ? 'bg-zinc-800/80 text-emerald-400 shadow-md border border-white/5' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]'}`}>
                        <Activity className="w-4 h-4" /> Live Roster
                    </button>
                    <button onClick={() => setActiveTab('bookings')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'bookings' ? 'bg-zinc-800/80 text-amber-400 shadow-md border border-white/5' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]'}`}>
                        <Calendar className="w-4 h-4" /> Live Bookings
                    </button>
                    <button onClick={() => setActiveTab('analytics')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'analytics' ? 'bg-zinc-800/80 text-blue-400 shadow-md border border-white/5' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]'}`}>
                        <Clock className="w-4 h-4" /> Analytics
                    </button>
                    <button onClick={() => setActiveTab('provisioning')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'provisioning' ? 'bg-zinc-800/80 text-purple-400 shadow-md border border-white/5' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]'}`}>
                        <Users className="w-4 h-4" /> Provisioning
                    </button>
                    <button onClick={() => setActiveTab('reset')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'reset' ? 'bg-zinc-800/80 text-red-400 shadow-md border border-white/5' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]'}`}>
                        <Shield className="w-4 h-4" /> Reset Requests
                        {/* Notification Dot */}
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse ml-1"></span>
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto custom-scrollbar pb-10">
                
                {/* TAB: LIVE ROSTER */}
                {activeTab === 'roster' && (
                    <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
                        <div className="bg-zinc-900/40 border border-white/[0.05] rounded-2xl overflow-hidden backdrop-blur-sm shadow-2xl">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/[0.05] text-zinc-500 text-[10px] font-bold uppercase tracking-widest bg-zinc-950/50">
                                        <th className="px-6 py-4">Agent Name</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Duration</th>
                                        <th className="px-6 py-4">Assigned Skills</th>
                                        <th className="px-6 py-4 text-center">CSAT</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mockAgents.map(agent => (
                                        <tr key={agent.id} className="border-b border-white/[0.02] hover:bg-zinc-800/20 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-xs font-bold text-zinc-300">
                                                        {agent.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-zinc-200">{agent.name}</p>
                                                        <p className="text-[10px] text-zinc-500">{agent.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">{getStatusBadge(agent.status)}</td>
                                            <td className="px-6 py-4">
                                                <span className={`text-sm font-mono ${agent.status === 'IN_CALL' ? 'text-zinc-300' : 'text-zinc-600'}`}>{agent.duration}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    {agent.skills.map(s => <span key={s} className="bg-zinc-800 text-zinc-400 text-[10px] px-2 py-0.5 rounded">{s}</span>)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                                                    <span className="text-sm font-bold text-zinc-200">{agent.csat}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={() => { setEditingAgent(agent); setShowEditModal(true); }}
                                                        className="px-3 py-1.5 rounded bg-zinc-500/10 text-zinc-300 border border-zinc-500/20 hover:bg-zinc-500/20 text-xs font-bold tracking-widest uppercase transition-colors flex items-center gap-2"
                                                    >
                                                        <Settings className="w-3 h-3" /> Edit
                                                    </button>
                                                    <button 
                                                        disabled={agent.status !== 'IN_CALL'}
                                                        className="px-3 py-1.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 disabled:opacity-30 disabled:pointer-events-none text-xs font-bold tracking-widest uppercase transition-colors flex items-center gap-2"
                                                    >
                                                        <Headphones className="w-3 h-3" /> Whisper
                                                    </button>
                                                    <button 
                                                        disabled={agent.status !== 'IN_CALL'}
                                                        className="px-3 py-1.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 disabled:opacity-30 disabled:pointer-events-none text-xs font-bold tracking-widest uppercase transition-colors flex items-center gap-2"
                                                    >
                                                        <Headset className="w-3 h-3" /> Barge
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* TAB: LIVE BOOKINGS */}
                {activeTab === 'bookings' && (
                    <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
                        <div className="bg-zinc-900/40 border border-white/[0.05] rounded-2xl overflow-hidden backdrop-blur-sm shadow-2xl">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/[0.05] text-zinc-500 text-[10px] font-bold uppercase tracking-widest bg-zinc-950/50">
                                        <th className="px-6 py-4">Ref ID</th>
                                        <th className="px-6 py-4">Patient Info</th>
                                        <th className="px-6 py-4">Specialist</th>
                                        <th className="px-6 py-4">Date & Time</th>
                                        <th className="px-6 py-4">Booking Agent</th>
                                        <th className="px-6 py-4 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { id: '849201', patient: 'Michael Chang', number: '+1 (555) 123-0099', doc: 'Dr. Sarah Chen', spec: 'Cardiology', date: 'Tomorrow', time: '10:00 AM', agent: 'Sarah Jenkins', status: 'Confirmed' },
                                        { id: '849202', patient: 'Emma Watson', number: '+1 (555) 882-3341', doc: 'Dr. Marcus Thorne', spec: 'Neurology', date: 'Jul 15, 2026', time: '02:30 PM', agent: 'David Chen', status: 'Confirmed' },
                                        { id: '849203', patient: 'David Smith', number: '+1 (555) 991-2233', doc: 'Dr. Emily Ross', spec: 'Orthopedics', date: 'Aug 02, 2026', time: '11:15 AM', agent: 'Sarah Jenkins', status: 'Pending Info' }
                                    ].map((booking) => (
                                        <tr key={booking.id} className="border-b border-white/[0.02] hover:bg-zinc-800/20 transition-colors group">
                                            <td className="px-6 py-4 font-mono text-xs font-bold text-zinc-400">#{booking.id}</td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-semibold text-zinc-200">{booking.patient}</p>
                                                <p className="text-[10px] text-zinc-500 font-mono">{booking.number}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-medium text-emerald-400">{booking.doc}</p>
                                                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">{booking.spec}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-semibold text-zinc-300">{booking.date}</p>
                                                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">{booking.time}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400">
                                                        {booking.agent.charAt(0)}
                                                    </div>
                                                    <span className="text-xs text-zinc-400 font-medium">{booking.agent}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {booking.status === 'Confirmed' ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                                                        <CheckCircle2 className="w-3 h-3" /> Confirmed
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-widest">
                                                        Pending Info
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* TAB: ANALYTICS */}
                {activeTab === 'analytics' && (
                    <div className="animate-in slide-in-from-bottom-4 fade-in duration-500 grid grid-cols-3 gap-6">
                        <div className="bg-zinc-900/60 p-6 rounded-2xl border border-white/5 shadow-lg">
                            <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">Average Handle Time</h3>
                            <p className="text-4xl font-mono text-zinc-100 font-bold">04:12</p>
                            <p className="text-emerald-400 text-xs mt-2 font-bold">-12s vs last week</p>
                        </div>
                        <div className="bg-zinc-900/60 p-6 rounded-2xl border border-white/5 shadow-lg">
                            <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">Total Calls Today</h3>
                            <p className="text-4xl font-mono text-zinc-100 font-bold">1,248</p>
                            <p className="text-emerald-400 text-xs mt-2 font-bold">+5% vs last week</p>
                        </div>
                        <div className="bg-zinc-900/60 p-6 rounded-2xl border border-white/5 shadow-lg">
                            <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">Average CSAT</h3>
                            <p className="text-4xl font-mono text-zinc-100 font-bold">4.8<span className="text-xl text-zinc-500">/5</span></p>
                            <p className="text-emerald-400 text-xs mt-2 font-bold">+0.2 vs last week</p>
                        </div>
                        <div className="col-span-3 bg-zinc-900/40 rounded-2xl border border-white/5 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-50"></div>
                            <LiveAnalytics />
                        </div>
                    </div>
                )}

                {/* TAB: PROVISIONING */}
                {activeTab === 'provisioning' && (
                    <div className="animate-in slide-in-from-bottom-4 fade-in duration-500 max-w-2xl mx-auto">
                        <div className="bg-zinc-900/80 p-8 rounded-2xl border border-white/[0.05] shadow-2xl backdrop-blur-xl">
                            <div className="mb-8 text-center">
                                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                                    <Shield className="w-8 h-8 text-emerald-400" />
                                </div>
                                <h3 className="text-xl font-bold text-zinc-100">Provision New Agent</h3>
                                <p className="text-zinc-500 text-sm mt-1">Deploy an agent and assign IVR routing capabilities.</p>
                            </div>

                            <form className="space-y-5" onSubmit={async (e) => { 
                                e.preventDefault(); 
                                const formData = new FormData(e.target);
                                const payload = Object.fromEntries(formData);
                                
                                try {
                                    const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/auth/register', {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            'Authorization': `Bearer ${localStorage.getItem('token')}` // Admin token
                                        },
                                        body: JSON.stringify({
                                            firstName: payload.firstName,
                                            lastName: payload.lastName,
                                            email: payload.email,
                                            role: 'USER', // Provisioning standard agents
                                            skills: ['Support'] // Mock skills parsing for now
                                        })
                                    });
                                    const data = await res.json();
                                    if (!res.ok) throw new Error(data.error || 'Failed to provision');
                                    alert(`Success: ${data.message}\nDefault Password: ${data.defaultPassword}`);
                                    e.target.reset();
                                } catch (err) {
                                    alert(`Error: ${err.message}`);
                                }
                            }}>
                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">First Name</label>
                                        <input name="firstName" required type="text" className="w-full bg-zinc-950 text-zinc-100 rounded-xl px-4 py-3.5 border border-white/5 focus:outline-none focus:border-emerald-500/50" placeholder="John" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Last Name</label>
                                        <input name="lastName" required type="text" className="w-full bg-zinc-950 text-zinc-100 rounded-xl px-4 py-3.5 border border-white/5 focus:outline-none focus:border-emerald-500/50" placeholder="Doe" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Corporate Email</label>
                                    <input name="email" required type="email" className="w-full bg-zinc-950 text-zinc-100 rounded-xl px-4 py-3.5 border border-white/5 focus:outline-none focus:border-emerald-500/50" placeholder="john.doe@apollo.com" />
                                </div>
                                
                                <div className="pt-4 pb-2">
                                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Assign IVR Routing Skills</label>
                                    <div className="flex flex-wrap gap-3">
                                        {['Clinic Booking', 'Clinic Support', 'Hotel Booking', 'Hotel Support', 'VIP Escalation'].map(skill => (
                                            <label key={skill} className="flex items-center gap-2 bg-zinc-950 border border-white/5 px-4 py-3 rounded-xl cursor-pointer hover:border-white/20 transition-colors">
                                                <input type="checkbox" name="skills" value={skill} className="accent-emerald-500 w-4 h-4" />
                                                <span className="text-sm text-zinc-300 font-medium">{skill}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-[0_10px_20px_-10px_rgba(16,185,129,0.8)] transition-all duration-300 active:scale-[0.98] mt-6 flex items-center justify-center gap-2">
                                    <Plus className="w-5 h-5" /> Deploy Agent
                                </button>
                            </form>
                        </div>
                    </div>
                )}
                {/* TAB: RESET REQUESTS */}
                {activeTab === 'reset' && (
                    <div className="animate-in slide-in-from-bottom-4 fade-in duration-500 max-w-4xl mx-auto">
                        <div className="bg-zinc-900/40 border border-white/[0.05] rounded-2xl overflow-hidden backdrop-blur-sm shadow-2xl p-6">
                            <h3 className="text-xl font-bold text-zinc-100 mb-4 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-red-500" /> Pending Password Resets
                            </h3>
                            <p className="text-sm text-zinc-400 mb-6">Review and approve password reset requests submitted via the login portal.</p>
                            
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/[0.05] text-zinc-500 text-[10px] font-bold uppercase tracking-widest bg-zinc-950/50">
                                        <th className="px-6 py-4">Request ID</th>
                                        <th className="px-6 py-4">Email</th>
                                        <th className="px-6 py-4">Timestamp</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-white/[0.02] hover:bg-zinc-800/20 transition-colors group">
                                        <td className="px-6 py-4 font-mono text-xs font-bold text-zinc-300">REQ-8492</td>
                                        <td className="px-6 py-4 text-sm font-medium text-zinc-200">sarah.j@apollo.com</td>
                                        <td className="px-6 py-4 text-sm text-zinc-400">Just now</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button className="px-3 py-1.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 text-xs font-bold tracking-widest uppercase transition-colors" onClick={() => alert('Password reset approved. Default password emailed to user.')}>Approve & Reset</button>
                                                <button className="px-3 py-1.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 text-xs font-bold tracking-widest uppercase transition-colors" onClick={() => alert('Request discarded.')}>Discard</button>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Agent Modal */}
            {showEditModal && editingAgent && (
                <>
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 animate-in fade-in duration-300" onClick={() => setShowEditModal(false)}></div>
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-[#09090b] border border-white/10 p-8 rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,1)] w-[500px] animate-in zoom-in-95 duration-300">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-xl font-black text-zinc-100 tracking-tight flex items-center gap-2">
                                <Settings className="w-5 h-5 text-emerald-500" />
                                Edit Agent Profile
                            </h3>
                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">{editingAgent.name}</p>
                        </div>
                        <button onClick={() => setShowEditModal(false)} className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <form className="space-y-4" onSubmit={(e) => {
                        e.preventDefault();
                        alert('Agent details updated successfully!');
                        setShowEditModal(false);
                    }}>
                        <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Agent Name</label>
                            <input type="text" defaultValue={editingAgent.name} className="w-full bg-zinc-950 text-zinc-100 rounded-xl px-4 py-3 border border-white/5 focus:outline-none focus:border-emerald-500/50" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Corporate Email</label>
                            <input type="email" defaultValue={editingAgent.email} className="w-full bg-zinc-950 text-zinc-100 rounded-xl px-4 py-3 border border-white/5 focus:outline-none focus:border-emerald-500/50" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Assigned Skills</label>
                            <input type="text" defaultValue={editingAgent.skills.join(', ')} className="w-full bg-zinc-950 text-zinc-100 rounded-xl px-4 py-3 border border-white/5 focus:outline-none focus:border-emerald-500/50" placeholder="e.g. Clinic, Support, Booking" />
                        </div>
                        <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-[0_6px_0_rgba(4,120,87,1)] active:shadow-none active:translate-y-1.5 transition-all duration-300 mt-4">
                            Save Changes
                        </button>
                    </form>
                </div>
                </>
            )}
        </div>
    );
}
