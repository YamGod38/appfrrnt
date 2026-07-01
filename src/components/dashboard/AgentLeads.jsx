import React, { useState, useEffect } from 'react';
import { Target, Search, User, Mail, Phone, Clock, MoreVertical, Building2, Globe, Activity, FileText, PhoneCall } from 'lucide-react';

const statuses = ['New', 'Contacted', 'Qualified', 'Converted', 'Lost'];

export default function AgentLeads() {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    
    // In a real app, this would be from an auth context
    const agentName = localStorage.getItem('name') || 'Agent Alpha';

    const fetchLeads = async () => {
        try {
            const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/leads');
            const data = await res.json();
            if (data.success) {
                // Filter leads to only show this agent's assigned leads
                const agentLeads = data.data.filter(l => l.assigned_to === agentName || l.assigned_to === 'Unassigned');
                setLeads(agentLeads);
            }
        } catch (err) {
            console.error('Failed to fetch leads', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, [agentName]);

    const handleStatusChange = async (leadId, newStatus) => {
        try {
            const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + `/api/leads/${leadId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                fetchLeads();
            }
        } catch (err) {
            console.error('Failed to update status', err);
        }
    };

    const handleCallLead = (phone) => {
        alert(`Dialing lead at ${phone}...`);
        // Logic to connect to WebRTCDialer would go here
    };

    const handleSendBill = async (lead) => {
        try {
            const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/whatsapp/send-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'BILL',
                    phone: lead.phone,
                    data: {
                        name: lead.name,
                        amount: '150.00',
                        description: 'Initial Consultation Fee'
                    }
                })
            });
            if (res.ok) {
                alert(`Bill sent successfully to ${lead.name} via WhatsApp!`);
            }
        } catch (err) {
            alert('Failed to send bill');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'New': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'Contacted': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            case 'Qualified': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            case 'Converted': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'Lost': return 'bg-red-500/10 text-red-400 border-red-500/20';
            default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
        }
    };

    const filteredLeads = leads.filter(l => 
        l.name?.toLowerCase().includes(search.toLowerCase()) || 
        l.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="bg-[#050505] rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,1)] border border-white/[0.05] w-full h-full flex flex-col relative overflow-hidden">
            {/* Header */}
            <div className="p-8 pb-4 border-b border-white/[0.05] bg-gradient-to-b from-white/[0.02] to-transparent flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500 tracking-tight flex items-center gap-3">
                        <Target className="w-6 h-6 text-purple-500" />
                        My Leads
                    </h2>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">
                        Manage your assigned leads pipeline
                    </p>
                </div>
                
                <div className="relative w-64">
                    <Search className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input 
                        type="text"
                        placeholder="Search your leads..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm font-medium text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 custom-scrollbar">
                {loading ? (
                    <div className="h-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                    </div>
                ) : (
                    <div className="flex gap-4 h-full">
                        {statuses.map(status => {
                            const colLeads = filteredLeads.filter(l => l.status === status);
                            return (
                                <div key={status} className="bg-zinc-900/40 rounded-2xl border border-white/[0.05] flex flex-col min-w-[320px] max-w-[320px] h-full flex-shrink-0 backdrop-blur-sm">
                                    <div className="p-4 border-b border-white/[0.05] flex items-center justify-between bg-zinc-900/50 rounded-t-2xl z-10">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor(status).split(' ')[0].replace('/10', '')}`}></div>
                                            <h3 className="font-bold text-zinc-200">{status}</h3>
                                        </div>
                                        <span className="bg-zinc-800 border border-white/5 text-zinc-400 text-xs px-2 py-0.5 rounded-md font-bold">
                                            {colLeads.length}
                                        </span>
                                    </div>
                                    <div className="p-3 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                                        {colLeads.map(lead => (
                                            <div key={lead.id} className="bg-zinc-950 border border-white/[0.05] rounded-xl p-4 hover:border-purple-500/30 hover:shadow-[0_4px_20px_rgba(168,85,247,0.1)] transition-all group">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h4 className="font-bold text-zinc-100">{lead.name}</h4>
                                                        <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1.5"><Building2 className="w-3 h-3" /> {lead.source || 'Direct'}</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5 mb-4">
                                                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                                                        <Mail className="w-3.5 h-3.5" /> <span className="truncate">{lead.email || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                                                        <Phone className="w-3.5 h-3.5" /> {lead.phone || 'N/A'}
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between border-t border-white/[0.05] pt-3 mt-3">
                                                    <div className="flex items-center gap-2">
                                                        <button 
                                                            onClick={() => handleCallLead(lead.phone)}
                                                            className="text-zinc-500 hover:text-emerald-400 bg-zinc-900 hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/20 p-1.5 rounded transition-colors"
                                                            title="Call Lead"
                                                        >
                                                            <PhoneCall className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleSendBill(lead)}
                                                            className="text-zinc-500 hover:text-emerald-400 bg-zinc-900 hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/20 p-1.5 rounded transition-colors"
                                                            title="Send Bill via WhatsApp"
                                                        >
                                                            <FileText className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <select 
                                                            className="bg-zinc-900 border border-white/10 rounded px-2 py-1.5 text-[10px] uppercase tracking-wider font-bold text-zinc-400 focus:outline-none focus:border-purple-500 transition-colors"
                                                            value={lead.status}
                                                            onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                                                        >
                                                            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {colLeads.length === 0 && (
                                            <div className="h-20 flex items-center justify-center text-zinc-600 text-xs font-bold uppercase tracking-widest border-2 border-dashed border-white/5 rounded-xl">
                                                No {status} Leads
                                            </div>
                                        )}
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
