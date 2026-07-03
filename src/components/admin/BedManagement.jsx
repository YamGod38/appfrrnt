import React, { useState, useEffect } from 'react';
import { BedDouble, CheckCircle2, AlertCircle, Clock, Search, X, Activity, User, Calendar, ShieldAlert } from 'lucide-react';

export default function BedManagement({ socket }) {
    const [beds, setBeds] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('All');
    
    // Modal State
    const [selectedBed, setSelectedBed] = useState(null);
    const [modalMode, setModalMode] = useState(''); // 'ASSIGN', 'UPDATE'
    
    // Form State
    const [patientName, setPatientName] = useState('');
    const [condition, setCondition] = useState('Stable');
    const [attendingDoctor, setAttendingDoctor] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (!socket) return;
        
        socket.emit('GET_INITIAL_STATE');
        socket.on('BED_STATUS_SYNC', (data) => {
            setBeds(data);
        });
        
        return () => {
            socket.off('BED_STATUS_SYNC');
        }
    }, [socket]);

    const openModal = (bed) => {
        setSelectedBed(bed);
        if (bed.status === 'Available') {
            setModalMode('ASSIGN');
            setPatientName('');
            setCondition('Stable');
            setAttendingDoctor('');
            setNotes('');
        } else {
            setModalMode('UPDATE');
        }
    };

    const closeModal = () => {
        setSelectedBed(null);
        setModalMode('');
    };

    const handleAssignPatient = (e) => {
        e.preventDefault();
        socket.emit('UPDATE_BED_STATUS', { 
            id: selectedBed.id, 
            status: 'Occupied', 
            patientName,
            condition,
            attendingDoctor,
            notes,
            admissionDate: new Date().toISOString()
        });
        closeModal();
    };

    const handleUpdateStatus = (newStatus) => {
        socket.emit('UPDATE_BED_STATUS', { 
            id: selectedBed.id, 
            status: newStatus 
        });
        closeModal();
    };

    const getStatusColors = (status) => {
        if (status === 'Available') return 'from-emerald-900/40 to-emerald-900/10 border-emerald-500/30 text-emerald-400 group-hover:border-emerald-500/60 shadow-[inset_0_0_30px_rgba(16,185,129,0.05)]';
        if (status === 'Occupied') return 'from-red-900/40 to-red-900/10 border-red-500/30 text-red-400 group-hover:border-red-500/60 shadow-[inset_0_0_30px_rgba(239,68,68,0.05)]';
        return 'from-amber-900/40 to-amber-900/10 border-amber-500/30 text-amber-400 group-hover:border-amber-500/60 shadow-[inset_0_0_30px_rgba(245,158,11,0.05)]';
    };

    const getConditionColor = (cond) => {
        if (cond === 'Critical') return 'bg-red-500/20 text-red-400 border border-red-500/30';
        if (cond === 'Stable') return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
        return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
    };

    const filteredBeds = beds.filter(b => {
        const matchesSearch = b.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              (b.patientName && b.patientName.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesFilter = filterType === 'All' || b.type === filterType;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="bg-[#050505]/90 border border-white/[0.05] rounded-3xl p-8 shadow-2xl backdrop-blur-2xl h-full flex flex-col min-h-0 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>

            {/* Header */}
            <div className="flex justify-between items-end mb-8 relative z-10">
                <div>
                    <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
                            <BedDouble className="w-6 h-6 text-blue-500" />
                        </div>
                        Premium Bed Matrix
                    </h3>
                    <p className="text-sm text-zinc-400 font-medium">Real-time occupancy and patient tracking</p>
                </div>
                
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input 
                            type="text" 
                            placeholder="Search beds or patients..." 
                            className="bg-zinc-900 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 w-64 transition-colors"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex bg-zinc-900 rounded-xl p-1 border border-white/5">
                        {['All', 'ICU', 'General', 'Operating Theater'].map(t => (
                            <button 
                                key={t}
                                onClick={() => setFilterType(t)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${filterType === t ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                            >
                                {t === 'Operating Theater' ? 'OT' : t}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-4 gap-4 mb-8 relative z-10">
                <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Available</p>
                        <p className="text-xl font-black text-white">{beds.filter(b => b.status === 'Available').length}</p>
                    </div>
                </div>
                <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Occupied</p>
                        <p className="text-xl font-black text-white">{beds.filter(b => b.status === 'Occupied').length}</p>
                    </div>
                </div>
                <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Cleaning</p>
                        <p className="text-xl font-black text-white">{beds.filter(b => b.status === 'Cleaning').length}</p>
                    </div>
                </div>
                <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <Activity className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Total Capacity</p>
                        <p className="text-xl font-black text-white">{beds.length}</p>
                    </div>
                </div>
            </div>

            {/* Beds Grid */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 relative z-10 space-y-8">
                {['ICU', 'General', 'Operating Theater'].map(type => {
                    const typeBeds = filteredBeds.filter(b => b.type === type);
                    if (typeBeds.length === 0) return null;

                    return (
                        <div key={type}>
                            <h4 className="text-sm font-black text-zinc-300 uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
                                {type} Wards
                                <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent"></div>
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                                {typeBeds.map(bed => (
                                    <div 
                                        key={bed.id}
                                        onClick={() => openModal(bed)}
                                        className={`group cursor-pointer relative overflow-hidden rounded-2xl bg-gradient-to-b border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${getStatusColors(bed.status)}`}
                                    >
                                        <div className="p-5 relative z-10">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-2">
                                                    <BedDouble className="w-5 h-5 opacity-70" />
                                                    <span className="text-lg font-black tracking-tight">{bed.id}</span>
                                                </div>
                                                <div className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${bed.status === 'Available' ? 'bg-emerald-500/20 text-emerald-300' : bed.status === 'Occupied' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'}`}>
                                                    {bed.status}
                                                </div>
                                            </div>

                                            {bed.status === 'Occupied' ? (
                                                <div className="space-y-3">
                                                    <div>
                                                        <p className="text-[10px] text-red-500/70 font-bold uppercase tracking-widest mb-0.5">Patient Name</p>
                                                        <p className="text-sm font-bold text-white truncate">{bed.patientName}</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${getConditionColor(bed.condition)}`}>
                                                            {bed.condition}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-red-500/70 font-bold uppercase tracking-widest mb-0.5">Attending Doctor</p>
                                                        <p className="text-xs font-semibold text-zinc-300 truncate">{bed.attendingDoctor}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="h-[104px] flex flex-col items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity">
                                                    {bed.status === 'Available' ? (
                                                        <>
                                                            <CheckCircle2 className="w-8 h-8 mb-2" />
                                                            <span className="text-xs font-bold uppercase tracking-widest">Ready for Admission</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Clock className="w-8 h-8 mb-2" />
                                                            <span className="text-xs font-bold uppercase tracking-widest">Maintenance Required</span>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Premium Modal */}
            {selectedBed && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={closeModal}></div>
                    <div className="relative bg-[#0a0a0a] border border-white/10 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className={`p-6 border-b border-white/5 ${selectedBed.status === 'Available' ? 'bg-emerald-900/20' : selectedBed.status === 'Occupied' ? 'bg-red-900/20' : 'bg-amber-900/20'}`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <BedDouble className={`w-5 h-5 ${selectedBed.status === 'Available' ? 'text-emerald-500' : selectedBed.status === 'Occupied' ? 'text-red-500' : 'text-amber-500'}`} />
                                        <h2 className="text-xl font-black text-white">Bed {selectedBed.id}</h2>
                                    </div>
                                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{selectedBed.type} Ward • {selectedBed.status}</p>
                                </div>
                                <button onClick={closeModal} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            {modalMode === 'ASSIGN' && (
                                <form onSubmit={handleAssignPatient} className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Patient Name</label>
                                        <div className="relative">
                                            <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                                            <input required type="text" value={patientName} onChange={e => setPatientName(e.target.value)} className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50" placeholder="Enter patient name..." />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Condition</label>
                                            <select value={condition} onChange={e => setCondition(e.target.value)} className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50">
                                                <option>Stable</option>
                                                <option>Observation</option>
                                                <option>Critical</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Attending Dr.</label>
                                            <input type="text" value={attendingDoctor} onChange={e => setAttendingDoctor(e.target.value)} className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50" placeholder="e.g. Dr. Smith" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Initial Notes</label>
                                        <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 h-24 resize-none" placeholder="Admission notes..."></textarea>
                                    </div>
                                    
                                    <button type="submit" className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl text-sm uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                                        Admit Patient
                                    </button>
                                </form>
                            )}

                            {modalMode === 'UPDATE' && (
                                <div className="space-y-6">
                                    {selectedBed.status === 'Occupied' && (
                                        <div className="bg-zinc-900 border border-white/5 rounded-2xl p-4 space-y-4">
                                            <div>
                                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Current Patient</p>
                                                <p className="text-lg font-bold text-white">{selectedBed.patientName}</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Condition</p>
                                                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${getConditionColor(selectedBed.condition)}`}>
                                                        {selectedBed.condition}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Attending</p>
                                                    <p className="text-sm font-semibold text-zinc-300">{selectedBed.attendingDoctor}</p>
                                                </div>
                                            </div>
                                            {selectedBed.notes && (
                                                <div>
                                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Notes</p>
                                                    <p className="text-xs text-zinc-400 bg-black/20 p-3 rounded-lg border border-white/5">{selectedBed.notes}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-3">
                                        {selectedBed.status === 'Occupied' && (
                                            <>
                                                <button onClick={() => handleUpdateStatus('Cleaning')} className="col-span-2 py-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                                                    <Clock className="w-4 h-4" /> Discharge & Clean
                                                </button>
                                                <button onClick={() => handleUpdateStatus('Available')} className="col-span-2 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-colors">
                                                    Force Available
                                                </button>
                                            </>
                                        )}
                                        
                                        {selectedBed.status === 'Cleaning' && (
                                            <>
                                                <button onClick={() => handleUpdateStatus('Available')} className="col-span-2 py-4 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 rounded-xl text-sm font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                                                    <CheckCircle2 className="w-5 h-5" /> Mark as Available
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
