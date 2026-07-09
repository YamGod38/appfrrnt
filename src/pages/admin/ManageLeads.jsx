import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, Download, Edit2, Trash2, Mail, Phone, ChevronDown, CheckSquare, Square, FileText, X, Camera, Globe, TrendingUp, BarChart2 } from 'lucide-react';

const statuses = ['New', 'Contacted', 'Qualified', 'Converted', 'Lost'];

export default function ManageLeads() {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedRows, setSelectedRows] = useState([]);
    const [activeTab, setActiveTab] = useState('pipeline');

    // Modal States
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('CREATE'); // 'CREATE' or 'EDIT'
    const [currentLead, setCurrentLead] = useState({ name: '', email: '', phone: '', status: 'New', source: '', notes: '', assigned_to: '' });

    const fetchLeads = async () => {
        try {
            const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/leads', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            if (data.success) {
                setLeads(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch leads', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    const handleStatusChange = async (leadId, newStatus) => {
        try {
            const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + `/api/leads/${leadId}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                fetchLeads();
            }
        } catch (err) {
            console.error('Failed to update status', err);
        }
    };

    const handleSendBill = async (lead) => {
        try {
            const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/whatsapp/send-pdf', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
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

    const handleSaveLead = async (e) => {
        e.preventDefault();
        try {
            const url = modalMode === 'CREATE' 
                ? (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/leads'
                : (import.meta.env.VITE_API_URL || 'http://localhost:5000') + `/api/leads/${currentLead.id}`;
            const method = modalMode === 'CREATE' ? 'POST' : 'PUT';

            const res = await fetch(url, {
                method,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(currentLead)
            });

            if (res.ok) {
                fetchLeads();
                setShowModal(false);
            } else {
                alert('Failed to save lead');
            }
        } catch (err) {
            console.error('Failed to save lead', err);
        }
    };

    const handleDeleteLead = async (id) => {
        if (!window.confirm("Are you sure you want to delete this lead? This cannot be undone.")) return;
        try {
            const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + `/api/leads/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) {
                fetchLeads();
                setSelectedRows(prev => prev.filter(rowId => rowId !== id));
            }
        } catch (err) {
            console.error('Failed to delete lead', err);
        }
    };

    const openCreateModal = () => {
        setModalMode('CREATE');
        setCurrentLead({ name: '', email: '', phone: '', status: 'New', source: '', notes: '', assigned_to: '' });
        setShowModal(true);
    };

    const openEditModal = (lead) => {
        setModalMode('EDIT');
        setCurrentLead(lead);
        setShowModal(true);
    };

    const handleExport = () => {
        if (leads.length === 0) {
            alert("No data to export");
            return;
        }

        const headers = ['ID', 'Name', 'Email', 'Phone', 'Status', 'Source', 'Assigned To', 'Created At'];
        const rows = filteredLeads.map(l => [
            l.id,
            `"${l.name || ''}"`,
            `"${l.email || ''}"`,
            `"${l.phone || ''}"`,
            `"${l.status || ''}"`,
            `"${l.source || ''}"`,
            `"${l.assigned_to || ''}"`,
            `"${new Date(l.created_at).toLocaleString()}"`
        ]);

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `leads_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    const toggleRow = (id) => {
        setSelectedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
    };

    const toggleAll = () => {
        if (selectedRows.length === filteredLeads.length) {
            setSelectedRows([]);
        } else {
            setSelectedRows(filteredLeads.map(l => l.id));
        }
    };

    const filteredLeads = leads.filter(l => 
        l.name?.toLowerCase().includes(search.toLowerCase()) || 
        l.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-6 h-full max-w-7xl mx-auto w-full relative z-10 animate-in fade-in duration-500">
            {/* Header & Tabs */}
            <header className="flex flex-col gap-4 pb-4 border-b border-white/[0.05] sticky top-0 bg-[#09090b]/90 backdrop-blur-md z-20">
                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="text-3xl font-bold text-zinc-100 tracking-tight flex items-center gap-3">
                            CRM & Marketing
                        </h2>
                        <p className="text-zinc-500 mt-2 text-sm">Manage patient leads and social media outreach.</p>
                    </div>
                    {activeTab === 'pipeline' && (
                        <div className="flex items-center gap-3">
                            <button onClick={handleExport} className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-zinc-400 bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 hover:bg-zinc-800 hover:text-white transition-colors">
                                <Download className="w-4 h-4" /> Export CSV
                            </button>
                            <button onClick={openCreateModal} className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-zinc-950 bg-emerald-500 rounded-xl px-4 py-2.5 hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all transform hover:-translate-y-1">
                                <Plus className="w-4 h-4" /> New Lead
                            </button>
                        </div>
                    )}
                    {activeTab === 'campaigns' && (
                        <button className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white bg-purple-600 rounded-xl px-4 py-2.5 hover:bg-purple-500 shadow-[0_0_20px_rgba(147,51,234,0.3)] transition-all transform hover:-translate-y-1">
                            <Plus className="w-4 h-4" /> Launch Campaign
                        </button>
                    )}
                </div>

                {/* Tab Switcher */}
                <div className="flex gap-4 border-b border-white/5 pb-2">
                    <button 
                        onClick={() => setActiveTab('pipeline')}
                        className={`text-sm font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-all ${activeTab === 'pipeline' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        Lead Pipeline
                    </button>
                    <button 
                        onClick={() => setActiveTab('campaigns')}
                        className={`text-sm font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-all ${activeTab === 'campaigns' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        Social Campaigns
                    </button>
                </div>
            </header>

            {/* Pipeline Content */}
            {activeTab === 'pipeline' && (
            <div className="bg-zinc-900/50 rounded-2xl border border-white/5 shadow-xl flex flex-col h-full overflow-hidden relative">
                {/* Toolbar */}
                <div className="p-4 border-b border-white/5 bg-zinc-900/80 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-bold text-zinc-100">Leads ({filteredLeads.length})</h2>
                        <div className="flex items-center gap-2 border border-white/10 rounded-xl bg-black/20 px-3 py-2 shadow-inner">
                            <Search className="w-4 h-4 text-zinc-500" />
                            <input 
                                type="text" 
                                placeholder="Search by name or email..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="text-sm outline-none w-64 bg-transparent text-zinc-200 placeholder:text-zinc-600"
                            />
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <div className="flex-1 overflow-auto custom-scrollbar">
                <table className="w-full text-left border-collapse text-sm text-zinc-300">
                    <thead className="bg-zinc-950 text-zinc-500 sticky top-0 z-10 border-b border-white/5 uppercase tracking-widest text-[10px] font-bold">
                        <tr>
                            <th className="py-3 px-4 w-10 border-r border-white/5">
                                <button onClick={toggleAll} className="hover:text-zinc-300 transition-colors">
                                    {selectedRows.length === filteredLeads.length && filteredLeads.length > 0 ? <CheckSquare className="w-4 h-4 text-emerald-500" /> : <Square className="w-4 h-4" />}
                                </button>
                            </th>
                            <th className="py-3 px-4 font-bold border-r border-white/5">Name / Contact</th>
                            <th className="py-3 px-4 font-bold border-r border-white/5">Status</th>
                            <th className="py-3 px-4 font-bold border-r border-white/5">Source</th>
                            <th className="py-3 px-4 font-bold border-r border-white/5">Assigned To</th>
                            <th className="py-3 px-4 font-bold border-r border-white/5">Created Date</th>
                            <th className="py-3 px-4 font-bold text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="8" className="p-8 text-center text-zinc-500 font-medium">Loading leads...</td>
                            </tr>
                        ) : filteredLeads.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="p-8 text-center text-zinc-500 font-medium">No records found.</td>
                            </tr>
                        ) : (
                            filteredLeads.map(lead => (
                            <tr key={lead.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                                <td className="py-3 px-4 border-r border-white/5">
                                    <button onClick={() => toggleRow(lead.id)} className="text-zinc-600 hover:text-emerald-500 transition-colors">
                                        {selectedRows.includes(lead.id) ? <CheckSquare className="w-4 h-4 text-emerald-500" /> : <Square className="w-4 h-4" />}
                                    </button>
                                </td>
                                <td className="py-3 px-4 border-r border-white/5">
                                    <div className="font-bold text-zinc-200">{lead.name || 'Unknown Lead'}</div>
                                    <div className="flex flex-col gap-0.5 mt-1 text-[10px] text-zinc-500">
                                        <span>{lead.email}</span>
                                        <span>{lead.phone}</span>
                                    </div>
                                </td>
                                <td className="py-3 px-4 border-r border-white/5">
                                    <select 
                                        value={lead.status}
                                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                                        className={`text-xs font-bold px-2.5 py-1.5 rounded-full border outline-none appearance-none cursor-pointer ${
                                            lead.status === 'New' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                                            lead.status === 'Contacted' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                            lead.status === 'Qualified' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                            lead.status === 'Converted' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                            'bg-zinc-800 text-zinc-400 border-zinc-700'
                                        }`}
                                    >
                                        {statuses.map(s => <option key={s} value={s} className="bg-zinc-900 text-zinc-300">{s}</option>)}
                                    </select>
                                </td>
                                <td className="py-3 px-4 border-r border-white/5 text-zinc-400">
                                    {lead.source || 'Organic'}
                                </td>
                                <td className="py-3 px-4 border-r border-white/5 text-zinc-400">
                                    {lead.assigned_to || 'Unassigned'}
                                </td>
                                <td className="py-3 px-4 border-r border-white/5 text-zinc-400">
                                    {new Date(lead.created_at).toLocaleDateString()}
                                </td>
                                <td className="py-3 px-4 text-center">
                                    <div className="flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => openEditModal(lead)} className="text-zinc-500 hover:text-blue-400 transition-colors" title="Edit">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleSendBill(lead)} className="text-zinc-500 hover:text-emerald-400 transition-colors" title="Send Medical Bill PDF via WhatsApp">
                                            <FileText className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDeleteLead(lead.id)} className="text-zinc-500 hover:text-red-400 transition-colors" title="Delete">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )))}
                    </tbody>
                </table>
                
                {filteredLeads.length === 0 && !loading && (
                    <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
                        <Filter className="w-12 h-12 mb-4 text-zinc-700" />
                        <p className="font-bold">No leads found</p>
                        <p className="text-sm mt-1">Try adjusting your filters or search query.</p>
                    </div>
                )}
            </div>
            </div>
            )}

            {/* Social Campaigns Content */}
            {activeTab === 'campaigns' && (
                <div className="flex flex-col gap-6">
                    {/* High Level Analytics */}
                    <div className="grid grid-cols-3 gap-6">
                        <div className="bg-gradient-to-br from-pink-500/10 to-transparent border border-pink-500/20 p-6 rounded-2xl">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center text-pink-400">
                                    <Camera className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Instagram Reach</h4>
                                    <p className="text-2xl font-black text-pink-400">45.2K</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                                <TrendingUp className="w-3 h-3" /> +12.5% this week
                            </div>
                        </div>
                        
                        <div className="bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 p-6 rounded-2xl">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                                    <Globe className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Facebook Eng.</h4>
                                    <p className="text-2xl font-black text-blue-400">12.8K</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                                <TrendingUp className="w-3 h-3" /> +8.2% this week
                            </div>
                        </div>

                        <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-2xl flex flex-col justify-center">
                            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Total Ad Spend</h4>
                            <p className="text-3xl font-black text-zinc-100 mb-2">₹12,450</p>
                            <p className="text-xs text-zinc-400">Est. ROI: <span className="text-emerald-400 font-bold">2.4x</span></p>
                        </div>
                    </div>

                    {/* Active Campaigns Table */}
                    <div className="bg-zinc-900/50 rounded-2xl border border-white/5 shadow-xl flex flex-col overflow-hidden">
                        <div className="p-5 border-b border-white/5 flex items-center gap-3">
                            <BarChart2 className="w-5 h-5 text-purple-400" />
                            <h3 className="text-lg font-bold text-zinc-100 tracking-tight">Active Campaigns</h3>
                        </div>
                        <table className="w-full text-left border-collapse text-sm text-zinc-300">
                            <thead className="bg-zinc-950 text-zinc-500 border-b border-white/5 uppercase tracking-widest text-[10px] font-bold">
                                <tr>
                                    <th className="py-4 px-5">Campaign Name</th>
                                    <th className="py-4 px-5">Platform</th>
                                    <th className="py-4 px-5">Status</th>
                                    <th className="py-4 px-5">Spend</th>
                                    <th className="py-4 px-5">Leads Gen.</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-white/5 hover:bg-white/[0.02]">
                                    <td className="py-4 px-5 font-bold text-zinc-200">Monsoon Health Promo</td>
                                    <td className="py-4 px-5">
                                        <span className="flex items-center gap-2 text-pink-400 bg-pink-400/10 w-max px-2 py-1 rounded text-xs font-bold"><Camera className="w-3 h-3"/> Instagram</span>
                                    </td>
                                    <td className="py-4 px-5"><span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Active</span></td>
                                    <td className="py-4 px-5 font-mono">₹4,200</td>
                                    <td className="py-4 px-5 font-black text-emerald-400">145</td>
                                </tr>
                                <tr className="border-b border-white/5 hover:bg-white/[0.02]">
                                    <td className="py-4 px-5 font-bold text-zinc-200">Free Cardiac Checkup</td>
                                    <td className="py-4 px-5">
                                        <span className="flex items-center gap-2 text-blue-400 bg-blue-400/10 w-max px-2 py-1 rounded text-xs font-bold"><Globe className="w-3 h-3"/> Facebook</span>
                                    </td>
                                    <td className="py-4 px-5"><span className="text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Optimizing</span></td>
                                    <td className="py-4 px-5 font-mono">₹8,250</td>
                                    <td className="py-4 px-5 font-black text-emerald-400">312</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Slide-over Modal for Create/Edit */}
            {showModal && (
                <>
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-300" onClick={() => setShowModal(false)}></div>
                <div className="fixed top-0 right-0 h-full w-[450px] bg-[#09090b] border-l border-white/10 z-50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                    <div className="p-5 border-b border-white/5 flex items-center justify-between bg-zinc-900/50">
                        <h3 className="text-xl font-bold text-zinc-100">{modalMode === 'CREATE' ? 'Create New Lead' : 'Edit Lead'}</h3>
                        <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
                        <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Full Name *</label>
                            <input 
                                type="text" 
                                required
                                value={currentLead.name}
                                onChange={e => setCurrentLead({...currentLead, name: e.target.value})}
                                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50 transition-colors" 
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Email Address</label>
                            <input 
                                type="email" 
                                value={currentLead.email}
                                onChange={e => setCurrentLead({...currentLead, email: e.target.value})}
                                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50 transition-colors" 
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Phone Number *</label>
                            <input 
                                type="text" 
                                required
                                value={currentLead.phone}
                                onChange={e => setCurrentLead({...currentLead, phone: e.target.value})}
                                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50 transition-colors" 
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Status</label>
                                <select 
                                    value={currentLead.status}
                                    onChange={e => setCurrentLead({...currentLead, status: e.target.value})}
                                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50 transition-colors appearance-none"
                                >
                                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Source</label>
                                <input 
                                    type="text" 
                                    value={currentLead.source}
                                    onChange={e => setCurrentLead({...currentLead, source: e.target.value})}
                                    placeholder="e.g. Meta Ads, Google"
                                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50 transition-colors" 
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Assigned To</label>
                            <input 
                                type="text" 
                                value={currentLead.assigned_to || ''}
                                onChange={e => setCurrentLead({...currentLead, assigned_to: e.target.value})}
                                placeholder="Agent Name"
                                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50 transition-colors" 
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Internal Notes</label>
                            <textarea 
                                rows="4"
                                value={currentLead.notes || ''}
                                onChange={e => setCurrentLead({...currentLead, notes: e.target.value})}
                                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50 transition-colors resize-none custom-scrollbar" 
                            ></textarea>
                        </div>
                    </div>
                    
                    <div className="p-5 border-t border-white/5 bg-zinc-900/50 flex gap-3">
                        <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 border border-white/10 text-zinc-300 font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-zinc-800 transition-colors">
                            Cancel
                        </button>
                        <button type="button" onClick={handleSaveLead} className="flex-[2] bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black uppercase tracking-widest text-xs py-3 rounded-xl shadow-[0_6px_0_rgba(16,185,129,0.3)] active:shadow-none active:translate-y-1.5 transition-all">
                            {modalMode === 'CREATE' ? 'Create Lead' : 'Save Changes'}
                        </button>
                    </div>
                </div>
                </>
            )}
        </div>
    );
}
