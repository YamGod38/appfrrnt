import { Outlet, Navigate } from 'react-router-dom';
import { Activity, LogOut, Phone } from 'lucide-react';

export default function AgentLayout() {
    const role = localStorage.getItem('role');
    
    if (role !== 'AGENT') {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="min-h-screen bg-[#09090b] flex flex-col print:h-auto print:block print:bg-white">
            {/* Premium Topbar */}
            <header className="relative bg-[#09090b]/80 backdrop-blur-xl border-b border-white/[0.05] px-6 py-4 flex justify-between items-center z-40 shadow-[0_4px_30px_rgba(0,0,0,0.5)] print:hidden">
                {/* Neon light edge */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-50"></div>

                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-white/10 flex items-center justify-center shadow-inner">
                        <Activity className="w-4 h-4 text-zinc-300" />
                    </div>
                    <h1 className="text-lg font-bold tracking-tight text-zinc-100">Apollo <span className="text-zinc-500 font-medium">| Agent Workspace</span></h1>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2.5 bg-zinc-950 px-4 py-2 rounded-full border border-white/[0.05] shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)] animate-pulse"></div>
                        <span className="text-xs font-bold uppercase tracking-widest text-zinc-300">Ready</span>
                    </div>
                    <button onClick={() => {
                        localStorage.clear();
                        window.location.href = '/login';
                    }} className="flex items-center gap-2 text-zinc-500 hover:text-red-400 text-xs font-bold uppercase tracking-widest transition-colors group">
                        <LogOut className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                        Logout
                    </button>
                </div>
            </header>
            
            {/* Main Content Area */}
            <main className="flex-1 p-6 overflow-y-auto relative custom-scrollbar print:overflow-visible print:h-auto print:block print:p-0">
                {/* Ambient backdrop */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none print:hidden"></div>
                <Outlet />
            </main>
        </div>
    );
}
