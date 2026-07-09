import React, { useState } from 'react';
import { Search, Stethoscope, Activity, FileText, Pill, Plus } from 'lucide-react';

const mockServices = [
    { id: 1, category: 'Consultation', name: 'General Physician Consultation', price: '₹500', duration: '15 mins', tier: 'Basic' },
    { id: 2, category: 'Consultation', name: 'Specialist Consultation', price: '₹1,200', duration: '30 mins', tier: 'Premium' },
    { id: 3, category: 'Diagnostics', name: 'Full Body Blood Test (CBC)', price: '₹850', duration: '10 mins', tier: 'Basic' },
    { id: 4, category: 'Diagnostics', name: 'MRI Scan (Brain)', price: '₹7,500', duration: '45 mins', tier: 'Premium' },
    { id: 5, category: 'Diagnostics', name: 'X-Ray (Chest)', price: '₹400', duration: '15 mins', tier: 'Basic' },
    { id: 6, category: 'Procedure', name: 'ECG', price: '₹300', duration: '10 mins', tier: 'Basic' },
    { id: 7, category: 'Procedure', name: 'Minor Suturing', price: '₹1,500', duration: '30 mins', tier: 'Standard' },
    { id: 8, category: 'Emergency', name: 'Ambulance Dispatch (Base)', price: '₹2,000', duration: 'N/A', tier: 'Critical' },
    { id: 9, category: 'Emergency', name: 'ICU Bed (Per Day)', price: '₹15,000', duration: '24 hours', tier: 'Critical' },
    { id: 10, category: 'Pharmacy', name: 'Standard First Aid Kit', price: '₹250', duration: 'N/A', tier: 'Basic' }
];

export default function ServiceChart() {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('All');

    const filteredServices = mockServices.filter(service => {
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
            <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
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
                        <div key={service.id} className="bg-zinc-900/60 border border-white/5 p-6 rounded-2xl shadow-xl hover:border-emerald-500/30 transition-all duration-300 group relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                            
                            <div className="flex justify-between items-start mb-6 relative z-10">
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
