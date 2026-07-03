import { useState } from 'react';
import { Calculator, Send, FileText, CheckCircle2 } from 'lucide-react';

const mockProcedures = [
    { id: 1, name: 'Knee Replacement', baseCost: 150000 },
    { id: 2, name: 'MRI Scan (Brain)', baseCost: 12000 },
    { id: 3, name: 'Cardiac Bypass Surgery', baseCost: 350000 },
    { id: 4, name: 'General Consultation', baseCost: 1500 }
];

const mockInsurances = [
    { id: 1, name: 'Star Health', coverage: 0.8 },
    { id: 2, name: 'HDFC ERGO', coverage: 0.85 },
    { id: 3, name: 'ICICI Lombard', coverage: 0.75 },
    { id: 4, name: 'No Insurance / Cash', coverage: 0 }
];

export default function BillingEstimator({ activeCall }) {
    const [procedure, setProcedure] = useState(mockProcedures[0]);
    const [insurance, setInsurance] = useState(mockInsurances[0]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [quoteSent, setQuoteSent] = useState(false);

    const coverageAmount = procedure.baseCost * insurance.coverage;
    const outOfPocket = procedure.baseCost - coverageAmount;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    };

    const handleSendQuote = () => {
        setIsGenerating(true);
        // Simulate PDF generation and WhatsApp dispatch
        setTimeout(() => {
            setIsGenerating(false);
            setQuoteSent(true);
            setTimeout(() => setQuoteSent(false), 3000);
        }, 1500);
    };

    return (
        <div className="bg-[#09090b]/80 border border-white/[0.05] rounded-2xl p-5 shadow-[0_10px_30px_-15px_rgba(0,0,0,1)] backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Calculator className="w-16 h-16 text-blue-500" />
            </div>
            
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                Dynamic Billing Estimator
            </h3>

            <div className="space-y-4 relative z-10">
                <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Select Procedure</label>
                    <select 
                        className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-blue-500"
                        value={procedure.id}
                        onChange={(e) => setProcedure(mockProcedures.find(p => p.id === parseInt(e.target.value)))}
                    >
                        {mockProcedures.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Insurance Provider</label>
                    <select 
                        className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-blue-500"
                        value={insurance.id}
                        onChange={(e) => setInsurance(mockInsurances.find(i => i.id === parseInt(e.target.value)))}
                    >
                        {mockInsurances.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                    </select>
                </div>

                <div className="bg-zinc-950/80 border border-white/5 rounded-xl p-4 mt-2">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-zinc-400">Total Estimate</span>
                        <span className="text-sm font-bold text-zinc-200">{formatCurrency(procedure.baseCost)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-emerald-500/70">Est. Insurance Coverage</span>
                        <span className="text-sm font-bold text-emerald-400">-{formatCurrency(coverageAmount)}</span>
                    </div>
                    <div className="h-px w-full bg-white/10 my-3"></div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-amber-500/70 uppercase tracking-widest">Est. Out of Pocket</span>
                        <span className="text-lg font-black text-amber-400">{formatCurrency(outOfPocket)}</span>
                    </div>
                </div>

                <button 
                    onClick={handleSendQuote}
                    disabled={isGenerating || quoteSent || !activeCall}
                    className={`w-full py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                        quoteSent 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : !activeCall 
                        ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]'
                    }`}
                >
                    {isGenerating ? (
                        <span className="animate-pulse flex items-center gap-2"><FileText className="w-4 h-4" /> Generating PDF...</span>
                    ) : quoteSent ? (
                        <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Sent to WhatsApp</span>
                    ) : (
                        <span className="flex items-center gap-2"><Send className="w-4 h-4" /> Send PDF Quote via WA</span>
                    )}
                </button>
            </div>
        </div>
    );
}
