import { useState, useEffect } from 'react';
import { CalendarDays, Search, Activity, Stethoscope, BedDouble, Droplets, Loader2, ArrowLeft, Download, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function BookingLogs() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportTimeframe, setExportTimeframe] = useState('today');
    const [exportStatus, setExportStatus] = useState('all');
    const [exportType, setExportType] = useState('all');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/bookings');
            const data = await res.json();
            if (data.success) {
                setBookings(data.bookings);
            }
        } catch (err) {
            console.error('Failed to fetch bookings', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredBookings = bookings.filter(b => {
        const query = searchQuery.toLowerCase();
        return (
            (b.patient_name && b.patient_name.toLowerCase().includes(query)) ||
            (b.phone_number && b.phone_number.toLowerCase().includes(query)) ||
            (b.huid && b.huid.toLowerCase().includes(query))
        );
    });

    const handleExport = (e) => {
        e.preventDefault();
        
        let toExport = [...bookings];
        
        // Filter by Status
        if (exportStatus === 'verified') {
            toExport = toExport.filter(b => b.status === 'Verified');
        } else if (exportStatus === 'live') {
            toExport = toExport.filter(b => b.status !== 'Verified');
        }

        // Filter by Type
        if (exportType !== 'all') {
            toExport = toExport.filter(b => b.type === exportType);
        }

        // Filter by Timeframe
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        
        if (exportTimeframe === 'today') {
            toExport = toExport.filter(b => b.booking_date && b.booking_date.startsWith(todayStr));
        } else if (exportTimeframe === 'weekly') {
            const weekAgo = new Date(now.setDate(now.getDate() - 7)).toISOString().split('T')[0];
            toExport = toExport.filter(b => b.booking_date && b.booking_date >= weekAgo);
        } else if (exportTimeframe === 'monthly') {
            const monthAgo = new Date(now.setMonth(now.getMonth() - 1)).toISOString().split('T')[0];
            toExport = toExport.filter(b => b.booking_date && b.booking_date >= monthAgo);
        } else if (exportTimeframe === 'yearly') {
            const yearAgo = new Date(now.setFullYear(now.getFullYear() - 1)).toISOString().split('T')[0];
            toExport = toExport.filter(b => b.booking_date && b.booking_date >= yearAgo);
        } else if (exportTimeframe === 'custom' && customStartDate && customEndDate) {
            toExport = toExport.filter(b => b.booking_date && b.booking_date >= customStartDate && b.booking_date <= customEndDate);
        }

        // Sort chronologically (first come first serve by ID)
        toExport.sort((a, b) => a.id - b.id);

        const csvRows = [];
        csvRows.push(['S.No.', 'ID', 'Type', 'Patient HUID', 'Patient Name', 'Phone Number', 'Details', 'Address', 'Date', 'Time', 'Agent', 'Status'].join(','));
        
        toExport.forEach((b, index) => {
            const row = [
                index + 1,
                b.id,
                b.type,
                b.huid || 'N/A',
                b.patient_name ? `"${b.patient_name}"` : 'N/A',
                b.phone_number || 'N/A',
                `"${b.details || ''}"`,
                b.address ? `"${b.address}"` : 'N/A',
                b.booking_date ? new Date(b.booking_date).toLocaleDateString() : 'N/A',
                b.booking_time || 'N/A',
                b.agent_name || 'System',
                b.status || 'Pending'
            ];
            csvRows.push(row.join(','));
        });

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `BookingLogs_${exportType}_${exportTimeframe}_${new Date().toISOString().slice(0,10)}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        setShowExportModal(false);
    };

    const getIconForType = (type) => {
        switch(type) {
            case 'APPOINTMENT': return <Stethoscope className="w-4 h-4 text-emerald-400" />;
            case 'SCAN': return <Activity className="w-4 h-4 text-cyan-400" />;
            case 'HOTEL': return <BedDouble className="w-4 h-4 text-indigo-400" />;
            case 'BLOOD_COLLECTION': return <Droplets className="w-4 h-4 text-rose-400" />;
            default: return <CalendarDays className="w-4 h-4 text-zinc-400" />;
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-zinc-100 p-8 font-sans selection:bg-emerald-500/30">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between bg-zinc-900/50 border border-white/5 p-6 rounded-3xl">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate('/admin')}
                            className="w-12 h-12 rounded-2xl bg-zinc-950 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/20 transition-all"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500 tracking-tight">Booking Logs</h1>
                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Master historical log of all bookings</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative w-96 group">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                <Search className="w-4 h-4 text-zinc-500 group-focus-within:text-emerald-400 transition-colors" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by Phone, HUID, or Name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-zinc-950 text-white rounded-2xl pl-12 pr-4 py-4 border border-white/10 focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all text-sm font-bold placeholder:text-zinc-600"
                            />
                        </div>
                        <button 
                            onClick={() => setShowExportModal(true)}
                            className="bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold px-6 py-4 rounded-2xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center gap-2 text-sm whitespace-nowrap"
                        >
                            <Download className="w-5 h-5" /> Export Bookings
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-zinc-900/50 border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-zinc-950 text-zinc-400 text-xs uppercase tracking-widest font-black border-b border-white/5">
                                <tr>
                                    <th className="p-6">Patient</th>
                                    <th className="p-6">Type & Details</th>
                                    <th className="p-6">Schedule</th>
                                    <th className="p-6">Agent</th>
                                    <th className="p-6">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 font-bold">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="p-12 text-center text-zinc-500">
                                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                                            Loading logs...
                                        </td>
                                    </tr>
                                ) : filteredBookings.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="p-12 text-center text-zinc-500">
                                            No bookings found matching your search.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredBookings.map((b) => (
                                        <tr key={b.id} className="hover:bg-zinc-800/30 transition-colors">
                                            <td className="p-6">
                                                <div className="text-zinc-100">{b.patient_name}</div>
                                                <div className="text-xs text-zinc-500 mt-1 font-mono">{b.phone_number}</div>
                                                {b.huid && <div className="text-[10px] text-blue-400 mt-1 uppercase tracking-widest">HUID: {b.huid}</div>}
                                            </td>
                                            <td className="p-6">
                                                <div className="flex items-center gap-2 text-zinc-100 uppercase text-xs tracking-widest mb-1">
                                                    {getIconForType(b.type)}
                                                    {b.type.replace('_', ' ')}
                                                </div>
                                                <div className="text-xs text-zinc-400 max-w-xs truncate">{b.details}</div>
                                                {b.address && <div className="text-[10px] text-zinc-500 mt-1 truncate max-w-xs">Addr: {b.address}</div>}
                                            </td>
                                            <td className="p-6">
                                                <div className="text-zinc-100">{new Date(b.booking_date).toLocaleDateString()}</div>
                                                <div className="text-xs text-amber-400 mt-1">{b.booking_time}</div>
                                            </td>
                                            <td className="p-6 text-zinc-300">{b.agent_name || 'System'}</td>
                                            <td className="p-6">
                                                <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest border ${
                                                    b.status === 'Verified' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                                    b.status === 'Cancelled' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                                                    'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                                }`}>
                                                    {b.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Export Modal */}
            {showExportModal && (
                <>
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 animate-in fade-in duration-300" onClick={() => setShowExportModal(false)}></div>
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-[#09090b] border border-white/10 p-8 rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,1)] w-[500px] animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar">
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
                                        required
                                        value={customStartDate}
                                        onChange={(e) => setCustomStartDate(e.target.value)}
                                        className="w-full bg-black/20 text-zinc-300 text-sm font-bold rounded-xl px-4 py-3 border border-emerald-500/20 focus:outline-none focus:border-emerald-500/50 shadow-inner [color-scheme:dark]"
                                    />
                                </div>
                                <div className="flex-1 relative">
                                    <label className="block text-[10px] font-bold text-emerald-500/70 uppercase tracking-widest mb-2">End Date</label>
                                    <input 
                                        type="date" 
                                        required
                                        value={customEndDate}
                                        onChange={(e) => setCustomEndDate(e.target.value)}
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
