import React, { useState, useEffect } from 'react';
import { Target, Activity, Users, CalendarCheck, PhoneIncoming, TrendingUp, Search, Download, X, Stethoscope, Bell, CloudRain, CloudSnow, CloudLightning, Cloud, Sun, CloudFog, MapPin, AlertCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import socket, { connectSocket } from '../../utils/socket';
import BedManagement from '../../components/admin/BedManagement';
import LiveQueueBoard from '../../components/admin/LiveQueueBoard';

export default function Reception() {
    useEffect(() => {
        connectSocket();
    }, []);
    const [stats, setStats] = useState(null);
    const [allBookings, setAllBookings] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [adminMemo, setAdminMemo] = useState('');
    const [highlightMemo, setHighlightMemo] = useState(false);
    const [weather, setWeather] = useState({ temp: '--', condition: 'Loading...', icon: 'Cloud' });
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportTimeframe, setExportTimeframe] = useState('today');
    const [exportStatus, setExportStatus] = useState('all');
    const [exportType, setExportType] = useState('all');
    
    const handleExport = (e) => {
        e.preventDefault();
        
        let filtered = [...allBookings];
        
        if (exportStatus === 'verified') {
            filtered = filtered.filter(b => b.status === 'Verified');
        } else if (exportStatus === 'live') {
            filtered = filtered.filter(b => b.status !== 'Verified');
        }

        // Filter by Type
        if (exportType !== 'all') {
            filtered = filtered.filter(b => b.type === exportType);
        }

        // Sort by ID ascending (first come first serve)
        filtered.sort((a, b) => a.id - b.id);

        const csvRows = [];
        csvRows.push(['S.No.', 'ID', 'Type', 'Patient HUID', 'Patient Name', 'Phone Number', 'Details', 'Address (Blood)', 'Date', 'Time', 'Status'].join(','));
        
        filtered.forEach((b, index) => {
            let details = '';
            if (b.type === 'APPOINTMENT') details = `Dr. ${b.doctor}`;
            if (b.type === 'SCAN') details = b.scanType;
            if (b.type === 'HOTEL') details = `${b.hotel} - ${b.roomType}`;
            if (b.type === 'BLOOD_COLLECTION') details = b.bloodTests || 'Home Blood Collection';
            
            const row = [
                index + 1,
                b.id,
                b.type,
                b.huid || 'N/A',
                b.patientName ? `"${b.patientName}"` : 'N/A',
                b.number || 'N/A',
                `"${details}"`,
                b.address ? `"${b.address}"` : 'N/A',
                b.date || 'N/A',
                b.time || 'N/A',
                b.status || 'Live'
            ];
            csvRows.push(row.join(','));
        });

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Reception_Bookings_${exportType}_${exportTimeframe}_${new Date().toISOString().slice(0,10)}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        setShowExportModal(false);
        setExportTimeframe('today');
        setExportStatus('all');
        setExportType('all');
    };

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
        const fetchWeather = async () => {
            try {
                // Deoghar, Jharkhand coordinates
                const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=24.4833&longitude=86.7000&current=temperature_2m,weather_code');
                const data = await res.json();
                if (data && data.current) {
                    const code = data.current.weather_code;
                    let condition = 'Clear';
                    let iconName = 'Sun';
                    
                    if (code === 0) { condition = 'Clear Sky'; iconName = 'Sun'; }
                    else if (code >= 1 && code <= 3) { condition = 'Cloudy'; iconName = 'Cloud'; }
                    else if (code === 45 || code === 48) { condition = 'Foggy'; iconName = 'CloudFog'; }
                    else if (code >= 51 && code <= 67 || code >= 80 && code <= 82) { condition = 'Rain'; iconName = 'CloudRain'; }
                    else if (code >= 71 && code <= 77 || code === 85 || code === 86) { condition = 'Snow'; iconName = 'CloudSnow'; }
                    else if (code >= 95) { condition = 'Thunderstorm'; iconName = 'CloudLightning'; }

                    setWeather({
                        temp: Math.round(data.current.temperature_2m),
                        condition,
                        icon: iconName
                    });
                }
            } catch (err) {
                console.error("Failed to fetch weather for Deoghar", err);
            }
        };

        const fetchBookings = async () => {
            try {
                const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/bookings');
                const data = await res.json();
                if (data.success) {
                    const mappedBookings = data.bookings.map(b => ({
                        id: b.id,
                        type: b.type,
                        patientName: b.patient_name,
                        huid: b.huid,
                        number: b.phone_number,
                        doctor: b.type === 'APPOINTMENT' ? b.details.replace('Dr. ', '') : undefined,
                        scanType: b.type === 'SCAN' ? b.details : undefined,
                        hotel: b.type === 'HOTEL' ? b.details.split(' - ')[0] : undefined,
                        roomType: b.type === 'HOTEL' ? b.details.split(' - ')[1] : undefined,
                        bloodTests: b.type === 'BLOOD_COLLECTION' ? b.details : undefined,
                        date: new Date(b.booking_date).toLocaleDateString('en-CA'), // YYYY-MM-DD
                        time: b.booking_time,
                        status: b.status,
                        address: b.address
                    }));
                    setAllBookings(mappedBookings);
                }
            } catch (err) {
                console.error('Failed to fetch bookings', err);
            }
        };

        fetchStats();
        fetchWeather();
        fetchBookings();
        const weatherInterval = setInterval(fetchWeather, 30 * 60 * 1000); // Update every 30 mins

        // Listen for real-time events that affect conversion rates
        socket.on('BOOKING_SYNC', fetchStats);
        socket.on('ALL_BOOKINGS_SYNC', (bookings) => {
            fetchBookings(); // Refetch from DB to get reliable data instead of in-memory sync
        });
        socket.on('INCOMING_CALL_RINGING', fetchStats);
        socket.on('DOCTOR_STATUS_SYNC', setDoctors);
        socket.on('ADMIN_MEMO_SYNC', setAdminMemo);
        
        socket.emit('GET_INITIAL_STATE'); // to load initial bookings if any

        return () => {
            socket.off('BOOKING_SYNC', fetchStats);
            socket.off('ALL_BOOKINGS_SYNC');
            socket.off('INCOMING_CALL_RINGING', fetchStats);
            socket.off('DOCTOR_STATUS_SYNC', setDoctors);
            socket.off('ADMIN_MEMO_SYNC', setAdminMemo);
            clearInterval(weatherInterval);
        };
    }, []);

    // Trigger highlight effect when a new memo arrives
    useEffect(() => {
        if (adminMemo) {
            setHighlightMemo(true);
            const timer = setTimeout(() => setHighlightMemo(false), 5000); // 5 seconds of alert
            return () => clearTimeout(timer);
        }
    }, [adminMemo]);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 min-h-full max-w-7xl mx-auto w-full relative z-10 animate-in fade-in duration-500 pb-10">
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

            {/* Middle Section: Chart + Widgets */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Conversion Trend Chart (Takes 2 columns) */}
                <div className="lg:col-span-2 bg-[#09090b]/90 rounded-2xl border border-white/[0.05] shadow-[0_20px_50px_-15px_rgba(0,0,0,1)] backdrop-blur-xl flex flex-col overflow-hidden min-h-[400px]">
                    <div className="px-6 py-5 border-b border-white/[0.05] flex justify-between items-center bg-zinc-950/50">
                        <h3 className="text-lg font-bold text-zinc-100 tracking-tight flex items-center gap-2">
                            <Activity className="w-5 h-5 text-purple-500" />
                            Booking Conversion Trends
                        </h3>
                    </div>
                    <div className="flex-1 p-6 h-[300px] min-h-[300px]">
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

                {/* Right Sidebar Widgets */}
                <div className="flex flex-col gap-6">
                    
                    {/* Doctor Availability Board */}
                    <div className="bg-[#09090b]/90 rounded-2xl border border-white/[0.05] shadow-[0_20px_50px_-15px_rgba(0,0,0,1)] backdrop-blur-xl flex flex-col overflow-hidden flex-1">
                        <div className="px-5 py-4 border-b border-white/[0.05] flex justify-between items-center bg-zinc-950/50">
                            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                                <Stethoscope className="w-4 h-4 text-blue-500" />
                                Specialist Status
                            </h3>
                        </div>
                        <div className="p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1">
                            {doctors.map(doc => (
                                <div key={doc.id} className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-bold text-zinc-200">{doc.name}</p>
                                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{doc.spec}</p>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest ${
                                        doc.status === 'Available' ? 'bg-emerald-500/10 text-emerald-400' :
                                        doc.status === 'In Surgery' ? 'bg-amber-500/10 text-amber-400' :
                                        'bg-red-500/10 text-red-400'
                                    }`}>
                                        {doc.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Notice Board & Weather */}
                    <div className="flex gap-4 h-32">
                        {/* Admin Notice */}
                        <div 
                            key={adminMemo} 
                            className={`flex-1 rounded-2xl p-4 relative overflow-hidden group transition-all duration-500 animate-in fade-in slide-in-from-top-2 ${
                                highlightMemo 
                                ? 'bg-amber-500/20 border-2 border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.5)] scale-[1.02]' 
                                : 'bg-amber-500/5 border border-amber-500/20 scale-100'
                            }`}
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Bell className={`w-16 h-16 text-amber-500 ${highlightMemo ? 'animate-pulse scale-110' : 'rotate-12'}`} />
                            </div>
                            <h4 className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                                <AlertCircle className={`w-3 h-3 ${highlightMemo ? 'animate-ping' : ''}`} /> Admin Memo
                            </h4>
                            <p className="text-xs text-amber-200/80 font-medium leading-relaxed mt-2">
                                {adminMemo || "No active memos at this time."}
                            </p>
                        </div>

                        {/* Weather / Local Info */}
                        <div className="w-32 bg-blue-500/5 rounded-2xl border border-blue-500/20 p-4 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                                <MapPin className="w-8 h-8 text-blue-500" />
                            </div>
                            
                            {weather.icon === 'Sun' && <Sun className="w-8 h-8 text-amber-400 mb-1" />}
                            {weather.icon === 'Cloud' && <Cloud className="w-8 h-8 text-blue-300 mb-1" />}
                            {weather.icon === 'CloudRain' && <CloudRain className="w-8 h-8 text-blue-400 mb-1" />}
                            {weather.icon === 'CloudSnow' && <CloudSnow className="w-8 h-8 text-blue-200 mb-1" />}
                            {weather.icon === 'CloudFog' && <CloudFog className="w-8 h-8 text-zinc-400 mb-1" />}
                            {weather.icon === 'CloudLightning' && <CloudLightning className="w-8 h-8 text-purple-400 mb-1" />}

                            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">{weather.condition}</p>
                            <p className="text-xl text-blue-100 font-black mt-0.5">{weather.temp}°C</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Live Queue Board Section */}
            <div className="mb-6">
                <LiveQueueBoard allBookings={allBookings} doctors={doctors} />
            </div>

            {/* Premium Smart Bed Map Section */}
            <div className="h-[700px] mb-6">
                <BedManagement socket={socket} />
            </div>

            {/* Bottom Section: Unified Feed */}
            <div className="flex-1 bg-[#09090b]/80 p-6 rounded-2xl border border-white/[0.05] shadow-[0_10px_30px_-15px_rgba(0,0,0,1)] backdrop-blur-xl flex flex-col min-h-0 relative">
                <div className="px-6 py-5 border-b border-white/[0.05] flex justify-between items-center bg-zinc-950/50">
                    <h3 className="text-lg font-bold text-zinc-100 tracking-tight flex items-center gap-2">
                        <CalendarCheck className="w-5 h-5 text-emerald-500" />
                        Live Booking Feed
                    </h3>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input 
                                type="text" 
                                placeholder="Search by HUID, Name or Number..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-black/20 border border-white/[0.02] shadow-inner backdrop-blur-md rounded-2xl pl-10 pr-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-zinc-600 w-72"
                            />
                        </div>
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-2 py-1.5 rounded uppercase tracking-widest whitespace-nowrap">
                            {allBookings.filter(b => b.status === 'Verified').length} Verified Today
                        </span>
                        <button 
                            onClick={() => setShowExportModal(true)}
                            className="bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-2xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center gap-2 text-sm"
                        >
                            <Download className="w-4 h-4" /> Export
                        </button>
                    </div>
                </div>
                <div className="p-6">
                    {allBookings.filter(b => 
                        !searchQuery || 
                        (b.huid && b.huid.toLowerCase().includes(searchQuery.toLowerCase())) ||
                        (b.patientName && b.patientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                        (b.number && b.number.includes(searchQuery))
                    ).length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest mb-2">
                                {searchQuery ? 'No Matching Bookings' : 'No Bookings Yet'}
                            </p>
                            <p className="text-zinc-600 text-xs">
                                {searchQuery ? 'Try adjusting your search criteria.' : 'Incoming bookings will appear here in real-time.'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {allBookings
                                .filter(b => 
                                    !searchQuery || 
                                    (b.huid && b.huid.toLowerCase().includes(searchQuery.toLowerCase())) ||
                                    (b.patientName && b.patientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                                    (b.number && b.number.includes(searchQuery))
                                )
                                .map((booking) => (
                                <div key={booking.id} className={`flex items-center justify-between p-4 rounded-xl border ${booking.status === 'Verified' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-zinc-900/50 border-white/[0.05]'}`}>
                                    <div className="flex gap-4 items-center">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                            booking.type === 'APPOINTMENT' ? 'bg-blue-500/10 text-blue-400' :
                                            booking.type === 'SCAN' ? 'bg-cyan-500/10 text-cyan-400' :
                                            booking.type === 'BLOOD_COLLECTION' ? 'bg-rose-500/10 text-rose-400' :
                                            'bg-amber-500/10 text-amber-400'
                                        }`}>
                                            {booking.type === 'APPOINTMENT' ? <Users className="w-5 h-5" /> :
                                             booking.type === 'SCAN' ? <Activity className="w-5 h-5" /> :
                                             booking.type === 'BLOOD_COLLECTION' ? <Target className="w-5 h-5" /> :
                                             <CalendarCheck className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-bold text-zinc-100">{booking.patientName}</p>
                                                {booking.huid && <span className="text-[10px] font-mono text-zinc-500 bg-black/50 px-1.5 py-0.5 rounded border border-white/5">HUID: {booking.huid}</span>}
                                                {booking.number && <span className="text-[10px] font-mono text-zinc-500 bg-black/50 px-1.5 py-0.5 rounded border border-white/5 flex items-center gap-1"><PhoneIncoming className="w-3 h-3"/> {booking.number}</span>}
                                            </div>
                                            <p className="text-xs text-zinc-400 mt-1">
                                                {booking.type === 'APPOINTMENT' && `Dr. ${booking.doctor} • ${booking.date} at ${booking.time}`}
                                                {booking.type === 'SCAN' && `${booking.scanType} • ${booking.date} at ${booking.time}`}
                                                {booking.type === 'HOTEL' && `${booking.hotel} (${booking.roomType}) • ${booking.checkIn}`}
                                                {booking.type === 'BLOOD_COLLECTION' && `${booking.bloodTests || 'Home Blood Collection'} • ${booking.date} at ${booking.time}`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {booking.status === 'Verified' ? (
                                            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                                                <Target className="w-3 h-3" /> Verified
                                            </span>
                                        ) : (
                                            <button 
                                                onClick={() => socket.emit('VERIFY_BOOKING', booking.id)}
                                                className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-95"
                                            >
                                                Verify Check-in
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Export Modal */}
            {showExportModal && (
                <>
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 animate-in fade-in duration-300" onClick={() => setShowExportModal(false)}></div>
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-[#09090b] border border-white/10 p-8 rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,1)] w-[500px] animate-in zoom-in-95 duration-300">
                    <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                        <div>
                            <h3 className="text-xl font-black text-zinc-100 tracking-tight flex items-center gap-2">
                                <Download className="w-5 h-5 text-emerald-500" />
                                Export Bookings
                            </h3>
                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Generate CSV Report</p>
                        </div>
                        <button onClick={() => setShowExportModal(false)} className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <form className="space-y-6" onSubmit={handleExport}>
                        <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Timeframe</label>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { id: 'today', label: 'Today' },
                                    { id: 'weekly', label: 'This Week' },
                                    { id: 'monthly', label: 'This Month' },
                                    { id: 'yearly', label: 'This Year' },
                                    { id: 'custom', label: 'Custom Dates' }
                                ].map((t) => (
                                    <button 
                                        key={t.id}
                                        type="button"
                                        onClick={() => setExportTimeframe(t.id)}
                                        className={`px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-300 ${
                                            exportTimeframe === t.id 
                                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[inset_0_0_15px_rgba(16,185,129,0.1)]' 
                                            : 'bg-zinc-900/50 text-zinc-400 border border-white/5 hover:bg-zinc-800 hover:text-zinc-300'
                                        }`}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        {exportTimeframe === 'custom' && (
                            <div className="flex gap-4 animate-in slide-in-from-top-2 duration-300">
                                <div className="flex-1 relative">
                                    <label className="block text-[10px] font-bold text-emerald-500/70 uppercase tracking-widest mb-2">Start Date</label>
                                    <input 
                                        type="date" 
                                        name="startDate"
                                        required
                                        className="w-full bg-black/20 text-zinc-300 text-sm font-bold rounded-xl px-4 py-3 border border-emerald-500/20 focus:outline-none focus:border-emerald-500/50 shadow-inner [color-scheme:dark]"
                                    />
                                </div>
                                <div className="flex-1 relative">
                                    <label className="block text-[10px] font-bold text-emerald-500/70 uppercase tracking-widest mb-2">End Date</label>
                                    <input 
                                        type="date" 
                                        name="endDate"
                                        required
                                        className="w-full bg-black/20 text-zinc-300 text-sm font-bold rounded-xl px-4 py-3 border border-emerald-500/20 focus:outline-none focus:border-emerald-500/50 shadow-inner [color-scheme:dark]"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Booking Type</label>
                            <div className="flex flex-col gap-2">
                                {[
                                    { id: 'all', label: 'All Booking Types' },
                                    { id: 'APPOINTMENT', label: 'Doctor Appointments' },
                                    { id: 'SCAN', label: 'Diagnostic Scans' },
                                    { id: 'BLOOD_COLLECTION', label: 'Home Blood Collection' }
                                ].map((s) => (
                                    <button 
                                        key={s.id}
                                        type="button"
                                        onClick={() => setExportType(s.id)}
                                        className={`w-full text-left px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-3 ${
                                            exportType === s.id 
                                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30 shadow-[inset_0_0_15px_rgba(168,85,247,0.1)]' 
                                            : 'bg-zinc-900/50 text-zinc-400 border border-white/5 hover:bg-zinc-800 hover:text-zinc-300'
                                        }`}
                                    >
                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                            exportType === s.id ? 'border-purple-400' : 'border-zinc-600'
                                        }`}>
                                            {exportType === s.id && <div className="w-2 h-2 rounded-full bg-purple-400"></div>}
                                        </div>
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Booking Status</label>
                            <div className="flex flex-col gap-2">
                                {[
                                    { id: 'all', label: 'All (Grouped & Separated by Status)' },
                                    { id: 'live', label: 'Live/Pending Bookings Only' },
                                    { id: 'verified', label: 'Verified Check-ins Only' }
                                ].map((s) => (
                                    <button 
                                        key={s.id}
                                        type="button"
                                        onClick={() => setExportStatus(s.id)}
                                        className={`w-full text-left px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-3 ${
                                            exportStatus === s.id 
                                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30 shadow-[inset_0_0_15px_rgba(59,130,246,0.1)]' 
                                            : 'bg-zinc-900/50 text-zinc-400 border border-white/5 hover:bg-zinc-800 hover:text-zinc-300'
                                        }`}
                                    >
                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                            exportStatus === s.id ? 'border-blue-400' : 'border-zinc-600'
                                        }`}>
                                            {exportStatus === s.id && <div className="w-2 h-2 rounded-full bg-blue-400"></div>}
                                        </div>
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="pt-2">
                            <p className="text-xs text-zinc-500 leading-relaxed mb-4">The exported CSV will automatically sort and separate verified check-ins from live pending bookings for easy reporting.</p>
                            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-[0_6px_0_rgba(4,120,87,1)] active:shadow-none active:translate-y-1.5 transition-all duration-300 flex items-center justify-center gap-2">
                                <Download className="w-4 h-4" /> Generate CSV
                            </button>
                        </div>
                    </form>
                </div>
                </>
            )}
        </div>
    );
}
