import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import {
    Plus, Trash2, FileText, CheckCircle, Settings, Image as ImageIcon,
    RefreshCcw, Eye
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

const SidebarInput = ({ label, value, onChange, type = "text", placeholder }) => (
    <div className="mb-3">
        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">{label}</label>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full text-sm p-2 border border-gray-200 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
        />
    </div>
);

const InvoiceEditor = ({ initialDocType, strictMode = false }) => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const initialData = location.state?.invoice;

    // Determine starting mode
    const startType = initialDocType || initialData?.docType || 'Invoice';

    // --- State Management ---
    const [docType, setDocType] = useState(startType);
    const [templateId, setTemplateId] = useState(initialData?.templateId || 'professional');
    const [currency, setCurrency] = useState(initialData?.currency || user?.user_metadata?.currency || '$');
    const [logo, setLogo] = useState(initialData?.logo || user?.user_metadata?.logo || null);

    // Document Data
    const [clients, setClients] = useState([]);

    useEffect(() => {
        if (user) {
            fetchClients();
            if (!logo && user.user_metadata?.logo) {
                setLogo(user.user_metadata.logo);
            }
        }
    }, [user]);

    const fetchClients = async () => {
        const { data } = await supabase
            .from('clients')
            .select('*')
            .eq('user_id', user.id);
        if (data) setClients(data);
    };

    const [docData, setDocData] = useState(initialData || {
        id: Date.now().toString(),
        number: 'INV-' + Math.floor(1000 + Math.random() * 9000), // Random ID for fresh doc
        date: new Date().toISOString().slice(0, 10),
        dueDate: new Date(Date.now() + 12096e5).toISOString().slice(0, 10), // +14 days
        sender: {
            name: user?.user_metadata?.full_name || user?.user_metadata?.name || '',
            email: user?.email || '',
            address: user?.user_metadata?.address || '',
            phone: user?.user_metadata?.phone || ''
        },
        recipient: {
            name: '',
            email: '',
            address: '',
            phone: ''
        },
        items: [
            { id: Date.now(), description: '', quantity: 1, price: 0 }
        ],
        notes: '',
        paymentDetails: '',
        taxRate: 0,
        discount: 0
    });

    // --- Calculations ---
    const subtotal = docData.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
    const taxAmount = (subtotal * (docData.taxRate / 100));
    const total = subtotal + taxAmount - docData.discount;

    // --- Handlers ---
    // --- Effects ---
    // Update Favicon when logo changes
    // --- Handlers ---
    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setLogo(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleInputChange = (section, field, value) => {
        if (section) {
            setDocData(prev => ({
                ...prev,
                [section]: { ...prev[section], [field]: value }
            }));
        } else {
            setDocData(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleItemChange = (id, field, value) => {
        setDocData(prev => ({
            ...prev,
            items: prev.items.map(item =>
                item.id === id ? { ...item, [field]: Number(value) || value } : item
            )
        }));
    };

    const addItem = () => {
        const newItem = {
            id: Date.now(),
            description: 'New Item',
            quantity: 1,
            price: 0
        };
        setDocData(prev => ({ ...prev, items: [...prev.items, newItem] }));
    };

    const removeItem = (id) => {
        setDocData(prev => ({ ...prev, items: prev.items.filter(item => item.id !== id) }));
    };

    const saveInvoice = async () => {
        const toastId = toast.loading('Saving document...');

        try {
            // 1. Prepare Payload for Supabase
            const invoicePayload = {
                user_id: user.id,
                unique_number: docData.number,
                doc_type: docType,
                date: docData.date,
                due_date: docData.dueDate,
                recipient_name: docData.recipient.name,
                recipient_email: docData.recipient.email,
                recipient_address: docData.recipient.address,
                recipient_phone: docData.recipient.phone,
                items: docData.items, // JSONB
                notes: docData.notes,
                payment_details: docData.paymentDetails,
                subtotal: subtotal,
                tax_rate: docData.taxRate,
                discount: docData.discount,
                total: total,
                currency: currency,
                template_id: templateId,
                logo: logo,
                status: 'Pending',
                updated_at: new Date().toISOString()
            };

            // If it's an existing edit (has a numeric ID presumably from DB), include ID.
            // If it's a new doc with a temporary timestamp ID, we let Supabase generate a new ID (or use the timestamp if valid bigint)
            // For simplicity, we'll try to use the unique_number as a key for upsert if we want to overwrite,
            // BUT unique_number isn't unique in DB constraint.
            // Better: If we have an ID that looks like a DB ID (not just Date.now() string if we can distinguish), use it.
            // Actually, for this transition, let's look up if this number exists for this user first? 
            // Or just check if initialData had an ID.

            // For now, let's Query by unique_number + user_id to see if it exists to Update it, otherwise Insert.
            // This prevents duplicate invoices with same number.

            const { data: existing } = await supabase
                .from('invoices')
                .select('id')
                .eq('user_id', user.id)
                .eq('unique_number', docData.number)
                .single();

            let savedData;

            if (existing) {
                // Update
                const { data, error } = await supabase
                    .from('invoices')
                    .update(invoicePayload)
                    .eq('id', existing.id)
                    .select()
                    .single();
                if (error) throw error;
                savedData = data;
            } else {
                // Insert
                const { data, error } = await supabase
                    .from('invoices')
                    .insert([invoicePayload])
                    .select()
                    .single();
                if (error) throw error;
                savedData = data;
            }

            // 2. Auto-save Client
            if (docData.recipient.name) {
                // Check if client exists by name
                const { data: clientData } = await supabase
                    .from('clients')
                    .select('id')
                    .eq('user_id', user.id)
                    .ilike('name', docData.recipient.name) // Case insensitive
                    .single();

                if (!clientData) {
                    await supabase.from('clients').insert([{
                        user_id: user.id,
                        name: docData.recipient.name,
                        email: docData.recipient.email,
                        address: docData.recipient.address
                    }]);
                }
            }

            toast.success('Document saved', { id: toastId });
            return savedData;

        } catch (error) {
            console.error(error);
            toast.error('Error saving: ' + error.message, { id: toastId });
            return null;
        }
    };

    const handlePreview = async () => {
        const savedDoc = await saveInvoice();
        if (savedDoc) {
            // Map back to internal format for preview if needed, or pass the savedDoc 
            // The Preview page expects 'docData' format.
            // We can re-construct it or just use the local state 'docData' which is up to date, 
            // plus the logo/currency stats.

            navigate('/preview', {
                state: {
                    docData: { ...docData, id: savedDoc.id },
                    docType,
                    templateId,
                    currency,
                    logo
                }
            });
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8">

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Settings className="w-6 h-6 text-indigo-600" />
                        {docType} Editor
                    </h1>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <button
                        onClick={() => setDocData({ ...docData, items: [], notes: '', paymentDetails: '', discount: 0, taxRate: 0 })}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg shadow-sm hover:bg-gray-50 transition-colors text-sm font-medium border border-gray-200"
                    >
                        <RefreshCcw size={16} /> Reset
                    </button>
                    <button
                        onClick={handlePreview}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all text-sm font-medium"
                    >
                        <Eye size={18} /> Preview & Save
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-6 md:p-8">

                    {/* Editor Layout: 2 Columns */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

                        {/* Column 1: Settings & Meta (4 cols) */}
                        <div className="md:col-span-4 space-y-6 border-b md:border-b-0 md:border-r border-gray-100 pb-6 md:pb-0 md:pr-6">

                            {/* Document Type & Appearance */}
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Settings</h3>
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    {!strictMode ? (
                                        <>
                                            <button
                                                onClick={() => setDocType('Invoice')}
                                                className={`p-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${docType === 'Invoice' ? 'bg-indigo-600 text-white' : 'bg-white border hover:bg-gray-50'}`}
                                            >
                                                <FileText size={16} /> Invoice
                                            </button>
                                            <button
                                                onClick={() => setDocType('Receipt')}
                                                className={`p-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${docType === 'Receipt' ? 'bg-emerald-600 text-white' : 'bg-white border hover:bg-gray-50'}`}
                                            >
                                                <CheckCircle size={16} /> Receipt
                                            </button>
                                        </>
                                    ) : (
                                        <div className="col-span-2 p-2 text-center text-sm font-bold text-gray-500 bg-gray-100 rounded-lg uppercase tracking-wider">
                                            {docType} Mode
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-4">
                                    <SidebarInput label="Currency Symbol" value={currency} onChange={setCurrency} />

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Style Template</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                { id: 'professional', label: 'Pro', color: 'bg-slate-600' },
                                                { id: 'tech', label: 'Tech', color: 'bg-emerald-500' },
                                                { id: 'business', label: 'Biz', color: 'bg-blue-800' },
                                                { id: 'creative', label: 'Fun', color: 'bg-fuchsia-500' },
                                                { id: 'minimal', label: 'Min', color: 'bg-black' }
                                            ].map(t => (
                                                <button
                                                    key={t.id}
                                                    onClick={() => setTemplateId(t.id)}
                                                    className={`p-2 text-xs font-medium rounded-lg border transition-all flex items-center gap-2 ${templateId === t.id ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600' : 'border-gray-200 hover:bg-gray-50'}`}
                                                >
                                                    <div className={`w-3 h-3 rounded-full ${t.color}`}></div>
                                                    {t.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Logo */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Business Logo</label>
                                <div className="flex items-center gap-2">
                                    <label className="cursor-pointer flex items-center justify-center w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 transition-colors bg-gray-50">
                                        <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                                        <span className="text-xs text-gray-500 flex items-center gap-2 font-medium">
                                            <ImageIcon size={16} /> {logo ? "Change Logo" : "Upload Logo"}
                                        </span>
                                    </label>
                                    {logo && (
                                        <button onClick={() => setLogo(null)} className="p-3 text-red-500 hover:bg-red-50 rounded-lg border border-gray-200">
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                                {logo && <div className="mt-2 text-xs text-green-600 flex items-center gap-1"><CheckCircle size={12} /> Logo uploaded</div>}
                            </div>

                        </div>

                        {/* Column 2: Content (8 cols) */}
                        <div className="md:col-span-8 space-y-8">

                            {/* People */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Sender Info (Hidden/Auto-populated) */}
                                {/* <div>
                                    <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider border-b pb-2">From (Sender)</h3>
                                    <div className="space-y-2">
                                        <SidebarInput label="Business Name" value={docData.sender.name} onChange={(v) => handleInputChange('sender', 'name', v)} />
                                        <SidebarInput label="Email" value={docData.sender.email} onChange={(v) => handleInputChange('sender', 'email', v)} />
                                        <SidebarInput label="Address" value={docData.sender.address} onChange={(v) => handleInputChange('sender', 'address', v)} />
                                        <SidebarInput label="Phone" value={docData.sender.phone || ''} onChange={(v) => handleInputChange('sender', 'phone', v)} placeholder="+1 123..." />
                                    </div>
                                </div> */}
                                <div>
                                    <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider border-b pb-2">To (Client)</h3>
                                    <div className="space-y-2">
                                        <div className="mb-3">
                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Client Name</label>
                                            <input
                                                list="clients-list"
                                                type="text"
                                                value={docData.recipient.name}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    handleInputChange('recipient', 'name', val);

                                                    // Auto-fill logic
                                                    const existingClient = clients.find(c => c.name.toLowerCase() === val.toLowerCase());
                                                    if (existingClient) {
                                                        setDocData(prev => ({
                                                            ...prev,
                                                            recipient: {
                                                                name: existingClient.name,
                                                                email: existingClient.email,
                                                                address: existingClient.address,
                                                                phone: ''
                                                            }
                                                        }));
                                                    }
                                                }}
                                                placeholder="Select or enter client name"
                                                className="w-full text-sm p-2 border border-gray-200 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-white"
                                            />
                                            <datalist id="clients-list">
                                                {clients.map(c => (
                                                    <option key={c.id} value={c.name} />
                                                ))}
                                            </datalist>
                                        </div>
                                        <SidebarInput label="Client Email" value={docData.recipient.email} onChange={(v) => handleInputChange('recipient', 'email', v)} />
                                        <SidebarInput label="Client Address" value={docData.recipient.address} onChange={(v) => handleInputChange('recipient', 'address', v)} />
                                    </div>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="bg-gray-50 p-4 rounded-xl">
                                <div className="grid grid-cols-3 gap-4">
                                    <SidebarInput label="Number" value={docData.number} onChange={(v) => handleInputChange(null, 'number', v)} />
                                    <SidebarInput label="Date" type="date" value={docData.date} onChange={(v) => handleInputChange(null, 'date', v)} />
                                    <SidebarInput label={docType === 'Invoice' ? "Due Date" : "Paid Date"} type="date" value={docData.dueDate} onChange={(v) => handleInputChange(null, 'dueDate', v)} />
                                </div>
                            </div>

                            {/* Items */}
                            <div>
                                <div className="flex justify-between items-center mb-4 border-b pb-2">
                                    <h3 className="text-lg font-bold text-gray-800">Line Items</h3>
                                    <button onClick={addItem} className="text-indigo-600 hover:text-indigo-800 text-sm font-bold flex items-center gap-1 bg-indigo-50 px-3 py-1 rounded-lg">
                                        <Plus size={16} /> Add Item
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {docData.items.map((item) => (
                                        <div key={item.id} className="grid grid-cols-12 gap-2 items-center bg-gray-50 p-2 rounded-lg group">
                                            <div className="col-span-6">
                                                <input
                                                    className="w-full text-sm font-medium bg-transparent border-b border-transparent focus:border-indigo-500 focus:outline-none px-1"
                                                    value={item.description}
                                                    onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                                                    placeholder="Item description"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <input
                                                    type="number"
                                                    className="w-full text-sm bg-white border rounded p-1"
                                                    value={item.quantity}
                                                    onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                                                    placeholder="Qty"
                                                />
                                            </div>
                                            <div className="col-span-3 relative">
                                                <span className="absolute left-1 top-1 text-gray-400 text-xs">{currency}</span>
                                                <input
                                                    type="number"
                                                    className="w-full text-sm bg-white border rounded p-1 pl-4"
                                                    value={item.price}
                                                    onChange={(e) => handleItemChange(item.id, 'price', e.target.value)}
                                                    placeholder="Price"
                                                />
                                            </div>
                                            <div className="col-span-1 text-right">
                                                <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {docData.items.length === 0 && (
                                        <div className="text-center p-4 text-gray-400 text-sm italic border-2 border-dashed border-gray-100 rounded-lg">
                                            No items added yet.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Totals & Notes */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Notes / Terms</label>
                                    <textarea
                                        rows="4"
                                        className="w-full text-sm p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none bg-gray-50"
                                        value={docData.notes}
                                        onChange={(e) => handleInputChange(null, 'notes', e.target.value)}
                                        placeholder="Add any notes, payment terms, or thank you messages here..."
                                    ></textarea>
                                    <div className={`mt-4 ${docType !== 'Invoice' ? 'opacity-50' : ''}`}>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Payment Details {docType !== 'Invoice' && '(Invoice Only)'}</label>
                                        <textarea
                                            rows="3"
                                            className="w-full text-sm p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none bg-gray-50"
                                            value={docData.paymentDetails || ''}
                                            onChange={(e) => handleInputChange(null, 'paymentDetails', e.target.value)}
                                            placeholder="Bank Name, Account No, Sort Code, IBAN etc."
                                            disabled={docType !== 'Invoice'}
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-6 rounded-xl space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-600">Subtotal</span>
                                        <span className="font-bold text-gray-800">{currency}{subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center gap-4">
                                        <span className="text-sm font-medium text-gray-600">Tax (%)</span>
                                        <input
                                            type="number"
                                            className="w-16 text-right text-sm border rounded p-1"
                                            value={docData.taxRate}
                                            onChange={(e) => handleInputChange(null, 'taxRate', e.target.value)}
                                        />
                                    </div>
                                    <div className="flex justify-between items-center gap-4">
                                        <span className="text-sm font-medium text-gray-600">Discount</span>
                                        <input
                                            type="number"
                                            className="w-16 text-right text-sm border rounded p-1"
                                            value={docData.discount}
                                            onChange={(e) => handleInputChange(null, 'discount', e.target.value)}
                                        />
                                    </div>
                                    <div className="pt-3 border-t border-gray-200 mt-2 flex justify-between items-center">
                                        <span className="text-lg font-bold text-gray-800">Total</span>
                                        <span className="text-2xl font-bold text-indigo-600">{currency}{total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            <div className="h-20"></div>
        </div >
    );
};

export default InvoiceEditor;
