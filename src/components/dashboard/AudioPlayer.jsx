import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, FastForward, Rewind, Download, Volume2, X } from 'lucide-react';

export default function AudioPlayer({ log, onClose }) {
    const [isPlaying, setIsPlaying] = useState(true);
    const [progress, setProgress] = useState(0);
    const [speed, setSpeed] = useState(1);
    const [currentTime, setCurrentTime] = useState('00:00');
    
    const durationStr = log.duration || '05:00';
    
    // Mock progress simulation since we don't have a real audio file
    useEffect(() => {
        let interval;
        if (isPlaying) {
            interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        setIsPlaying(false);
                        return 100;
                    }
                    return prev + (0.5 * speed);
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, speed]);

    useEffect(() => {
        // Convert progress % to time based on mock 5 mins total
        const totalSeconds = 300; // 5 mins
        const currentSeconds = Math.floor((progress / 100) * totalSeconds);
        const mins = Math.floor(currentSeconds / 60);
        const secs = currentSeconds % 60;
        setCurrentTime(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
    }, [progress]);

    const togglePlay = () => setIsPlaying(!isPlaying);
    
    const handleSeek = (e) => {
        setProgress(Number(e.target.value));
    };

    const cycleSpeed = () => {
        if (speed === 1) setSpeed(1.5);
        else if (speed === 1.5) setSpeed(2);
        else setSpeed(1);
    };

    const handleDownload = () => {
        alert(`Downloading recording for ${log.id}...`);
    };

    return (
        <div className="flex flex-col gap-4 bg-zinc-950 border border-emerald-500/20 p-5 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300 shadow-[0_10px_30px_rgba(16,185,129,0.05)] relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-zinc-900">
                <div 
                    className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-300"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            <div className="flex justify-between items-center relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-inner relative">
                        {isPlaying && (
                            <div className="absolute inset-0 rounded-full border border-emerald-500/50 animate-ping opacity-50"></div>
                        )}
                        <Volume2 className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="text-zinc-100 font-bold text-sm tracking-tight">Interaction Recording</h4>
                        <p className="text-xs text-zinc-500 font-mono mt-0.5">{log.id} • {log.customer}</p>
                    </div>
                </div>
                
                <button 
                    onClick={onClose}
                    className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-red-500/20 hover:border-red-500/30 border border-transparent transition-all"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            <div className="flex items-center gap-6 mt-2 relative z-10">
                {/* Controls */}
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setProgress(Math.max(0, progress - 5))}
                        className="p-2 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-full transition-colors"
                        title="Rewind 15s"
                    >
                        <Rewind className="w-4 h-4" />
                    </button>
                    
                    <button 
                        onClick={togglePlay}
                        className="w-10 h-10 flex items-center justify-center bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all transform hover:scale-105 active:scale-95"
                    >
                        {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
                    </button>
                    
                    <button 
                        onClick={() => setProgress(Math.min(100, progress + 5))}
                        className="p-2 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-full transition-colors"
                        title="Fast Forward 15s"
                    >
                        <FastForward className="w-4 h-4" />
                    </button>
                </div>

                {/* Scrubber */}
                <div className="flex-1 flex items-center gap-3">
                    <span className="text-[10px] font-mono text-zinc-500 w-8 text-right">{currentTime}</span>
                    <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={progress}
                        onChange={handleSeek}
                        className="flex-1 h-1 bg-zinc-800 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-400 cursor-pointer"
                    />
                    <span className="text-[10px] font-mono text-zinc-500 w-8">{durationStr}</span>
                </div>

                {/* Utilities */}
                <div className="flex items-center gap-2 border-l border-white/5 pl-6">
                    <button 
                        onClick={cycleSpeed}
                        className="px-2 py-1 bg-zinc-900 border border-white/5 text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/30 rounded text-[10px] font-bold font-mono transition-colors min-w-[36px]"
                        title="Playback Speed"
                    >
                        {speed}x
                    </button>
                    <button 
                        onClick={handleDownload}
                        className="p-2 text-zinc-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                        title="Download Recording"
                    >
                        <Download className="w-4 h-4" />
                    </button>
                </div>
            </div>
            
            {/* Audio Waveform visualization */}
            {isPlaying && (
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] flex items-center justify-around z-0 px-10">
                    {[...Array(40)].map((_, i) => (
                        <div key={i} className="w-1 bg-emerald-500 rounded-full animate-pulse" style={{ height: `${20 + Math.random() * 80}%`, animationDelay: `${Math.random()}s`, animationDuration: `${0.5 + Math.random()}s` }}></div>
                    ))}
                </div>
            )}
        </div>
    );
}
