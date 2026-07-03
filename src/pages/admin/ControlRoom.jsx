import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Phone, CalendarCheck, Clock, ShieldCheck, UserCheck, Activity, ChevronRight, Bell, Send } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import AgentStatusWidget from '../../components/agents/AgentStatusWidget';
import BedManagement from '../../components/admin/BedManagement';

const mockChartData = [
  { time: '08:00', inbound: 12, outbound: 5 },
  { time: '10:00', inbound: 45, outbound: 22 },
  { time: '12:00', inbound: 67, outbound: 34 },
  { time: '14:00', inbound: 32, outbound: 18 },
  { time: '16:00', inbound: 89, outbound: 55 },
  { time: '18:00', inbound: 23, outbound: 12 }
];

const socket = io((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '', { auth: { token: localStorage.getItem('token') } });

export default function ControlRoom() {
    const [attendanceLogs, setAttendanceLogs] = useState([]);
    const [recentBookings, setRecentBookings] = useState([]);
    const [memoInput, setMemoInput] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        socket.emit('GET_INITIAL_STATE');
        socket.on('ATTENDANCE_LOG_SYNC', (logs) => {
            setAttendanceLogs(logs);
        });

        socket.on('BOOKING_SYNC', (bookings) => {
            setRecentBookings(bookings);
        });

        return () => {
            socket.off('ATTENDANCE_LOG_SYNC');
            socket.off('BOOKING_SYNC');
        };
    }, []);

    const formatTime = (isoString) => {
        const d = new Date(isoString);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    return (
        <>
        <div className="flex flex-col gap-8 h-full max-w-7xl mx-auto w-full relative z-10 animate-in fade-in duration-500">
            <header className="flex justify-between items-end pb-6 border-b border-white/[0.05]">
                <div>
                    <h2 className="text-3xl font-bold text-zinc-100 tracking-tight flex items-center gap-3">
                        Control Room
                        <ShieldCheck className="w-6 h-6 text-emerald-500" />
                    </h2>
                    <p className="text-zinc-500 mt-2 text-sm">Live overview of enterprise operations and agent tracking.</p>
                </div>
                <div className="bg-[#09090b]/80 backdrop-blur-md px-6 py-4 rounded-xl border border-white/[0.05] shadow-[0_10px_30px_-15px_rgba(0,0,0,1)]">
                    <AgentStatusWidget socket={socket} />
                </div>
            </header>

            <div className="grid grid-cols-4 gap-6">
                <div className="h-[160px] bg-[#09090b]/80 p-6 rounded-2xl border border-white/[0.05] shadow-[0_10px_30px_-15px_rgba(0,0,0,1)] backdrop-blur-xl transform transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden flex flex-col justify-center">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Phone className="w-20 h-20 text-emerald-500 -rotate-12" />
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <Phone className="w-4 h-4 text-emerald-400" />
                        </div>
                        <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest transition-colors group-hover:text-zinc-300">Active Calls</p>
                    </div>
                    <h3 className="text-5xl font-bold text-zinc-100 font-mono tracking-tight group-hover:text-emerald-400 transition-colors">1</h3>
                </div>

                <div className="h-[160px] bg-[#09090b]/80 p-6 rounded-2xl border border-white/[0.05] shadow-[0_10px_30px_-15px_rgba(0,0,0,1)] backdrop-blur-xl transform transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden flex flex-col justify-center">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <CalendarCheck className="w-20 h-20 text-blue-500 rotate-12" />
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <CalendarCheck className="w-4 h-4 text-blue-400" />
                        </div>
                        <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest transition-colors group-hover:text-zinc-300">Live Slots Booked</p>
                    </div>
                    <h3 className="text-5xl font-bold text-zinc-100 font-mono tracking-tight group-hover:text-blue-400 transition-colors">{recentBookings.length}</h3>
                </div>

                <div className="h-[160px] bg-[#09090b]/80 p-6 rounded-2xl border border-white/[0.05] shadow-[0_10px_30px_-15px_rgba(0,0,0,1)] backdrop-blur-xl transform transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden flex flex-col justify-center">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Clock className="w-20 h-20 text-purple-500 -rotate-12" />
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                            <Clock className="w-4 h-4 text-purple-400" />
                        </div>
                        <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest transition-colors group-hover:text-zinc-300">Avg Handling Time</p>
                    </div>
                    <h3 className="text-5xl font-bold text-zinc-100 font-mono tracking-tight group-hover:text-purple-400 transition-colors">2m <span className="text-2xl text-zinc-500 group-hover:text-purple-500/50">14s</span></h3>
                </div>

                {/* Agent Attendance Log Widget */}
                <div className="h-[160px] bg-[#09090b]/80 p-6 rounded-2xl border border-white/[0.05] shadow-[0_10px_30px_-15px_rgba(0,0,0,1)] backdrop-blur-xl transform transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden flex flex-col">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <UserCheck className="w-20 h-20 text-emerald-500 rotate-12" />
                    </div>
                    <div className="flex items-center justify-between mb-4 relative z-10 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                <UserCheck className="w-4 h-4 text-emerald-400" />
                            </div>
                            <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Attendance Log</p>
                        </div>
                        {attendanceLogs.length > 0 && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>}
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
                        {attendanceLogs.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-xs text-zinc-500 font-medium">No agents clocked in yet</div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {attendanceLogs.map((log) => (
                                    <div key={log.id} className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-2.5 text-xs flex justify-between items-center group/log hover:border-emerald-500/30 transition-colors">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.5)]"></div>
                                            <span className="text-zinc-300 font-medium">{log.agentName}</span>
                                        </div>
                                        <span className="text-zinc-500 font-mono text-[10px] bg-zinc-950 px-1.5 py-0.5 rounded border border-white/5">{formatTime(log.timestamp)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Admin Quick Actions */}
            <div className="grid grid-cols-1 mt-2">
                <div className="bg-[#09090b]/80 p-4 rounded-2xl border border-amber-500/20 shadow-[0_10px_30px_-15px_rgba(245,158,11,0.2)] backdrop-blur-xl flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20">
                        <Bell className="w-5 h-5 text-amber-500" />
                    </div>
                    <div className="flex-1">
                        <input 
                            type="text"
                            placeholder="Type a memo to broadcast live to the Reception Portal..."
                            value={memoInput}
                            onChange={(e) => setMemoInput(e.target.value)}
                            className="w-full bg-zinc-950 border border-white/[0.05] shadow-inner rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-amber-500/50 transition-colors"
                        />
                    </div>
                    <button 
                        onClick={() => {
                            if (!memoInput) return;
                            socket.emit('UPDATE_ADMIN_MEMO', memoInput);
                            setMemoInput('');
                        }}
                        disabled={!memoInput}
                        className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:hover:bg-amber-500 text-zinc-950 font-bold px-6 py-2.5 rounded-xl transition-all shadow-[0_5px_0_rgba(217,119,6,1)] active:shadow-none active:translate-y-1 text-sm flex items-center gap-2 shrink-0 disabled:active:translate-y-0 disabled:active:shadow-[0_5px_0_rgba(217,119,6,1)]"
                    >
                        <Send className="w-4 h-4" /> Broadcast Memo
                    </button>
                </div>
            </div>

            {/* Premium Smart Bed Map Section */}
            <div className="h-[600px] mt-6">
                <BedManagement socket={socket} />
            </div>

            {/* Bottom Split View */}
            <div className="flex-1 grid grid-cols-2 gap-6 mt-6 min-h-0">
                
                {/* Live Bookings Feed */}
                <div className="bg-[#09090b]/90 rounded-2xl border border-white/[0.05] shadow-[0_20px_50px_-15px_rgba(0,0,0,1)] backdrop-blur-xl flex flex-col overflow-hidden">
                    <div className="px-6 py-5 border-b border-white/[0.05] flex justify-between items-center bg-zinc-950/50">
                        <div className="flex items-center gap-4">
                            <h3 className="text-lg font-bold text-zinc-100 tracking-tight flex items-center gap-2">
                                <Activity className="w-5 h-5 text-blue-500" />
                                Live Bookings Feed
                            </h3>
                            {recentBookings.length > 0 && <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20 animate-pulse">Live</span>}
                        </div>
                        <button onClick={() => navigate('/admin/bookings')} className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1">View Logs <ChevronRight className="w-3 h-3" /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-3">
                        {recentBookings.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-zinc-500">
                                <CalendarCheck className="w-12 h-12 mb-3 opacity-20" />
                                <p className="text-sm font-medium">Waiting for incoming bookings...</p>
                            </div>
                        ) : (
                            recentBookings.map((booking) => (
                                <div key={booking.id} className="bg-zinc-900/50 border border-white/5 rounded-xl p-4 flex items-center justify-between hover:border-blue-500/30 hover:bg-zinc-900 transition-all group animate-in slide-in-from-top-2">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                            <CalendarCheck className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <div>
                                            <h4 className="text-zinc-100 font-bold text-sm">{booking.patientName}</h4>
                                            <p className="text-zinc-500 text-xs mt-0.5">Booked with <span className="text-blue-400 font-medium">{booking.doctor}</span></p>
                                            <p className="text-[9px] text-zinc-600 uppercase tracking-widest font-bold mt-1">
                                                Processed by: <span className="text-zinc-400">{booking.agentName || 'Agent Alpha'}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-zinc-300 font-bold text-sm bg-zinc-950 px-3 py-1 rounded-md border border-white/5">
                                            {booking.date} at {booking.time}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Call Volume Trends Chart */}
                <div className="bg-[#09090b]/90 rounded-2xl border border-white/[0.05] shadow-[0_20px_50px_-15px_rgba(0,0,0,1)] backdrop-blur-xl flex flex-col overflow-hidden">
                    <div className="px-6 py-5 border-b border-white/[0.05] flex justify-between items-center bg-zinc-950/50">
                        <h3 className="text-lg font-bold text-zinc-100 tracking-tight flex items-center gap-2">
                            <Activity className="w-5 h-5 text-emerald-500" />
                            Call Volume Trends (Today)
                        </h3>
                    </div>
                    <div className="flex-1 p-6 h-full min-h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={mockChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorInbound" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorOutbound" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="time" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#09090b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="inbound" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorInbound)" />
                                <Area type="monotone" dataKey="outbound" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorOutbound)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Global Call Logs (Condensed) */}
                <div className="bg-[#09090b]/90 rounded-2xl border border-white/[0.05] shadow-[0_20px_50px_-15px_rgba(0,0,0,1)] backdrop-blur-xl flex flex-col overflow-hidden col-span-2">
                    <div className="px-6 py-5 border-b border-white/[0.05] flex justify-between items-center bg-zinc-950/50">
                        <h3 className="text-lg font-bold text-zinc-100 tracking-tight flex items-center gap-2">
                            <Phone className="w-5 h-5 text-zinc-500" />
                            Recent Call Logs
                        </h3>
                        <button onClick={() => navigate('/admin/logs')} className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1">View All <ChevronRight className="w-3 h-3" /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/[0.05] text-zinc-500 text-[10px] font-bold uppercase tracking-widest bg-zinc-950/30">
                                    <th className="py-3 px-6">Agent</th>
                                    <th className="py-3 px-6">Patient/Guest</th>
                                    <th className="py-3 px-6">Duration</th>
                                    <th className="py-3 px-6">Sentiment</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm text-zinc-300">
                                <tr className="border-b border-white/[0.02] hover:bg-zinc-800/30 transition-all duration-200 cursor-default group">
                                    <td className="py-4 px-6 font-medium group-hover:text-white transition-colors flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-[10px] font-bold">A</div>
                                        Agent Alpha
                                    </td>
                                    <td className="py-4 px-6 group-hover:text-zinc-200 transition-colors font-medium">Rahul Sharma</td>
                                    <td className="py-4 px-6 font-mono text-zinc-400 text-xs">03:45</td>
                                    <td className="py-4 px-6">
                                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20 font-semibold tracking-wide">
                                            Happy
                                        </span>
                                    </td>
                                </tr>
                                <tr className="border-b border-white/[0.02] hover:bg-zinc-800/30 transition-all duration-200 cursor-default group">
                                    <td className="py-4 px-6 font-medium group-hover:text-white transition-colors flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-[10px] font-bold">D</div>
                                        Agent Delta
                                    </td>
                                    <td className="py-4 px-6 group-hover:text-zinc-200 transition-colors font-medium">Jane Smith</td>
                                    <td className="py-4 px-6 font-mono text-zinc-400 text-xs">01:12</td>
                                    <td className="py-4 px-6">
                                        <span className="inline-flex items-center gap-1.5 text-xs text-red-400 bg-red-400/10 px-2 py-0.5 rounded border border-red-400/20 font-semibold tracking-wide">
                                            Angry
                                        </span>
                                    </td>
                                </tr>
                                <tr className="border-b border-white/[0.02] hover:bg-zinc-800/30 transition-all duration-200 cursor-default group">
                                    <td className="py-4 px-6 font-medium group-hover:text-white transition-colors flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-[10px] font-bold">A</div>
                                        Agent Alpha
                                    </td>
                                    <td className="py-4 px-6 group-hover:text-zinc-200 transition-colors font-medium">Michael Chen</td>
                                    <td className="py-4 px-6 font-mono text-zinc-400 text-xs">10:45</td>
                                    <td className="py-4 px-6">
                                        <span className="inline-flex items-center gap-1.5 text-xs text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded border border-blue-400/20 font-semibold tracking-wide">
                                            Neutral
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            </div>
        </>
    );
}
