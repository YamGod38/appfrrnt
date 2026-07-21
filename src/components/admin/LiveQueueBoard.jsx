import React, { useMemo, useState, useEffect } from 'react';
import { Stethoscope, Activity, Users, Hash, AlertCircle, CheckCircle2, ChevronRight, Filter, Clock } from 'lucide-react';

export default function LiveQueueBoard({ allBookings, doctors }) {
    const [currentTimeSlot, setCurrentTimeSlot] = useState('');

    // Update current time slot to match the booking format (e.g., "10:00 AM - 10:15 AM")
    useEffect(() => {
        const updateSlot = () => {
            const now = new Date();
            let h = now.getHours();
            let m = now.getMinutes();
            
            // Round down to nearest 15 mins for the slot
            const mStart = Math.floor(m / 15) * 15;
            
            const startH = h % 12 || 12;
            const startAmPm = h >= 12 ? 'PM' : 'AM';
            const startM = mStart.toString().padStart(2, '0');
            
            // End time is +15 mins
            let endH = h;
            let endM = mStart + 15;
            if (endM >= 60) {
                endM -= 60;
                endH += 1;
            }
            const endH12 = endH % 12 || 12;
            const endAmPm = endH >= 12 && endH < 24 ? 'PM' : 'AM';
            const endMStr = endM.toString().padStart(2, '0');
            
            const slot = `${startH}:${startM} ${startAmPm} - ${endH12}:${endMStr} ${endAmPm}`;
            setCurrentTimeSlot(slot);
        };
        updateSlot();
        const interval = setInterval(updateSlot, 60000); // Check every minute
        return () => clearInterval(interval);
    }, []);

    const queueData = useMemo(() => {
        const today = new Date().toLocaleDateString('en-CA');
        
        // Filter today's appointments
        const appointments = allBookings.filter(b => 
            b.type === 'APPOINTMENT' && 
            b.date === today &&
            b.status !== 'Verified' // Only show those who haven't finished/checked-in completely, or maybe show all?
            // Wait, we usually show pending ones in queue. 
        );

        // Group by Doctor
        const queues = {};
        
        appointments.forEach(b => {
            if (!b.doctor) return;
            
            let doctorName = b.doctor;
            let token = 'N/A';
            let isPriority = false;
            
            // Parse "Smith (Token: P1)"
            const match = b.doctor.match(/^(.*?)\s*\(\s*Token:\s*(.*?)\s*\)$/i);
            if (match) {
                doctorName = match[1].trim();
                token = match[2].trim();
                if (token.toUpperCase().startsWith('P')) {
                    isPriority = true;
                }
            }

            if (!queues[doctorName]) {
                queues[doctorName] = {
                    doctorName,
                    slots: {}
                };
            }

            if (!queues[doctorName].slots[b.time]) {
                queues[doctorName].slots[b.time] = [];
            }

            queues[doctorName].slots[b.time].push({
                ...b,
                doctorName,
                token,
                isPriority
            });
        });

        // Sort tokens inside each slot
        Object.values(queues).forEach(docQ => {
            Object.values(docQ.slots).forEach(slotQ => {
                slotQ.sort((a, b) => {
                    if (a.isPriority && !b.isPriority) return -1;
                    if (!a.isPriority && b.isPriority) return 1;
                    
                    // Both priority or both routine: sort by numeric part
                    const numA = parseInt(a.token.replace(/\D/g, '')) || 0;
                    const numB = parseInt(b.token.replace(/\D/g, '')) || 0;
                    return numA - numB;
                });
            });
        });

        return queues;
    }, [allBookings]);

    const hasAnyQueue = Object.keys(queueData).length > 0;

    return (
        <div className="bg-[#09090b]/90 rounded-2xl border border-white/[0.05] shadow-[0_20px_50px_-15px_rgba(0,0,0,1)] backdrop-blur-xl flex flex-col min-h-[400px]">
            <div className="px-6 py-5 border-b border-white/[0.05] flex justify-between items-center bg-zinc-950/50">
                <h3 className="text-lg font-bold text-zinc-100 tracking-tight flex items-center gap-2">
                    <Users className="w-5 h-5 text-amber-500" />
                    Live Priority Queue
                </h3>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-2 border border-white/5 bg-zinc-900/50 px-3 py-1.5 rounded-lg">
                        <Clock className="w-3 h-3 text-amber-500" /> Current Slot: <span className="text-amber-400">{currentTimeSlot}</span>
                    </span>
                </div>
            </div>

            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                {!hasAnyQueue ? (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-500 py-12">
                        <Hash className="w-12 h-12 mb-4 opacity-20" />
                        <p className="text-sm font-bold uppercase tracking-widest">No Active Queues</p>
                        <p className="text-xs text-zinc-600 mt-1">Pending appointments will appear here with token numbers.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Object.values(queueData).map((docQueue, idx) => {
                            // Find the queue for current time slot, or fallback to the earliest upcoming one
                            const allSlots = Object.keys(docQueue.slots).sort(); // Basic sort, could be better if parsing time
                            // Let's just flatten all pending tokens for this doctor for today for now, 
                            // grouped by slot, so receptionist sees the full day's pipeline but separated by slot.
                            
                            return (
                                <div key={idx} className="bg-zinc-900/50 rounded-xl border border-white/[0.05] overflow-hidden flex flex-col">
                                    <div className="p-4 bg-zinc-950/80 border-b border-white/[0.05] flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400">
                                                <Stethoscope className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-zinc-100">Dr. {docQueue.doctorName}</h4>
                                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Active Pipeline</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="p-4 flex-1 space-y-6">
                                        {allSlots.map(slotTime => (
                                            <div key={slotTime}>
                                                <h5 className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest border-b border-white/5 pb-1 mb-3 flex items-center gap-2">
                                                    <Clock className="w-3 h-3 text-emerald-500" /> {slotTime}
                                                </h5>
                                                <div className="space-y-2">
                                                    {docQueue.slots[slotTime].map((patient, pIdx) => (
                                                        <div key={patient.id} className={`p-3 rounded-lg border flex items-center justify-between ${
                                                            patient.isPriority 
                                                            ? 'bg-rose-500/10 border-rose-500/30 shadow-[inset_0_0_10px_rgba(244,63,94,0.1)]' 
                                                            : 'bg-zinc-950 border-white/[0.02]'
                                                        }`}>
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-lg ${
                                                                    patient.isPriority ? 'bg-rose-500 text-zinc-950 shadow-[0_0_15px_rgba(244,63,94,0.4)]' : 'bg-zinc-800 text-zinc-300'
                                                                }`}>
                                                                    {patient.token}
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-bold text-zinc-200">{patient.patientName}</p>
                                                                    <p className="text-[9px] text-zinc-500 uppercase tracking-widest mt-0.5">ID: {patient.huid || 'N/A'}</p>
                                                                </div>
                                                            </div>
                                                            
                                                            {patient.isPriority && (
                                                                <AlertCircle className="w-4 h-4 text-rose-500 animate-pulse" />
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
