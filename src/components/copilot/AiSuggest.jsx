import { useState, useEffect } from 'react';
import { Bot, Sparkles, Loader2 } from 'lucide-react';

export default function AiSuggest({ activeCall }) {
    const [transcript, setTranscript] = useState('');
    const [suggestion, setSuggestion] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    // Simulated transcript stream (in production, this would come from WebSockets / Exotel streaming)
    useEffect(() => {
        if (!activeCall) {
            setTranscript('');
            setSuggestion('');
            return;
        }

        const mockPhrases = [
            "Hi, I'm calling about my chronic back pain.",
            "I need to book a follow up appointment with Dr. Smith.",
            "Can you tell me if he is available tomorrow?"
        ];

        let index = 0;
        const interval = setInterval(() => {
            if (index < mockPhrases.length) {
                setTranscript(prev => prev + " " + mockPhrases[index]);
                generateSuggestion(mockPhrases[index]);
                index++;
            }
        }, 5000); // New phrase every 5 seconds

        return () => clearInterval(interval);
    }, [activeCall]);

    const generateSuggestion = async (newTranscript) => {
        setIsGenerating(true);
        try {
            const res = await fetch('http://localhost:5000/api/ai/copilot-suggest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transcript: newTranscript })
            });
            const data = await res.json();
            if (data.suggestion) setSuggestion(data.suggestion);
        } catch (error) {
            console.error('Failed to get AI suggestion', error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="bg-[#09090b]/80 p-5 rounded-2xl shadow-[0_15px_40px_-15px_rgba(0,0,0,1)] border border-white/[0.05] border-t-white/[0.1] backdrop-blur-xl h-full flex flex-col relative overflow-hidden group">
            {/* Ambient light */}
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[80px] pointer-events-none"></div>

            <div className="flex justify-between items-center mb-5 relative z-10 border-b border-white/[0.05] pb-4">
                <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-purple-400" />
                    </div>
                    AI Copilot
                </h2>
                <div className="flex items-center gap-2">
                    {isGenerating && <Loader2 className="w-3.5 h-3.5 text-purple-400 animate-spin" />}
                    <span className="text-[10px] font-bold text-purple-400 bg-purple-400/10 px-2 py-1 rounded uppercase tracking-widest border border-purple-400/20">Active</span>
                </div>
            </div>

            <div className="flex-1 flex flex-col gap-4 relative z-10">
                <div className="bg-zinc-950/50 p-4 rounded-xl border border-white/[0.02] shadow-inner h-24 overflow-y-auto custom-scrollbar">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-600 mb-2">Live Transcript</p>
                    <p className="text-sm text-zinc-300 leading-relaxed italic">
                        {transcript || (activeCall ? "Listening to customer..." : "Waiting for active call...")}
                    </p>
                </div>

                <div className="flex-1 bg-purple-500/5 p-4 rounded-xl border border-purple-500/10 shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)] flex flex-col relative overflow-hidden">
                    <div className="absolute -top-6 -right-6 text-purple-500/10">
                        <Sparkles className="w-24 h-24" />
                    </div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-purple-400 mb-3 flex items-center gap-2">
                        <Sparkles className="w-3 h-3" />
                        Suggested Response
                    </p>
                    <div className="flex-1 flex items-center">
                        {suggestion ? (
                            <p className="text-base text-zinc-100 font-medium leading-relaxed drop-shadow-md">"{suggestion}"</p>
                        ) : (
                            <p className="text-sm text-zinc-500 italic">Copilot is analyzing context...</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
