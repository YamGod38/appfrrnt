import { useState, useEffect } from 'react';
import { CalendarDays, Loader2, Sparkles, ChevronRight, MapPin, Building2, CheckCircle2, BedDouble, Plus, X } from 'lucide-react';

export default function HotelBooking({ activeCall }) {
    const [hotels, setHotels] = useState([]);
    const [selectedHotel, setSelectedHotel] = useState(null);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [checkInDate, setCheckInDate] = useState('');
    const [checkOutDate, setCheckOutDate] = useState('');
    const [guestNames, setGuestNames] = useState(['']); // Start with one empty input
    const [status, setStatus] = useState('idle');

    useEffect(() => {
        const fetchHotels = async () => {
            try {
                const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/hotels');
                const data = await res.json();
                if (data.success) {
                    setHotels(data.data);
                }
            } catch (err) {
                console.error('Failed to fetch hotels:', err);
            }
        };
        fetchHotels();
    }, []);

    const handleAddGuest = () => {
        setGuestNames([...guestNames, '']);
    };

    const handleRemoveGuest = (index) => {
        const newGuests = guestNames.filter((_, i) => i !== index);
        if (newGuests.length === 0) newGuests.push('');
        setGuestNames(newGuests);
    };

    const handleGuestNameChange = (index, value) => {
        const newGuests = [...guestNames];
        newGuests[index] = value;
        setGuestNames(newGuests);
    };

    const handleBooking = async (e) => {
        e.preventDefault();
        if (!selectedHotel || !selectedRoom || !checkInDate || !checkOutDate) return;
        setStatus('booking');
        
        try {
            const agentName = localStorage.getItem('name') || 'Agent Alpha';
            const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/hotels/book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    hotel_id: selectedHotel.id,
                    room_id: selectedRoom.id,
                    patient_name: activeCall?.customerInfo?.full_name || 'Walk-in Patient',
                    guest_names: guestNames.filter(n => n.trim() !== ''),
                    check_in: checkInDate,
                    check_out: checkOutDate,
                    agent_name: agentName
                })
            });
            
            if (res.ok) {
                setStatus('success');
            } else {
                setStatus('idle');
                alert('Booking failed.');
            }
        } catch (err) {
            console.error(err);
            setStatus('idle');
        }
    };

    return (
        <div className="bg-[#050505] rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,1)] border border-white/[0.05] w-full h-full flex flex-col relative overflow-hidden group print:bg-white print:text-black print:border-none print:shadow-none print:h-auto print:overflow-visible print:block">
            
            {/* Animated Background Mesh - Hidden on Print */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-40 print:hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] mix-blend-screen animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
            </div>

            {/* Header - Hidden on Print */}
            <div className="p-8 pb-4 relative z-10 flex justify-between items-start border-b border-white/[0.05] bg-gradient-to-b from-white/[0.02] to-transparent print:hidden">
                <div>
                    <h2 className="text-3xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500 flex items-center gap-3 tracking-tight">
                        Hotel Reservations
                    </h2>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-amber-500" />
                        Live Luxury Inventory
                    </p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-zinc-900 border border-white/10 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] relative overflow-hidden group-hover:border-amber-500/30 transition-all duration-500">
                    <Sparkles className="w-5 h-5 text-amber-400 relative z-10" />
                    <div className="absolute inset-0 bg-amber-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 relative z-10 space-y-8 print:overflow-visible print:h-auto print:block print:p-0">
                
                {status === 'success' ? (
                    /* BOOKING SLIP (Printable) */
                    <div className="bg-zinc-950/80 border border-amber-500/20 rounded-2xl p-8 relative overflow-hidden print:bg-white print:border-black print:text-black">
                        {/* Print background watermark */}
                        <div className="absolute inset-0 opacity-5 pointer-events-none hidden print:flex items-center justify-center">
                            <Building2 className="w-64 h-64" />
                        </div>
                        
                        <div className="flex justify-between items-start mb-8 border-b border-white/10 print:border-black pb-6">
                            <div>
                                <h1 className="text-2xl font-black text-amber-400 print:text-black mb-1">APOLLO CONCIERGE</h1>
                                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest print:text-gray-500">Official Hotel Reservation</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xl font-mono font-bold text-zinc-100 print:text-black">#HTL{Math.floor(Math.random() * 1000000)}</p>
                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest print:text-gray-500">Ref ID</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8 mb-8">
                            <div>
                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 print:text-gray-500">Primary Guest</p>
                                <p className="text-lg font-bold text-zinc-100 print:text-black">{activeCall?.customerInfo?.full_name || 'Walk-in Patient'}</p>
                                <p className="text-sm font-mono text-zinc-400 print:text-gray-600">{activeCall?.callerNumber || '+91 98765 43210'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 print:text-gray-500">Hotel Property</p>
                                <p className="text-lg font-bold text-amber-400 print:text-black">{selectedHotel?.name || 'Partner Hotel'}</p>
                                <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest print:text-gray-600">{selectedRoom?.room_type || 'Standard Room'}</p>
                            </div>
                        </div>

                        {guestNames.filter(n => n.trim() !== '').length > 0 && (
                            <div className="mb-8">
                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 print:text-gray-500">Additional Registered Guests</p>
                                <div className="flex flex-wrap gap-2">
                                    {guestNames.filter(n => n.trim() !== '').map((guest, idx) => (
                                        <span key={idx} className="bg-zinc-900 border border-white/10 text-zinc-300 text-xs px-3 py-1.5 rounded-lg print:bg-gray-100 print:border-gray-300 print:text-black">
                                            {guest}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-6 flex justify-between items-center print:bg-gray-100 print:border-gray-300">
                            <div>
                                <p className="text-[10px] font-bold text-amber-500/70 uppercase tracking-widest mb-1 print:text-gray-500">Check-In</p>
                                <p className="text-xl font-black text-amber-400 print:text-black">{checkInDate}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-amber-500/70 uppercase tracking-widest mb-1 print:text-gray-500">Check-Out</p>
                                <p className="text-xl font-black text-amber-400 print:text-black">{checkOutDate}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                    {/* HOTEL SELECTION */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">1. Select Partner Hotel</label>
                            {selectedHotel && <span className="text-[10px] font-bold text-amber-400 tracking-widest uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">Selected</span>}
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            {hotels.map(hotel => (
                                <div 
                                    key={hotel.id}
                                    onClick={() => {
                                        setSelectedHotel(hotel);
                                        setSelectedRoom(null); // reset room on hotel change
                                    }}
                                    className={`rounded-2xl p-4 border transition-all duration-300 relative overflow-hidden group/hotel ${selectedHotel?.id === hotel.id ? 'cursor-pointer bg-amber-500/10 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.15)] -translate-y-1' : 'cursor-pointer bg-zinc-900/50 border-white/[0.05] hover:border-white/20 hover:bg-zinc-800'}`}
                                >
                                    {selectedHotel?.id === hotel.id && <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/20 blur-2xl"></div>}
                                    <div className="flex items-center gap-3 mb-2 relative z-10">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner transition-colors ${selectedHotel?.id === hotel.id ? 'bg-amber-500/20 text-amber-400' : 'bg-zinc-950 text-zinc-500 group-hover/hotel:text-zinc-300'}`}>
                                            <Building2 className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className={`text-sm font-bold transition-colors ${selectedHotel?.id === hotel.id ? 'text-amber-50' : 'text-zinc-300'}`}>{hotel.name}</h4>
                                            <p className="text-[10px] text-zinc-500 font-bold flex items-center gap-1 uppercase tracking-widest mt-0.5"><MapPin className="w-3 h-3" /> {hotel.location}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-3 relative z-10 flex gap-2">
                                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border ${selectedHotel?.id === hotel.id ? 'text-amber-400 border-amber-500/20 bg-amber-500/10' : 'text-zinc-400 border-white/10 bg-zinc-950'}`}>
                                            {hotel.rating}
                                        </span>
                                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border ${selectedHotel?.id === hotel.id ? 'text-purple-400 border-purple-500/20 bg-purple-500/10' : 'text-zinc-400 border-white/10 bg-zinc-950'}`}>
                                            {hotel.type}
                                        </span>
                                    </div>
                                    <div className="mt-2 text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                                        {hotel.rooms.length} Rooms Available
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="h-px w-full bg-gradient-to-r from-transparent via-white/[0.05] to-transparent"></div>

                    {/* ROOM TYPE & DATES SELECTION */}
                    <div className={`grid grid-cols-2 gap-8 transition-opacity duration-300 ${!selectedHotel ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                        {/* ROOM TYPE */}
                        <div>
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-4 block">2. Live Available Rooms</label>
                            <div className="space-y-3">
                                {selectedHotel && selectedHotel.rooms.length === 0 && (
                                    <p className="text-sm text-red-400 font-bold p-4 bg-red-500/10 rounded-xl border border-red-500/20">No rooms currently available for this property.</p>
                                )}
                                {selectedHotel?.rooms.map(room => (
                                    <div 
                                        key={room.id}
                                        onClick={() => setSelectedRoom(room)}
                                        className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${selectedRoom?.id === room.id ? 'bg-amber-500/10 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'bg-zinc-900/50 border-white/[0.05] hover:border-white/20'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedRoom?.id === room.id ? 'bg-amber-500/20 text-amber-400' : 'bg-zinc-950 text-zinc-500'}`}>
                                                <BedDouble className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h4 className={`text-sm font-bold ${selectedRoom?.id === room.id ? 'text-amber-400' : 'text-zinc-300'}`}>{room.room_type}</h4>
                                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{room.price}</p>
                                            </div>
                                        </div>
                                        {selectedRoom?.id === room.id && <CheckCircle2 className="w-5 h-5 text-amber-400" />}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* DATES & NAMES */}
                        <div className={`transition-opacity duration-300 ${!selectedRoom ? 'opacity-30 pointer-events-none' : 'opacity-100'} space-y-8`}>
                            
                            <div>
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-4 block">3. Select Dates</label>
                                <div className="space-y-4">
                                    <div className="relative group/input">
                                        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none z-10">
                                            <CalendarDays className="w-5 h-5 text-zinc-500 group-focus-within/input:text-amber-400 transition-colors" />
                                        </div>
                                        <input 
                                            type="date" 
                                            className="w-full bg-zinc-950 text-zinc-100 rounded-2xl pl-14 pr-5 py-4 border border-white/[0.05] shadow-[inset_0_2px_15px_rgba(0,0,0,0.8)] transition-all duration-300 focus:outline-none focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10 hover:border-white/10 cursor-pointer text-sm font-bold tracking-wide [color-scheme:dark] relative"
                                            value={checkInDate}
                                            onChange={(e) => setCheckInDate(e.target.value)}
                                        />
                                        <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
                                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Check In</span>
                                        </div>
                                    </div>
                                    
                                    <div className="relative group/input">
                                        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none z-10">
                                            <CalendarDays className="w-5 h-5 text-zinc-500 group-focus-within/input:text-amber-400 transition-colors" />
                                        </div>
                                        <input 
                                            type="date" 
                                            className="w-full bg-zinc-950 text-zinc-100 rounded-2xl pl-14 pr-5 py-4 border border-white/[0.05] shadow-[inset_0_2px_15px_rgba(0,0,0,0.8)] transition-all duration-300 focus:outline-none focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10 hover:border-white/10 cursor-pointer text-sm font-bold tracking-wide [color-scheme:dark] relative"
                                            value={checkOutDate}
                                            min={checkInDate}
                                            onChange={(e) => setCheckOutDate(e.target.value)}
                                        />
                                        <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
                                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Check Out</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-4 flex items-center justify-between">
                                    <span>4. Guest Names Registry</span>
                                    <button 
                                        type="button" 
                                        onClick={handleAddGuest}
                                        className="text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded"
                                    >
                                        <Plus className="w-3 h-3" /> Add Guest
                                    </button>
                                </label>
                                <div className="space-y-3">
                                    {guestNames.map((name, index) => (
                                        <div key={index} className="flex items-center gap-3">
                                            <input 
                                                type="text" 
                                                placeholder={`Guest Name ${index + 1}`}
                                                className="flex-1 bg-zinc-950 text-zinc-100 rounded-xl px-4 py-3 border border-white/[0.05] shadow-[inset_0_2px_15px_rgba(0,0,0,0.8)] transition-all duration-300 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 text-sm font-bold"
                                                value={name}
                                                onChange={(e) => handleGuestNameChange(index, e.target.value)}
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => handleRemoveGuest(index)}
                                                className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-500 hover:text-red-400 hover:border-red-500/30 transition-all"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    </>
                )}
            </div>

            {/* ACTION FOOTER - Hidden on Print */}
            <div className="p-8 border-t border-white/[0.05] bg-[#050505] relative z-20 print:hidden">
                {status === 'success' ? (
                    <div className="flex gap-4">
                        <button 
                            onClick={() => window.print()}
                            className="flex-1 bg-zinc-100 text-zinc-950 font-black py-5 rounded-2xl transition-all duration-300 hover:bg-white hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] tracking-[0.2em] uppercase text-sm flex items-center justify-center gap-2 active:scale-95"
                        >
                            Print Reservation
                        </button>
                        <button 
                            onClick={() => {
                                setStatus('idle');
                                setSelectedHotel(null);
                                setSelectedRoom(null);
                                setCheckInDate('');
                                setCheckOutDate('');
                                setGuestNames(['']);
                                // Force reload of hotels to get fresh availability
                                fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/hotels')
                                    .then(res => res.json())
                                    .then(data => data.success && setHotels(data.data));
                            }}
                            className="flex-1 bg-zinc-900 text-zinc-400 border border-white/10 font-bold py-5 rounded-2xl transition-all duration-300 hover:bg-zinc-800 hover:text-white tracking-[0.2em] uppercase text-sm flex items-center justify-center gap-2 active:scale-95"
                        >
                            New Reservation
                        </button>
                    </div>
                ) : (
                    <button 
                        onClick={handleBooking}
                        disabled={!selectedHotel || !selectedRoom || !checkInDate || !checkOutDate || status === 'booking'}
                        className={`relative w-full text-white font-black py-5 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none group/btn shadow-[0_8px_0_rgba(9,9,11,1)] active:shadow-none active:translate-y-2 ${status === 'booking' ? 'bg-amber-500/50' : 'bg-gradient-to-b from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]'}`}
                    >
                        <span className="relative z-10 tracking-[0.2em] uppercase text-sm flex items-center justify-center gap-2">
                            {status === 'booking' ? (
                                <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                            ) : (
                                <>Confirm Reservation <ChevronRight className="w-4 h-4" /></>
                            )}
                        </span>
                        
                        {/* Animated Shine Effect */}
                        {status !== 'booking' && (
                            <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 transition-all duration-700 group-hover/btn:left-[200%] pointer-events-none"></div>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}
