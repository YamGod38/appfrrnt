import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Star, ShieldCheck, HeartPulse, Send, CheckCircle2, Loader2, MessageSquareText } from 'lucide-react';

export default function Feedback() {
    const { id } = useParams();
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comments, setComments] = useState('');
    const [status, setStatus] = useState('idle'); // idle, submitting, success, error

    useEffect(() => {
        document.title = 'Apollo Hospitals - Patient Feedback';
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) return;

        setStatus('submitting');
        try {
            const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/feedback/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ callId: id, rating, comments })
            });
            const data = await res.json();
            
            if (data.success) {
                setStatus('success');
            } else {
                setStatus('error');
            }
        } catch (err) {
            console.error(err);
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 selection:bg-emerald-500/30">
                <div className="w-full max-w-md bg-zinc-900/40 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-10 text-center shadow-[0_0_50px_rgba(16,185,129,0.15)] animate-in zoom-in-95 duration-500">
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                    </div>
                    <h1 className="text-2xl font-black tracking-tight text-zinc-100 mb-3">Thank You!</h1>
                    <p className="text-zinc-400 text-sm leading-relaxed mb-8">
                        Your feedback is invaluable. It helps us continually improve our care and ensures we provide the best possible experience for you.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-500 bg-emerald-500/10 py-3 rounded-xl border border-emerald-500/20">
                        <ShieldCheck className="w-4 h-4" /> Apollo Quality Assurance
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 relative overflow-hidden selection:bg-emerald-500/30">
            {/* Background Effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none opacity-50 mix-blend-screen"></div>

            <div className="w-full max-w-lg relative z-10">
                {/* Header Logo */}
                <div className="flex flex-col items-center justify-center mb-10">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)] mb-4">
                        <HeartPulse className="w-8 h-8 text-zinc-950" />
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-white">Apollo <span className="text-zinc-500">Care</span></h1>
                    <p className="text-emerald-400 font-bold uppercase tracking-widest text-[10px] mt-2 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">Patient Feedback</p>
                </div>

                {/* Form Card */}
                <div className="bg-[#09090b]/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
                    {/* Inner subtle glow */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>

                    <div className="text-center mb-10">
                        <h2 className="text-xl font-bold text-zinc-100 mb-2">How was your experience?</h2>
                        <p className="text-sm text-zinc-400">Please rate the assistance you received during your recent call.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Star Rating */}
                        <div className="flex flex-col items-center justify-center gap-4">
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        type="button"
                                        key={star}
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHover(star)}
                                        onMouseLeave={() => setHover(0)}
                                        className="relative group p-1 transition-transform hover:scale-110 focus:outline-none"
                                    >
                                        <Star 
                                            className={`w-12 h-12 transition-all duration-300 ${
                                                star <= (hover || rating) 
                                                ? 'fill-emerald-400 text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]' 
                                                : 'fill-zinc-800 text-zinc-700'
                                            }`} 
                                        />
                                    </button>
                                ))}
                            </div>
                            <div className="h-4">
                                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 animate-in fade-in zoom-in duration-300">
                                    {rating === 1 && 'Poor'}
                                    {rating === 2 && 'Fair'}
                                    {rating === 3 && 'Good'}
                                    {rating === 4 && 'Very Good'}
                                    {rating === 5 && 'Excellent!'}
                                </span>
                            </div>
                        </div>

                        {/* Comments */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                <MessageSquareText className="w-4 h-4" /> Tell us more (Optional)
                            </label>
                            <textarea
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                                placeholder="What did you like? What can we improve?"
                                rows="4"
                                className="w-full bg-zinc-950/50 border border-white/5 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all resize-none placeholder:text-zinc-600"
                            ></textarea>
                        </div>

                        {/* Error Message */}
                        {status === 'error' && (
                            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium p-3 rounded-xl text-center">
                                Something went wrong. Please try again.
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={rating === 0 || status === 'submitting'}
                            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 ${
                                rating > 0
                                ? 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                            }`}
                        >
                            {status === 'submitting' ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" /> Submitting...
                                </>
                            ) : (
                                <>
                                    Submit Feedback <Send className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
                
                <div className="text-center mt-8">
                    <p className="text-[10px] text-zinc-600 font-medium">Secured by Apollo Enterprise Systems</p>
                </div>
            </div>
        </div>
    );
}
