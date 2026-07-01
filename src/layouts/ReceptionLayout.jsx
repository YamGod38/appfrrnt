import { Outlet, useNavigate } from 'react-router-dom';
import { Target, LogOut, Hexagon } from 'lucide-react';

export default function ReceptionLayout() {
    const navigate = useNavigate();
    const name = localStorage.getItem('name') || 'Front Desk';

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div className="h-screen w-full bg-[#050505] text-zinc-300 font-sans flex flex-col overflow-hidden selection:bg-purple-500/30">
            {/* Minimalist Premium Topbar */}
            <header className="h-20 bg-[#09090b]/80 border-b border-white/[0.05] flex items-center justify-between px-8 backdrop-blur-xl relative z-20">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
                        <Hexagon className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500 tracking-tight">Apollo CRM</h1>
                        <p className="text-[10px] font-bold text-purple-500 uppercase tracking-widest">Reception Portal</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-sm font-bold text-zinc-100">{name}</p>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Active Shift</p>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/5 hover:border-red-500/30 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 flex items-center justify-center transition-all group"
                        title="Sign Out"
                    >
                        <LogOut className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                </div>
            </header>

            {/* Main Content Area with Animated Background */}
            <main className="flex-1 relative overflow-hidden flex flex-col">
                <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
                    <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] mix-blend-screen animate-pulse"></div>
                    <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }}></div>
                    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 relative z-10">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
