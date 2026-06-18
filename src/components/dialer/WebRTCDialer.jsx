import { useState, useEffect, useRef } from 'react';
import { Delete } from 'lucide-react';

export default function WebRTCDialer() {
    const [number, setNumber] = useState('');
    const [callState, setCallState] = useState('offline'); // offline, idle, ringing, connected
    const exotelClient = useRef(null);

    useEffect(() => {
        // Initialize Exotel SDK when component mounts
        const subscriberName = import.meta.env.VITE_EXOTEL_SUBSCRIBER_NAME;
        const sipPassword = import.meta.env.VITE_EXOTEL_SIP_PASSWORD;
        const accountSid = import.meta.env.VITE_EXOTEL_ACCOUNT_SID;

        if (!subscriberName || !sipPassword || !accountSid) {
            console.warn('[Exotel WebRTC] Missing API credentials in .env. Falling back to mock SDK behavior.');
            setCallState('idle'); // Mock ready state
            return;
        }

        try {
            // Assuming window.Exotel is available via the script tag injected in index.html
            exotelClient.current = new window.Exotel({
                username: subscriberName,
                password: sipPassword,
                account_sid: accountSid,
                onReady: () => {
                    console.log('[Exotel WebRTC] Softphone registered and ready.');
                    setCallState('idle');
                },
                onIncomingCall: (callDetails) => {
                    console.log('[Exotel WebRTC] Incoming Call ringing...', callDetails);
                    setCallState('ringing');
                },
                onCallEstablished: () => {
                    setCallState('connected');
                },
                onCallEnded: () => {
                    setCallState('idle');
                },
                onError: (err) => {
                    console.error('[Exotel WebRTC] Error:', err);
                    setCallState('offline');
                }
            });

            exotelClient.current.init();

        } catch (error) {
            console.error('[Exotel WebRTC] Failed to initialize:', error);
            setCallState('offline');
        }

        return () => {
            if (exotelClient.current) {
                // Cleanup logic if Exotel SDK supports it
                // exotelClient.current.destroy();
            }
        };
    }, []);

    const handleDial = (num) => {
        if (num === 'CLEAR') {
            setNumber('');
            return;
        }
        if (num === 'BACKSPACE') {
            setNumber(prev => prev.slice(0, -1));
            return;
        }
        setNumber(prev => {
            if (prev.length >= 12) return prev; // Limit to 12 digits
            return prev + num;
        });
    };

    const call = async () => {
        if (!number) return;
        setCallState('ringing');

        if (exotelClient.current) {
            console.log(`[Exotel WebRTC] Dialing ${number}...`);
            // Request Mic permissions before dialing
            try {
                await navigator.mediaDevices.getUserMedia({ audio: true });
                exotelClient.current.dial(number);
            } catch (err) {
                console.error('[Exotel WebRTC] Microphone access denied', err);
                alert('You must allow microphone access to make calls.');
                setCallState('idle');
            }
        } else {
            console.log(`[Mock SDK] Dialing ${number}...`);
            setTimeout(() => setCallState('connected'), 2000);
        }
    };

    const endCall = () => {
        if (exotelClient.current) {
            exotelClient.current.hangup();
        } else {
            console.log('[Mock SDK] Call ended.');
        }
        setCallState('idle');
        setNumber('');
    };

    return (
        <div className="bg-zinc-900/80 p-6 rounded-2xl shadow-[0_15px_40px_-15px_rgba(0,0,0,1)] border border-white/5 border-t-white/10 backdrop-blur-xl w-full text-center h-full flex flex-col transform transition-all duration-500 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,1)] relative overflow-hidden group">
            {/* Inner glow for 3D volume */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <h2 className="text-xl font-bold mb-6 text-zinc-100 flex items-center justify-center gap-2 relative z-10">
                <span className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${callState === 'offline' ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]' : callState === 'idle' ? 'bg-zinc-500 shadow-inner' : callState === 'ringing' ? 'bg-yellow-400 animate-pulse shadow-[0_0_15px_rgba(250,204,21,0.8)]' : 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)]'}`}></span>
                Exotel Softphone
            </h2>
            
            <div className="bg-[#050505] rounded-xl mb-6 p-6 border border-white/[0.03] shadow-[inset_0_8px_32px_rgba(0,0,0,1)] flex-1 flex flex-col items-center justify-center relative z-10 overflow-hidden group/display min-h-[100px]">
                <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover/display:opacity-100 transition-opacity duration-300"></div>
                
                {/* Delete Button */}
                <button 
                    onClick={() => handleDial('BACKSPACE')}
                    disabled={!number || callState !== 'idle'}
                    className="absolute top-3 right-3 text-zinc-600 hover:text-red-400 disabled:opacity-0 transition-all duration-200"
                >
                    <Delete className="w-4 h-4" />
                </button>

                <h3 className="text-4xl font-mono tracking-widest text-zinc-100 drop-shadow-md relative z-10 w-full leading-tight select-none">
                    {number || <span className="opacity-20 text-zinc-500">_</span>}
                </h3>
                
                {/* Realistic Status Indicator */}
                <div className="mt-4 flex items-center gap-2 bg-zinc-950/80 px-3 py-1 rounded-full border border-white/[0.02] shadow-inner">
                    <span className={`w-1.5 h-1.5 rounded-full ${callState === 'connected' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : callState === 'ringing' ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.8)] animate-pulse' : 'bg-zinc-600'}`}></span>
                    <p className={`text-[9px] uppercase tracking-widest font-bold font-mono transition-colors duration-300 ${callState === 'connected' ? 'text-emerald-400' : callState === 'ringing' ? 'text-yellow-500' : 'text-zinc-500'}`}>{callState}</p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6 relative z-10">
                {['1','2','3','4','5','6','7','8','9','*','0','#'].map(num => (
                    <button 
                        key={num} 
                        onClick={() => handleDial(num)}
                        disabled={callState === 'offline'}
                        className="bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 font-medium h-14 rounded-xl shadow-[0_4px_10px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] transition-all duration-200 active:scale-95 active:shadow-[inset_0_4px_10px_rgba(0,0,0,0.6)] text-2xl disabled:opacity-30 disabled:pointer-events-none hover:text-white flex items-center justify-center"
                    >
                        {num}
                    </button>
                ))}
            </div>

            <div className="flex gap-4 justify-center relative z-10">
                {callState === 'idle' ? (
                    <button onClick={call} className="bg-emerald-600 hover:bg-emerald-500 text-white w-full py-4 rounded-xl font-bold tracking-widest shadow-[0_8px_20px_-8px_rgba(16,185,129,0.8),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all duration-300 active:scale-95 active:shadow-[inset_0_6px_15px_rgba(0,0,0,0.4)] hover:-translate-y-1">
                        CALL
                    </button>
                ) : callState === 'offline' ? (
                    <button disabled className="bg-zinc-800 text-zinc-500 w-full py-4 rounded-xl font-bold tracking-widest shadow-inner border border-zinc-700/50">
                        OFFLINE
                    </button>
                ) : (
                    <button onClick={endCall} className="bg-red-600 hover:bg-red-500 text-white w-full py-4 rounded-xl font-bold tracking-widest shadow-[0_8px_20px_-8px_rgba(239,68,68,0.8),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all duration-300 active:scale-95 active:shadow-[inset_0_6px_15px_rgba(0,0,0,0.4)] hover:-translate-y-1">
                        END CALL
                    </button>
                )}
            </div>
        </div>
    );
}
