import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, UserCheck, Clock, CheckCircle, LogOut } from 'lucide-react';

export default function AttendanceLogs() {
    const [logs, setLogs] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedAgent, setSelectedAgent] = useState('All');
    const [selectedDate, setSelectedDate] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, [selectedAgent, selectedDate, search]);

    const fetchLogs = async () => {
        try {
            const queryParams = new URLSearchParams();
            if (selectedAgent && selectedAgent !== 'All') queryParams.append('agent', selectedAgent);
            if (selectedDate) queryParams.append('date', selectedDate);
            if (search) queryParams.append('search', search);

            const token = localStorage.getItem('token');
            const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + `/api/attendance/logs?${queryParams.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (data.success) {
                setLogs(data.data);
            }
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch attendance logs', err);
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const queryParams = new URLSearchParams();
            if (selectedAgent && selectedAgent !== 'All') queryParams.append('agent', selectedAgent);
            if (selectedDate) queryParams.append('date', selectedDate);
            
            const token = localStorage.getItem('token');
            const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + `/api/attendance/export?${queryParams.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error('Export failed');
            
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `attendance_logs_${new Date().toISOString().slice(0,10)}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error(err);
            alert('Failed to export logs');
        }
    };

    const getActionBadge = (action) => {
        const act = action.toLowerCase();
        if (act.includes('in') || act === 'online') {
            return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest">{action}</span>;
        } else if (act.includes('out') || act === 'offline') {
            return <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest">{action}</span>;
        } else if (act.includes('break')) {
            return <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest">{action}</span>;
        }
        return <span className="bg-zinc-800 text-zinc-400 border border-white/5 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest">{action}</span>;
    };

    const agentsList = ['All', ...new Set(logs.map(log => log.agent_name))];

    return (
        <div className="flex flex-col gap-6 h-full max-w-7xl mx-auto w-full relative z-10 animate-in fade-in duration-500">
            <header className="flex justify-between items-end pb-6 border-b border-white/[0.05] sticky top-0 bg-[#09090b]/90 backdrop-blur-md z-20">
                <div>
                    <h2 className="text-3xl font-bold text-zinc-100 tracking-tight flex items-center gap-3">
                        Attendance Logs
                        <UserCheck className="w-6 h-6 text-emerald-500" />
                    </h2>
                    <p className="text-zinc-500 mt-2 text-sm">Highly detailed tracker for agent clock-ins, clock-outs, and breaks.</p>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-3">
                    <div className="relative group/search">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <Search className="w-4 h-4 text-zinc-500 group-focus-within/search:text-emerald-400 transition-colors" />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Search by Agent or Action..." 
                            className="bg-zinc-900/50 text-zinc-100 placeholder-zinc-600 rounded-xl pl-10 pr-4 py-2.5 border border-white/5 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm w-64"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <select 
                            className="appearance-none bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300 px-4 py-2.5 pl-4 pr-10 rounded-xl border border-white/5 transition-colors text-sm font-bold focus:outline-none"
                            value={selectedAgent}
                            onChange={(e) => setSelectedAgent(e.target.value)}
                        >
                            {agentsList.map(agent => (
                                <option key={agent} value={agent}>{agent}</option>
                            ))}
                        </select>
                        <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                    </div>
                    <input 
                        type="date"
                        className="bg-zinc-900/50 text-zinc-300 rounded-xl px-4 py-2.5 border border-white/5 focus:outline-none focus:border-emerald-500/50 text-sm font-bold [color-scheme:dark]"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                    />
                    <button onClick={handleExport} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all active:scale-95 text-sm font-bold">
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto custom-scrollbar pb-10">
                <div className="bg-zinc-900/40 border border-white/[0.05] rounded-2xl overflow-hidden backdrop-blur-sm shadow-2xl">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/[0.05] text-zinc-500 text-[10px] font-bold uppercase tracking-widest bg-zinc-950/50">
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Agent Name</th>
                                <th className="px-6 py-4">Action</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Time</th>
                                <th className="px-6 py-4 text-right">Verification</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-10 text-zinc-500 text-sm">Loading attendance data...</td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-10 text-zinc-500 text-sm">No attendance records found.</td>
                                </tr>
                            ) : (
                                logs.map(log => {
                                    const dateObj = new Date(log.timestamp);
                                    return (
                                        <tr key={log.id} className="border-b border-white/[0.02] hover:bg-zinc-800/20 transition-colors group">
                                            <td className="px-6 py-4 font-mono text-xs font-bold text-emerald-400">#{log.id}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-zinc-200">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400 border border-white/5">
                                                        {log.agent_name.charAt(0)}
                                                    </div>
                                                    {log.agent_name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">{getActionBadge(log.action)}</td>
                                            <td className="px-6 py-4 text-sm text-zinc-400">{dateObj.toLocaleDateString()}</td>
                                            <td className="px-6 py-4 font-mono text-sm text-zinc-300 flex items-center gap-2">
                                                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                                                {dateObj.toLocaleTimeString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="inline-flex items-center gap-1.5 text-emerald-500/70 text-[10px] font-bold uppercase tracking-widest">
                                                    <CheckCircle className="w-3.5 h-3.5" /> SYSTEM VERIFIED
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
