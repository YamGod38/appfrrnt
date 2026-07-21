import { useEffect, useState } from 'react';
import socket, { connectSocket } from '../../utils/socket';
import WebRTCDialer from '../../components/dialer/WebRTCDialer';
import KnowledgeBase from '../../components/knowledge-base/KnowledgeBase';
import InteractionTimeline from '../../components/timeline/InteractionTimeline';
import AppointmentBooking from '../../components/booking/AppointmentBooking';
import HotelBooking from '../../components/booking/HotelBooking';
import AiSuggest from '../../components/copilot/AiSuggest';
import UnifiedInbox from '../../components/inbox/UnifiedInbox';
import CallHistory from '../../components/dashboard/CallHistory';
import FollowUps from '../../components/dashboard/FollowUps';
import AgentLeads from '../../components/dashboard/AgentLeads';
import WhatsappDashboard from '../admin/WhatsappDashboard';
import BookingLogs from '../admin/BookingLogs';
import PatientProfileModal from '../../components/dashboard/PatientProfileModal';
import BillingEstimator from '../../components/dashboard/BillingEstimator';
export default function Workspace() {
  const [incomingCall, setIncomingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(null); 
  const [activeTab, setActiveTab] = useState('terminal'); // terminal, operations, inbox

  // Quick Action States
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showAmbulanceModal, setShowAmbulanceModal] = useState(false);
  const [ambulanceLocation, setAmbulanceLocation] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [agentStatus, setAgentStatus] = useState('Online');
  const [isPatientOnHold, setIsPatientOnHold] = useState(false);
  const [driverCallState, setDriverCallState] = useState('idle');
  
  // Feedback Toast State
  const [feedbackToast, setFeedbackToast] = useState(null);

  // Missed Call Popup State
  const [missedCallPrompt, setMissedCallPrompt] = useState(null);
  
  // Follow Up Modal State
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleData, setScheduleData] = useState({ date: '', time: '' });

  // Patient Profile Modal State
  const [showProfileModal, setShowProfileModal] = useState(false);

  // AI Triage State
  const [triageNotes, setTriageNotes] = useState('');
  const [triageResult, setTriageResult] = useState(null);

  useEffect(() => {
    connectSocket();
  }, []);
  useEffect(() => {
      if (triageNotes.trim().length === 0) {
          setTriageResult(null);
          return;
      }
      
      const timer = setTimeout(async () => {
          try {
              const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/ai/triage', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                  body: JSON.stringify({ 
                      symptoms: triageNotes, 
                      agentName: localStorage.getItem('name') || 'Agent'
                  })
              });
              const data = await res.json();
              if (data.success) {
                  setTriageResult(data.data);
              }
          } catch (err) {
              console.error('Triage AI error:', err);
          }
      }, 800); // 800ms debounce

      return () => clearTimeout(timer);
  }, [triageNotes]);

  useEffect(() => {
    // Clock in logic
    const agentName = localStorage.getItem('name') || 'Agent Alpha';
    socket.emit('AGENT_CLOCK_IN', {
        agentName: agentName,
        action: 'Clocked In',
        timestamp: new Date().toISOString()
    });
    
    // Set initial status to Online
    socket.emit('UPDATE_AGENT_STATUS', { name: agentName, status: 'Online' });

    socket.on('INCOMING_CALL_RINGING', (data) => {
      setIncomingCall(data);
      setActiveTab('terminal'); // Auto-switch to terminal on call
      setTimeout(() => setIncomingCall(null), 30000); // auto-hide
    });

    socket.on('FEEDBACK_RECEIVED', (data) => {
        setFeedbackToast(data);
        setTimeout(() => setFeedbackToast(null), 5000);
    });

    socket.on('MISSED_CALL_ALERT', (data) => {
        // We could show a toast here, but the instruction is to pop when they finish a call.
    });

    return () => {
      socket.off('INCOMING_CALL_RINGING');
      socket.off('FEEDBACK_RECEIVED');
      socket.off('MISSED_CALL_ALERT');
    };
  }, []);

  // IDLE TRACKING LOGIC (Phase 7 Security)
  useEffect(() => {
    let idleTimer;
    const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
    
    const resetIdleTimer = () => {
        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
            handleIdleStrike();
        }, IDLE_TIMEOUT_MS);
    };

    const handleIdleStrike = async () => {
        const currentStrikes = parseInt(localStorage.getItem('idle_strikes') || '0', 10) + 1;
        localStorage.setItem('idle_strikes', currentStrikes);
        
        console.warn(`[Security] Agent Idle Strike: ${currentStrikes}`);
        
        if (currentStrikes >= 4) {
            // Trigger Admin Alert
            try {
                await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/security/idle-alert', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ 
                        agentName: localStorage.getItem('name') || 'Unknown Agent',
                        strikes: currentStrikes,
                        timestamp: new Date().toISOString()
                    })
                });
                console.error('[Security] 4th idle strike! Admin notified.');
                // Reset counter after alerting
                localStorage.setItem('idle_strikes', '0');
            } catch (err) {
                console.error('Failed to send idle alert to server', err);
            }
        }
    };

    // Attach activity listeners
    window.addEventListener('mousemove', resetIdleTimer);
    window.addEventListener('keydown', resetIdleTimer);
    window.addEventListener('click', resetIdleTimer);
    window.addEventListener('scroll', resetIdleTimer);

    // Initialize first timer
    resetIdleTimer();

    return () => {
        clearTimeout(idleTimer);
        window.removeEventListener('mousemove', resetIdleTimer);
        window.removeEventListener('keydown', resetIdleTimer);
        window.removeEventListener('click', resetIdleTimer);
        window.removeEventListener('scroll', resetIdleTimer);
    };
  }, []);

  const handleUpload = async (e, customerId) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('prescription', file);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}` + `/api/patients/${customerId || 'unknown'}/upload`, { method: 'POST', body: formData });
      const data = await res.json();
      alert(`File shipped to cloud storage! URL: ${data.url}`);
    } catch (err) {
      alert('Upload failed');
    }
  };

  const answerCall = () => {
    setActiveCall(incomingCall);
    setIncomingCall(null);
  };

  const endCall = async () => {
    // Trigger automated feedback system if we have an active caller
    if (activeCall?.callerNumber) {
        try {
            fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/feedback/send-link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify({
                    callId: activeCall.id || Date.now().toString(),
                    patientNumber: activeCall.callerNumber,
                    patientName: activeCall.customerInfo?.full_name || '',
                    agentName: localStorage.getItem('name') || 'Agent'
                })
            });
        } catch (err) {
            console.error('Failed to trigger feedback', err);
        }
    }

    setActiveCall(null);
    // When finishing a call, check for missed calls in the queue
    try {
        const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/calls/next-missed', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        if (data.success && data.data) {
            setMissedCallPrompt(data.data);
        }
    } catch (err) {
        console.error('Failed to fetch next missed call', err);
    }
  };

  const handleScheduleCall = async () => {
      if (!scheduleData.date || !scheduleData.time) return;
      try {
          const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/calls/schedule', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
              body: JSON.stringify({
                  patient_name: activeCall?.customerInfo?.full_name || 'Unknown Patient',
                  phone: activeCall?.callerNumber || 'Unknown',
                  agent_name: localStorage.getItem('name') || 'Agent Alpha',
                  scheduled_time: `${scheduleData.date}T${scheduleData.time}:00Z`
              })
          });
          if (res.ok) {
              alert('Follow-up call scheduled successfully!');
              setShowScheduleModal(false);
          }
      } catch (err) {
          alert('Failed to schedule call');
      }
  };

  const handleStatusChange = (e) => {
      const newStatus = e.target.value;
      setAgentStatus(newStatus);
      const agentName = localStorage.getItem('name') || 'Agent Alpha';
      socket.emit('UPDATE_AGENT_STATUS', { name: agentName, status: newStatus });
  };

  const simulateIncomingCall = () => {
      setIncomingCall({
          id: Date.now().toString(),
          callerNumber: '+91 98765 43210',
          customerInfo: {
              full_name: 'Rahul Kumar',
              huid: 'APL-8823',
              vip_status: true,
              loyalty_tier: 'DIAMOND',
              phone: '+91 98765 43210',
              address: 'A-45, Vasant Vihar, New Delhi',
              last_doctor: 'Dr. Sharma (Cardiology)'
          }
      });
  };

  return (
    <div className="flex flex-col h-full relative z-10 w-full max-w-7xl mx-auto print:h-auto print:block print:overflow-visible">
        {/* Workspace Sub-Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-white/[0.05] pb-4 mb-6 sticky top-0 bg-[#09090b]/90 backdrop-blur-md z-20 overflow-x-auto custom-scrollbar print:hidden">
            <button 
                onClick={() => setActiveTab('terminal')}
                className={`flex-none px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'terminal' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'}`}
            >
                Terminal
            </button>
            <button 
                onClick={() => setActiveTab('operations')}
                className={`flex-none px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'operations' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'}`}
            >
                Appointments
            </button>
            {/* Hidden for now as requested */}
            <button 
                onClick={() => setActiveTab('hotels')}
                className={`hidden flex-none px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'hotels' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'}`}
            >
                Hotels
            </button>
            <button 
                onClick={() => setActiveTab('inbox')}
                className={`flex-none px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'inbox' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'}`}
            >
                Unified Inbox
            </button>
            <button 
                onClick={() => setActiveTab('calls')}
                className={`flex-none px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'calls' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'}`}
            >
                Calls
            </button>
            <button 
                onClick={() => setActiveTab('bookings')}
                className={`flex-none px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'bookings' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'}`}
            >
                Bookings
            </button>
            <button 
                onClick={() => setActiveTab('followups')}
                className={`flex-none px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'followups' ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'}`}
            >
                Follow Ups
            </button>
            <button 
                onClick={() => setActiveTab('leads')}
                className={`flex-none px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'leads' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'}`}
            >
                Leads
            </button>
            <button 
                onClick={() => setActiveTab('whatsapp')}
                className={`flex-none px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'whatsapp' ? 'bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'}`}
            >
                WhatsApp
            </button>
            <div className="flex-1"></div>
            <button 
                onClick={simulateIncomingCall}
                className="flex-none px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all animate-pulse"
            >
                Test Incoming Call
            </button>
        </div>

        {/* Tab Content Areas */}
        <div className="flex-1 min-h-0">
            
            {/* TERMINAL TAB: Call handling and Timeline */}
            {activeTab === 'terminal' && (
                <div className="grid grid-cols-12 gap-6 h-full animate-in fade-in zoom-in-95 duration-300">
                    
                    {/* LEFT COLUMN: Caller Profile & Knowledge Base */}
                    <div className="col-span-3 flex flex-col gap-6 h-full min-h-0">
                        {/* Caller Profile Widget */}
                        <div className="flex-none bg-[#09090b]/80 border border-white/[0.05] rounded-2xl p-5 shadow-[0_10px_30px_-15px_rgba(0,0,0,1)] backdrop-blur-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <svg className="w-16 h-16 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Caller Profile</h3>
                                {isPatientOnHold && <span className="text-[9px] font-black uppercase tracking-widest text-amber-500 bg-amber-500/20 px-2 py-1 rounded-md animate-pulse border border-amber-500/30">PATIENT ON HOLD</span>}
                            </div>
                            {activeCall ? (
                                <div className={`${isPatientOnHold ? 'opacity-50 pointer-events-none grayscale blur-[1px] transition-all duration-500' : 'transition-all duration-500'}`}>
                                    <h4 className="text-xl font-bold text-zinc-100">{activeCall.customerInfo?.full_name || 'Unknown Caller'}</h4>
                                    <p className="text-xs text-zinc-400 font-mono mt-1">{activeCall.callerNumber}</p>
                                    
                                    <div className="mt-4 space-y-3">
                                        <div className="flex justify-between items-center border-b border-white/[0.05] pb-2">
                                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">HUID</span>
                                            <span className="text-xs font-bold text-blue-400 font-mono bg-blue-400/10 px-2 py-0.5 rounded">{activeCall.customerInfo?.huid || 'Unregistered'}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-white/[0.05] pb-2">
                                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Status</span>
                                            <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">Premium Patient</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-white/[0.05] pb-2">
                                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">LTV</span>
                                            <span className="text-xs font-bold text-zinc-300">$1,240.00</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-white/[0.05] pb-2">
                                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Address</span>
                                            <span className="text-xs font-bold text-zinc-300 truncate max-w-[150px]" title={activeCall.customerInfo?.address || 'N/A'}>{activeCall.customerInfo?.address || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-white/[0.05] pb-2">
                                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Last Dr.</span>
                                            <span className="text-xs font-bold text-zinc-300 truncate max-w-[150px]">{activeCall.customerInfo?.last_doctor || 'None'}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-white/[0.05] pb-2">
                                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Next Appt</span>
                                            <span className="text-xs font-bold text-zinc-300">Oct 24, 2:30 PM</span>
                                        </div>
                                    </div>
                                    
                                    <button 
                                        onClick={() => setShowProfileModal(true)}
                                        className="mt-6 w-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
                                    >
                                        Open Full Profile & Vault
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-6 text-zinc-500">
                                    <p className="text-xs font-medium">Waiting for incoming call...</p>
                                </div>
                            )}
                        </div>

                        {/* Knowledge Base */}
                        <div className="flex-1 min-h-0">
                            <KnowledgeBase />
                        </div>
                    </div>

                    {/* MIDDLE COLUMN: Softphone & Quick Actions */}
                    <div className="col-span-4 flex flex-col gap-6 h-full min-h-0 overflow-y-auto custom-scrollbar pr-2 pb-2">
                        <div className="flex-none">
                            <WebRTCDialer />
                        </div>

                        {/* AI Triage Notes Widget */}
                        <div className="flex-none bg-[#09090b]/80 border border-white/[0.05] rounded-2xl p-5 shadow-[0_10px_30px_-15px_rgba(0,0,0,1)] backdrop-blur-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <svg className="w-16 h-16 text-emerald-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                            </div>
                            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                AI Triage Notes 
                                {triageResult?.isEmergency && <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded text-[9px] animate-pulse">EMERGENCY</span>}
                            </h3>
                            <textarea 
                                value={triageNotes}
                                onChange={(e) => setTriageNotes(e.target.value)}
                                placeholder="Type patient symptoms here... (e.g. severe chest pain, fractured arm)"
                                className="w-full h-24 bg-zinc-950/50 border border-white/5 rounded-xl p-3 text-sm text-zinc-300 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all resize-none placeholder:text-zinc-700"
                            />
                            {triageResult && (
                                <div className="mt-3 flex items-center justify-between bg-zinc-900/80 p-3 rounded-xl border border-white/5">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Suggested Dept</span>
                                        <span className="text-sm font-semibold text-zinc-200">{triageResult.department}</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Priority</span>
                                        <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded mt-1 ${
                                            triageResult.priority === 'RED' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 
                                            triageResult.priority === 'YELLOW' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 
                                            'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                        }`}>
                                            {triageResult.priority}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {/* Quick Actions Panel */}
                        <div className="flex-none bg-[#09090b]/80 border border-white/[0.05] rounded-2xl p-5 shadow-[0_10px_30px_-15px_rgba(0,0,0,1)] backdrop-blur-xl relative overflow-hidden">
                            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Quick Actions</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <button 
                                    onClick={() => setShowTransferModal(true)}
                                    className="bg-zinc-900/80 hover:bg-zinc-800 border border-white/[0.05] text-zinc-300 hover:text-emerald-400 py-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex flex-col items-center gap-2 shadow-[0_6px_0_rgba(9,9,11,1)] active:shadow-none active:translate-y-1.5"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                                    Transfer Call
                                </button>
                                <button 
                                    onClick={() => setShowScheduleModal(true)}
                                    className="bg-zinc-900/80 hover:bg-zinc-800 border border-white/[0.05] text-zinc-300 hover:text-blue-400 py-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex flex-col items-center gap-2 shadow-[0_6px_0_rgba(9,9,11,1)] active:shadow-none active:translate-y-1.5"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    Schedule Follow-Up
                                </button>
                                <button 
                                    onClick={() => setIsMuted(!isMuted)}
                                    className={`py-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex flex-col items-center gap-2 shadow-[0_6px_0_rgba(9,9,11,1)] active:shadow-none active:translate-y-1.5 ${isMuted ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-zinc-900/80 hover:bg-zinc-800 border border-white/[0.05] text-zinc-300 hover:text-purple-400'}`}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                                    {isMuted ? 'Unmute Line' : 'Mute Line'}
                                </button>
                                <button 
                                    onClick={() => setShowNoteModal(true)}
                                    className="bg-zinc-900/80 hover:bg-zinc-800 border border-white/[0.05] text-zinc-300 hover:text-yellow-400 py-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex flex-col items-center gap-2 shadow-[0_6px_0_rgba(9,9,11,1)] active:shadow-none active:translate-y-1.5"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                                    Add Note
                                </button>
                                <button 
                                    onClick={endCall}
                                    className="col-span-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 py-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex flex-col items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" /></svg>
                                    End Call
                                </button>
                            </div>
                            <button 
                                onClick={() => {
                                    setAmbulanceLocation(activeCall?.customerInfo?.address || '');
                                    setShowAmbulanceModal(true);
                                }}
                                className="w-full mt-4 bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] py-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all flex justify-center items-center gap-3 animate-pulse hover:animate-none transform hover:-translate-y-1"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                                Dispatch Ambulance
                            </button>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: AI Suggest & Timeline */}
                    <div className="col-span-5 flex flex-col gap-6 h-full min-h-0">
                        {/* Dynamic Billing Estimator (Hidden for now as requested) */}
                        <div className="hidden flex-none">
                            <BillingEstimator activeCall={activeCall} />
                        </div>

                        <div className="flex-[0.5] min-h-0">
                            <AiSuggest activeCall={activeCall} />
                        </div>
                        
                        <div className="flex-[0.5] min-h-0">
                            <InteractionTimeline activeCall={activeCall} />
                        </div>
                    </div>
                </div>
            )}

            {/* OPERATIONS TAB: Appointment Booking */}
            {activeTab === 'operations' && (
                <div className="flex gap-6 h-[calc(100vh-200px)] animate-in fade-in zoom-in-95 duration-300 print:h-auto print:block print:overflow-visible">
                    <div className="flex-1 h-full print:h-auto print:block print:overflow-visible">
                        <AppointmentBooking activeCall={activeCall} />
                    </div>
                </div>
            )}

            {/* HOTELS TAB: Hotel Booking */}
            {activeTab === 'hotels' && (
                <div className="flex gap-6 h-[calc(100vh-200px)] animate-in fade-in zoom-in-95 duration-300 print:h-auto print:block print:overflow-visible">
                    <div className="flex-1 h-full print:h-auto print:block print:overflow-visible">
                        <HotelBooking activeCall={activeCall} />
                    </div>
                </div>
            )}

            {/* INBOX TAB: Full Screen Chat */}
            {activeTab === 'inbox' && (
                <div className="h-[calc(100vh-200px)] animate-in fade-in zoom-in-95 duration-300">
                    <UnifiedInbox customerPhone={activeCall ? activeCall.callerNumber : null} />
                </div>
            )}

            {/* CALLS TAB: Agent Call History */}
            {activeTab === 'calls' && (
                <div className="h-[calc(100vh-200px)] animate-in fade-in zoom-in-95 duration-300">
                    <CallHistory />
                </div>
            )}

            {/* BOOKINGS TAB: Booking Logs */}
            {activeTab === 'bookings' && (
                <div className="h-[calc(100vh-200px)] animate-in fade-in zoom-in-95 duration-300">
                    <BookingLogs />
                </div>
            )}

            {/* FOLLOW UPS TAB: Agent Scheduled Followups */}
            {activeTab === 'followups' && (
                <div className="h-[calc(100vh-200px)] animate-in fade-in zoom-in-95 duration-300">
                    <FollowUps />
                </div>
            )}

            {/* LEADS TAB: Agent Leads Pipeline */}
            {activeTab === 'leads' && (
                <div className="h-[calc(100vh-200px)] animate-in fade-in zoom-in-95 duration-300">
                    <AgentLeads />
                </div>
            )}

            {/* WHATSAPP TAB: Agent Whatsapp Dashboard */}
            {activeTab === 'whatsapp' && (
                <div className="h-[calc(100vh-200px)] animate-in fade-in zoom-in-95 duration-300">
                    <WhatsappDashboard />
                </div>
            )}

        </div>

        {/* Enhanced Screen Pop Modal */}
        {incomingCall && (
            <>
            {/* High-end dramatic backdrop */}
            <div className="fixed inset-0 bg-black/85 backdrop-blur-2xl z-40 animate-in fade-in duration-500 flex items-center justify-center">
                {/* Radial animated glow behind the modal */}
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[120px] animate-pulse pointer-events-none ${incomingCall.customerInfo?.vip_status ? 'bg-amber-500/20' : 'bg-emerald-500/20'}`}></div>
            </div>

            <div className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-[#050505]/95 border p-8 rounded-[2rem] shadow-[0_0_100px_rgba(0,0,0,0.8),inset_0_0_30px_rgba(255,255,255,0.02)] backdrop-blur-3xl w-[600px] animate-in zoom-in-75 fade-in duration-500 overflow-hidden group ${incomingCall.customerInfo?.vip_status ? 'border-amber-500/30' : 'border-emerald-500/30'}`}>
                {/* Rotating scanner beam effect */}
                <div className={`absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,rgba(255,255,255,0.05)_360deg)] animate-[spin_4s_linear_infinite] pointer-events-none opacity-50`}></div>
                
                {/* Content Container */}
                <div className="relative z-10">
                    {/* Header: EKG & VIP Tag */}
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-3 w-3">
                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${incomingCall.customerInfo?.vip_status ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
                                <span className={`relative inline-flex rounded-full h-3 w-3 ${incomingCall.customerInfo?.vip_status ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                            </span>
                            <p className={`text-[10px] uppercase tracking-[0.3em] font-black animate-pulse ${incomingCall.customerInfo?.vip_status ? 'text-amber-400' : 'text-emerald-400'}`}>
                                Incoming Transmission
                            </p>
                        </div>
                        {incomingCall.customerInfo?.vip_status && (
                            <div className="bg-amber-500/10 border border-amber-500/50 px-3 py-1 rounded-full flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-pulse">
                                <svg className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">{incomingCall.customerInfo?.loyalty_tier || 'VIP'} TIER</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-6 mb-8">
                        {/* Avatar */}
                        <div className={`relative w-20 h-20 rounded-2xl flex items-center justify-center border shadow-2xl ${incomingCall.customerInfo?.vip_status ? 'bg-amber-500/10 border-amber-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
                            <span className="text-3xl font-black text-white/50">{incomingCall.customerInfo?.full_name?.charAt(0) || '?'}</span>
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-400 tracking-tight">{incomingCall.customerInfo?.full_name || 'Unknown Entity'}</h3>
                            <p className="text-sm text-zinc-400 font-mono mt-1">{incomingCall.callerNumber}</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        {/* Vital Stats Panel */}
                        <div className="bg-zinc-900/50 p-5 rounded-2xl border border-white/5 shadow-inner">
                            <h4 className="text-[10px] text-zinc-500 uppercase tracking-widest font-black mb-4 border-b border-white/5 pb-2">Patient Demographics</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Age / Gender</span> 
                                    <span className="text-xs font-bold text-zinc-200">{incomingCall.customerInfo?.age || '--'} YRS / {incomingCall.customerInfo?.gender?.toUpperCase() || 'U'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Entity Type</span> 
                                    <span className="text-xs font-black text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded uppercase">{incomingCall.customerInfo?.entity_type?.replace('_', ' ') || 'STANDARD'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Last Visit</span> 
                                    <span className="text-xs font-bold text-zinc-200">{incomingCall.customerInfo?.last_visit ? new Date(incomingCall.customerInfo.last_visit).toLocaleDateString() : 'First Time'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Medical Profile Panel */}
                        <div className="bg-zinc-900/50 p-5 rounded-2xl border border-white/5 shadow-inner">
                            <h4 className="text-[10px] text-zinc-500 uppercase tracking-widest font-black mb-4 border-b border-white/5 pb-2">Clinical Profile</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Condition</span> 
                                    <span className="text-[10px] font-black text-red-400 bg-red-400/10 px-2 py-0.5 rounded border border-red-500/20">{incomingCall.customerInfo?.primary_condition || 'Undiagnosed'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Specialist</span> 
                                    <span className="text-xs font-bold text-zinc-200">{incomingCall.customerInfo?.assigned_specialist || 'Unassigned'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Balance</span> 
                                    <span className="text-xs font-mono font-bold text-zinc-300">{incomingCall.customerInfo?.outstanding_balance || '$0.00'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-8">
                        <label className={`flex items-center justify-center w-full p-4 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 group bg-[#050505]/50 ${incomingCall.customerInfo?.vip_status ? 'border-amber-500/20 hover:border-amber-500/50 hover:bg-amber-500/10' : 'border-zinc-800 hover:border-emerald-500/50 hover:bg-emerald-500/10'}`}>
                            <span className="text-xs text-zinc-400 font-bold transition-colors flex items-center gap-2 uppercase tracking-widest">
                                <svg className={`w-4 h-4 ${incomingCall.customerInfo?.vip_status ? 'text-amber-500 group-hover:text-amber-400' : 'text-emerald-500 group-hover:text-emerald-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
                                Upload Lab Results / Scans
                            </span>
                            <input type="file" className="hidden" onChange={(e) => handleUpload(e, incomingCall.customerInfo?.id)} />
                        </label>
                    </div>
                    
                    <div className="flex gap-4 relative z-10">
                        <button className={`flex-[1.5] py-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all transform hover:-translate-y-1 active:translate-y-0 text-zinc-950 ${incomingCall.customerInfo?.vip_status ? 'bg-amber-500 hover:bg-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.3)]' : 'bg-emerald-500 hover:bg-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)]'}`} onClick={answerCall}>Engage Comm</button>
                        <button 
                            className="flex-1 bg-zinc-900 hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/30 text-zinc-400 border border-white/5 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all transform hover:-translate-y-1 active:translate-y-0" 
                            onClick={() => {
                                socket.emit('EMERGENCY_ESCALATION', {
                                    agentName: localStorage.getItem('name') || 'Agent',
                                    department: 'Manager / Shift Supervisor',
                                    symptoms: 'MANUAL OVERRIDE: Priority Escalation to Admin required immediately for patient ' + (incomingCall?.customerInfo?.full_name || 'Unknown'),
                                    patientProfile: incomingCall?.customerInfo || null
                                });
                                setIncomingCall(null);
                            }}
                        >
                            Escalate Admin
                        </button>
                        <button className="flex-1 bg-zinc-900 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 text-zinc-400 border border-white/5 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all transform hover:-translate-y-1 active:translate-y-0" onClick={() => setIncomingCall(null)}>Disconnect</button>
                    </div>
                </div>
            </div>
            </>
        )}
        
        {/* Transfer Call Modal */}
        {showTransferModal && (
            <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 animate-in fade-in duration-300" onClick={() => setShowTransferModal(false)}></div>
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-[#09090b] border border-white/10 p-8 rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,1)] w-[500px] animate-in zoom-in-95 duration-300">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-black text-zinc-100 tracking-tight">Transfer Call</h3>
                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Select Destination</p>
                    </div>
                    <button onClick={() => setShowTransferModal(false)} className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Admin / Manager Transfer */}
                    <div 
                        onClick={() => {
                            socket.emit('EMERGENCY_ESCALATION', {
                                agentName: localStorage.getItem('name') || 'Agent',
                                department: 'Manager / Shift Supervisor',
                                symptoms: 'MANUAL OVERRIDE: Priority Escalation to Admin required immediately for patient ' + (activeCall?.customerInfo?.full_name || 'Unknown'),
                                patientProfile: activeCall?.customerInfo || null
                            });
                            setShowTransferModal(false);
                            setActiveCall(null);
                        }}
                        className="cursor-pointer bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20 rounded-2xl p-4 flex items-center gap-4 hover:border-amber-500/50 hover:bg-amber-500/20 transition-all group"
                    >
                        <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        </div>
                        <div>
                            <h4 className="text-amber-400 font-bold flex items-center gap-2 text-sm">Escalate to Manager / Admin <span className="text-[9px] bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-300">PRIORITY</span></h4>
                            <p className="text-xs text-amber-500/70 font-medium">Bypass queue, direct transfer to shift supervisor.</p>
                        </div>
                        <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                        </div>
                    </div>

                    <div className="h-px w-full bg-white/[0.05] my-4"></div>

                    {/* Agent Transfers */}
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Available Agents</p>
                    
                    {[
                        { name: 'Sarah Jenkins', dept: 'Cardiology', status: 'Available' },
                        { name: 'David Chen', dept: 'Neurology', status: 'In Call' }
                    ].map((agent, i) => (
                        <div 
                            key={i}
                            onClick={() => {
                                if (agent.status === 'Available') {
                                    alert(`Call transferred to ${agent.name}`);
                                    setShowTransferModal(false);
                                    setActiveCall(null);
                                }
                            }}
                            className={`rounded-2xl p-4 flex items-center gap-4 border transition-all ${agent.status === 'Available' ? 'cursor-pointer bg-zinc-900/50 border-white/[0.05] hover:border-emerald-500/30 hover:bg-zinc-800 group' : 'opacity-50 cursor-not-allowed border-transparent bg-zinc-900/30'}`}
                        >
                            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">
                                {agent.name.charAt(0)}
                            </div>
                            <div>
                                <h4 className="text-zinc-200 font-bold text-sm">{agent.name}</h4>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">{agent.dept}</p>
                            </div>
                            <div className="ml-auto flex items-center gap-2">
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${agent.status === 'Available' ? 'text-emerald-400' : 'text-red-400'}`}>{agent.status}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            </>
        )}

        {/* Add Note Modal */}
        {showNoteModal && (
            <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 animate-in fade-in duration-300" onClick={() => setShowNoteModal(false)}></div>
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-[#09090b] border border-white/10 p-8 rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,1)] w-[500px] animate-in zoom-in-95 duration-300">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-black text-zinc-100 tracking-tight flex items-center gap-2">
                            <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                            Add Note
                        </h3>
                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Attach to Patient Profile</p>
                    </div>
                    <button onClick={() => setShowNoteModal(false)} className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="space-y-4">
                    <textarea 
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Type your interaction notes here..."
                        className="w-full bg-[#050505] text-zinc-100 rounded-2xl p-4 border border-white/5 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] transition-all duration-300 focus:outline-none focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/10 min-h-[150px] resize-none"
                    ></textarea>

                    <button 
                        onClick={() => {
                            if (!noteText.trim()) return;
                            alert('Note saved to profile!');
                            setNoteText('');
                            setShowNoteModal(false);
                        }}
                        disabled={!noteText.trim()}
                        className="w-full bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-black py-4 rounded-xl text-sm uppercase tracking-widest transition-all shadow-[0_6px_0_rgba(161,98,7,1)] active:shadow-none active:translate-y-1.5 disabled:opacity-50 disabled:pointer-events-none"
                    >
                        Save Note
                    </button>
                </div>
            </div>
            </>
        )}

        <PatientProfileModal 
            show={showProfileModal} 
            onClose={() => setShowProfileModal(false)} 
            customerInfo={activeCall?.customerInfo}
        />

        {/* Real-time Feedback Toast */}
        {feedbackToast && (
            <div className="fixed bottom-6 right-6 z-50 bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl shadow-[0_10px_30px_rgba(16,185,129,0.2)] backdrop-blur-md animate-in slide-in-from-bottom-5 fade-in duration-300 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
                </div>
                <div>
                    <h4 className="text-emerald-400 font-bold text-sm">New 5-Star Feedback!</h4>
                    <p className="text-xs text-zinc-400">Patient <span className="font-mono text-zinc-300">{feedbackToast.patientNumber}</span> gave you {feedbackToast.rating} stars.</p>
                </div>
            </div>
        )}

        {/* Schedule Follow-up Modal */}
        {showScheduleModal && (
            <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 animate-in fade-in duration-300" onClick={() => setShowScheduleModal(false)}></div>
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-[#09090b] border border-white/10 p-8 rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,1)] w-[400px] animate-in zoom-in-95 duration-300">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-black text-zinc-100 tracking-tight">Schedule Callback</h3>
                    </div>
                    <button onClick={() => setShowScheduleModal(false)} className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-2">Date</label>
                        <input type="date" className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500" value={scheduleData.date} onChange={e => setScheduleData({...scheduleData, date: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-2">Time (UTC)</label>
                        <input type="time" className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500" value={scheduleData.time} onChange={e => setScheduleData({...scheduleData, time: e.target.value})} />
                    </div>
                    <button onClick={handleScheduleCall} className="w-full bg-blue-500 hover:bg-blue-400 text-zinc-950 font-black py-4 rounded-xl text-sm uppercase tracking-widest transition-all shadow-[0_6px_0_rgba(29,78,216,1)] active:shadow-none active:translate-y-1.5 mt-4">
                        Confirm Schedule
                    </button>
                </div>
            </div>
            </>
        )}

        {/* Ambulance Dispatch Modal */}
        {showAmbulanceModal && (
            <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 animate-in fade-in duration-300" onClick={() => setShowAmbulanceModal(false)}></div>
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-[#09090b] border border-red-500/30 p-8 rounded-3xl shadow-[0_0_50px_rgba(220,38,38,0.15)] w-[500px] animate-in zoom-in-95 duration-300">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 border border-red-500/30 animate-pulse">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-red-400 tracking-tight">Emergency Dispatch</h3>
                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Book Ambulance</p>
                        </div>
                    </div>
                    <button onClick={() => setShowAmbulanceModal(false)} className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {driverCallState === 'idle' && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Pickup Location</label>
                            <textarea 
                                rows="2"
                                value={ambulanceLocation}
                                onChange={(e) => setAmbulanceLocation(e.target.value)}
                                placeholder="Enter exact address or landmark..."
                                className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all resize-none"
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Select 3rd-Party Driver</label>
                            <select 
                                value={selectedDriver}
                                onChange={(e) => setSelectedDriver(e.target.value)}
                                className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all appearance-none"
                            >
                                <option value="" disabled>-- Choose Available Driver --</option>
                                <option value="Rajesh Kumar (Apollo 1)">Rajesh Kumar (Apollo 1) - 2 mins away</option>
                                <option value="Suresh Singh (Apollo 4)">Suresh Singh (Apollo 4) - 5 mins away</option>
                                <option value="Amit Patel (Apollo 2)">Amit Patel (Apollo 2) - 8 mins away</option>
                            </select>
                        </div>

                        <button 
                            onClick={() => {
                                if (!ambulanceLocation || !selectedDriver) {
                                    alert('Please provide location and select a driver.');
                                    return;
                                }
                                setIsPatientOnHold(true);
                                setDriverCallState('calling');
                                setTimeout(() => setDriverCallState('connected'), 2500);
                            }}
                            className="w-full mt-4 bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-xl uppercase tracking-[0.1em] shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all hover:-translate-y-1"
                        >
                            Hold Patient & Call Driver
                        </button>
                    </div>
                )}

                {driverCallState === 'calling' && (
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center border-4 border-yellow-500/30 border-t-yellow-500 animate-spin mb-6"></div>
                        <h3 className="text-xl font-bold text-yellow-400 tracking-tight animate-pulse mb-2">Calling Driver...</h3>
                        <p className="text-zinc-400 text-sm">Putting {activeCall?.customerInfo?.full_name || 'Patient'} on hold.</p>
                    </div>
                )}

                {driverCallState === 'connected' && (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                        <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 border-2 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)] mb-6 animate-pulse">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                        </div>
                        <h3 className="text-2xl font-black text-emerald-400 tracking-tight mb-2">Connected to {selectedDriver}</h3>
                        <p className="text-zinc-400 text-sm mb-6">Read out the pickup location:</p>
                        <div className="bg-zinc-900 border border-white/5 p-4 rounded-xl w-full mb-8">
                            <p className="text-sm font-bold text-zinc-200">{ambulanceLocation}</p>
                        </div>

                        <button 
                            onClick={() => {
                                setDriverCallState('idle');
                                setIsPatientOnHold(false);
                                setShowAmbulanceModal(false);
                            }}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl uppercase tracking-[0.1em] shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all hover:-translate-y-1"
                        >
                            End Driver Call & Resume Patient
                        </button>
                    </div>
                )}
            </div>
            </>
        )}

        {/* Missed Call Prompt Modal */}
        {missedCallPrompt && (
            <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 animate-in fade-in duration-300"></div>
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-[#09090b] border border-orange-500/30 p-8 rounded-3xl shadow-[0_0_50px_rgba(249,115,22,0.2)] w-[450px] animate-in zoom-in-95 duration-300">
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 mb-6 shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7h6m-3-3v6" /></svg>
                    </div>
                    <h3 className="text-2xl font-black text-white tracking-tight mb-2">Missed Call Alert</h3>
                    <p className="text-zinc-400 text-sm mb-8">A caller was placed in the queue while you were busy. Please return their call immediately.</p>
                    
                    <div className="bg-zinc-900/80 w-full p-4 rounded-xl border border-white/5 mb-8">
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Callback Number</p>
                        <p className="text-xl font-mono font-bold text-zinc-200">{missedCallPrompt.phone}</p>
                    </div>

                    <div className="flex gap-4 w-full">
                        <button onClick={() => {
                            // Dial logic here
                            alert(`Dialing ${missedCallPrompt.phone}...`);
                            setMissedCallPrompt(null);
                        }} className="flex-1 bg-orange-500 hover:bg-orange-400 text-zinc-950 font-black py-4 rounded-xl text-sm uppercase tracking-widest transition-all shadow-[0_6px_0_rgba(194,65,12,1)] active:shadow-none active:translate-y-1.5">
                            Dial Now
                        </button>
                        <button onClick={() => setMissedCallPrompt(null)} className="px-6 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-white/5 py-4 rounded-xl text-sm font-black uppercase tracking-widest transition-all">
                            Skip
                        </button>
                    </div>
                </div>
            </div>
            </>
        )}

        {/* Floating Help Button */}
        <button 
            onClick={() => alert("UNIVERSAL WORKSPACE HELP\n\n1. Active Call: Take calls in the Terminal tab. Mute, transfer, or end calls using the big buttons.\n2. Screen Pop: When a call connects, caller details pop up automatically. Click 'Accept' to view their full profile.\n3. Missed Calls: When you finish an active call, the system will automatically prompt you if there's a caller waiting in the queue.\n4. WhatsApp Center: Use the WhatsApp tab to view automated messages. In the Leads tab, click the Document icon to send Medical Bills directly via WhatsApp.\n5. Follow Ups: Scheduled callbacks appear in the Follow Ups tab. Click 'Resolve' once you complete them.\n6. Status: Keep your status updated (Online/Break) using the dropdown in the top right to control call routing.")}
            className="fixed bottom-6 right-6 w-14 h-14 bg-zinc-800 border border-white/10 rounded-full flex items-center justify-center text-zinc-400 opacity-50 hover:opacity-100 hover:bg-zinc-700 hover:text-white transition-all shadow-lg z-50 group"
            title="Help & Information"
        >
            <span className="font-bold text-xl">?</span>
            <span className="absolute right-16 bg-zinc-900 border border-white/10 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity">
                How things work
            </span>
        </button>
    </div>
  );
}
