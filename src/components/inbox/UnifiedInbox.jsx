import { useState } from 'react';
import { MessageSquare, Send, Phone } from 'lucide-react';

export default function UnifiedInbox({ customerPhone }) {
    const [messages, setMessages] = useState([
        { id: 1, sender: 'system', text: 'WhatsApp channel securely connected.', time: '10:00 AM' }
    ]);
    const [input, setInput] = useState('');

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || !customerPhone) return;

        const messageText = input;
        const newMsg = { id: Date.now(), sender: 'agent', text: messageText, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
        setMessages([...messages, newMsg]);
        setInput('');

        try {
            const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/messages/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ to: customerPhone, text: messageText })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            console.log('[UnifiedInbox] Message delivered via API:', data.status);
        } catch (err) {
            console.error('[UnifiedInbox] Failed to deliver:', err.message);
        }
    };

    return (
        <div className="bg-[#09090b]/80 p-5 rounded-2xl shadow-[0_15px_40px_-15px_rgba(0,0,0,1)] border border-white/[0.05] border-t-white/[0.1] backdrop-blur-xl h-full flex flex-col relative overflow-hidden group">
            {/* Ambient light */}
            <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[80px] pointer-events-none"></div>

            <div className="flex justify-between items-center mb-5 relative z-10 border-b border-white/[0.05] pb-4">
                <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-blue-400" />
                    </div>
                    Unified Inbox
                </h2>
                <div className="flex items-center gap-2 text-zinc-400 bg-zinc-950/50 px-3 py-1.5 rounded-lg border border-white/[0.05]">
                    <Phone className="w-3.5 h-3.5" />
                    <span className="text-xs font-mono">{customerPhone || 'Waiting...'}</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto mb-4 space-y-3 custom-scrollbar relative z-10 pr-2">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex flex-col ${msg.sender === 'agent' ? 'items-end' : 'items-start'}`}>
                        <div className={`px-4 py-2.5 rounded-xl max-w-[85%] text-sm shadow-md ${msg.sender === 'agent' ? 'bg-blue-600/90 text-white rounded-tr-sm border border-blue-500/50' : 'bg-zinc-800/80 text-zinc-200 rounded-tl-sm border border-white/5'}`}>
                            {msg.text}
                        </div>
                        <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-1.5 mx-1">{msg.time}</span>
                    </div>
                ))}
            </div>

            <form onSubmit={sendMessage} className="relative z-10">
                <div className="relative group/input">
                    <input 
                        type="text" 
                        disabled={!customerPhone}
                        placeholder={customerPhone ? "Type WhatsApp message..." : "Waiting for active call..."}
                        className="w-full bg-zinc-950/50 text-zinc-100 rounded-xl pl-4 pr-12 py-3.5 border border-white/5 shadow-inner transition-all duration-300 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 text-sm"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <button 
                        type="submit"
                        disabled={!input.trim() || !customerPhone}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none active:scale-95 shadow-[0_0_10px_rgba(37,99,235,0.4)]"
                    >
                        <Send className="w-4 h-4 -ml-0.5" />
                    </button>
                </div>
            </form>
        </div>
    );
}
