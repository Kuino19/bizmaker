import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { FileText, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LedgerItem = ({ item, currency, onDownload }) => (
    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors group text-sm">
        <td className="py-3 px-4 text-gray-500 font-mono">{new Date(item.date).toLocaleDateString()}</td>
        <td className="py-3 px-4 font-medium text-gray-900">{item.recipient.name}</td>
        <td className="py-3 px-4 text-gray-500">{item.number}</td>
        <td className="py-3 px-4">
            <span className={`px-2 py-0.5 rounded text-xs font-medium border ${item.docType === 'Receipt'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                {item.docType === 'Receipt' ? 'CLEARED' : 'PENDING'}
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

    useEffect(() => {
        if (user) {
            setUserCurrency(user.user_metadata?.currency || '$');
            fetchBookings();
        }
    }, [user]);

    const fetchBookings = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('invoices')
                .select('id, unique_number, doc_type, date, recipient_name, total, currency')
                .eq('user_id', user.id)
                .order('date', { ascending: false });

            if (data) {
                const mapped = data.map(doc => ({
                    id: doc.id,
                    number: doc.unique_number,
                    docType: doc.doc_type,
                    date: doc.date,
                    recipient: { name: doc.recipient_name },
                    total: doc.total,
                    currency: doc.currency,
                    ...doc
                }));
                setBookings(mapped);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Derived Stats (Financial Year)
    const totalRevenue = bookings
        .filter(b => b.docType === 'Receipt' && new Date(b.date).getFullYear() === selectedYear)
        .reduce((acc, b) => acc + (b.total || 0), 0);

    const totalPending = bookings
        .filter(b => b.docType === 'Invoice' && new Date(b.date).getFullYear() === selectedYear)
        .reduce((acc, b) => acc + (b.total || 0), 0);

    const handleDownloadPDF = (doc) => {
        navigate('/preview', {
            state: {
                docData: doc,
                docType: doc.docType,
                themeColor: doc.themeColor,
                currency: doc.currency,
                logo: doc.logo
            }
        });
    };

    const handleExportCSV = () => {
        const headers = ["Date", "Type", "Ref", "Client", "Status", "Amount"];
        const rows = bookings.map(b => [
            b.date,
            b.docType,
            b.number,
            b.recipient.name,
            b.docType === 'Receipt' ? 'CLEARED' : 'PENDING',
            b.total?.toFixed(2)
        ]);

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `financial_ledger_${selectedYear}.csv`;
        link.click();
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
                        <div className="text-sm text-gray-500 font-mono">
                            FY {selectedYear}
                        </div>
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
                                {bookings.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="p-12 text-center text-gray-400 font-mono text-sm">
                                            -- NO RECORDED TRANSACTIONS --
                                        </td>
                                    </tr>
                                ) : (
                                    bookings.map(booking => (
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
