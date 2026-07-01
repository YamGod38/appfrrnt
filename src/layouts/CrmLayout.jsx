import React from 'react';
import { Outlet, Navigate, NavLink } from 'react-router-dom';
import { Target, Users, Settings, LogOut, ChevronRight, BarChart3, Building2, Phone } from 'lucide-react';

export default function CrmLayout() {
    const role = localStorage.getItem('role');
    const name = localStorage.getItem('name') || 'Admin User';
    
    if (role !== 'ADMIN') {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="min-h-screen bg-[#f3f4f6] text-zinc-900 flex selection:bg-blue-500/30">
            {/* Sidebar - Classic Light Theme CRM look */}
            <aside className="w-64 bg-white border-r border-zinc-200 flex flex-col relative z-20 shadow-sm">
                <div className="p-5 flex items-center gap-3 border-b border-zinc-100">
                    <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center shadow-sm">
                        <Target className="w-4 h-4 text-white" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-zinc-800">Classic CRM</h1>
                </div>

                <nav className="flex flex-col gap-1 p-3 flex-1">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 mb-2 px-3 mt-4">Modules</p>
                    
                    <NavLink to="/crm" end className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-700' : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'}`}>
                        {({ isActive }) => (
                            <>
                                <BarChart3 className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-zinc-400'}`} />
                                Dashboard
                                <ChevronRight className={`w-3 h-3 ml-auto opacity-0`} />
                            </>
                        )}
                    </NavLink>

                    <NavLink to="/crm/leads" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-700' : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'}`}>
                        {({ isActive }) => (
                            <>
                                <Users className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-zinc-400'}`} />
                                Leads Pipeline
                                {isActive && <ChevronRight className="w-3 h-3 ml-auto text-blue-600" />}
                            </>
                        )}
                    </NavLink>

                    <NavLink to="/crm/accounts" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-700' : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'}`}>
                        {({ isActive }) => (
                            <>
                                <Building2 className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-zinc-400'}`} />
                                Accounts
                            </>
                        )}
                    </NavLink>
                </nav>

                <div className="p-4 border-t border-zinc-100 bg-zinc-50">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold border border-blue-200">
                            {name.charAt(0)}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-semibold text-zinc-800 truncate">{name}</p>
                            <p className="text-[10px] text-zinc-500 uppercase">Administrator</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <NavLink to="/admin" className="flex items-center gap-2 w-full px-3 py-2 rounded text-xs font-semibold text-zinc-600 hover:bg-zinc-200 transition-colors">
                            <Phone className="w-3.5 h-3.5" /> Back to Call Center
                        </NavLink>
                    </div>
                </div>
            </aside>
            
            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f8fafc]">
                <header className="h-14 bg-white border-b border-zinc-200 flex items-center px-6 justify-between shadow-sm flex-none">
                    <div className="flex items-center gap-4">
                        <h2 className="font-semibold text-zinc-700 text-sm">Classic CRM Interface</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="text-zinc-500 hover:text-zinc-800"><Settings className="w-4 h-4" /></button>
                    </div>
                </header>
                
                <div className="flex-1 overflow-auto p-6 relative z-10">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
