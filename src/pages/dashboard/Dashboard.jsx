import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, FileText, TrendingUp, Users } from 'lucide-react';
import { storageService } from '../../lib/storageService';
import { useAuth } from '../../context/AuthContext';
import { isOverdueInvoice, mapStoredDocumentToSummary, STATUS_STYLES } from '../../lib/documentUtils';

const QuickAction = ({ to, icon: Icon, title, desc, color }) => (
    <Link to={to} className={`block p-6 rounded-2xl border transition-all hover:shadow-md ${color} group`}>
        <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm text-white">
                {React.createElement(Icon, { size: 24 })}
            </div>
            <ArrowRight size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
        </div>
        <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
        <p className="text-white/80 text-xs font-medium">{desc}</p>
    </Link>
);

const ActivityItem = ({ invoice, currency }) => (
    <div className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-xl transition-colors border-b border-gray-50 last:border-0">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${invoice.docType === 'Receipt' ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'}`}>
            {invoice.docType === 'Receipt' ? <CheckCircle size={18} /> : <FileText size={18} />}
        </div>
        <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">
                {invoice.docType === 'Receipt' ? 'Payment received' : 'Invoice created'} for <span className="font-bold">{invoice.recipient?.name || 'Unknown client'}</span>
            </p>
            <p className="text-xs text-gray-500">
                {invoice.number} - {new Date(invoice.date).toLocaleDateString()}
            </p>
        </div>
        <div className="text-right">
            <p className="font-bold text-gray-900">{currency}{invoice.total?.toFixed(2)}</p>
            <span className={`text-[10px] uppercase font-bold border rounded-full px-2 py-0.5 ${STATUS_STYLES[invoice.status] || STATUS_STYLES.Pending}`}>
                {invoice.status}
            </span>
        </div>
    </div>
);

const tips = [
    {
        title: 'Customize Your Brand',
        desc: 'Add your logo in Settings so invoices and receipts look consistent everywhere.',
        link: '/settings',
        cta: 'Open Settings'
    },
    {
        title: 'Track Your Growth',
        desc: 'Use the Finance ledger to compare cleared revenue, pending invoices, and overdue work.',
        link: '/finance',
        cta: 'Go to Finance'
    },
    {
        title: 'Build Your Client List',
        desc: 'Save regular clients once and pull them into new invoices faster next time.',
        link: '/clients',
        cta: 'Manage Clients'
    },
    {
        title: 'Get Paid Faster',
        desc: 'Mark invoices as Sent, Paid, or Overdue so the dashboard reflects what needs attention.',
        link: '/history',
        cta: 'Review Invoices'
    }
];

const Dashboard = () => {
    const { user } = useAuth();
    const [userCurrency, setUserCurrency] = useState('$');
    const [stats, setStats] = useState({
        revenue: 0,
        invoiceCount: 0,
        clientCount: 0,
        pending: 0,
        overdue: 0,
        topClient: 'None yet'
    });
    const [recentInvoices, setRecentInvoices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentTipIndex, setCurrentTipIndex] = useState(0);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    const fetchStats = useCallback(async () => {
        setIsLoading(true);
        try {
            const invoices = await storageService.getInvoices(user.id);
            const mapped = (invoices || []).map(mapStoredDocumentToSummary);
            const revenue = mapped
                .filter(inv => inv.docType === 'Receipt' || inv.status === 'Paid')
                .reduce((acc, inv) => acc + (inv.total || 0), 0);
            const pending = mapped
                .filter(inv => inv.docType === 'Invoice' && ['Sent', 'Pending', 'Overdue'].includes(inv.status))
                .reduce((acc, inv) => acc + (inv.total || 0), 0);
            const overdue = mapped.filter(isOverdueInvoice).length;
            const clientTotals = mapped.reduce((acc, inv) => {
                const name = inv.recipient?.name || 'Unknown';
                acc[name] = (acc[name] || 0) + (inv.total || 0);
                return acc;
            }, {});
            const topClient = Object.entries(clientTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None yet';
            const clients = await storageService.getClients(user.id);

            setStats({
                revenue,
                invoiceCount: mapped.length,
                clientCount: clients?.length || 0,
                pending,
                overdue,
                topClient
            });
            setRecentInvoices(mapped.slice(0, 10));
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            setUserCurrency(user.user_metadata?.currency || '$');
            fetchStats();
        }
    }, [fetchStats, user]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTipIndex((prev) => (prev + 1) % tips.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const currentTip = tips[currentTipIndex];
    const firstName = useMemo(() => user?.user_metadata?.full_name?.split(' ')[0] || 'User', [user]);

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {getGreeting()}, {firstName}!
                </h1>
                <p className="text-gray-500">Here is what is happening with your business today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <QuickAction to="/editor" icon={FileText} title="Create Invoice" desc="Bill a client for work done" color="bg-indigo-600 border-indigo-600 shadow-indigo-100" />
                <QuickAction to="/receipt-editor" icon={CheckCircle} title="Create Receipt" desc="Record a payment received" color="bg-emerald-600 border-emerald-600 shadow-emerald-100" />
                <QuickAction to="/clients" icon={Users} title="Add New Client" desc="Build your address book" color="bg-blue-600 border-blue-600 shadow-blue-100" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-50 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur-sm z-10">
                            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                <TrendingUp size={20} className="text-indigo-600" /> Recent Activity
                            </h3>
                            <Link to="/history" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                                View History
                            </Link>
                        </div>

                        <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                            {isLoading ? (
                                <div className="p-12 text-center text-gray-400">Loading activity...</div>
                            ) : recentInvoices.length === 0 ? (
                                <div className="p-12 text-center">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FileText className="text-gray-300" size={32} />
                                    </div>
                                    <p className="text-gray-500 font-medium">No activity yet.</p>
                                    <p className="text-sm text-gray-400">Create your first invoice to get started.</p>
                                </div>
                            ) : (
                                recentInvoices.map(inv => (
                                    <ActivityItem key={inv.id} invoice={inv} currency={userCurrency} />
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Business Snapshot</h3>
                        <div className="space-y-6">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                                <p className="text-3xl font-extrabold text-gray-900 tracking-tight">
                                    {userCurrency}{stats.revenue.toLocaleString()}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Documents</p>
                                    <p className="text-xl font-bold text-gray-800">{stats.invoiceCount}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Clients Active</p>
                                    <p className="text-xl font-bold text-gray-800">{stats.clientCount}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Pending</p>
                                    <p className="text-xl font-bold text-amber-600">{userCurrency}{stats.pending.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Overdue</p>
                                    <p className="text-xl font-bold text-red-600">{stats.overdue}</p>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-gray-100">
                                <p className="text-xs text-gray-500 mb-1">Top Client</p>
                                <p className="text-sm font-bold text-gray-800 truncate">{stats.topClient}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-2xl border border-indigo-100 transition-all duration-500">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-indigo-900 animate-fadeIn">{currentTip.title}</h3>
                            <span className="text-[10px] font-mono text-indigo-300 bg-white px-1.5 py-0.5 rounded border border-indigo-50">
                                TIP {currentTipIndex + 1}/{tips.length}
                            </span>
                        </div>
                        <p className="text-sm text-indigo-700/80 mb-4 min-h-[60px] animate-fadeIn">
                            {currentTip.desc}
                        </p>
                        <Link to={currentTip.link} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-wide flex items-center gap-1 group">
                            {currentTip.cta} <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
