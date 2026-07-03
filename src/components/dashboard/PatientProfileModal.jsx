import { useState } from 'react';
import { User, FileText, UploadCloud, X, Save, ShieldAlert, CheckCircle2, Eye } from 'lucide-react';

export default function PatientProfileModal({ show, onClose, customerInfo }) {
    const [activeTab, setActiveTab] = useState('details');
    const [isSaving, setIsSaving] = useState(false);
    
    // Vault state
    const [uploadedFiles, setUploadedFiles] = useState([
        { id: 1, name: 'Blood_Test_Report_Oct.pdf', size: '1.2 MB', date: '2023-10-15', type: 'pdf' },
        { id: 2, name: 'XRay_Chest.jpg', size: '4.5 MB', date: '2023-09-02', type: 'image' }
    ]);
    const [dragActive, setDragActive] = useState(false);

    // Profile form state
    const [formData, setFormData] = useState({
        full_name: customerInfo?.full_name || '',
        phone: customerInfo?.phone || '',
        email: customerInfo?.email || '',
        dob: '1985-04-12',
        blood_group: 'O+',
        chronic_conditions: 'Hypertension',
        address: customerInfo?.address || '',
        last_doctor: customerInfo?.last_doctor || ''
    });

    if (!show) return null;

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            // Mock upload
            const newFile = {
                id: Date.now(),
                name: e.dataTransfer.files[0].name,
                size: (e.dataTransfer.files[0].size / 1024 / 1024).toFixed(1) + ' MB',
                date: new Date().toISOString().split('T')[0],
                type: e.dataTransfer.files[0].type.includes('image') ? 'image' : 'pdf'
            };
            setUploadedFiles([newFile, ...uploadedFiles]);
        }
    };

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            alert('Patient Profile Updated Successfully');
        }, 1000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
            
            <div className="relative bg-[#09090b] border border-white/[0.05] shadow-2xl rounded-2xl w-full max-w-3xl overflow-hidden flex flex-col h-[600px] animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-white/[0.05] flex justify-between items-center bg-zinc-900/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-zinc-100">{formData.full_name || 'Patient Profile'}</h2>
                            <p className="text-xs font-mono text-zinc-500">HUID: {customerInfo?.huid || 'Unregistered'}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex px-6 border-b border-white/[0.05]">
                    <button 
                        onClick={() => setActiveTab('details')}
                        className={`px-4 py-3 text-sm font-bold tracking-widest uppercase border-b-2 transition-colors ${activeTab === 'details' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
                    >
                        Edit Details
                    </button>
                    <button 
                        onClick={() => setActiveTab('vault')}
                        className={`px-4 py-3 text-sm font-bold tracking-widest uppercase border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'vault' ? 'border-blue-500 text-blue-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
                    >
                        Medical Vault <ShieldAlert className="w-3 h-3" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {activeTab === 'details' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Full Name</label>
                                    <input type="text" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2.5 text-zinc-300 text-sm focus:outline-none focus:border-emerald-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Phone</label>
                                    <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2.5 text-zinc-300 text-sm focus:outline-none focus:border-emerald-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Date of Birth</label>
                                    <input type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2.5 text-zinc-300 text-sm focus:outline-none focus:border-emerald-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Blood Group</label>
                                    <select value={formData.blood_group} onChange={e => setFormData({...formData, blood_group: e.target.value})} className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2.5 text-zinc-300 text-sm focus:outline-none focus:border-emerald-500">
                                        <option>O+</option><option>O-</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Last Doctor Visited</label>
                                    <input type="text" value={formData.last_doctor} disabled className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2.5 text-zinc-500 text-sm opacity-70 cursor-not-allowed" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Address</label>
                                    <textarea value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} rows="2" className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2 text-zinc-300 text-sm focus:outline-none focus:border-emerald-500 resize-none"></textarea>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Chronic Conditions</label>
                                    <textarea value={formData.chronic_conditions} onChange={e => setFormData({...formData, chronic_conditions: e.target.value})} rows="3" className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2 text-zinc-300 text-sm focus:outline-none focus:border-emerald-500 resize-none"></textarea>
                                </div>
                            </div>
                            <div className="flex justify-end pt-4">
                                <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-6 py-2.5 rounded-lg font-bold text-sm uppercase tracking-widest transition-all">
                                    {isSaving ? <span className="animate-spin text-xl leading-none">⟳</span> : <Save className="w-4 h-4" />}
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'vault' && (
                        <div className="h-full flex flex-col animate-in fade-in duration-300">
                            {/* Drag & Drop Zone */}
                            <div 
                                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all flex-none mb-6 ${dragActive ? 'border-blue-500 bg-blue-500/5 scale-[1.02]' : 'border-white/10 hover:border-blue-500/30 hover:bg-blue-500/5'}`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                <UploadCloud className={`w-12 h-12 mx-auto mb-3 transition-colors ${dragActive ? 'text-blue-400' : 'text-zinc-600'}`} />
                                <h3 className="text-zinc-300 font-bold mb-1">Drag and drop files here</h3>
                                <p className="text-zinc-500 text-sm">Supports PDFs, JPEGs, and PNGs sent by patients via WhatsApp</p>
                                <div className="mt-4 relative">
                                    <button className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                        Browse Files
                                    </button>
                                    <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={e => {
                                        if (e.target.files && e.target.files[0]) handleDrop({ preventDefault: () => {}, stopPropagation: () => {}, dataTransfer: { files: e.target.files } });
                                    }} />
                                </div>
                            </div>

                            {/* Uploaded Files Grid */}
                            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Patient Documents</h4>
                            <div className="grid grid-cols-2 gap-4 overflow-y-auto custom-scrollbar flex-1 pr-2">
                                {uploadedFiles.map(file => (
                                    <div key={file.id} className="bg-zinc-950 border border-white/5 rounded-xl p-4 flex gap-4 items-start hover:border-blue-500/30 transition-colors group">
                                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-none">
                                            <FileText className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-bold text-zinc-200 truncate">{file.name}</p>
                                            <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                                                <span>{file.size}</span>
                                                <span>•</span>
                                                <span>{file.date}</span>
                                            </div>
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-2 transition-all">
                                            <button 
                                                onClick={() => alert(`Opening secure document viewer for: ${file.name}`)}
                                                className="p-2 hover:bg-blue-500/10 text-zinc-400 hover:text-blue-400 rounded-lg transition-colors"
                                                title="View Document"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => setUploadedFiles(uploadedFiles.filter(f => f.id !== file.id))}
                                                className="p-2 hover:bg-red-500/10 text-zinc-400 hover:text-red-400 rounded-lg transition-colors"
                                                title="Delete Document"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
