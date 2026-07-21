import React, { useState, useEffect } from 'react';
import { Phone, User, Clock, PhoneIncoming, FileText, CheckCircle, Forward, Play } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import socket from '../../utils/socket';

export default function AdminConsole() {
    const { activeAdminCall, setActiveAdminCall } = useOutletContext() || {};
    const [history, setHistory] = useState([]);

    useEffect(() => {
        if (activeAdminCall) {
            // Mock fetching history for the patient
            setHistory([
                { id: 1, type: 'incoming', date: 'Yesterday', time: '10:30 AM', agent: activeAdminCall.agentName || 'Unknown Agent', notes: 'Patient inquired about MRI pricing. Forwarded to billing.' },
                { id: 2, type: 'outgoing', date: '3 days ago', time: '02:15 PM', agent: 'System', notes: 'Automated appointment reminder sent.' },
                { id: 3, type: 'incoming', date: 'Last week', time: '09:00 AM', agent: 'Rahul S.', notes: 'Booked general consultation.' }
            ]);
        } else {
            setHistory([]);
        }
    }, [activeAdminCall]);

    const handleReturnToAgent = () => {
        if (activeAdminCall) {
            // Re-construct the call to pass back
            socket.emit('RETURN_ESCALATED_CALL', { 
                call: { number: activeAdminCall.patientProfile?.phone_number || 'Unknown', customerInfo: activeAdminCall.patientProfile } 
            });
            setActiveAdminCall(null);
            setHistory([]);
            alert(`Call successfully forwarded back to ${activeAdminCall.agentName}`);
        }
    };

    return (
        <div className="flex flex-col h-full max-w-7xl mx-auto w-full relative z-10 animate-in fade-in duration-500">
            <header className="flex justify-between items-end pb-6 border-b border-white/[0.05] mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-zinc-100 tracking-tight flex items-center gap-3">
                        Escalation Console
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                        </span>
                    </h2>
                    <p className="text-zinc-500 mt-2 text-sm">Handle escalated calls from agents, view history, and return calls.</p>
                </div>
            </header>

            {!activeAdminCall && (
                <div className="flex-1 flex flex-col items-center justify-center border border-white/5 rounded-2xl bg-zinc-900/30">
                    <div className="w-24 h-24 bg-black/40 rounded-full flex items-center justify-center mb-6 border border-white/5 shadow-inner">
                        <Phone className="w-10 h-10 text-zinc-700" />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-400 tracking-tight">No Active Escalations</h3>
                    <p className="text-zinc-600 mt-2 max-w-sm text-center">When an agent escalates a call, you can accept it and manage it here.</p>
                </div>
            )}

            {activeAdminCall && (
                <div className="flex-1 flex gap-6">
                    {/* Left Column: Call Controls */}
                    <div className="w-1/3 flex flex-col gap-6">
                        <div className="bg-zinc-900/60 border border-emerald-500/20 rounded-2xl p-6 shadow-[0_0_30px_rgba(16,185,129,0.05)]">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
                                    <Phone className="w-6 h-6 text-emerald-500 animate-pulse" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-zinc-100">Active Escalation</h3>
                                    <p className="text-xs text-emerald-500 font-bold tracking-widest uppercase flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                        Connected
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Escalated By</p>
                                    <p className="text-zinc-200 font-medium flex items-center gap-2">
                                        <User className="w-4 h-4 text-amber-500" /> {activeAdminCall.agentName || 'Agent'}
                                    </p>
                                </div>

                                <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Patient Profile</p>
                                    <p className="text-zinc-200 font-bold text-lg">{activeAdminCall.patientProfile?.full_name || 'Unknown Patient'}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-zinc-400 font-mono text-xs">{activeAdminCall.patientProfile?.phone_number || 'Unknown'}</p>
                                        <span className="text-zinc-600">•</span>
                                        <p className="text-zinc-400 text-xs">{activeAdminCall.patientProfile?.age || '--'} yrs, {activeAdminCall.patientProfile?.gender || '--'}</p>
                                    </div>
                                    {activeAdminCall.patientProfile?.vip_status && (
                                        <div className="mt-2 inline-flex items-center gap-1 bg-amber-500/10 text-amber-500 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest">
                                            VIP Priority
                                        </div>
                                    )}
                                </div>
                                <div className="bg-black/40 p-4 rounded-xl border border-white/5 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                                    <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-1">Transfer Context</p>
                                    <p className="text-zinc-300 text-sm leading-relaxed">{activeAdminCall.symptoms ? activeAdminCall.symptoms.replace(/"/g, '') : 'No context provided.'}</p>
                                </div>

                            </div>

                            <button 
                                onClick={handleReturnToAgent}
                                className="w-full bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 font-bold uppercase tracking-widest text-xs py-4 rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                                <Forward className="w-4 h-4" /> Return Call to {activeAdminCall.agentName || 'Agent'}
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Call History */}
                    <div className="w-2/3 bg-zinc-900/60 border border-white/5 rounded-2xl flex flex-col overflow-hidden">
                        <div className="p-6 border-b border-white/5 bg-black/20">
                            <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-amber-500" /> Patient Interaction History
                            </h3>
                            <p className="text-xs text-zinc-500 mt-1">Review previous touchpoints before resolving the escalation.</p>
                        </div>
                        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-4">
                            {history.map((log) => (
                                <div key={log.id} className="bg-black/40 border border-white/5 rounded-xl p-4 flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                                        {log.type === 'incoming' ? <PhoneIncoming className="w-4 h-4 text-emerald-400" /> : <Play className="w-4 h-4 text-blue-400" />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="text-sm font-bold text-zinc-200 capitalize">{log.type} Call</h4>
                                                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Handled by: <span className="text-zinc-400">{log.agent}</span></p>
                                            </div>
                                            <span className="text-xs font-mono text-zinc-500 bg-black/50 px-2 py-1 rounded-md border border-white/5">
                                                {log.date} at {log.time}
                                            </span>
                                        </div>
                                        <div className="bg-zinc-900/80 p-3 rounded-lg border border-white/[0.02]">
                                            <p className="text-sm text-zinc-300 flex items-start gap-2">
                                                <FileText className="w-4 h-4 text-zinc-600 mt-0.5 shrink-0" />
                                                {log.notes}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
