import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storageService } from '../../lib/storageService';
import { useAuth } from '../../context/AuthContext';
import { Download, Edit, FileText, Plus, Search, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
    DOCUMENT_STATUSES,
    escapeCsvValue,
    mapStoredDocumentToEditor,
    mapStoredDocumentToSummary,
    STATUS_STYLES
} from '../../lib/documentUtils';

const History = ({ typeFilter }) => {
    const { user } = useAuth();
    const [invoices, setInvoices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [sortBy, setSortBy] = useState('updated');
    const navigate = useNavigate();

    const fetchDocuments = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await storageService.getInvoices(user.id, typeFilter);
            
            if (data) {
                const mapped = data.map(mapStoredDocumentToSummary);
                setInvoices(mapped);
            }
        } catch (err) {
            console.error('Error fetching history:', err);
            toast.error('Failed to load history');
        } finally {
            setIsLoading(false);
        }
    }, [typeFilter, user]);

    useEffect(() => {
        if (user) fetchDocuments();
    }, [fetchDocuments, user]);

    const filteredInvoices = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        return invoices
            .filter(inv => statusFilter === 'All' || inv.status === statusFilter)
            .filter(inv => {
                if (!term) return true;
                return [
                    inv.number,
                    inv.recipient?.name,
                    inv.recipient?.email,
                    inv.date,
                    inv.status
                ].some(value => String(value || '').toLowerCase().includes(term));
            })
            .sort((a, b) => {
                if (sortBy === 'amount') return (b.total || 0) - (a.total || 0);
                if (sortBy === 'client') return String(a.recipient?.name || '').localeCompare(String(b.recipient?.name || ''));
                if (sortBy === 'date') return new Date(b.date || 0) - new Date(a.date || 0);
                return new Date(b.updatedAt || b.date || 0) - new Date(a.updatedAt || a.date || 0);
            });
    }, [invoices, searchTerm, sortBy, statusFilter]);

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
            const editorData = mapStoredDocumentToEditor(invoiceSummary);

            const route = editorData.docType === 'Receipt' ? '/receipt-editor' : '/editor';
            toast.dismiss(toastId);
            navigate(route, { state: { invoice: editorData } });
        } catch (error) {
            console.error('Error loading document details:', error);
            toast.error('Failed to open document', { id: toastId });
        }
    };

    const handleStatusChange = async (id, status) => {
        try {
            const updated = await storageService.updateInvoiceStatus(id, status);
            setInvoices(prev => prev.map(inv => inv.id === id ? mapStoredDocumentToSummary({ ...inv, ...updated, status }) : inv));
            toast.success('Status updated');
        } catch (error) {
            toast.error(error.message || 'Unable to update status');
        }
    };

    const handleOpenPreview = (doc) => {
        const editorDoc = mapStoredDocumentToEditor(doc);
        navigate('/preview', {
            state: {
                docData: editorDoc,
                docType: editorDoc.docType,
                templateId: editorDoc.templateId,
                currency: editorDoc.currency,
                logo: editorDoc.logo,
                status: editorDoc.status
            }
        });
    };

    const handleExportCSV = () => {
        const headers = ['Date', 'Type', 'Number', 'Client', 'Email', 'Status', 'Total'];
        const rows = filteredInvoices.map(inv => [
            inv.date,
            inv.docType,
            inv.number,
            inv.recipient?.name,
            inv.recipient?.email,
            inv.status,
            inv.total?.toFixed(2)
        ]);
        const csvContent = [headers, ...rows]
            .map(row => row.map(escapeCsvValue).join(','))
            .join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${typeFilter || 'documents'}_history.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const isReceipt = typeFilter === 'Receipt';
    const buttonText = isReceipt ? 'New Receipt' : 'New Invoice';
    const createRoute = isReceipt ? '/receipt-editor' : '/editor';
    const emptyText = isReceipt ? 'No receipts found. Create your first one!' : 'No invoices found. Create your first one!';

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">{typeFilter ? `${typeFilter} History` : 'All Documents'}</h1>
                <div className="flex gap-2">
                    <button
                        onClick={handleExportCSV}
                        className="bg-white text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 border border-gray-200 transition-colors"
                    >
                        <Download size={18} /> CSV
                    </button>
                    <button
                        onClick={() => navigate(createRoute)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
                    >
                        <Plus size={18} /> {buttonText}
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="relative md:col-span-2">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search client, number, email, status"
                        className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="All">All statuses</option>
                    {DOCUMENT_STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
                </select>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="updated">Recently updated</option>
                    <option value="date">Document date</option>
                    <option value="client">Client name</option>
                    <option value="amount">Amount</option>
                </select>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {isLoading ? (
                    <div className="p-12 text-center text-gray-400">Loading documents...</div>
                ) : filteredInvoices.length === 0 ? (
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
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Total</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredInvoices.map((inv) => (
                                <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{inv.number}</td>
                                    <td className="px-6 py-4 text-gray-600">{inv.recipient?.name}</td>
                                    <td className="px-6 py-4 text-gray-600">{inv.date}</td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={inv.status}
                                            onChange={(e) => handleStatusChange(inv.id, e.target.value)}
                                            className={`text-xs font-semibold border rounded-full px-2 py-1 outline-none ${STATUS_STYLES[inv.status] || STATUS_STYLES.Pending}`}
                                        >
                                            {DOCUMENT_STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-900">
                                        {inv.currency}{inv.total?.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleOpenPreview(inv)}
                                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                title="Preview"
                                            >
                                                <FileText size={18} />
                                            </button>
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
