import { useState, useEffect } from 'react';

export default function KnowledgeBase() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);

    useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            return;
        }
        const fetchKB = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`http://localhost:5000/api/kb/search?q=${query}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!res.ok) throw new Error('API Error');
                const data = await res.json();
                setResults(data);
            } catch (err) {
                console.error('KB Search failed', err);
            }
        };
        const timeoutId = setTimeout(fetchKB, 300);
        return () => clearTimeout(timeoutId);
    }, [query]);

    return (
        <div className="bg-zinc-900/80 p-6 rounded-2xl shadow-xl shadow-black/60 border border-white/5 backdrop-blur-lg w-full flex flex-col h-full">
            <h2 className="text-xl font-bold mb-4 text-zinc-100">Knowledge Base</h2>
            <input 
                type="text" 
                placeholder="Search scripts (e.g. sugar, suite)..." 
                className="w-full bg-zinc-950 text-zinc-100 placeholder-zinc-500 rounded-lg px-4 py-3 border border-white/10 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all mb-4 shadow-inner"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                {results.length > 0 ? (
                    results.map(res => (
                        <div key={res.id} className="p-4 bg-zinc-950/50 rounded-xl border border-white/5 shadow-sm group hover:border-emerald-500/30 transition-colors">
                            <h3 className="font-bold text-emerald-400 text-sm mb-2">{res.title}</h3>
                            <p className="text-xs text-zinc-300 leading-relaxed">{res.content}</p>
                            <div className="flex flex-wrap gap-2 mt-3">
                                {res.tags && res.tags.map(tag => (
                                    <span key={tag} className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full border border-white/5">{tag}</span>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    query.length > 1 && <p className="text-sm text-zinc-500 text-center mt-10">No scripts found.</p>
                )}
            </div>
        </div>
    );
}
