import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { FileText, Users, TrendingUp, ArrowRight, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const QuickAction = ({ to, icon: Icon, title, desc, color }) => (
    <Link to={to} className={`block p-6 rounded-2xl border transition-all hover:shadow-md ${color} group`}>
        <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm text-white">
                <Icon size={24} />
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
                {invoice.docType === 'Receipt' ? 'Payment received' : 'Invoice created'} for <span className="font-bold">{invoice.recipient.name}</span>
            </p>
            <p className="text-xs text-gray-500">
                {invoice.number} • {new Date(invoice.date).toLocaleDateString()}
            </p>
        </div>
        <div className="text-right">
            <p className="font-bold text-gray-900">{currency}{invoice.total?.toFixed(2)}</p>
            <p className={`text-[10px] uppercase font-bold ${invoice.docType === 'Receipt' ? 'text-emerald-600' : 'text-amber-500'}`}>
                {invoice.docType === 'Receipt' ? 'Completed' : 'Pending'}
            </p>
        </div>
    </div>
);

const Dashboard = () => {
    const { user } = useAuth();
    const [userCurrency, setUserCurrency] = useState('$');
    const [stats, setStats] = useState({ revenue: 0, invoiceCount: 0, clientCount: 0 });
    const [recentInvoices, setRecentInvoices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    useEffect(() => {
        if (user) {
            setUserCurrency(user.user_metadata?.currency || '$');
            fetchStats();
        }
    }, [user]);

    const fetchStats = async () => {
        setIsLoading(true);

        const { data: invoices, error } = await supabase
            .from('invoices')
            .select('doc_type, total')
            .eq('user_id', user.id);

        if (!error && invoices) {
            const revenue = invoices
                .filter(inv => inv.doc_type === 'Receipt')
                .reduce((acc, inv) => acc + (inv.total || 0), 0);

            setStats(prev => ({
                ...prev,
                revenue,
                invoiceCount: invoices.length
            }));
        }

        const { count: clientCount } = await supabase
            .from('clients')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

        setStats(prev => ({ ...prev, clientCount: clientCount || 0 }));

        const { data: recent } = await supabase
            .from('invoices')
            .select('*')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false })
            .limit(10); // Fetch a bit more for the feed

        if (recent) {
            const mappedRecent = recent.map(inv => ({
                id: inv.id,
                recipient: { name: inv.recipient_name },
                number: inv.unique_number,
                date: inv.date,
                currency: inv.currency,
                total: inv.total,
                docType: inv.doc_type // Needed for icon/color
            }));
            setRecentInvoices(mappedRecent);
        }
        setIsLoading(false);
    };

    const [currentTipIndex, setCurrentTipIndex] = useState(0);

    const tips = [
        {
            title: "Customize Your Brand 🎨",
            desc: "Did you know you can add your logo to receipts? It makes your documents look much more professional.",
            link: "/receipt-editor",
            cta: "Try it now"
        },
        {
            title: "Track Your Growth 📈",
            desc: "Check the new Finance Ledger to see exactly how much revenue you've cleared this year versus pending invoices.",
            link: "/finance",
            cta: "Go to Finance"
        },
        {
            title: "Build Your Rolodex 👥",
            desc: "Save regular clients to your Address Book. You can select them fast next time you invoice.",
            link: "/clients",
            cta: "Manage Clients"
        },
        {
            title: "Go Paperless 🌳",
            desc: "You can download any past invoice or receipt as a PDF instantly from the History page.",
            link: "/history",
            cta: "View History"
        },
        {
            title: "Tax Time Made Easy 🏛️",
            desc: "Need to file taxes? Download your entire Financial Year ledger as a CSV file in one click.",
            link: "/finance",
            cta: "Get Report"
        },
        {
            title: "Work On The Go 📱",
            desc: "BizMaker is fully mobile-optimized. Send an invoice right from the job site on your phone.",
            link: "/editor",
            cta: "Try Mobile View"
        },
        {
            title: "Get Paid Faster 💸",
            desc: "Clear, professional invoices with proper due dates help clients pay you on time.",
            link: "/editor",
            cta: "Create Invoice"
        },
        {
            title: "Stay Organized 🗂️",
            desc: "Keep your 'Pending' and 'Cleared' payments separate so you never lose track of money owed.",
            link: "/finance",
            cta: "Check Status"
        },
        {
            title: "Build Trust 🤝",
            desc: "sending consistent, branded receipts helps build long-term trust with your customers.",
            link: "/receipt-editor",
            cta: "Send Receipt"
        },
        {
            title: "Clone & Go ⚡",
            desc: "Have a repeat job? Open an old invoice in History and hit 'Edit' (concept) to save time.",
            link: "/history",
            cta: "See History"
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTipIndex((prev) => (prev + 1) % tips.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [tips.length]);

    const currentTip = tips[currentTipIndex];

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header Section */}
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {getGreeting()}, {user?.user_metadata?.full_name?.split(' ')[0] || 'User'}! 👋
                </h1>
                <p className="text-gray-500">Here's what's happening with your business today.</p>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <QuickAction
                    to="/editor"
                    icon={FileText}
                    title="Create Invoice"
                    desc="Bill a client for work done"
                    color="bg-indigo-600 border-indigo-600 shadow-indigo-100"
                />
                <QuickAction
                    to="/receipt-editor"
                    icon={CheckCircle}
                    title="Create Receipt"
                    desc="Record a payment received"
                    color="bg-emerald-600 border-emerald-600 shadow-emerald-100"
                />
                <QuickAction
                    to="/clients"
                    icon={Users}
                    title="Add New Client"
                    desc="Build your address book"
                    color="bg-blue-600 border-blue-600 shadow-blue-100"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Feed Column (2/3 width) */}
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
                                    <p className="text-sm text-gray-400">Create your first invoice to get started!</p>
                                </div>
                            ) : (
                                recentInvoices.map(inv => (
                                    <ActivityItem key={inv.id} invoice={inv} currency={userCurrency} />
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Stats Column (1/3 width) */}
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
                        </div>
                    </div>

                    {/* Rotating Pro Tip Widget */}
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
