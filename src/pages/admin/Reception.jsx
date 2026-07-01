import React, { useState, useEffect } from 'react';
import { Target, Activity, Users, CalendarCheck, PhoneIncoming, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { io } from 'socket.io-client';

const socket = io((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '');

export default function Reception() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/calls/conversion-rates');
                const data = await res.json();
                if (data.success) {
                    setStats(data.data);
                }
            } catch (err) {
                console.error('Failed to fetch conversion rates', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();

        // Listen for real-time events that affect conversion rates
        socket.on('BOOKING_SYNC', fetchStats);
        socket.on('INCOMING_CALL_RINGING', fetchStats);

        return () => {
            socket.off('BOOKING_SYNC', fetchStats);
            socket.off('INCOMING_CALL_RINGING', fetchStats);
        };
    }, []);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 h-full max-w-7xl mx-auto w-full relative z-10 animate-in fade-in duration-500">
            <header className="flex justify-between items-end pb-6 border-b border-white/[0.05]">
                <div>
                    <h2 className="text-3xl font-bold text-zinc-100 tracking-tight flex items-center gap-3">
                        Reception Dashboard
                        <Target className="w-6 h-6 text-purple-500" />
                    </h2>
                    <p className="text-zinc-500 mt-2 text-sm">Track conversion rates from inbound calls to booked slots.</p>
                </div>
            </header>

            <div className="grid grid-cols-3 gap-6">
                <div className="bg-[#09090b]/80 p-6 rounded-2xl border border-white/[0.05] shadow-[0_10px_30px_-15px_rgba(0,0,0,1)] backdrop-blur-xl group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <PhoneIncoming className="w-20 h-20 text-blue-500 -rotate-12" />
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <PhoneIncoming className="w-4 h-4 text-blue-400" />
                        </div>
                        <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Total Inbound Calls</p>
                    </div>
                    <h3 className="text-5xl font-bold text-zinc-100 font-mono tracking-tight">{stats?.totalCallers || 0}</h3>
                </div>

                <div className="bg-[#09090b]/80 p-6 rounded-2xl border border-white/[0.05] shadow-[0_10px_30px_-15px_rgba(0,0,0,1)] backdrop-blur-xl group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <CalendarCheck className="w-20 h-20 text-emerald-500 rotate-12" />
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <CalendarCheck className="w-4 h-4 text-emerald-400" />
                        </div>
                        <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Total Bookings</p>
                    </div>
                    <h3 className="text-5xl font-bold text-zinc-100 font-mono tracking-tight">{stats?.totalBookings || 0}</h3>
                </div>

                <div className="bg-[#09090b]/80 p-6 rounded-2xl border border-white/[0.05] shadow-[0_10px_30px_-15px_rgba(0,0,0,1)] backdrop-blur-xl group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUp className="w-20 h-20 text-purple-500 -rotate-12" />
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-purple-400" />
                        </div>
                        <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Conversion Rate</p>
                    </div>
                    <h3 className="text-5xl font-bold text-zinc-100 font-mono tracking-tight">{stats?.conversionRate || 0}%</h3>
                </div>
            </div>

            {/* Conversion Trend Chart */}
            <div className="bg-[#09090b]/90 rounded-2xl border border-white/[0.05] shadow-[0_20px_50px_-15px_rgba(0,0,0,1)] backdrop-blur-xl flex flex-col overflow-hidden flex-1 min-h-[400px]">
                <div className="px-6 py-5 border-b border-white/[0.05] flex justify-between items-center bg-zinc-950/50">
                    <h3 className="text-lg font-bold text-zinc-100 tracking-tight flex items-center gap-2">
                        <Activity className="w-5 h-5 text-purple-500" />
                        Booking Conversion Trends
                    </h3>
                </div>
                <div className="flex-1 p-6 h-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats?.trend || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="date" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#09090b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                itemStyle={{ fontSize: '14px', fontWeight: 'bold' }}
                            />
                            <Area type="monotone" dataKey="calls" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCalls)" name="Inbound Calls" />
                            <Area type="monotone" dataKey="bookings" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorBookings)" name="Booked Slots" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
