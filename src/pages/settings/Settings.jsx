import React, { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Save, Building2, MapPin, Globe, Banknote, Image, Download, Upload, Palette } from 'lucide-react';
import toast from 'react-hot-toast';
import { storageService } from '../../lib/storageService';
import { optimizeImage } from '../../lib/imageUtils';
import InvoiceTemplate from '../../components/InvoiceTemplate';

const Settings = () => {
    const { user, updateProfile } = useAuth();
    const [loading, setLoading] = useState(false);
    const initialFormData = useMemo(() => ({
        name: user?.user_metadata?.name || user?.user_metadata?.full_name || '',
        address: user?.user_metadata?.address || '',
        country: user?.user_metadata?.country || 'US',
        currency: user?.user_metadata?.currency || '$',
        logo: user?.user_metadata?.logo || '',
        invoicePrefix: user?.user_metadata?.invoicePrefix || 'INV',
        receiptPrefix: user?.user_metadata?.receiptPrefix || 'REC',
        numberPadding: user?.user_metadata?.numberPadding || 4
    }), [user]);
    const [formData, setFormData] = useState(initialFormData);

    const defaultCustomTheme = { headerColor: '#4f46e5', accentColor: '#4f46e5', font: 'sans', corners: 'rounded' };
    const [customTheme, setCustomTheme] = useState(
        user?.user_metadata?.custom_template || defaultCustomTheme
    );
    const [showTemplatePreview, setShowTemplatePreview] = useState(false);

    const handleLogoChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const toastId = toast.loading('Optimizing logo...');
            try {
                // 1. Optimize on client-side (Max 400px, JPEG)
                const optimizedBlob = await optimizeImage(file, { maxWidth: 400 });
                
                // 2. Upload to Supabase Storage if logged in
                if (user && !user.id.includes('guest')) {
                    toast.loading('Uploading to secure storage...', { id: toastId });
                    const publicUrl = await storageService.uploadLogo(optimizedBlob, user.id);
                    setFormData(prev => ({ ...prev, logo: publicUrl }));
                    toast.success('Logo uploaded and optimized', { id: toastId });
                } else {
                    // Fallback for guests (smaller base64)
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        setFormData(prev => ({ ...prev, logo: reader.result }));
                        toast.success('Logo optimized (stored locally)', { id: toastId });
                    };
                    reader.readAsDataURL(optimizedBlob);
                }
            } catch (error) {
                console.error('Logo upload error:', error);
                toast.error('Failed to process logo: ' + error.message, { id: toastId });
            }
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const updates = {
            ...formData,
            full_name: formData.name,
            custom_template: customTheme
        };

        await updateProfile(updates);
        setLoading(false);
    };

    const handleExportBackup = async () => {
        try {
            const [invoices, clients, meta] = await Promise.all([
                storageService.getInvoices(user.id),
                storageService.getClients(user.id),
                storageService.getDocumentMeta()
            ]);
            const backup = {
                app: 'BizMaker',
                version: 1,
                exportedAt: new Date().toISOString(),
                profile: formData,
                invoices,
                clients,
                documentMeta: meta
            };
            const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `bizmaker_backup_${new Date().toISOString().slice(0, 10)}.json`;
            link.click();
            URL.revokeObjectURL(url);
            toast.success('Backup exported');
        } catch (error) {
            toast.error(error.message || 'Unable to export backup');
        }
    };

    const handleImportBackup = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            const backup = JSON.parse(text);
            if (backup.app !== 'BizMaker' || !Array.isArray(backup.invoices) || !Array.isArray(backup.clients)) {
                throw new Error('This does not look like a BizMaker backup.');
            }

            await Promise.all((backup.clients || []).map(client => storageService.saveClient({ ...client, user_id: user.id })));
            await Promise.all((backup.invoices || []).map(invoice => storageService.saveInvoice({ ...invoice, user_id: user.id })));
            if (backup.profile) {
                await updateProfile({ ...backup.profile, full_name: backup.profile.name });
                setFormData(prev => ({ ...prev, ...backup.profile }));
            }
            toast.success('Backup imported');
        } catch (error) {
            toast.error(error.message || 'Unable to import backup');
        } finally {
            e.target.value = '';
        }
    };

    const handleRepairProfile = async () => {
        if (!confirm("This will clear your profile logo and reset metadata to fix 'Failed to Fetch' errors. Continue?")) return;
        
        try {
            setLoading(true);
            await updateProfile({ logo: '', full_name: formData.name });
            setFormData(prev => ({ ...prev, logo: '' }));
            toast.success('Profile repaired! Please try saving again.');
        } catch (error) {
            toast.error('Repair failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-500">Manage your business profile and preferences</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Building2 size={20} className="text-indigo-600" />
                        Business Profile
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Logo Upload Section */}
                    <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
                        <div className="shrink-0">
                            <div className="w-20 h-20 rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                                {formData.logo ? (
                                    <img src={formData.logo} alt="Business Logo" className="w-full h-full object-cover" />
                                ) : (
                                    <Image size={24} className="text-gray-400" />
                                )}
                            </div>
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Business Logo</label>
                            <p className="text-xs text-gray-500 mb-3">Recommended size: 200x200px. Max size: 100KB.</p>
                            <div className="flex items-center gap-3">
                                <label className="cursor-pointer px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm">
                                    Upload New Logo
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleLogoChange}
                                    />
                                </label>
                                {formData.logo && (
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, logo: '' }))}
                                        className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Business Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                placeholder="Your Business Name"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Business Address</label>
                            <div className="relative">
                                <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                    placeholder="123 Business St"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Country</label>
                            <div className="relative">
                                <Globe size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <select
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-white"
                                >
                                    <option value="US">United States</option>
                                    <option value="UK">United Kingdom</option>
                                    <option value="EU">Europe</option>
                                    <option value="NG">Nigeria</option>
                                    <option value="IN">India</option>
                                    <option value="CA">Canada</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Currency Symbol</label>
                            <div className="relative">
                                <Banknote size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <select
                                    name="currency"
                                    value={formData.currency}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-white"
                                >
                                    <option value="$">USD ($)</option>
                                    <option value="£">GBP (£)</option>
                                    <option value="€">EUR (€)</option>
                                    <option value="₦">NGN (₦)</option>
                                    <option value="₹">INR (₹)</option>
                                    <option value="C$">CAD (C$)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-4">Document Numbering</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Invoice Prefix</label>
                                <input
                                    type="text"
                                    name="invoicePrefix"
                                    value={formData.invoicePrefix}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Receipt Prefix</label>
                                <input
                                    type="text"
                                    name="receiptPrefix"
                                    value={formData.receiptPrefix}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Number Padding</label>
                                <input
                                    type="number"
                                    min="2"
                                    max="8"
                                    name="numberPadding"
                                    value={formData.numberPadding}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Custom Template (#8) */}
                    <div className="pt-6 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide flex items-center gap-2">
                                    <Palette size={16} className="text-indigo-600" /> Custom Brand Theme
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">Saved as your 6th template option in the editor</p>
                            </div>
                            <button type="button" onClick={() => setShowTemplatePreview(p => !p)}
                                className="text-xs text-indigo-600 hover:underline">
                                {showTemplatePreview ? 'Hide Preview' : 'Show Preview'}
                            </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-600">Header Color</label>
                                <div className="flex items-center gap-2">
                                    <input type="color" value={customTheme.headerColor}
                                        onChange={e => setCustomTheme(p => ({ ...p, headerColor: e.target.value }))}
                                        className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
                                    <span className="text-xs font-mono text-gray-500">{customTheme.headerColor}</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-600">Accent Color</label>
                                <div className="flex items-center gap-2">
                                    <input type="color" value={customTheme.accentColor}
                                        onChange={e => setCustomTheme(p => ({ ...p, accentColor: e.target.value }))}
                                        className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
                                    <span className="text-xs font-mono text-gray-500">{customTheme.accentColor}</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-600">Font</label>
                                <select value={customTheme.font}
                                    onChange={e => setCustomTheme(p => ({ ...p, font: e.target.value }))}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500">
                                    <option value="sans">Sans-serif</option>
                                    <option value="serif">Serif</option>
                                    <option value="mono">Monospace</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-600">Corners</label>
                                <select value={customTheme.corners}
                                    onChange={e => setCustomTheme(p => ({ ...p, corners: e.target.value }))}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500">
                                    <option value="sharp">Sharp</option>
                                    <option value="rounded">Rounded</option>
                                    <option value="pill">Pill</option>
                                </select>
                            </div>
                        </div>
                        {showTemplatePreview && (
                            <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                                <div style={{ transform: 'scale(0.5)', transformOrigin: 'top left', width: '200%', pointerEvents: 'none' }}>
                                    <InvoiceTemplate
                                        templateId="custom"
                                        customTheme={customTheme}
                                        docData={{ number: 'INV-0001', date: new Date().toISOString().slice(0,10), dueDate: new Date().toISOString().slice(0,10), sender: { name: formData.name || 'Your Business', email: user?.email, address: formData.address }, recipient: { name: 'Sample Client', email: 'client@example.com' }, items: [{ id: 1, description: 'Design Services', quantity: 1, price: 500 }], notes: 'Thank you for your business.', taxRate: 0, discount: 0 }}
                                        currency={formData.currency || '$'}
                                        logo={formData.logo}
                                        docType="Invoice"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-4">Backup</h3>
                        <div className="flex flex-col md:flex-row gap-3">
                            <button
                                type="button"
                                onClick={handleExportBackup}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                <Download size={18} /> Export Backup
                            </button>
                            <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
                                <Upload size={18} /> Import Backup
                                <input type="file" accept="application/json" className="hidden" onChange={handleImportBackup} />
                            </label>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <h3 className="text-sm font-bold text-red-600 uppercase tracking-wide">Troubleshooting</h3>
                            <p className="text-xs text-gray-500">Getting 'Failed to Fetch'? Your profile data might be too large.</p>
                        </div>
                        <button
                            type="button"
                            onClick={handleRepairProfile}
                            className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 border border-red-100 rounded-lg transition-colors"
                        >
                            Repair Profile Data
                        </button>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-sm disabled:opacity-70"
                        >
                            <Save size={18} />
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Settings;
