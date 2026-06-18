import { useState, useEffect } from 'react';
import { CalendarDays, Clock, CheckCircle2, Loader2, Sparkles, ChevronRight, Stethoscope, Activity, XCircle } from 'lucide-react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

export default function AppointmentBooking({ activeCall }) {
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState(null);
    const [status, setStatus] = useState('idle');
    const [doctors, setDoctors] = useState([]);

    useEffect(() => {
        socket.emit('GET_INITIAL_STATE');
        socket.on('DOCTOR_STATUS_SYNC', (data) => {
            setDoctors(data);
            // If the currently selected doctor goes off duty, deselect them
            setSelectedDoctor(prev => {
                const doc = data.find(d => d.id === prev);
                if (doc && doc.status !== 'Available') return null;
                return prev;
            });
        });

        return () => {
            socket.off('DOCTOR_STATUS_SYNC');
        };
    }, []);

    const timeSlots = ['09:00 AM', '10:30 AM', '11:00 AM', '01:00 PM', '02:30 PM', '04:00 PM', '05:30 PM'];

    const handleBooking = async (e) => {
        e.preventDefault();
        if (!selectedDoctor || !selectedDate || !selectedTime) return;
        setStatus('booking');
        
        // Simulate network request
        setTimeout(() => {
            setStatus('success');
            const docName = doctors.find(d => d.id === selectedDoctor)?.name || 'Dr. Assigned';
            const agentName = localStorage.getItem('name') || 'Agent Alpha';
            socket.emit('BOOKING_MADE', {
                patientName: activeCall?.customerInfo?.full_name || 'Walk-in Patient',
                doctor: docName,
                date: selectedDate,
                time: selectedTime,
                agentName: agentName
            });
        }, 2000);
    };

    return (
        <div className="bg-[#050505] rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,1)] border border-white/[0.05] w-full h-full flex flex-col relative overflow-hidden group print:bg-white print:text-black print:border-none print:shadow-none print:h-auto print:overflow-visible print:block">
            
            {/* Animated Background Mesh - Hidden on Print */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-40 print:hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] mix-blend-screen animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
            </div>

            {/* Header - Hidden on Print */}
            <div className="p-8 pb-4 relative z-10 flex justify-between items-start border-b border-white/[0.05] bg-gradient-to-b from-white/[0.02] to-transparent print:hidden">
                <div>
                    <h2 className="text-3xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500 flex items-center gap-3 tracking-tight">
                        Book Appointment
                    </h2>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-500" />
                        Next-Gen Scheduling Matrix
                    </p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-zinc-900 border border-white/10 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] relative overflow-hidden group-hover:border-emerald-500/30 transition-all duration-500">
                    <Sparkles className="w-5 h-5 text-emerald-400 relative z-10" />
                    <div className="absolute inset-0 bg-emerald-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 relative z-10 space-y-8 print:overflow-visible print:h-auto print:block print:p-0">
                
                {status === 'success' ? (
                    /* APPOINTMENT SLIP (Printable) */
                    <div className="bg-zinc-950/80 border border-emerald-500/20 rounded-2xl p-8 relative overflow-hidden print:bg-white print:border-black print:text-black">
                        {/* Print background watermark */}
                        <div className="absolute inset-0 opacity-5 pointer-events-none hidden print:flex items-center justify-center">
                            <Stethoscope className="w-64 h-64" />
                        </div>
                        
                        <div className="flex justify-between items-start mb-8 border-b border-white/10 print:border-black pb-6">
                            <div>
                                <h1 className="text-2xl font-black text-emerald-400 print:text-black mb-1">APOLLO CRM</h1>
                                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest print:text-gray-500">Official Appointment Slip</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xl font-mono font-bold text-zinc-100 print:text-black">#{Math.floor(Math.random() * 1000000)}</p>
                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest print:text-gray-500">Ref ID</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8 mb-8">
                            <div>
                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 print:text-gray-500">Patient Details</p>
                                <p className="text-lg font-bold text-zinc-100 print:text-black">{activeCall?.customerInfo?.full_name || 'Walk-in Patient'}</p>
                                <p className="text-sm font-mono text-zinc-400 print:text-gray-600">{activeCall?.callerNumber || '+1 (555) 000-0000'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 print:text-gray-500">Specialist</p>
                                <p className="text-lg font-bold text-emerald-400 print:text-black">{doctors.find(d => d.id === selectedDoctor)?.name || 'Dr. Assigned'}</p>
                                <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest print:text-gray-600">{doctors.find(d => d.id === selectedDoctor)?.spec || 'Specialist'}</p>
                            </div>
                        </div>

                        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-6 flex justify-between items-center print:bg-gray-100 print:border-gray-300">
                            <div>
                                <p className="text-[10px] font-bold text-emerald-500/70 uppercase tracking-widest mb-1 print:text-gray-500">Date</p>
                                <p className="text-xl font-black text-emerald-400 print:text-black">{selectedDate}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-emerald-500/70 uppercase tracking-widest mb-1 print:text-gray-500">Time</p>
                                <p className="text-xl font-black text-emerald-400 print:text-black">{selectedTime}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                    {/* DOCTOR SELECTION */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">1. Select Specialist</label>
                            {selectedDoctor && <span className="text-[10px] font-bold text-emerald-400 tracking-widest uppercase bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Selected</span>}
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            {doctors.map(doc => {
                                const isAvailable = doc.status === 'Available';
                                return (
                                <div 
                                    key={doc.id}
                                    onClick={() => isAvailable && setSelectedDoctor(doc.id)}
                                    className={`rounded-2xl p-4 border transition-all duration-300 relative overflow-hidden group/doc ${!isAvailable ? 'opacity-50 grayscale cursor-not-allowed bg-zinc-900/30 border-transparent' : selectedDoctor === doc.id ? 'cursor-pointer bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)] -translate-y-1' : 'cursor-pointer bg-zinc-900/50 border-white/[0.05] hover:border-white/20 hover:bg-zinc-800'}`}
                                >
                                    {selectedDoctor === doc.id && <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/20 blur-2xl"></div>}
                                    <div className="flex items-center gap-3 mb-2 relative z-10">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner transition-colors ${selectedDoctor === doc.id ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-950 text-zinc-500 group-hover/doc:text-zinc-300'}`}>
                                            <Stethoscope className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className={`text-sm font-bold transition-colors ${selectedDoctor === doc.id ? 'text-emerald-50' : 'text-zinc-300'}`}>{doc.name}</h4>
                                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{doc.spec}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-3 relative z-10">
                                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border ${isAvailable ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10' : 'text-amber-400 border-amber-500/20 bg-amber-500/10'}`}>
                                            {isAvailable ? <CheckCircle2 className="w-3 h-3" /> : <Activity className="w-3 h-3" />} {doc.status}
                                        </span>
                                    </div>
                                </div>
                            )})}
                        </div>
                    </div>

                    <div className="h-px w-full bg-gradient-to-r from-transparent via-white/[0.05] to-transparent"></div>

                    {/* DATE & TIME SELECTION */}
                    <div className="grid grid-cols-2 gap-8">
                        {/* DATE */}
                        <div className={`transition-opacity duration-300 ${!selectedDoctor ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-4 block">2. Choose Date</label>
                            <div className="relative group/input">
                                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none z-10">
                                    <CalendarDays className="w-5 h-5 text-zinc-500 group-focus-within/input:text-emerald-400 transition-colors" />
                                </div>
                                <input 
                                    type="date" 
                                    className="w-full bg-zinc-950 text-zinc-100 rounded-2xl pl-14 pr-5 py-5 border border-white/[0.05] shadow-[inset_0_2px_15px_rgba(0,0,0,0.8)] transition-all duration-300 focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 hover:border-white/10 cursor-pointer text-sm font-bold tracking-wide [color-scheme:dark] relative"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* TIME */}
                        <div className={`transition-opacity duration-300 ${!selectedDate ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-4 block">3. Available Slots</label>
                            <div className="flex flex-wrap gap-3">
                                {timeSlots.map(t => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setSelectedTime(t)}
                                        className={`px-4 py-3 rounded-xl text-xs font-bold tracking-widest transition-all duration-300 border ${selectedTime === t ? 'bg-emerald-500 text-zinc-950 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)] scale-105' : 'bg-zinc-900 border-white/[0.05] text-zinc-400 hover:border-emerald-500/30 hover:text-emerald-400'}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    </>
                )}
            </div>

            {/* ACTION FOOTER - Hidden on Print */}
            <div className="p-8 border-t border-white/[0.05] bg-[#050505] relative z-20 print:hidden">
                {status === 'success' ? (
                    <div className="flex gap-4">
                        <button 
                            onClick={() => window.print()}
                            className="flex-1 bg-zinc-100 text-zinc-950 font-black py-5 rounded-2xl transition-all duration-300 hover:bg-white hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] tracking-[0.2em] uppercase text-sm flex items-center justify-center gap-2 active:scale-95"
                        >
                            Print Slip
                        </button>
                        <button 
                            onClick={() => {
                                setStatus('idle');
                                setSelectedDoctor(null);
                                setSelectedDate('');
                                setSelectedTime(null);
                            }}
                            className="flex-1 bg-zinc-900 text-zinc-400 border border-white/10 font-bold py-5 rounded-2xl transition-all duration-300 hover:bg-zinc-800 hover:text-white tracking-[0.2em] uppercase text-sm flex items-center justify-center gap-2 active:scale-95"
                        >
                            New Booking
                        </button>
                    </div>
                ) : (
                    <button 
                        onClick={handleBooking}
                        disabled={!selectedDoctor || !selectedDate || !selectedTime || status === 'booking'}
                        className={`relative w-full text-white font-black py-5 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none group/btn shadow-[0_8px_0_rgba(9,9,11,1)] active:shadow-none active:translate-y-2 ${status === 'booking' ? 'bg-emerald-500/50' : 'bg-zinc-100 text-zinc-950 hover:bg-white'}`}
                    >
                        <span className="relative z-10 tracking-[0.2em] uppercase text-sm flex items-center justify-center gap-2">
                            {status === 'booking' ? (
                                <><Loader2 className="w-5 h-5 animate-spin" /> Finalizing...</>
                            ) : (
                                <>Confirm Booking <ChevronRight className="w-4 h-4" /></>
                            )}
                        </span>
                        
                        {/* Animated Shine Effect */}
                        {status !== 'booking' && (
                            <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-black/10 to-transparent skew-x-12 transition-all duration-700 group-hover/btn:left-[200%] pointer-events-none"></div>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}
