import { useState, useEffect } from 'react';
import { CalendarDays, Clock, CheckCircle2, Loader2, Sparkles, ChevronRight, Stethoscope, Activity, XCircle, MessageSquare, UserCircle, Edit2, Save } from 'lucide-react';
import { io } from 'socket.io-client';

const socket = io((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '', { auth: { token: localStorage.getItem('token') } });

export default function AppointmentBooking({ activeCall }) {
    const [bookingMode, setBookingMode] = useState('consultation'); // 'consultation', 'scan', 'blood'
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [selectedScan, setSelectedScan] = useState(null);
    const [addressNotes, setAddressNotes] = useState('');
    const [labTests, setLabTests] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState(null);
    const [status, setStatus] = useState('idle');
    const [doctors, setDoctors] = useState([]);
    const [scanTypes, setScanTypes] = useState([]);
    const [isSendingWA, setIsSendingWA] = useState(false);
    
    // Patient Profile States
    const [patientName, setPatientName] = useState(activeCall?.customerInfo?.full_name || 'Walk-in Patient');
    const [patientPhone, setPatientPhone] = useState(activeCall?.callerNumber || '');
    const [patientHuid, setPatientHuid] = useState(activeCall?.customerInfo?.huid || '');
    const [isEditingProfile, setIsEditingProfile] = useState(false);

    useEffect(() => {
        setPatientName(activeCall?.customerInfo?.full_name || 'Walk-in Patient');
        setPatientPhone(activeCall?.callerNumber || '');
        setPatientHuid(activeCall?.customerInfo?.huid || '');
    }, [activeCall]);

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

        socket.on('SCAN_TYPES_SYNC', (scans) => {
            setScanTypes(scans);
        });

        return () => {
            socket.off('DOCTOR_STATUS_SYNC');
            socket.off('SCAN_TYPES_SYNC');
        };
    }, []);

    const timeSlots = ['09:00 AM', '10:30 AM', '11:00 AM', '01:00 PM', '02:30 PM', '04:00 PM', '05:30 PM'];

    const todayStr = new Date().toISOString().split('T')[0];
    const isToday = selectedDate === todayStr;

    const isTimeInPast = (timeStr) => {
        if (!isToday) return false;
        const [time, modifier] = timeStr.split(' ');
        let [hours, minutes] = time.split(':');
        hours = parseInt(hours, 10);
        if (hours === 12) {
            hours = modifier === 'PM' ? 12 : 0;
        } else if (modifier === 'PM') {
            hours += 12;
        }
        
        const now = new Date();
        const slotTime = new Date();
        slotTime.setHours(hours, parseInt(minutes, 10), 0, 0);
        
        return slotTime < now;
    };

    const handleBooking = async (e) => {
        e.preventDefault();
        if ((bookingMode === 'consultation' && !selectedDoctor) || (bookingMode === 'scan' && !selectedScan) || (bookingMode === 'blood' && (!addressNotes || !labTests)) || !selectedDate || !selectedTime) return;
        setStatus('booking');
        
        // Simulate network request
        setTimeout(() => {
            setStatus('success');
            const agentName = localStorage.getItem('name') || 'Agent Alpha';
            const huid = patientHuid || 'WALK-IN-' + Math.floor(Math.random() * 100000);
            
            if (bookingMode === 'consultation') {
                const docName = doctors.find(d => d.id === selectedDoctor)?.name || 'Dr. Assigned';
                socket.emit('BOOKING_MADE', {
                    patientName: patientName,
                    huid: huid,
                    number: patientPhone,
                    doctor: docName,
                    date: selectedDate,
                    time: selectedTime,
                    agentName: agentName
                });
            } else if (bookingMode === 'scan') {
                const scan = scanTypes.find(s => s.id === selectedScan);
                socket.emit('SCAN_BOOKING_MADE', {
                    patientName: patientName,
                    huid: huid,
                    number: patientPhone,
                    scanType: scan?.name,
                    date: selectedDate,
                    time: selectedTime,
                    agentName: agentName
                });
            } else if (bookingMode === 'blood') {
                socket.emit('BLOOD_COLLECTION_MADE', {
                    patientName: patientName,
                    huid: huid,
                    number: patientPhone,
                    notes: `Tests: ${labTests}`,
                    address: addressNotes,
                    date: selectedDate,
                    time: selectedTime,
                    agentName: agentName
                });
            }
        }, 2000);
    };

    const handleWhatsAppSend = async () => {
        if (!patientPhone) {
            return alert("No phone number linked to this call.");
        }
        setIsSendingWA(true);
        try {
            const desc = bookingMode === 'consultation' ? 'Appointment Booking' : bookingMode === 'scan' ? 'Diagnostic Scan Booking' : 'Blood Collection Booking';
            const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/whatsapp/send-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'DOCTOR',
                    phone: patientPhone,
                    data: { name: patientName, amount: '0.00', description: desc }
                })
            });
            if (res.ok) {
                alert('Booking slip sent via WhatsApp successfully!');
            } else {
                alert('Failed to send WhatsApp message.');
            }
        } catch (err) {
            console.error(err);
            alert('Error sending WhatsApp message.');
        } finally {
            setIsSendingWA(false);
        }
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
                                <p className="text-lg font-bold text-zinc-100 print:text-black">{patientName}</p>
                                <p className="text-sm font-mono text-zinc-400 print:text-gray-600">{patientPhone || '+91 98765 43210'}</p>
                                <p className="text-[10px] font-bold text-blue-400 font-mono mt-1 uppercase tracking-widest print:text-blue-600">HUID: {patientHuid || 'NEW-REGISTRATION'}</p>
                            </div>
                            <div>
                                {bookingMode === 'consultation' ? (
                                    <>
                                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 print:text-gray-500">Specialist</p>
                                        <p className="text-lg font-bold text-emerald-400 print:text-black">{doctors.find(d => d.id === selectedDoctor)?.name || 'Dr. Assigned'}</p>
                                        <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest print:text-gray-600">{doctors.find(d => d.id === selectedDoctor)?.spec || 'Specialist'}</p>
                                    </>
                                ) : bookingMode === 'scan' ? (
                                    <>
                                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 print:text-gray-500">Scan Details</p>
                                        <p className="text-lg font-bold text-cyan-400 print:text-black">{scanTypes.find(s => s.id === selectedScan)?.name}</p>
                                        <p className="text-xs font-bold text-amber-400 uppercase mt-1 print:text-orange-600">Prep: {scanTypes.find(s => s.id === selectedScan)?.prep}</p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 print:text-gray-500">Blood Collection Details</p>
                                        <p className="text-lg font-bold text-rose-400 print:text-black">Home Visit</p>
                                        <p className="text-xs font-bold text-zinc-400 mt-1 print:text-gray-600">Tests: {labTests}</p>
                                        <p className="text-xs font-bold text-zinc-400 mt-1 print:text-gray-600">Addr: {addressNotes}</p>
                                    </>
                                )}
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
                    {/* PATIENT PROFILE SECTION */}
                    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 relative overflow-hidden group mb-8">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full pointer-events-none"></div>
                        <div className="flex justify-between items-center mb-4">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <UserCircle className="w-4 h-4 text-blue-400" /> Patient Profile
                            </label>
                            {isEditingProfile ? (
                                <button 
                                    onClick={() => {
                                        setIsEditingProfile(false);
                                        socket.emit('UPDATE_PATIENT_PROFILE', { patientName, phoneNumber: patientPhone, huid: patientHuid });
                                    }}
                                    className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                                >
                                    <Save className="w-3 h-3" /> SAVE
                                </button>
                            ) : (
                                <button 
                                    onClick={() => setIsEditingProfile(true)}
                                    className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 hover:text-white transition-colors"
                                >
                                    <Edit2 className="w-3 h-3" /> EDIT
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4 relative z-10">
                            <div>
                                <label className="text-xs font-bold text-zinc-500 mb-1 block">Full Name</label>
                                {isEditingProfile ? (
                                    <input 
                                        type="text" 
                                        value={patientName} 
                                        onChange={(e) => setPatientName(e.target.value)} 
                                        className="w-full bg-zinc-950 text-white rounded-lg px-3 py-2 border border-blue-500/30 focus:outline-none focus:border-blue-500 text-sm"
                                    />
                                ) : (
                                    <p className="text-sm font-bold text-zinc-100">{patientName}</p>
                                )}
                            </div>
                            <div>
                                <label className="text-xs font-bold text-zinc-500 mb-1 block">Phone Number</label>
                                {isEditingProfile ? (
                                    <input 
                                        type="text" 
                                        value={patientPhone} 
                                        onChange={(e) => setPatientPhone(e.target.value)} 
                                        className="w-full bg-zinc-950 text-white rounded-lg px-3 py-2 border border-blue-500/30 focus:outline-none focus:border-blue-500 text-sm"
                                    />
                                ) : (
                                    <p className="text-sm font-mono text-zinc-300">{patientPhone || 'N/A'}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* BOOKING MODE TOGGLE */}
                    <div className="flex flex-wrap gap-2 bg-zinc-900/50 p-1.5 rounded-xl border border-white/5 mb-8 w-full max-w-lg mx-auto">
                        <button 
                            type="button"
                            onClick={() => { setBookingMode('consultation'); setSelectedScan(null); }}
                            className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${bookingMode === 'consultation' ? 'bg-emerald-500 text-zinc-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            Consultation
                        </button>
                        <button 
                            type="button"
                            onClick={() => { setBookingMode('scan'); setSelectedDoctor(null); }}
                            className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${bookingMode === 'scan' ? 'bg-cyan-500 text-zinc-950 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            Diagnostic Scan
                        </button>
                        <button 
                            type="button"
                            onClick={() => { setBookingMode('blood'); setSelectedDoctor(null); setSelectedScan(null); }}
                            className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${bookingMode === 'blood' ? 'bg-rose-500 text-zinc-950 shadow-[0_0_15px_rgba(244,63,94,0.3)]' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            Blood Collect
                        </button>
                    </div>

                    {bookingMode === 'consultation' ? (
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
                    ) : bookingMode === 'scan' ? (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">1. Select Scan Type</label>
                            {selectedScan && <span className="text-[10px] font-bold text-cyan-400 tracking-widest uppercase bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">Selected</span>}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {scanTypes.map(scan => (
                                <div 
                                    key={scan.id}
                                    onClick={() => setSelectedScan(scan.id)}
                                    className={`rounded-2xl p-4 border transition-all duration-300 relative overflow-hidden group/doc cursor-pointer ${selectedScan === scan.id ? 'bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)] -translate-y-1' : 'bg-zinc-900/50 border-white/[0.05] hover:border-white/20 hover:bg-zinc-800'}`}
                                >
                                    {selectedScan === scan.id && <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/20 blur-2xl"></div>}
                                    <div className="flex items-center gap-3 mb-3 relative z-10">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner transition-colors ${selectedScan === scan.id ? 'bg-cyan-500/20 text-cyan-400' : 'bg-zinc-950 text-zinc-500 group-hover/doc:text-zinc-300'}`}>
                                            <Activity className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className={`text-sm font-bold transition-colors ${selectedScan === scan.id ? 'text-cyan-50' : 'text-zinc-300'}`}>{scan.name}</h4>
                                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{scan.duration}</p>
                                        </div>
                                    </div>
                                    <div className="relative z-10 bg-black/20 p-2 rounded-lg border border-white/5">
                                        <p className="text-[9px] text-amber-500 font-bold uppercase tracking-widest mb-0.5">Prep Instructions:</p>
                                        <p className="text-xs text-zinc-400">{scan.prep}</p>
                                    </div>
                                </div>
                            ))}
                            {scanTypes.length === 0 && (
                                <div className="col-span-2 text-center py-8 text-zinc-500 text-xs uppercase tracking-widest font-bold">No Scans Available</div>
                            )}
                        </div>
                    </div>
                    ) : (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">1. Home Collection Details</label>
                        </div>
                        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 relative overflow-hidden group space-y-4">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 blur-3xl rounded-full pointer-events-none"></div>
                            
                            <div className="relative z-10">
                                <label className="text-xs font-bold text-zinc-300 mb-2 block">Lab Tests Required</label>
                                <input
                                    type="text"
                                    value={labTests}
                                    onChange={(e) => setLabTests(e.target.value)}
                                    placeholder="e.g. CBC, Lipid Profile, Thyroid, HbA1c..."
                                    className="w-full bg-zinc-950 text-zinc-100 rounded-xl p-4 border border-white/10 shadow-[inset_0_2px_15px_rgba(0,0,0,0.8)] focus:outline-none focus:border-rose-500/50 focus:ring-4 focus:ring-rose-500/10 transition-all text-sm"
                                />
                            </div>

                            <div className="relative z-10">
                                <label className="text-xs font-bold text-zinc-300 mb-2 block">Home Address</label>
                                <textarea
                                    value={addressNotes}
                                    onChange={(e) => setAddressNotes(e.target.value)}
                                    placeholder="Enter complete address, landmarks, and instructions for the phlebotomist..."
                                    className="w-full bg-zinc-950 text-zinc-100 rounded-xl p-4 border border-white/10 shadow-[inset_0_2px_15px_rgba(0,0,0,0.8)] focus:outline-none focus:border-rose-500/50 focus:ring-4 focus:ring-rose-500/10 transition-all text-sm h-24 resize-none custom-scrollbar"
                                />
                                <p className="text-[10px] text-zinc-500 mt-2 font-bold flex items-center gap-1">
                                    <Activity className="w-3 h-3 text-rose-500" /> Note: Fasting may be required depending on tests prescribed.
                                </p>
                            </div>
                        </div>
                    </div>
                    )}

                    <div className="h-px w-full bg-gradient-to-r from-transparent via-white/[0.05] to-transparent"></div>

                    {/* DATE & TIME SELECTION */}
                    <div className="grid grid-cols-2 gap-8 mt-8">
                        {/* DATE */}
                        <div className={`transition-opacity duration-300 ${(!selectedDoctor && !selectedScan && bookingMode !== 'blood') ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-4 block">2. Choose Date</label>
                            <div className="relative group/input">
                                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none z-10">
                                    <CalendarDays className="w-5 h-5 text-zinc-500 group-focus-within/input:text-emerald-400 transition-colors" />
                                </div>
                                <input 
                                    type="date" 
                                    className="w-full bg-zinc-950 text-zinc-100 rounded-2xl pl-14 pr-5 py-5 border border-white/[0.05] shadow-[inset_0_2px_15px_rgba(0,0,0,0.8)] transition-all duration-300 focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 hover:border-white/10 cursor-pointer text-sm font-bold tracking-wide [color-scheme:dark] relative"
                                    value={selectedDate}
                                    min={todayStr}
                                    onChange={(e) => {
                                        setSelectedDate(e.target.value);
                                        setSelectedTime(null); // Reset time when date changes
                                    }}
                                />
                            </div>
                        </div>

                        {/* TIME */}
                        <div className={`transition-opacity duration-300 ${!selectedDate ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-4 block">3. Available Slots</label>
                            <div className="flex flex-wrap gap-3">
                                {timeSlots.map(t => {
                                    const past = isTimeInPast(t);
                                    return (
                                    <button
                                        key={t}
                                        type="button"
                                        disabled={past}
                                        onClick={() => setSelectedTime(t)}
                                        className={`px-4 py-3 rounded-xl text-xs font-bold tracking-widest transition-all duration-300 border ${past ? 'opacity-20 bg-zinc-900 border-white/[0.02] cursor-not-allowed' : selectedTime === t ? 'bg-emerald-500 text-zinc-950 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)] scale-105' : 'bg-zinc-900 border-white/[0.05] text-zinc-400 hover:border-emerald-500/30 hover:text-emerald-400'}`}
                                    >
                                        {t}
                                    </button>
                                )})}
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
                            className="flex-1 bg-zinc-100 text-zinc-950 font-black py-5 rounded-2xl transition-all duration-300 hover:bg-white hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] tracking-[0.2em] uppercase text-xs flex items-center justify-center gap-2 active:scale-95"
                        >
                            Print Slip
                        </button>
                        <button 
                            onClick={handleWhatsAppSend}
                            disabled={isSendingWA}
                            className="flex-1 bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/30 font-black py-5 rounded-2xl transition-all duration-300 hover:bg-[#25D366]/20 hover:shadow-[0_0_30px_rgba(37,211,102,0.2)] tracking-[0.2em] uppercase text-xs flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                        >
                            <MessageSquare className="w-4 h-4" />
                            {isSendingWA ? 'Sending...' : 'WA Send'}
                        </button>
                        <button 
                            onClick={() => {
                                setStatus('idle');
                                setSelectedDoctor(null);
                                setSelectedScan(null);
                                setAddressNotes('');
                                setLabTests('');
                                setSelectedDate('');
                                setSelectedTime(null);
                            }}
                            className="flex-1 bg-zinc-900 text-zinc-400 border border-white/10 font-bold py-5 rounded-2xl transition-all duration-300 hover:bg-zinc-800 hover:text-white tracking-[0.2em] uppercase text-xs flex items-center justify-center gap-2 active:scale-95"
                        >
                            New Booking
                        </button>
                    </div>
                ) : (
                    <button 
                        onClick={handleBooking}
                        disabled={(bookingMode === 'consultation' && !selectedDoctor) || (bookingMode === 'scan' && !selectedScan) || (bookingMode === 'blood' && (!addressNotes || !labTests)) || !selectedDate || !selectedTime || status === 'booking'}
                        className={`relative w-full text-white font-black py-5 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none group/btn shadow-[0_8px_0_rgba(9,9,11,1)] active:shadow-none active:translate-y-2 ${status === 'booking' ? (bookingMode === 'scan' ? 'bg-cyan-500/50' : bookingMode === 'blood' ? 'bg-rose-500/50' : 'bg-emerald-500/50') : 'bg-zinc-100 text-zinc-950 hover:bg-white'}`}
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
