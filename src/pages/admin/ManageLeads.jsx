import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, Download, Edit2, Trash2, Mail, Phone, ChevronDown, CheckSquare, Square, FileText, X } from 'lucide-react';

const statuses = ['New', 'Contacted', 'Qualified', 'Converted', 'Lost'];

export default function ManageLeads() {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedRows, setSelectedRows] = useState([]);

    // Modal States
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('CREATE'); // 'CREATE' or 'EDIT'
    const [currentLead, setCurrentLead] = useState({ name: '', email: '', phone: '', status: 'New', source: '', notes: '', assigned_to: '' });

    const fetchLeads = async () => {
        try {
            const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/leads');
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

    const handleSaveLead = async (e) => {
        e.preventDefault();
        try {
            const url = modalMode === 'CREATE' 
                ? (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/leads'
                : (import.meta.env.VITE_API_URL || 'http://localhost:5000') + `/api/leads/${currentLead.id}`;
            const method = modalMode === 'CREATE' ? 'POST' : 'PUT';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
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
                method: 'DELETE'
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
        <div className="bg-white rounded border border-zinc-200 shadow-sm flex flex-col h-full overflow-hidden relative">
            {/* Toolbar */}
            <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-bold text-zinc-800">Leads ({filteredLeads.length})</h2>
                    <div className="flex items-center gap-2 border border-zinc-300 rounded bg-white px-2 py-1">
                        <Search className="w-4 h-4 text-zinc-400" />
                        <input 
                            type="text" 
                            placeholder="Search by name or email..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="text-sm outline-none w-64 placeholder:text-zinc-400"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleExport} className="flex items-center gap-2 text-sm font-medium text-zinc-600 bg-white border border-zinc-300 rounded px-3 py-1.5 hover:bg-zinc-50 transition-colors">
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                    <button onClick={openCreateModal} className="flex items-center gap-2 text-sm font-medium text-white bg-blue-600 border border-blue-700 rounded px-3 py-1.5 hover:bg-blue-700 shadow-sm transition-colors">
                        <Plus className="w-4 h-4" /> New Lead
                    </button>
                </div>
            </div>

            {/* Data Table */}
            <div className="flex-1 overflow-auto custom-scrollbar">
                <table className="w-full text-left border-collapse text-sm">
                    <thead className="bg-zinc-100 text-zinc-600 sticky top-0 z-10 shadow-[0_1px_0_#e5e7eb]">
                        <tr>
                            <th className="py-2.5 px-4 font-semibold w-10 border-r border-zinc-200">
                                <button onClick={toggleAll} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                                    {selectedRows.length === filteredLeads.length && filteredLeads.length > 0 ? <CheckSquare className="w-4 h-4 text-blue-600" /> : <Square className="w-4 h-4" />}
                                </button>
                            </th>
                            <th className="py-2.5 px-4 font-semibold border-r border-zinc-200 flex items-center justify-between cursor-pointer hover:bg-zinc-200">Name <ChevronDown className="w-3 h-3" /></th>
                            <th className="py-2.5 px-4 font-semibold border-r border-zinc-200">Contact Info</th>
                            <th className="py-2.5 px-4 font-semibold border-r border-zinc-200">Status</th>
                            <th className="py-2.5 px-4 font-semibold border-r border-zinc-200">Source</th>
                            <th className="py-2.5 px-4 font-semibold border-r border-zinc-200">Assigned To</th>
                            <th className="py-2.5 px-4 font-semibold border-r border-zinc-200">Created At</th>
                            <th className="py-2.5 px-4 font-semibold w-24 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-zinc-700">
                        {loading ? (
                            <tr>
                                <td colSpan="8" className="p-8 text-center text-zinc-500 font-medium">Loading leads...</td>
                            </tr>
                        ) : filteredLeads.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="p-8 text-center text-zinc-500 font-medium">No records found.</td>
                            </tr>
                        ) : (
                            filteredLeads.map((lead, idx) => (
                                <tr key={lead.id} className={`border-b border-zinc-200 hover:bg-blue-50/50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-zinc-50/30'}`}>
                                    <td className="py-2.5 px-4 border-r border-zinc-200 text-center">
                                        <button onClick={() => toggleRow(lead.id)} className={`text-zinc-400 hover:text-blue-600 transition-colors ${selectedRows.includes(lead.id) && 'text-blue-600'}`}>
                                            {selectedRows.includes(lead.id) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                                        </button>
                                    </td>
                                    <td className="py-2.5 px-4 border-r border-zinc-200 font-medium text-blue-700 cursor-pointer hover:underline" onClick={() => openEditModal(lead)}>
                                        {lead.name}
                                    </td>
                                    <td className="py-2.5 px-4 border-r border-zinc-200">
                                        <div className="flex flex-col gap-1">
                                            <span className="flex items-center gap-1.5 text-xs text-zinc-600"><Mail className="w-3 h-3 text-zinc-400" /> {lead.email || '-'}</span>
                                            <span className="flex items-center gap-1.5 text-xs text-zinc-600"><Phone className="w-3 h-3 text-zinc-400" /> {lead.phone || '-'}</span>
                                        </div>
                                    </td>
                                    <td className="py-2.5 px-4 border-r border-zinc-200">
                                        <select 
                                            className="bg-transparent border border-zinc-300 rounded px-2 py-1 text-xs font-semibold focus:outline-none focus:border-blue-500 w-full cursor-pointer hover:bg-white transition-colors"
                                            value={lead.status}
                                            onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                                        >
                                            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </td>
                                    <td className="py-2.5 px-4 border-r border-zinc-200 text-xs">{lead.source || 'Direct'}</td>
                                    <td className="py-2.5 px-4 border-r border-zinc-200 text-xs">{lead.assigned_to || 'Unassigned'}</td>
                                    <td className="py-2.5 px-4 border-r border-zinc-200 text-xs text-zinc-500">{new Date(lead.created_at).toLocaleDateString()}</td>
                                    <td className="py-2.5 px-4 text-center">
                                        <div className="flex items-center justify-center gap-3">
                                            <button 
                                                onClick={() => handleSendBill(lead)}
                                                className="text-emerald-500 hover:text-emerald-700 transition-colors"
                                                title="Send WhatsApp Bill"
                                            >
                                                <FileText className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => openEditModal(lead)} className="text-blue-500 hover:text-blue-700 transition-colors" title="Edit Lead"><Edit2 className="w-4 h-4" /></button>
                                            <button onClick={() => handleDeleteLead(lead.id)} className="text-red-500 hover:text-red-700 transition-colors" title="Delete Lead"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            <div className="p-3 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between text-xs text-zinc-500">
                <span>Showing 1 to {filteredLeads.length} of {filteredLeads.length} entries</span>
            </div>

            {/* Modal for Create/Edit */}
            {showModal && (
                <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50">
                            <h3 className="text-lg font-bold text-zinc-800">{modalMode === 'CREATE' ? 'Create New Lead' : 'Edit Lead'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-zinc-700 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveLead} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-zinc-600 uppercase mb-1">Full Name</label>
                                <input 
                                    required
                                    type="text" 
                                    value={currentLead.name}
                                    onChange={e => setCurrentLead({...currentLead, name: e.target.value})}
                                    className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-600 uppercase mb-1">Email</label>
                                    <input 
                                        type="email" 
                                        value={currentLead.email}
                                        onChange={e => setCurrentLead({...currentLead, email: e.target.value})}
                                        className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-600 uppercase mb-1">Phone</label>
                                    <input 
                                        type="tel" 
                                        value={currentLead.phone}
                                        onChange={e => setCurrentLead({...currentLead, phone: e.target.value})}
                                        className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-600 uppercase mb-1">Source</label>
                                    <input 
                                        type="text" 
                                        value={currentLead.source}
                                        placeholder="e.g. Website, Walk-in"
                                        onChange={e => setCurrentLead({...currentLead, source: e.target.value})}
                                        className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-600 uppercase mb-1">Status</label>
                                    <select 
                                        value={currentLead.status}
                                        onChange={e => setCurrentLead({...currentLead, status: e.target.value})}
                                        className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    >
                                        {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end gap-3 border-t border-zinc-100 mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-sm font-semibold text-zinc-600 hover:bg-zinc-100 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors">
                                    {modalMode === 'CREATE' ? 'Create Lead' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
