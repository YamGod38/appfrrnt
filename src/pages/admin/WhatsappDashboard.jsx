import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, CheckCircle2, Clock, Activity, FileText, Bot, Search, User, Users, Plus } from 'lucide-react';

export default function WhatsappDashboard() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Sandbox state
    const [sendPhone, setSendPhone] = useState('');
    const [template, setTemplate] = useState('medical_bill_v1');
    const [isSending, setIsSending] = useState(false);

    // Patient Profile / HUID Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [patient, setPatient] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [activeTab, setActiveTab] = useState('sandbox'); // 'sandbox' | 'profile'
    
    // Family Member Modal state
    const [showFamilyModal, setShowFamilyModal] = useState(false);
    const [newFamName, setNewFamName] = useState('');
    const [newFamRelation, setNewFamRelation] = useState('');
    const [newFamAge, setNewFamAge] = useState('');

    const fetchLogs = async () => {
        try {
            const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/whatsapp/logs');
            const data = await res.json();
            if (data.success) {
                setLogs(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch WhatsApp logs', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const handleSearch = async () => {
        if (!searchQuery) return;
        setIsSearching(true);
        try {
            const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + `/api/patients/search?query=${encodeURIComponent(searchQuery)}`);
            const data = await res.json();
            if (data.success) {
                setPatient(data.data);
                setSendPhone(data.data.phone); // auto-fill sandbox phone
                setActiveTab('profile');
            } else {
                alert('Patient not found with that HUID or Phone.');
                setPatient(null);
            }
        } catch (err) {
            alert('Error searching patient.');
        } finally {
            setIsSearching(false);
        }
    };

    const handleAddFamily = async (e) => {
        e.preventDefault();
        if (!patient) return;
        try {
            const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + `/api/patients/${patient.huid}/family`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newFamName, relation: newFamRelation, age: parseInt(newFamAge) || 0 })
            });
            const data = await res.json();
            if (data.success) {
                setPatient(prev => ({ ...prev, family_members: [...prev.family_members, data.data] }));
                setShowFamilyModal(false);
                setNewFamName('');
                setNewFamRelation('');
                setNewFamAge('');
            } else {
                alert('Failed to add family member');
            }
        } catch (err) {
            alert('Error adding family member');
        }
    };

    const handleSendTest = async (overrideUrl = null, overrideType = null) => {
        if (!sendPhone) return alert('Enter a phone number');
        setIsSending(true);
        try {
            const typeMap = {
                'medical_bill_v1': 'BILL',
                'hotel_booking_conf': 'HOTEL',
                'appointment_reminder': 'DOCTOR'
            };
            
            const payload = {
                type: overrideType || (typeMap[template] || 'BILL'),
                phone: sendPhone,
                data: { name: patient ? patient.name : 'Sandbox Test', amount: '0.00', description: 'Test Message' }
            };
            if (overrideUrl) payload.fileUrl = overrideUrl;

            const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/whatsapp/send-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            if (res.ok) {
                alert(overrideUrl ? 'File sent successfully!' : 'Test message sent successfully!');
                fetchLogs();
            }
        } catch (err) {
            alert('Failed to send message');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 relative">
            <div className="flex justify-between items-end relative z-10">
                <div>
                    <h1 className="text-3xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500 flex items-center gap-3 tracking-tight">
                        <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-green-400" />
                        </div>
                        WhatsApp Center
                    </h1>
                    <p className="text-zinc-400 font-medium">Monitor automated messaging, manage patient profiles (HUID), and send reports.</p>
                </div>
                <div className="flex gap-2 bg-zinc-900 border border-white/5 rounded-xl p-1 h-12">
                    <input 
                        type="text" 
                        placeholder="Search HUID or Phone..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        className="bg-transparent text-white px-4 outline-none text-sm w-56 placeholder:text-zinc-600"
                    />
                    <button 
                        onClick={handleSearch}
                        className="bg-green-500 text-zinc-950 font-bold px-4 rounded-lg text-sm hover:bg-green-400 transition-colors flex items-center gap-2"
                    >
                        {isSearching ? <div className="w-4 h-4 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin"></div> : <Search className="w-4 h-4" />}
                        Search
                    </button>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-4 gap-6">
                {[
                    { label: 'Total Messages', value: '1,284', icon: MessageSquare, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                    { label: 'Delivery Rate', value: '99.8%', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                    { label: 'Avg Response Time', value: '< 2m', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10' },
                    { label: 'Feedback Avg', value: '4.9/5', icon: Activity, color: 'text-purple-400', bg: 'bg-purple-400/10' }
                ].map((metric, i) => (
                    <div key={i} className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <metric.icon className={`w-16 h-16 ${metric.color}`} />
                        </div>
                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">{metric.label}</p>
                        <h3 className="text-3xl font-black text-white tracking-tight">{metric.value}</h3>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* Activity Log Table */}
                <div className="col-span-8 bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden flex flex-col min-h-[500px]">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-zinc-400" />
                            Recent Activity Log
                        </h2>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                        {loading ? (
                            <div className="h-full flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/5 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                                        <th className="pb-4 font-medium">Type</th>
                                        <th className="pb-4 font-medium">Recipient</th>
                                        <th className="pb-4 font-medium">Template / Msg</th>
                                        <th className="pb-4 font-medium">Time</th>
                                        <th className="pb-4 font-medium text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((log) => (
                                        <tr key={log.id} className="border-b border-white/[0.02] hover:bg-zinc-800/30 transition-colors">
                                            <td className="py-4">
                                                <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
                                                    log.type === 'BILL' ? 'bg-amber-500/10 text-amber-400' :
                                                    log.type === 'HOTEL' ? 'bg-blue-500/10 text-blue-400' :
                                                    log.type === 'FEEDBACK' ? 'bg-purple-500/10 text-purple-400' :
                                                    'bg-zinc-500/10 text-zinc-400'
                                                }`}>
                                                    {log.type}
                                                </span>
                                            </td>
                                            <td className="py-4 text-sm font-mono text-zinc-300">{log.phone}</td>
                                            <td className="py-4 text-sm text-zinc-400 max-w-[200px] truncate" title={log.message || log.template}>
                                                {log.message ? `"${log.message}"` : log.template}
                                            </td>
                                            <td className="py-4 text-xs font-mono text-zinc-500">
                                                {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </td>
                                            <td className="py-4 text-right">
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
                                                    log.status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-400' :
                                                    log.status === 'Read' ? 'bg-blue-500/10 text-blue-400' :
                                                    log.status === 'Received' ? 'bg-purple-500/10 text-purple-400' :
                                                    'bg-zinc-500/10 text-zinc-400'
                                                }`}>
                                                    {log.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {logs.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="py-8 text-center text-zinc-500 text-sm">No recent activity</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Right Panel: Tabs for Sandbox / Profile */}
                <div className="col-span-4 flex flex-col h-[500px]">
                    <div className="flex gap-2 mb-4">
                        <button 
                            onClick={() => setActiveTab('sandbox')}
                            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'sandbox' ? 'bg-green-500 text-zinc-950 shadow-[0_4px_0_rgba(21,128,61,1)]' : 'bg-zinc-900/50 text-zinc-400 border border-white/5 hover:text-white'}`}
                        >
                            Sandbox
                        </button>
                        <button 
                            onClick={() => setActiveTab('profile')}
                            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'profile' ? 'bg-blue-500 text-white shadow-[0_4px_0_rgba(29,78,216,1)]' : 'bg-zinc-900/50 text-zinc-400 border border-white/5 hover:text-white'}`}
                        >
                            Patient Profile
                        </button>
                    </div>

                    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 flex-1 flex flex-col relative overflow-hidden">
                        
                        {activeTab === 'sandbox' && (
                            <>
                                <div className="absolute -bottom-10 -right-10 opacity-5 pointer-events-none">
                                    <Bot className="w-64 h-64 text-green-500" />
                                </div>
                                <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2 mb-6 relative z-10">
                                    <Send className="w-5 h-5 text-green-400" /> Message Sandbox
                                </h2>
                                <div className="space-y-5 flex-1 relative z-10">
                                    <div>
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-2">Recipient Phone</label>
                                        <input 
                                            type="text"
                                            placeholder="+1 (555) 000-0000"
                                            value={sendPhone}
                                            onChange={e => setSendPhone(e.target.value)}
                                            className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-green-500/50 font-mono text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-2">Message Template</label>
                                        <select 
                                            value={template}
                                            onChange={e => setTemplate(e.target.value)}
                                            className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-zinc-300 focus:outline-none focus:border-green-500/50 text-sm"
                                        >
                                            <option value="medical_bill_v1">Medical Bill Notice (v1)</option>
                                            <option value="appointment_reminder">Appointment Reminder</option>
                                            <option value="hotel_booking_conf">Hotel Booking Confirmation</option>
                                        </select>
                                    </div>
                                    <div className="bg-zinc-950/50 border border-white/5 p-4 rounded-xl">
                                        <p className="text-xs text-zinc-400 mb-2 font-bold uppercase tracking-widest">Preview:</p>
                                        <div className="text-sm text-zinc-300 space-y-2">
                                            <p>Hi [{patient ? patient.name : 'Patient Name'}],</p>
                                            {template === 'medical_bill_v1' && <p>Your recent medical bill of [Amount] is ready. Please find the attached PDF for details.</p>}
                                            {template === 'appointment_reminder' && <p>This is a reminder for your upcoming appointment. Please bring your ID.</p>}
                                            {template === 'hotel_booking_conf' && <p>Your hotel booking slip is attached.</p>}
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleSendTest()}
                                    disabled={isSending}
                                    className="mt-6 w-full bg-green-500 hover:bg-green-400 text-zinc-950 font-black py-4 rounded-xl text-sm uppercase tracking-widest transition-all shadow-[0_6px_0_rgba(21,128,61,1)] active:shadow-none active:translate-y-1.5 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isSending ? 'Sending...' : 'Send Test Message'}
                                </button>
                            </>
                        )}

                        {activeTab === 'profile' && !patient && (
                            <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 gap-3 text-center">
                                <Search className="w-12 h-12 opacity-20" />
                                <p>Search a patient's HUID or phone number in the top bar to view their profile.</p>
                            </div>
                        )}

                        {activeTab === 'profile' && patient && (
                            <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar -mr-4 pr-4">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center font-bold text-xl">
                                        {patient.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">{patient.name}</h3>
                                        <p className="text-xs text-zinc-400 font-mono">{patient.phone} • {patient.huid}</p>
                                    </div>
                                </div>

                                {/* Family Members */}
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                            <Users className="w-4 h-4" /> Family Under HUID
                                        </label>
                                        <button onClick={() => setShowFamilyModal(true)} className="text-[10px] bg-zinc-800 text-white px-2 py-1 rounded hover:bg-zinc-700">+ Add</button>
                                    </div>
                                    <div className="space-y-2">
                                        {patient.family_members && patient.family_members.length > 0 ? patient.family_members.map(fam => (
                                            <div key={fam.id} className="bg-zinc-950 border border-white/5 p-3 rounded-xl flex justify-between items-center">
                                                <div>
                                                    <p className="text-sm font-bold text-zinc-200">{fam.name}</p>
                                                    <p className="text-[10px] text-zinc-500">{fam.relation} • {fam.age} yrs</p>
                                                </div>
                                                <User className="w-4 h-4 text-zinc-600" />
                                            </div>
                                        )) : <p className="text-xs text-zinc-500">No family members linked.</p>}
                                    </div>
                                </div>

                                {/* Files / Prescriptions */}
                                <div>
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 mb-3">
                                        <FileText className="w-4 h-4" /> Attached Files (Bills/Reports)
                                    </label>
                                    <div className="space-y-2">
                                        {patient.prescription_urls && patient.prescription_urls.length > 0 ? patient.prescription_urls.map((url, idx) => (
                                            <div key={idx} className="bg-zinc-950 border border-white/5 p-3 rounded-xl flex justify-between items-center gap-2">
                                                <a href={url} target="_blank" rel="noreferrer" className="text-sm font-bold text-blue-400 hover:underline truncate flex-1">
                                                    File_{idx+1}.pdf
                                                </a>
                                                <button 
                                                    onClick={() => handleSendTest(url, 'BILL')}
                                                    className="bg-green-500/20 text-green-400 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-500 hover:text-zinc-950 transition-colors whitespace-nowrap"
                                                >
                                                    WA Send
                                                </button>
                                            </div>
                                        )) : <p className="text-xs text-zinc-500">No files found.</p>}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Family Member Modal */}
            {showFamilyModal && (
                <>
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-40" onClick={() => setShowFamilyModal(false)}></div>
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-zinc-900 border border-white/10 p-6 rounded-2xl z-50 w-96 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                    <h3 className="text-lg font-bold text-white mb-4">Add Family Member</h3>
                    <form onSubmit={handleAddFamily} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-zinc-400 mb-1">Name</label>
                            <input type="text" value={newFamName} onChange={e=>setNewFamName(e.target.value)} required className="w-full bg-zinc-950 border border-white/10 rounded-lg p-2 text-white" />
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-zinc-400 mb-1">Relation</label>
                                <input type="text" value={newFamRelation} onChange={e=>setNewFamRelation(e.target.value)} required placeholder="e.g. Son" className="w-full bg-zinc-950 border border-white/10 rounded-lg p-2 text-white" />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-zinc-400 mb-1">Age</label>
                                <input type="number" value={newFamAge} onChange={e=>setNewFamAge(e.target.value)} required className="w-full bg-zinc-950 border border-white/10 rounded-lg p-2 text-white" />
                            </div>
                        </div>
                        <div className="flex gap-3 pt-4">
                            <button type="button" onClick={() => setShowFamilyModal(false)} className="flex-1 bg-zinc-800 text-white py-2 rounded-lg font-bold text-sm hover:bg-zinc-700">Cancel</button>
                            <button type="submit" className="flex-1 bg-blue-500 text-white py-2 rounded-lg font-bold text-sm hover:bg-blue-400">Save</button>
                        </div>
                    </form>
                </div>
                </>
            )}
        </div>
    );
}
