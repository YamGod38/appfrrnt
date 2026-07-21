import React, { useState, useEffect } from 'react';
import { Search, Activity, Edit2, Save, X } from 'lucide-react';
import socket from '../../utils/socket';

export default function ServiceChart({ isAdmin = false }) {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('All');
    const [services, setServices] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});

    useEffect(() => {
        const handleSync = (data) => setServices(data);
        socket.on('SERVICE_CATALOG_SYNC', handleSync);
        
        if (socket.connected) {
            socket.emit('GET_INITIAL_STATE');
        }

        return () => {
            socket.off('SERVICE_CATALOG_SYNC', handleSync);
        };
    }, []);

    const filteredServices = services.filter(service => {
        const matchesSearch = service.name.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'All' || service.category === filter;
        return matchesSearch && matchesFilter;
    });

    const getTierColor = (tier) => {
        switch(tier) {
            case 'Premium': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
            case 'Critical': return 'text-red-400 bg-red-500/10 border-red-500/20';
            case 'Standard': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
            default: return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
        }
    };

    const categories = ['All', 'Consultation', 'Diagnostics', 'Procedure', 'Emergency', 'Pharmacy'];

    const handleEditClick = (service) => {
        setEditingId(service.id);
        setEditForm(service);
    };

    const handleSave = () => {
        socket.emit('UPDATE_SERVICE', editForm);
        setEditingId(null);
    };

    const handleCancel = () => {
        setEditingId(null);
    };

    return (
        <div className="flex flex-col gap-6 h-full max-w-7xl mx-auto w-full relative z-10 animate-in fade-in duration-500">
            <header className="flex justify-between items-end pb-6 border-b border-white/[0.05] sticky top-0 bg-[#09090b]/90 backdrop-blur-md z-20">
                <div>
                    <h2 className="text-3xl font-bold text-zinc-100 tracking-tight flex items-center gap-3">
                        Universal Service Chart
                        <Activity className="w-6 h-6 text-emerald-500" />
                    </h2>
                    <p className="text-zinc-500 mt-2 text-sm">Centralized pricing and service catalog for quick reference.</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input 
                            type="text" 
                            placeholder="Search service..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-black/20 border border-white/[0.02] shadow-inner backdrop-blur-md rounded-2xl pl-10 pr-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-zinc-600 w-64"
                        />
                    </div>
                </div>
            </header>

            {/* Category Filters */}
            <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar shrink-0">
                {categories.map(cat => (
                    <button 
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${filter === cat ? 'bg-emerald-500 text-zinc-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-zinc-900/50 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Service Grid */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pb-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredServices.map(service => (
                        <div key={service.id} className={`bg-zinc-900/60 border ${editingId === service.id ? 'border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'border-white/5 hover:border-emerald-500/30'} p-6 rounded-2xl shadow-xl transition-all duration-300 group relative overflow-hidden`}>
                            {editingId !== service.id && <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>}
                            
                            {isAdmin && editingId !== service.id && (
                                <button onClick={() => handleEditClick(service)} className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-emerald-500/20 text-zinc-400 hover:text-emerald-400 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-20">
                                    <Edit2 className="w-4 h-4" />
                                </button>
                            )}

                            {editingId === service.id ? (
                                <div className="space-y-4 relative z-10">
                                    <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
                                        <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                                            <Edit2 className="w-3 h-3" /> Editing Service
                                        </h3>
                                        <div className="flex gap-2">
                                            <button onClick={handleSave} className="p-1.5 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-zinc-950 rounded transition-colors"><Save className="w-4 h-4" /></button>
                                            <button onClick={handleCancel} className="p-1.5 bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white rounded transition-colors"><X className="w-4 h-4" /></button>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block">Service Name</label>
                                            <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:border-emerald-500/50 outline-none" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block">Price</label>
                                                <input type="text" value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:border-emerald-500/50 outline-none" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block">Duration</label>
                                                <input type="text" value={editForm.duration} onChange={e => setEditForm({...editForm, duration: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:border-emerald-500/50 outline-none" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block">Tier</label>
                                            <select value={editForm.tier} onChange={e => setEditForm({...editForm, tier: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:border-emerald-500/50 outline-none appearance-none custom-select">
                                                <option value="Basic" className="bg-zinc-900 text-zinc-200">Basic</option>
                                                <option value="Standard" className="bg-zinc-900 text-zinc-200">Standard</option>
                                                <option value="Premium" className="bg-zinc-900 text-zinc-200">Premium</option>
                                                <option value="Critical" className="bg-zinc-900 text-zinc-200">Critical</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between items-start mb-6 relative z-10 pr-8">
                                        <div>
                                            <p className="text-[10px] font-bold text-emerald-500/70 uppercase tracking-widest mb-1">{service.category}</p>
                                            <h3 className="text-lg font-bold text-zinc-100 group-hover:text-emerald-50 transition-colors leading-tight pr-4">{service.name}</h3>
                                        </div>
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${getTierColor(service.tier)} shrink-0`}>
                                            {service.tier}
                                        </span>
                                    </div>

                                    <div className="space-y-4 relative z-10">
                                        <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Base Price</span>
                                            <span className="text-xl font-black text-white group-hover:text-emerald-400 transition-colors">{service.price}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Est. Duration</span>
                                            <span className="text-sm font-semibold text-zinc-300">{service.duration}</span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
                
                {filteredServices.length === 0 && (
                    <div className="text-center py-20">
                        <Activity className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-zinc-400">No services found</h3>
                        <p className="text-zinc-600 mt-2">Try adjusting your search or category filter.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
