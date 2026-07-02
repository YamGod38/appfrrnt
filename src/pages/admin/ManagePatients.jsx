import { useState, useEffect } from 'react';
import { User, Plus, Search, Edit2, Trash2, X, Database, FileText, Calendar, Mail, Phone, Activity, AlertTriangle, Users, UserPlus, UploadCloud, File as FileIcon } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ManagePatients() {
    const [patients, setPatients] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPatient, setEditingPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Family State
    const [familyMembers, setFamilyMembers] = useState([]);
    const [newFamily, setNewFamily] = useState({ name: '', relation: '', age: '' });
    const [isAddingFamily, setIsAddingFamily] = useState(false);

    // Upload State
    const [uploading, setUploading] = useState(false);

    const initialFormState = {
        full_name: '', phone_number: '', email: '', dob: '',
        gender: '', blood_group: '', weight: '', height: '',
        allergies: '', chronic_conditions: '',
        emergency_contact_name: '', emergency_contact_phone: '', address: '', last_visited: ''
    };

    const [formData, setFormData] = useState(initialFormState);

    const getAuthHeaders = () => ({
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    const fetchPatients = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/api/patients${searchQuery ? `?q=${searchQuery}` : ''}`, getAuthHeaders());
            setPatients(res.data.data || []);
        } catch (error) {
            console.error('Failed to fetch patients', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchPatients();
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const fetchFamilyMembers = async (huid) => {
        try {
            const res = await axios.get(`${API_URL}/api/patients/${huid}/family`, getAuthHeaders());
            setFamilyMembers(res.data.data || []);
        } catch (error) {
            console.error('Failed to fetch family members', error);
            setFamilyMembers([]);
        }
    };

    const handleOpenModal = (patient = null) => {
        if (patient) {
            setEditingPatient(patient);
            setFormData({
                full_name: patient.full_name || '',
                phone_number: patient.phone_number || '',
                email: patient.email || '',
                dob: patient.dob ? new Date(patient.dob).toISOString().split('T')[0] : '',
                gender: patient.gender || '',
                blood_group: patient.blood_group || '',
                weight: patient.weight || '',
                height: patient.height || '',
                allergies: patient.allergies || '',
                chronic_conditions: patient.chronic_conditions || '',
                emergency_contact_name: patient.emergency_contact_name || '',
                emergency_contact_phone: patient.emergency_contact_phone || '',
                address: patient.address || '',
                last_visited: patient.last_visited ? new Date(patient.last_visited).toISOString().split('T')[0] : ''
            });
            fetchFamilyMembers(patient.huid);
        } else {
            setEditingPatient(null);
            setFormData(initialFormState);
            setFamilyMembers([]);
        }
        setNewFamily({ name: '', relation: '', age: '' });
        setIsAddingFamily(false);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingPatient(null);
        setFamilyMembers([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingPatient) {
                await axios.put(`${API_URL}/api/patients/${editingPatient.huid}`, formData, getAuthHeaders());
            } else {
                await axios.post(`${API_URL}/api/patients`, formData, getAuthHeaders());
            }
            handleCloseModal();
            fetchPatients();
        } catch (error) {
            console.error('Failed to save patient', error);
            alert('Failed to save patient profile. Check console for details.');
        }
    };

    const handleDelete = async (huid) => {
        if (!window.confirm('Are you sure you want to permanently delete this profile?')) return;
        try {
            await axios.delete(`${API_URL}/api/patients/${huid}`, getAuthHeaders());
            fetchPatients();
        } catch (error) {
            console.error('Failed to delete patient', error);
            alert('Failed to delete patient. Ensure you have ADMIN privileges.');
        }
    };

    const handleAddFamilyMember = async () => {
        if (!newFamily.name || !newFamily.relation) return alert('Name and Relation are required');
        try {
            await axios.post(`${API_URL}/api/patients/${editingPatient.huid}/family`, newFamily, getAuthHeaders());
            setNewFamily({ name: '', relation: '', age: '' });
            setIsAddingFamily(false);
            fetchFamilyMembers(editingPatient.huid);
        } catch (error) {
            console.error('Failed to add family member', error);
        }
    };

    const handleDeleteFamilyMember = async (id) => {
        if (!window.confirm('Remove this family member?')) return;
        try {
            await axios.delete(`${API_URL}/api/patients/family/${id}`, getAuthHeaders());
            fetchFamilyMembers(editingPatient.huid);
        } catch (error) {
            console.error('Failed to remove family member', error);
        }
    };

    const calculateAge = (dob) => {
        if (!dob) return null;
        const diffMs = Date.now() - new Date(dob).getTime();
        const ageDt = new Date(diffMs);
        return Math.abs(ageDt.getUTCFullYear() - 1970);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !editingPatient) return;

        const uploadData = new FormData();
        uploadData.append('prescription', file);

        setUploading(true);
        try {
            const res = await axios.post(`${API_URL}/api/patients/${editingPatient.id}/upload`, uploadData, {
                headers: { ...getAuthHeaders().headers, 'Content-Type': 'multipart/form-data' }
            });
            
            // Refresh patient data to see new file
            const newUrl = res.data.url;
            setEditingPatient(prev => ({
                ...prev,
                prescription_urls: [...(prev.prescription_urls || []), newUrl]
            }));
            fetchPatients();
        } catch (error) {
            console.error('Failed to upload file:', error);
            alert('Upload failed. Check console.');
        }
        setUploading(false);
    };

    return (
        <div className="flex flex-col gap-8 max-w-[1400px] mx-auto w-full animate-in fade-in duration-500 pb-10">
            <header className="flex justify-between items-end pb-6 border-b border-white/[0.05]">
                <div>
                    <h2 className="text-3xl font-bold text-zinc-100 tracking-tight flex items-center gap-3">
                        Userbase
                        <Database className="w-6 h-6 text-emerald-500" />
                    </h2>
                    <p className="text-zinc-500 mt-2 text-sm">Manage the unified client and patient medical database.</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Search className="w-4 h-4 text-zinc-500 group-focus-within:text-emerald-400 transition-colors" />
                        </div>
                        <input 
                            type="text" 
                            className="bg-zinc-900 border border-white/[0.05] text-zinc-200 text-sm rounded-xl focus:ring-emerald-500 focus:border-emerald-500 block w-64 pl-10 p-2.5 transition-all shadow-inner" 
                            placeholder="Search HUID, Name, Phone..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button onClick={() => handleOpenModal()} className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold px-5 py-2.5 rounded-xl transition-all shadow-[0_5px_0_rgba(4,120,87,1)] active:shadow-none active:translate-y-1 text-sm flex items-center gap-2">
                        <Plus className="w-4 h-4" /> New Profile
                    </button>
                </div>
            </header>

            <div className="bg-[#09090b]/80 border border-white/[0.05] rounded-2xl shadow-[0_10px_30px_-15px_rgba(0,0,0,1)] overflow-hidden backdrop-blur-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="border-b border-white/[0.05] text-zinc-500 text-[10px] font-bold uppercase tracking-widest bg-zinc-950/50">
                                <th className="py-4 px-6 w-32">HUID</th>
                                <th className="py-4 px-6">Patient Info</th>
                                <th className="py-4 px-6">Contact</th>
                                <th className="py-4 px-6">Clinical Indicators</th>
                                <th className="py-4 px-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-zinc-300">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="py-10 text-center text-zinc-500">
                                        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                        Loading database...
                                    </td>
                                </tr>
                            ) : patients.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-10 text-center text-zinc-500 font-medium">No profiles found.</td>
                                </tr>
                            ) : (
                                patients.map((patient) => {
                                    const age = calculateAge(patient.dob);
                                    return (
                                    <tr key={patient.huid} className="border-b border-white/[0.02] hover:bg-zinc-800/30 transition-all duration-200 group">
                                        <td className="py-4 px-6 font-mono text-emerald-400 font-bold text-xs">{patient.huid}</td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-xs font-bold text-zinc-400 shadow-inner">
                                                    {patient.full_name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-zinc-200">{patient.full_name}</div>
                                                    <div className="text-xs text-zinc-500 flex items-center gap-2 mt-0.5">
                                                        {patient.gender && <span>{patient.gender}</span>}
                                                        {patient.gender && age && <span className="w-1 h-1 rounded-full bg-zinc-600"></span>}
                                                        {age && <span>{age} yrs</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex flex-col gap-1">
                                                {patient.phone_number && <span className="text-xs text-zinc-400 flex items-center gap-1.5"><Phone className="w-3 h-3"/> {patient.phone_number}</span>}
                                                {patient.email && <span className="text-xs text-zinc-400 flex items-center gap-1.5"><Mail className="w-3 h-3"/> {patient.email}</span>}
                                                {!patient.phone_number && !patient.email && <span className="text-xs text-zinc-600 italic">No contact info</span>}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex flex-wrap gap-2">
                                                {patient.blood_group && (
                                                    <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/20" title="Blood Group">
                                                        <Activity className="w-3 h-3" /> {patient.blood_group}
                                                    </span>
                                                )}
                                                {patient.allergies && (
                                                    <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20" title={`Allergies: ${patient.allergies}`}>
                                                        <AlertTriangle className="w-3 h-3" /> Allergies
                                                    </span>
                                                )}
                                                {patient.family_count > 0 && (
                                                    <button onClick={() => handleOpenModal(patient)} className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors" title="View Linked Family Members">
                                                        <Users className="w-3 h-3" /> {patient.family_count} Dependents
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-right space-x-2">
                                            <button onClick={() => handleOpenModal(patient)} className="p-2 bg-zinc-900 border border-white/5 rounded-lg text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(patient.huid)} className="p-2 bg-zinc-900 border border-white/5 rounded-lg text-zinc-400 hover:text-red-400 hover:border-red-500/30 transition-all">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
                    <div className="bg-[#09090b] border border-white/10 rounded-2xl p-6 md:p-8 w-full max-w-4xl shadow-2xl animate-in zoom-in-95 duration-200 my-8 flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center mb-6 border-b border-white/[0.05] pb-4 shrink-0">
                            <h3 className="text-2xl font-bold text-zinc-100 flex items-center gap-3">
                                {editingPatient ? 'Edit Medical Profile' : 'New Medical Profile'}
                                {editingPatient && <span className="text-sm font-mono text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">{editingPatient.huid}</span>}
                            </h3>
                            <button onClick={handleCloseModal} className="text-zinc-500 hover:text-zinc-300 bg-zinc-900 p-2 rounded-lg transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="overflow-y-auto pr-2 custom-scrollbar flex-1">
                            <form id="patient-form" onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                    {/* Left Column: Personal Info */}
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                                            <User className="w-4 h-4" /> Personal Details
                                        </h4>
                                        <div>
                                            <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Full Name *</label>
                                            <input type="text" required value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-zinc-200 text-sm focus:outline-none focus:border-emerald-500/50" placeholder="e.g. Rahul Sharma" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Date of Birth</label>
                                                <input type="date" value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-zinc-200 text-sm focus:outline-none focus:border-emerald-500/50" />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Gender</label>
                                                <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-zinc-200 text-sm focus:outline-none focus:border-emerald-500/50">
                                                    <option value="">Select...</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Phone Number</label>
                                            <input type="text" value={formData.phone_number} onChange={(e) => setFormData({...formData, phone_number: e.target.value})} className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-zinc-200 text-sm focus:outline-none focus:border-emerald-500/50" placeholder="+91 9876543210" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Email Address</label>
                                            <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-zinc-200 text-sm focus:outline-none focus:border-emerald-500/50" placeholder="rahul@example.in" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Home Address</label>
                                            <textarea value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-zinc-200 text-sm focus:outline-none focus:border-emerald-500/50 resize-none h-20" placeholder="Full residential address..."></textarea>
                                        </div>
                                    </div>

                                    {/* Right Column: Medical Info */}
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold text-purple-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                                            <Activity className="w-4 h-4" /> Clinical Data
                                        </h4>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Blood Grp</label>
                                                <select value={formData.blood_group} onChange={(e) => setFormData({...formData, blood_group: e.target.value})} className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-zinc-200 text-sm focus:outline-none focus:border-purple-500/50">
                                                    <option value="">N/A</option>
                                                    <option value="A+">A+</option>
                                                    <option value="A-">A-</option>
                                                    <option value="B+">B+</option>
                                                    <option value="B-">B-</option>
                                                    <option value="AB+">AB+</option>
                                                    <option value="AB-">AB-</option>
                                                    <option value="O+">O+</option>
                                                    <option value="O-">O-</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Weight (kg)</label>
                                                <input type="text" value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-zinc-200 text-sm focus:outline-none focus:border-purple-500/50" placeholder="e.g. 70" />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Height (cm)</label>
                                                <input type="text" value={formData.height} onChange={(e) => setFormData({...formData, height: e.target.value})} className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-zinc-200 text-sm focus:outline-none focus:border-purple-500/50" placeholder="e.g. 175" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-orange-400"/> Allergies</label>
                                            <input type="text" value={formData.allergies} onChange={(e) => setFormData({...formData, allergies: e.target.value})} className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-zinc-200 text-sm focus:outline-none focus:border-orange-500/50" placeholder="Penicillin, Peanuts, etc." />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Chronic Conditions</label>
                                            <input type="text" value={formData.chronic_conditions} onChange={(e) => setFormData({...formData, chronic_conditions: e.target.value})} className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-2.5 text-zinc-300 text-sm focus:outline-none focus:border-emerald-500/30" placeholder="e.g. None" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Last Visited</label>
                                            <input type="date" value={formData.last_visited} onChange={(e) => setFormData({...formData, last_visited: e.target.value})} className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-2.5 text-zinc-300 text-sm focus:outline-none focus:border-emerald-500/30" />
                                        </div>
                                        
                                        <div className="pt-2">
                                            <h5 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-2 mb-3">
                                                <Users className="w-3 h-3" /> Emergency Contact
                                            </h5>
                                            <div className="grid grid-cols-2 gap-4">
                                                <input type="text" value={formData.emergency_contact_name} onChange={(e) => setFormData({...formData, emergency_contact_name: e.target.value})} className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-2.5 text-zinc-300 text-sm focus:outline-none focus:border-emerald-500/30" placeholder="Contact Name" />
                                                <input type="text" value={formData.emergency_contact_phone} onChange={(e) => setFormData({...formData, emergency_contact_phone: e.target.value})} className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-2.5 text-zinc-300 text-sm focus:outline-none focus:border-emerald-500/30" placeholder="Contact Phone" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>

                            {/* Family Section (Only visible when editing an existing patient) */}
                            {editingPatient && (
                                <div className="mt-8 pt-8 border-t border-white/[0.05]">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-sm font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
                                            <Users className="w-4 h-4" /> Linked Family Members
                                        </h4>
                                        <button type="button" onClick={() => setIsAddingFamily(!isAddingFamily)} className="text-xs bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1 font-bold transition-colors">
                                            <UserPlus className="w-3 h-3" /> Add Dependent
                                        </button>
                                    </div>

                                    {isAddingFamily && (
                                        <div className="bg-blue-950/20 border border-blue-500/20 rounded-xl p-4 mb-4 flex gap-4 items-end">
                                            <div className="flex-1">
                                                <label className="block text-[10px] uppercase text-blue-400/70 font-bold mb-1">Full Name</label>
                                                <input type="text" value={newFamily.name} onChange={(e) => setNewFamily({...newFamily, name: e.target.value})} className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-200" placeholder="Dependent Name" />
                                            </div>
                                            <div className="w-40">
                                                <label className="block text-[10px] uppercase text-blue-400/70 font-bold mb-1">Relation</label>
                                                <select value={newFamily.relation} onChange={(e) => setNewFamily({...newFamily, relation: e.target.value})} className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-200">
                                                    <option value="">Select...</option>
                                                    <option value="Spouse">Spouse</option>
                                                    <option value="Child">Child</option>
                                                    <option value="Parent">Parent</option>
                                                    <option value="Sibling">Sibling</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                            <div className="w-24">
                                                <label className="block text-[10px] uppercase text-blue-400/70 font-bold mb-1">Age</label>
                                                <input type="number" value={newFamily.age} onChange={(e) => setNewFamily({...newFamily, age: e.target.value})} className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-200" placeholder="Years" />
                                            </div>
                                            <button type="button" onClick={handleAddFamilyMember} className="bg-blue-500 hover:bg-blue-400 text-zinc-950 px-4 py-2 rounded-lg font-bold text-sm transition-colors">
                                                Add
                                            </button>
                                        </div>
                                    )}

                                    {familyMembers.length === 0 ? (
                                        <div className="text-center py-6 border border-dashed border-white/10 rounded-xl text-zinc-500 text-sm">
                                            No family members linked to this profile.
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {familyMembers.map((member) => (
                                                <div key={member.id} className="bg-zinc-900/50 border border-white/5 rounded-xl p-3 flex justify-between items-center group hover:bg-zinc-800/50 transition-colors">
                                                    <div>
                                                        <div className="font-bold text-zinc-300 text-sm">{member.name}</div>
                                                        <div className="text-[10px] text-zinc-500 uppercase tracking-wider flex gap-2 mt-0.5">
                                                            <span className="text-blue-400">{member.relation}</span>
                                                            {member.age && <span>{member.age} yrs</span>}
                                                        </div>
                                                    </div>
                                                    <button type="button" onClick={() => handleDeleteFamilyMember(member.id)} className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Documents Section (Only visible when editing an existing patient) */}
                            {editingPatient && (
                                <div className="mt-8 pt-8 border-t border-white/[0.05]">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                                            <FileText className="w-4 h-4" /> Documents & Prescriptions
                                        </h4>
                                        <label className={`cursor-pointer text-xs bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1 font-bold transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                                            <UploadCloud className="w-3 h-3" /> {uploading ? 'Uploading...' : 'Upload Document'}
                                            <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,image/*" disabled={uploading} />
                                        </label>
                                    </div>

                                    {(!editingPatient.prescription_urls || editingPatient.prescription_urls.length === 0) ? (
                                        <div className="text-center py-6 border border-dashed border-white/10 rounded-xl text-zinc-500 text-sm">
                                            No documents uploaded for this profile.
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {editingPatient.prescription_urls.map((url, idx) => {
                                                const filename = url.split('/').pop() || `Document ${idx + 1}`;
                                                return (
                                                    <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="bg-zinc-900/50 border border-white/5 rounded-xl p-3 flex items-center gap-3 group hover:bg-zinc-800/50 transition-colors">
                                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                                                            <FileIcon className="w-4 h-4 text-emerald-400" />
                                                        </div>
                                                        <div className="flex-1 truncate">
                                                            <div className="font-bold text-zinc-300 text-xs truncate">{decodeURIComponent(filename)}</div>
                                                            <div className="text-[9px] text-zinc-500 uppercase tracking-wider mt-0.5">View Document</div>
                                                        </div>
                                                    </a>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        
                        <div className="pt-4 mt-4 border-t border-white/[0.05] flex gap-4 justify-end shrink-0">
                            <button type="button" onClick={handleCloseModal} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold px-6 py-3 rounded-xl transition-colors text-sm">Cancel</button>
                            <button type="submit" form="patient-form" className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold px-8 py-3 rounded-xl transition-colors shadow-[0_5px_0_rgba(4,120,87,1)] active:shadow-none active:translate-y-1 text-sm flex items-center gap-2">
                                <Database className="w-4 h-4" />
                                {editingPatient ? 'Save Profile' : 'Create Profile'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
