import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartPulse, Loader2, KeyRound, ArrowLeft } from 'lucide-react';

export default function Login() {
    const [mode, setMode] = useState('login'); // 'login' or 'reset'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const containerRef = useRef(null);

    // Mouse tracker glow effect
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!containerRef.current) return;
            const { clientX, clientY } = e;
            const x = Math.round((clientX / window.innerWidth) * 100);
            const y = Math.round((clientY / window.innerHeight) * 100);
            containerRef.current.style.setProperty('--mouse-x', `${x}%`);
            containerRef.current.style.setProperty('--mouse-y', `${y}%`);
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            if (mode === 'login') {
                const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await res.json();
                
                if (res.ok) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('role', data.role);
                    localStorage.setItem('name', data.name);
                    
                    // Simulate delay for auth animation
                    setTimeout(() => {
                        if (data.role === 'ADMIN') navigate('/admin');
                        else if (data.role === 'RECEPTION') navigate('/reception');
                        else navigate('/agent');
                    }, 800);
                } else {
                    setError(data.error || 'Login failed');
                    setLoading(false);
                }
            } else {
                // Reset password request
                const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/auth/reset-request', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });
                const data = await res.json();
                if (res.ok) {
                    setSuccess(data.message);
                    setTimeout(() => setMode('login'), 3000);
                } else {
                    setError(data.error || 'Failed to submit reset request');
                }
                setLoading(false);
            }
        } catch (err) {
            setError('Server connection failed. Is the backend running?');
            setLoading(false);
        }
    };

    return (
        <div 
            ref={containerRef}
            className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden selection:bg-emerald-500/30"
            style={{
                '--mouse-x': '50%',
                '--mouse-y': '50%',
            }}
        >
            {/* Dynamic Mouse Glow Tracker */}
            <div 
                className="absolute inset-0 z-0 pointer-events-none opacity-40 transition-opacity duration-300"
                style={{
                    background: 'radial-gradient(circle at var(--mouse-x) var(--mouse-y), rgba(16, 185, 129, 0.15) 0%, transparent 40%)'
                }}
            />

            {/* Arcade Grid Animation Background */}
            <div className="absolute inset-0 z-0 pointer-events-none" style={{ perspective: '1000px' }}>
                <div className="absolute bottom-0 left-0 w-full h-[60%] bg-gradient-to-t from-emerald-900/10 to-transparent"></div>
                <div 
                    className="absolute bottom-0 w-full h-[200%] origin-bottom opacity-20"
                    style={{
                        backgroundImage: `
                            linear-gradient(to right, rgba(16, 185, 129, 0.2) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(16, 185, 129, 0.2) 1px, transparent 1px)
                        `,
                        backgroundSize: '40px 40px',
                        transform: 'rotateX(75deg) translateY(0)',
                        animation: 'grid-scroll 10s linear infinite',
                    }}
                />
            </div>

            <style>{`
                @keyframes grid-scroll {
                    0% { transform: rotateX(75deg) translateY(0); }
                    100% { transform: rotateX(75deg) translateY(40px); }
                }
            `}</style>

            {/* Login Card */}
            <div className="w-full max-w-[420px] bg-[#09090b]/80 p-10 rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,1)] border border-white/[0.05] border-t-emerald-500/20 backdrop-blur-3xl transform transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_30px_60px_-15px_rgba(16,185,129,0.1)] relative z-10 group overflow-hidden">
                
                {/* Inner ambient card glow */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>

                <div className="flex justify-center mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-zinc-950 border border-white/10 flex items-center justify-center shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] group-hover:border-emerald-500/30 transition-colors duration-500 relative">
                        {mode === 'login' ? <HeartPulse className="w-6 h-6 text-emerald-400" /> : <KeyRound className="w-6 h-6 text-emerald-400" />}
                        <div className="absolute inset-0 rounded-2xl bg-emerald-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                </div>

                <div className="text-center mb-8 transform transition-transform duration-500">
                    <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-400 tracking-tight drop-shadow-md">Apollo CRM</h1>
                    <p className="text-emerald-500/80 text-[10px] mt-2 font-bold tracking-[0.3em] uppercase">
                        {mode === 'login' ? 'Secure Access Portal' : 'Password Recovery'}
                    </p>
                </div>
                
                {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-6 text-sm text-center animate-pulse backdrop-blur-md">{error}</div>}
                {success && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl mb-6 text-sm text-center backdrop-blur-md">{success}</div>}
                
                <form onSubmit={handleAuth} className="space-y-5 relative z-10">
                    <div className="group/input">
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 transition-colors group-focus-within/input:text-emerald-400">Email Address</label>
                        <input 
                            type="email" 
                            className="w-full bg-[#050505] text-zinc-100 rounded-2xl px-4 py-4 border border-white/5 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] transition-all duration-300 focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 hover:border-white/10 text-sm font-medium"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    
                    {mode === 'login' && (
                        <div className="group/input animate-in fade-in slide-in-from-top-2 duration-300">
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 transition-colors group-focus-within/input:text-emerald-400 flex justify-between">
                                <span>Password</span>
                                <button type="button" onClick={() => { setMode('reset'); setError(''); setSuccess(''); }} className="text-emerald-500/70 hover:text-emerald-400 transition-colors">Forgot?</button>
                            </label>
                            <input 
                                type="password" 
                                className="w-full bg-[#050505] text-zinc-100 rounded-2xl px-4 py-4 border border-white/5 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] transition-all duration-300 focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 hover:border-white/10 text-sm font-medium"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    <div className="pt-4">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className={`relative overflow-hidden w-full text-white font-black py-4.5 rounded-2xl transition-all duration-300 disabled:opacity-80 disabled:pointer-events-none group/btn shadow-[0_8px_0_rgba(6,78,59,1)] active:shadow-none active:translate-y-2 ${loading ? 'bg-emerald-700 shadow-none translate-y-2' : 'bg-gradient-to-b from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 hover:-translate-y-1'}`}
                        >
                            <span className="relative z-10 text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> {mode === 'login' ? 'Authenticating...' : 'Submitting...'}</> : (mode === 'login' ? 'Authenticate' : 'Request Reset')}
                            </span>
                            {/* 3D Glass overlay & Shine */}
                            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
                            {!loading && (
                                <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 transition-all duration-700 group-hover/btn:left-[200%] pointer-events-none"></div>
                            )}
                        </button>
                    </div>

                    {mode === 'reset' && (
                        <div className="text-center pt-2 animate-in fade-in">
                            <button type="button" onClick={() => { setMode('login'); setError(''); setSuccess(''); }} className="text-[11px] text-zinc-500 hover:text-zinc-300 font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-1 mx-auto">
                                <ArrowLeft className="w-3 h-3" /> Back to Login
                            </button>
                        </div>
                    )}
                </form>

                {mode === 'login' && (
                    <div className="mt-8 text-center text-[10px] text-zinc-600 font-bold uppercase tracking-widest space-y-1">
                        <p className="hover:text-emerald-500/50 transition-colors cursor-default">Demo: admin@apollo.com / admin</p>
                        <p className="hover:text-emerald-500/50 transition-colors cursor-default">Demo: agent@apollo.com / agent</p>
                        <p className="hover:text-emerald-500/50 transition-colors cursor-default">Demo: reception@apollo.com / reception</p>
                    </div>
                )}
            </div>
        </div>
    );
}
