import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Stethoscope, Activity, CalendarClock, ChevronDown, CheckCircle2, XCircle, Search, UserPlus, Trash2, ShieldAlert, Plus } from 'lucide-react';

const socket = io((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '', { auth: { token: localStorage.getItem('token') } });

export default function ManageDoctors() {
    const [doctors, setDoctors] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newDoc, setNewDoc] = useState({ name: '', spec: '' });
    const [scanTypes, setScanTypes] = useState([]);
    const [newScanName, setNewScanName] = useState('');
    const [newScanPrep, setNewScanPrep] = useState('');
    const [newScanDuration, setNewScanDuration] = useState('');

    useEffect(() => {
        socket.emit('GET_INITIAL_STATE');
        socket.on('DOCTOR_STATUS_SYNC', (data) => {
            setDoctors(data);
        });

        socket.on('SCAN_TYPES_SYNC', (scans) => {
            setScanTypes(scans);
        });

        return () => {
            socket.off('DOCTOR_STATUS_SYNC');
            socket.off('SCAN_TYPES_SYNC');
        };
    }, []);

    const updateStatus = (id, newStatus) => {
        socket.emit('UPDATE_DOCTOR_STATUS', { id, status: newStatus });
    };

    const handleAddDoctor = (e) => {
        e.preventDefault();
        if (!newDoc.name || !newDoc.spec) return;
        socket.emit('ADD_DOCTOR', { name: `Dr. ${newDoc.name}`, spec: newDoc.spec });
        setNewDoc({ name: '', spec: '' });
        setShowAddModal(false);
    };

    const handleRemoveDoctor = (id) => {
        if (confirm("Are you sure you want to remove this doctor from the active roster?")) {
            socket.emit('REMOVE_DOCTOR', id);
        }
    };

    const handleAddScan = (e) => {
        e.preventDefault();
        if (!newScanName) return;
        socket.emit('ADD_SCAN_TYPE', { 
            name: newScanName, 
            prep: newScanPrep || 'No special preparation needed.', 
            duration: newScanDuration || '30 mins' 
        });
        setNewScanName('');
        setNewScanPrep('');
        setNewScanDuration('');
    };

    const handleDeleteScan = (id) => {
        socket.emit('REMOVE_SCAN_TYPE', id);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Available': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            case 'In Surgery': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
            case 'Off Duty': return 'text-red-400 bg-red-500/10 border-red-500/20';
            default: return 'text-zinc-400 bg-zinc-800 border-zinc-700';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Available': return <CheckCircle2 className="w-3.5 h-3.5" />;
            case 'In Surgery': return <Activity className="w-3.5 h-3.5 animate-pulse" />;
            case 'Off Duty': return <XCircle className="w-3.5 h-3.5" />;
            default: return null;
        }
    };

    const filteredDoctors = doctors.filter(doc => 
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        doc.spec.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = {
        total: doctors.length,
        available: doctors.filter(d => d.status === 'Available').length,
        surgery: doctors.filter(d => d.status === 'In Surgery').length,
        off: doctors.filter(d => d.status === 'Off Duty').length
    };

    return (
        <div className="flex flex-col gap-6 h-full max-w-7xl mx-auto w-full relative z-10 animate-in fade-in duration-500">
            <header className="flex justify-between items-end pb-6 border-b border-white/[0.05] sticky top-0 bg-[#09090b]/90 backdrop-blur-md z-20">
                <div>
                    <h2 className="text-3xl font-bold text-zinc-100 tracking-tight flex items-center gap-3">
                        Manage Doctors
                        <Stethoscope className="w-6 h-6 text-emerald-500" />
                    </h2>
                    <p className="text-zinc-500 mt-2 text-sm">Real-time availability toggling & roster management.</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input 
                            type="text" 
                            placeholder="Search specialist..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-black/20 border border-white/[0.02] shadow-inner backdrop-blur-md rounded-2xl pl-10 pr-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-zinc-600 w-64"
                        />
                    </div>
                    <button 
                        onClick={() => setShowAddModal(true)}
                        className="bg-emerald-500/90 hover:bg-emerald-400 text-zinc-950 font-bold py-2.5 px-5 rounded-2xl flex items-center gap-2 transition-colors shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                    >
                        <UserPlus className="w-4 h-4" /> Add Doctor
                    </button>
                </div>
            </header>

            {/* Analytics Row */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-zinc-900/40 border border-white/5 p-4 rounded-xl flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Total Roster</p>
                        <p className="text-2xl font-black text-zinc-100">{stats.total}</p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                        <Stethoscope className="w-5 h-5 text-zinc-400" />
                    </div>
                </div>
                <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-emerald-500/70 uppercase tracking-widest mb-1">Available</p>
                        <p className="text-2xl font-black text-emerald-400">{stats.available}</p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    </div>
                </div>
                <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-xl flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-amber-500/70 uppercase tracking-widest mb-1">In Surgery</p>
                        <p className="text-2xl font-black text-amber-400">{stats.surgery}</p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <Activity className="w-5 h-5 text-amber-400" />
                    </div>
                </div>
                <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-xl flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-red-500/70 uppercase tracking-widest mb-1">Off Duty</p>
                        <p className="text-2xl font-black text-red-400">{stats.off}</p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                        <XCircle className="w-5 h-5 text-red-400" />
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pb-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDoctors.map(doctor => (
                        <div key={doctor.id} className="bg-zinc-900/60 border border-white/5 p-6 rounded-2xl shadow-xl hover:border-emerald-500/30 transition-all duration-300 group relative overflow-hidden">
                            {/* Hover effect background */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-white/10 flex items-center justify-center text-lg font-bold text-zinc-300 shadow-inner group-hover:scale-110 transition-transform">
                                        {doctor.name.split(' ').pop().charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-zinc-100 group-hover:text-emerald-50 transition-colors">{doctor.name}</h3>
                                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{doctor.spec}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleRemoveDoctor(doctor.id)}
                                    className="p-2 bg-zinc-950/50 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                                    title="Remove Doctor"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-4 relative z-10">
                                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Current Status</span>
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${getStatusColor(doctor.status)}`}>
                                        {getStatusIcon(doctor.status)} {doctor.status}
                                    </span>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Update Availability</label>
                                    <div className="relative">
                                        <select 
                                            className="w-full bg-zinc-950 text-zinc-300 text-sm font-bold appearance-none rounded-xl px-4 py-3 border border-white/5 focus:outline-none focus:border-emerald-500/50 hover:border-white/10 transition-colors cursor-pointer"
                                            value={doctor.status}
                                            onChange={(e) => updateStatus(doctor.id, e.target.value)}
                                        >
                                            <option value="Available">🟢 Available (Accepting Bookings)</option>
                                            <option value="In Surgery">🟡 In Surgery (Hold Bookings)</option>
                                            <option value="Off Duty">🔴 Off Duty (Block Bookings)</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {doctors.length === 0 && (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl bg-zinc-900/30">
                            <div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center mb-4 border border-white/5">
                                <ShieldAlert className="w-8 h-8 text-zinc-500" />
                            </div>
                            <h3 className="text-xl font-bold text-zinc-300 mb-2">Server Disconnected</h3>
                            <p className="text-zinc-500 text-sm max-w-sm text-center mb-6">Cannot fetch the live doctor roster. Ensure the Node.js backend is running on port 5000 and socket connections are accepted.</p>
                        </div>
                    )}
                    
                    {doctors.length > 0 && filteredDoctors.length === 0 && (
                        <div className="col-span-full py-12 flex items-center justify-center text-zinc-500 text-sm font-bold uppercase tracking-widest">
                            <Search className="w-5 h-5 mr-2" /> No doctors found matching your search.
                        </div>
                    )}
                </div>

                {/* Diagnostic Scans Manager */}
                <div className="bg-[#09090b]/90 rounded-2xl border border-white/[0.05] shadow-[0_20px_50px_-15px_rgba(0,0,0,1)] backdrop-blur-xl flex flex-col overflow-hidden mt-8">
                    <div className="px-6 py-5 border-b border-white/[0.05] flex justify-between items-center bg-zinc-950/50">
                        <h3 className="text-lg font-bold text-zinc-100 tracking-tight flex items-center gap-2">
                            <Activity className="w-5 h-5 text-cyan-500" />
                            Diagnostic Scans Manager
                        </h3>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded border border-cyan-500/20">Live Sync</span>
                    </div>
                    <div className="p-6 flex flex-col gap-6">
                        {/* Add New Scan Form */}
                        <form onSubmit={handleAddScan} className="flex gap-4 bg-zinc-900/50 p-4 rounded-xl border border-white/5 items-end">
                            <div className="flex-1">
                                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1.5 block">Scan Name</label>
                                <input type="text" value={newScanName} onChange={e => setNewScanName(e.target.value)} placeholder="e.g. Full Body MRI" className="w-full bg-zinc-950 text-sm text-zinc-300 px-4 py-2.5 rounded-lg border border-white/10 focus:outline-none focus:border-cyan-500/50" required />
                            </div>
                            <div className="flex-1">
                                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1.5 block">Prep Instructions</label>
                                <input type="text" value={newScanPrep} onChange={e => setNewScanPrep(e.target.value)} placeholder="e.g. Fasting for 8 hours" className="w-full bg-zinc-950 text-sm text-zinc-300 px-4 py-2.5 rounded-lg border border-white/10 focus:outline-none focus:border-cyan-500/50" />
                            </div>
                            <div className="w-32">
                                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1.5 block">Duration</label>
                                <input type="text" value={newScanDuration} onChange={e => setNewScanDuration(e.target.value)} placeholder="e.g. 45 mins" className="w-full bg-zinc-950 text-sm text-zinc-300 px-4 py-2.5 rounded-lg border border-white/10 focus:outline-none focus:border-cyan-500/50" />
                            </div>
                            <button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2">
                                <Plus className="w-4 h-4" /> Add
                            </button>
                        </form>

                        {/* List of Active Scans */}
                        <div className="grid grid-cols-2 gap-4">
                            {scanTypes.map(scan => (
                                <div key={scan.id} className="bg-zinc-950 border border-white/5 rounded-xl p-4 flex justify-between items-start hover:border-cyan-500/30 transition-colors group">
                                    <div>
                                        <h4 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                                            {scan.name}
                                            <span className="text-[9px] text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded uppercase tracking-widest">{scan.duration}</span>
                                        </h4>
                                        <p className="text-xs text-zinc-500 mt-1.5 line-clamp-1">{scan.prep}</p>
                                    </div>
                                    <button onClick={() => handleDeleteScan(scan.id)} className="text-zinc-600 hover:text-red-400 p-1.5 bg-zinc-900 rounded-md transition-colors opacity-0 group-hover:opacity-100">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            {scanTypes.length === 0 && (
                                <div className="col-span-2 text-center py-8 text-zinc-500 text-sm">No diagnostic scans configured.</div>
                            )}
                        </div>
                    </div>
                </div>

            </div>

            {/* ADD DOCTOR MODAL */}
            {showAddModal && (
                <>
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 animate-in fade-in duration-300" onClick={() => setShowAddModal(false)}></div>
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-zinc-950 border border-white/10 p-8 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] z-50 animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-start mb-6 border-b border-white/5 pb-4">
                            <div>
                                <h3 className="text-2xl font-black text-white flex items-center gap-2">
                                    <UserPlus className="w-6 h-6 text-emerald-500" />
                                    Onboard Specialist
                                </h3>
                                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Add to Active Roster</p>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="text-zinc-500 hover:text-white transition-colors">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleAddDoctor} className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Full Name</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">Dr.</span>
                                    <input 
                                        type="text"
                                        required
                                        value={newDoc.name}
                                        onChange={(e) => setNewDoc({...newDoc, name: e.target.value})}
                                        className="w-full bg-zinc-900 border border-white/5 rounded-xl pl-10 pr-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50 transition-colors shadow-inner"
                                        placeholder="Sarah Chen"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Specialty</label>
                                <input 
                                    type="text"
                                    required
                                    value={newDoc.spec}
                                    onChange={(e) => setNewDoc({...newDoc, spec: e.target.value})}
                                    className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50 transition-colors shadow-inner"
                                    placeholder="e.g. Cardiology, Neurology..."
                                />
                            </div>

                            <button 
                                type="submit"
                                disabled={!newDoc.name || !newDoc.spec}
                                className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-emerald-500 text-zinc-950 font-black py-4 rounded-xl transition-all shadow-[0_5px_0_rgba(16,185,129,0.4)] disabled:shadow-none active:shadow-none active:translate-y-1 uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                            >
                                <UserPlus className="w-4 h-4" /> Finalize Onboarding
                            </button>
                        </form>
                    </div>
                </>
            )}
        </div>
    );
}
