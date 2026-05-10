import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storageService } from '../../lib/storageService';
import { useAuth } from '../../context/AuthContext';
import { Trash2, Edit, FileText, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const History = ({ typeFilter }) => {
    const { user } = useAuth();
    const [invoices, setInvoices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) fetchDocuments();
    }, [user, typeFilter]);

    const fetchDocuments = async () => {
        setIsLoading(true);
        try {
            const data = await storageService.getInvoices(user.id, typeFilter);
            
            if (data) {
                const mapped = data.map(doc => ({
                    id: doc.id,
                    number: doc.unique_number,
                    recipient: { name: doc.recipient_name },
                    date: doc.date,
                    currency: doc.currency,
                    total: doc.total,
                    docType: doc.doc_type,
                    updatedAt: doc.updated_at,
                    ...doc 
                }));
                setInvoices(mapped);
            }
        } catch (err) {
            console.error('Error fetching history:', err);
            toast.error('Failed to load history');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this document?')) {
            try {
                await storageService.deleteInvoice(id);
                setInvoices(prev => prev.filter(inv => inv.id !== id));
                toast.success('Document deleted');
            } catch (error) {
                toast.error(error.message || 'Error deleting document');
            }
        }
    };

    const handleEdit = async (invoiceSummary) => {
        const toastId = toast.loading('Loading document...');
        try {
            // Since our storageService.getInvoices already returns the full objects on local storage,
            // we might not NEED to refetch, but to be safe and consistent with web path:
            let invoice;
            if (invoiceSummary.items) {
                 invoice = invoiceSummary;
            } else {
                 // For web path, we might still need a single fetch if storageService only returns summaries.
                 // But our storageService.getInvoices currently returns '*'
                 invoice = invoiceSummary;
            }

            const editorData = {
                id: invoice.id,
                number: invoice.unique_number,
                date: invoice.date,
                dueDate: invoice.due_date,
                recipient: {
                    name: invoice.recipient_name,
                    email: invoice.recipient_email,
                    address: invoice.recipient_address,
                    phone: invoice.recipient_phone
                },
                items: invoice.items,
                notes: invoice.notes,
                taxRate: invoice.tax_rate,
                discount: invoice.discount,
                themeColor: invoice.theme_color,
                currency: invoice.currency,
                logo: invoice.logo,
                docType: invoice.doc_type
            };

            const route = invoice.doc_type === 'Receipt' ? '/receipt-editor' : '/editor';
            toast.dismiss(toastId);
            navigate(route, { state: { invoice: editorData } });
        } catch (error) {
            console.error('Error loading document details:', error);
            toast.error('Failed to open document', { id: toastId });
        }
    };

    const isReceipt = typeFilter === 'Receipt';
    const buttonText = isReceipt ? 'New Receipt' : 'New Invoice';
    const createRoute = isReceipt ? '/receipt-editor' : '/editor';
    const emptyText = isReceipt ? 'No receipts found. Create your first one!' : 'No invoices found. Create your first one!';

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">{typeFilter ? `${typeFilter} History` : 'All Documents'}</h1>
                <button
                    onClick={() => navigate(createRoute)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
                >
                    <Plus size={18} /> {buttonText}
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {invoices.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                        <p>{emptyText}</p>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Number</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Client</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Total</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {invoices.map((inv) => (
                                <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{inv.number}</td>
                                    <td className="px-6 py-4 text-gray-600">{inv.recipient?.name}</td>
                                    <td className="px-6 py-4 text-gray-600">{inv.date}</td>
                                    <td className="px-6 py-4 font-bold text-gray-900">
                                        {inv.currency}{inv.total?.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(inv)}
                                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(inv.id)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default History;
