import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { storageService } from '../../lib/storageService';
import { useAuth } from '../../context/AuthContext';
import { Download, FileText, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { escapeCsvValue, mapStoredDocumentToEditor, mapStoredDocumentToSummary, STATUS_STYLES } from '../../lib/documentUtils';

const LedgerItem = ({ item, currency, onDownload }) => (
    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors group text-sm">
        <td className="py-3 px-4 text-gray-500 font-mono">{new Date(item.date).toLocaleDateString()}</td>
        <td className="py-3 px-4 font-medium text-gray-900">{item.recipient?.name || 'Unknown'}</td>
        <td className="py-3 px-4 text-gray-500">{item.number}</td>
        <td className="py-3 px-4">
            <span className={`px-2 py-0.5 rounded text-xs font-medium border ${STATUS_STYLES[item.status] || STATUS_STYLES.Pending}`}>
                {item.status}
            </span>
        </td>
        <td className="py-3 px-4 text-right font-mono font-medium text-gray-900">
            {item.docType === 'Receipt' ? '+' : ''}{currency}{item.total?.toFixed(2)}
        </td>
        <td className="py-3 px-4 text-right">
            <button
                onClick={() => onDownload(item)}
                className="text-gray-400 hover:text-gray-900 transition-colors"
                title="Download PDF"
            >
                <Download size={16} />
            </button>
        </td>
    </tr>
);

const Finance = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [userCurrency, setUserCurrency] = useState('$');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    const fetchBookings = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await storageService.getInvoices(user.id);

            if (data) {
                const mapped = data.map(mapStoredDocumentToSummary);
                setBookings(mapped);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
            toast.error('Failed to load financial data');
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            setUserCurrency(user.user_metadata?.currency || '$');
            fetchBookings();
        }
    }, [fetchBookings, user]);

    const availableYears = useMemo(() => {
        const years = bookings.map(b => new Date(b.date).getFullYear()).filter(Boolean);
        return [...new Set([new Date().getFullYear(), ...years])].sort((a, b) => b - a);
    }, [bookings]);

    const filteredBookings = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        return bookings
            .filter(b => new Date(b.date).getFullYear() === Number(selectedYear))
            .filter(b => statusFilter === 'All' || b.status === statusFilter || b.docType === statusFilter)
            .filter(b => {
                if (!term) return true;
                return [b.recipient?.name, b.number, b.docType, b.status]
                    .some(value => String(value || '').toLowerCase().includes(term));
            })
            .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    }, [bookings, searchTerm, selectedYear, statusFilter]);

    // Derived Stats (Financial Year)
    const totalRevenue = filteredBookings
        .filter(b => b.docType === 'Receipt' || b.status === 'Paid')
        .reduce((acc, b) => acc + (b.total || 0), 0);

    const totalPending = filteredBookings
        .filter(b => b.docType === 'Invoice' && ['Sent', 'Pending', 'Overdue'].includes(b.status))
        .reduce((acc, b) => acc + (b.total || 0), 0);

    const overdueTotal = filteredBookings
        .filter(b => b.status === 'Overdue')
        .reduce((acc, b) => acc + (b.total || 0), 0);

    const handleDownloadPDF = (doc) => {
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

    const handleExportCSV = async () => {
        const headers = ["Date", "Type", "Ref", "Client", "Status", "Amount"];
        const rows = filteredBookings.map(b => [
            b.date,
            b.docType,
            b.number,
            b.recipient?.name,
            b.status,
            b.total?.toFixed(2)
        ]);

        const csvContent = [headers, ...rows].map(r => r.map(escapeCsvValue).join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `financial_ledger_${selectedYear}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-8 items-start">

                {/* Main Ledger Area */}
                <div className="flex-1 w-full bg-white border border-gray-300 shadow-sm rounded-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <FileText size={20} className="text-gray-500" />
                            <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wide">General Ledger</h2>
                        </div>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="text-sm text-gray-600 font-mono bg-white border border-gray-200 rounded px-2 py-1"
                        >
                            {availableYears.map(year => <option key={year} value={year}>FY {year}</option>)}
                        </select>
                    </div>

                    <div className="px-6 py-4 border-b border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="relative">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search ledger"
                                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="border border-gray-200 rounded px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="All">All transactions</option>
                            <option value="Invoice">Invoices</option>
                            <option value="Receipt">Receipts</option>
                            <option value="Paid">Paid</option>
                            <option value="Pending">Pending</option>
                            <option value="Overdue">Overdue</option>
                        </select>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-white border-b-2 border-gray-200">
                                <tr>
                                    <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider font-mono">Date</th>
                                    <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider font-mono">Client / Particulars</th>
                                    <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider font-mono">Ref #</th>
                                    <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider font-mono">Status</th>
                                    <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider font-mono text-right">Amount</th>
                                    <th className="py-3 px-4 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="6" className="p-12 text-center text-gray-400 font-mono text-sm">
                                            -- LOADING TRANSACTIONS --
                                        </td>
                                    </tr>
                                ) : filteredBookings.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="p-12 text-center text-gray-400 font-mono text-sm">
                                            -- NO RECORDED TRANSACTIONS --
                                        </td>
                                    </tr>
                                ) : (
                                    filteredBookings.map(booking => (
                                        <LedgerItem key={booking.id} item={booking} currency={userCurrency} onDownload={handleDownloadPDF} />
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Sidebar controls */}
                <div className="w-full lg:w-80 shrink-0 space-y-6">

                    {/* Financial Summary Widget */}
                    <div className="bg-slate-800 text-white p-6 rounded-sm shadow-sm">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Financial Position</h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-slate-400 text-xs mb-1">Total Cleared Revenue ({selectedYear})</p>
                                <p className="text-2xl font-mono">{userCurrency}{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                            </div>
                            <div className="pt-4 border-t border-slate-700">
                                <p className="text-slate-400 text-xs mb-1">Pending Invoices</p>
                                <p className="text-lg font-mono text-amber-400">{userCurrency}{totalPending.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                            </div>
                            <div className="pt-4 border-t border-slate-700">
                                <p className="text-slate-400 text-xs mb-1">Overdue</p>
                                <p className="text-lg font-mono text-red-300">{userCurrency}{overdueTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                            </div>
                        </div>
                    </div>

                    {/* Reports & Downloads */}
                    <div className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm">
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                            Reports Center
                        </h3>
                        <div className="space-y-3">
                            <button
                                onClick={handleExportCSV}
                                className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded transition-colors group"
                            >
                                <span className="text-sm text-gray-700 font-medium">Download FY {selectedYear} Ledger</span>
                                <Download size={16} className="text-gray-400 group-hover:text-gray-600" />
                            </button>

                            <button className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded transition-colors group opacity-50 cursor-not-allowed" disabled>
                                <span className="text-sm text-gray-500 font-medium">Monthly Statement (PDF)</span>
                                <span className="text-xs text-gray-400 border border-gray-200 px-1 rounded">Soon</span>
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-4 leading-relaxed">
                            * Statements are generated based on cleared receipts only. Pending invoices are not included in tax reports.
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Finance;
