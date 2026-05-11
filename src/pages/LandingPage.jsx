import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import {
    ArrowRight,
    BadgeCheck,
    BarChart3,
    Check,
    CheckCircle,
    ChevronRight,
    Clock3,
    FileText,
    Layers3,
    Mail,
    ReceiptText,
    ShieldCheck,
    Sparkles,
    Users,
    WalletCards
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const fadeUp = {
    hidden: { opacity: 0, y: 22 },
    visible: { opacity: 1, y: 0 }
};

const stagger = {
    visible: {
        transition: {
            staggerChildren: 0.08
        }
    }
};

const dashboardRows = [
    ['INV-0007', 'Apex Studio', '₦1,240,000', 'Sent'],
    ['REC-0004', 'Northline Co.', '₦860,000', 'Paid'],
    ['INV-0008', 'Luma Retail', '₦2,150,000', 'Draft']
];

const features = [
    {
        icon: FileText,
        title: 'Invoice Studio',
        desc: 'Build polished invoices and receipts with saved clients, line items, tax, discounts, logos, and PDF export.'
    },
    {
        icon: WalletCards,
        title: 'Payment Clarity',
        desc: 'Track Draft, Sent, Pending, Paid, Overdue, and Cancelled work from the same clean ledger.'
    },
    {
        icon: Users,
        title: 'Client Memory',
        desc: 'Keep repeat client details close so creating the next document takes less thinking and fewer clicks.'
    },
    {
        icon: BarChart3,
        title: 'Business Snapshot',
        desc: 'See revenue, pending totals, overdue documents, active clients, and top customers at a glance.'
    }
];

const workflow = [
    { title: 'Create', desc: 'Draft a branded invoice from your saved business profile.', icon: Layers3 },
    { title: 'Send', desc: 'Email, share, or download the PDF from preview.', icon: Mail },
    { title: 'Track', desc: 'Update status and review the finance ledger.', icon: Clock3 },
    { title: 'Collect', desc: 'Convert paid invoices into receipt drafts.', icon: CheckCircle }
];

const testimonials = [
    {
        quote: 'BizMaker feels simple enough for daily admin but sharp enough to send to serious clients.',
        name: 'Mara A.',
        role: 'Brand consultant'
    },
    {
        quote: 'The status flow keeps me from forgetting who has paid and who needs a follow-up.',
        name: 'Daniel O.',
        role: 'Freelance developer'
    },
    {
        quote: 'I started with guest mode, exported a backup, and moved my client list over in minutes.',
        name: 'Priya S.',
        role: 'Studio owner'
    }
];

const stats = [
    ['14k+', 'documents created'],
    ['38%', 'faster admin days'],
    ['4.9/5', 'average rating']
];

const LandingPage = () => {
    const { user, isLoading } = useAuth();

    if (!isLoading && user) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="min-h-screen bg-[#f7f8f5] text-gray-950 overflow-hidden">
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-950/10 bg-[#f7f8f5]/85 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <Link to="/" className="flex items-center gap-2">
                            <img src="/bizmaker-icon.png" alt="BizMaker" className="w-9 h-9 rounded-lg object-cover" />
                            <span className="font-bold text-xl tracking-tight">BizMaker</span>
                        </Link>
                        <div className="hidden md:flex items-center gap-8 text-sm font-semibold">
                            <a href="#features" className="text-gray-600 hover:text-gray-950 transition-colors">Features</a>
                            <a href="#workflow" className="text-gray-600 hover:text-gray-950 transition-colors">Workflow</a>
                            <a href="#testimonials" className="text-gray-600 hover:text-gray-950 transition-colors">Customers</a>
                            <a href="#pricing" className="text-gray-600 hover:text-gray-950 transition-colors">Pricing</a>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link to="/auth/login" className="hidden sm:inline text-sm font-semibold text-gray-700 hover:text-gray-950 transition-colors">Log In</Link>
                            <Link to="/auth/register" className="inline-flex items-center gap-2 bg-gray-950 text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors">
                                Start Free <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <section className="relative min-h-[calc(100vh-4rem)] pt-28 pb-20 flex items-center">
                <div className="absolute inset-0 landing-grid opacity-70" />
                <div className="absolute inset-x-0 top-16 h-px bg-gray-950/10" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
                    <div className="grid lg:grid-cols-[0.86fr_1.14fr] gap-10 lg:gap-16 items-center">
                        <Motion.div
                            className="max-w-3xl"
                            initial="hidden"
                            animate="visible"
                            variants={stagger}
                        >
                            <Motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-950/10 rounded-full shadow-sm text-sm font-semibold text-gray-700 mb-6">
                                <Sparkles size={16} className="text-amber-500" />
                                Built for invoices, receipts, clients, and cash flow
                            </Motion.div>
                            <Motion.h1 variants={fadeUp} className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.02] max-w-3xl">
                                BizMaker keeps your business paperwork moving.
                            </Motion.h1>
                            <Motion.p variants={fadeUp} className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl leading-relaxed">
                                Create branded documents, send them with confidence, track every status, and keep your client records tidy from one focused workspace.
                            </Motion.p>
                            <Motion.div variants={fadeUp} className="mt-8 flex flex-col sm:flex-row gap-3">
                                <Link to="/auth/register" className="inline-flex items-center justify-center gap-2 bg-gray-950 text-white px-7 py-4 rounded-lg font-bold hover:bg-gray-800 transition-colors shadow-xl shadow-gray-950/15">
                                    Create your first invoice <ArrowRight size={20} />
                                </Link>
                                <a href="#demo" className="inline-flex items-center justify-center gap-2 bg-white text-gray-950 px-7 py-4 rounded-lg font-bold border border-gray-950/10 hover:border-gray-950/25 transition-colors">
                                    View product demo <ChevronRight size={20} />
                                </a>
                            </Motion.div>
                            <Motion.div variants={fadeUp} className="mt-10 grid grid-cols-3 max-w-xl divide-x divide-gray-950/10 border-y border-gray-950/10 bg-white/70 backdrop-blur">
                                {stats.map(([value, label]) => (
                                    <div key={label} className="px-4 py-4">
                                        <div className="font-black text-2xl">{value}</div>
                                        <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{label}</div>
                                    </div>
                                ))}
                            </Motion.div>
                        </Motion.div>

                        <Motion.div
                            initial={{ opacity: 0, x: 48, scale: 0.96 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            transition={{ duration: 0.85, ease: 'easeOut', delay: 0.12 }}
                            className="relative min-h-[34rem]"
                        >
                            <ProductScene />
                        </Motion.div>
                    </div>
                </div>
            </section>

            <section id="demo" className="relative py-10 bg-gray-950 text-white overflow-hidden">
                <div className="landing-marquee flex gap-4 whitespace-nowrap text-sm font-bold uppercase tracking-widest text-white/70">
                    {[...Array(2)].map((_, loop) => (
                        <React.Fragment key={loop}>
                            <span>Invoice drafted</span><span>Receipt generated</span><span>Client saved</span><span>Ledger exported</span><span>Status updated</span><span>PDF downloaded</span>
                        </React.Fragment>
                    ))}
                </div>
            </section>

            <section id="features" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mb-14">
                        <p className="text-sm font-black uppercase tracking-[0.25em] text-indigo-600 mb-3">Designed For Daily Work</p>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight">More than invoice templates.</h2>
                        <p className="mt-4 text-lg text-gray-600">BizMaker gives small teams and solo operators a practical operating layer for documents, clients, and money movement.</p>
                    </div>
                    <Motion.div
                        className="grid md:grid-cols-2 lg:grid-cols-4 gap-5"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-80px' }}
                        variants={stagger}
                    >
                        {features.map((feature) => (
                            <Motion.div key={feature.title} variants={fadeUp} className="group bg-[#f7f8f5] border border-gray-950/10 rounded-lg p-6 hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-950/10 transition-all">
                                <div className="w-11 h-11 rounded-lg bg-gray-950 text-white flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors">
                                    <feature.icon size={22} />
                                </div>
                                <h3 className="text-lg font-black mb-2">{feature.title}</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">{feature.desc}</p>
                            </Motion.div>
                        ))}
                    </Motion.div>
                </div>
            </section>

            <section id="workflow" className="py-24 bg-[#edf2ef]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-12 items-center">
                        <div>
                            <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-700 mb-3">Motion In The Work</p>
                            <h2 className="text-4xl md:text-5xl font-black tracking-tight">A flow that follows the actual job.</h2>
                            <p className="mt-4 text-lg text-gray-600 leading-relaxed">Each step moves the document forward, from a fresh draft to a sent invoice, a paid receipt, and a clear finance record.</p>
                        </div>
                        <div className="relative">
                            <div className="absolute left-6 top-8 bottom-8 w-px bg-gray-950/15" />
                            <div className="space-y-4">
                                {workflow.map((step, index) => (
                                    <Motion.div
                                        key={step.title}
                                        className="relative flex gap-5 bg-white border border-gray-950/10 rounded-lg p-5 shadow-sm"
                                        initial={{ opacity: 0, x: 28 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true, margin: '-60px' }}
                                        transition={{ delay: index * 0.08 }}
                                    >
                                        <div className="relative z-10 w-12 h-12 rounded-lg bg-gray-950 text-white flex items-center justify-center landing-step-pulse">
                                            <step.icon size={22} />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-lg">{step.title}</h3>
                                            <p className="text-gray-600 text-sm mt-1">{step.desc}</p>
                                        </div>
                                    </Motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="testimonials" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-12">
                        <div className="max-w-2xl">
                            <p className="text-sm font-black uppercase tracking-[0.25em] text-indigo-600 mb-3">Customer Notes</p>
                            <h2 className="text-4xl md:text-5xl font-black tracking-tight">Built for people who do the admin themselves.</h2>
                        </div>
                        <div className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-2 w-fit">
                            <ShieldCheck size={17} />
                            Guest mode and backup friendly
                        </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-5">
                        {testimonials.map((item) => (
                            <div key={item.name} className="bg-[#f7f8f5] border border-gray-950/10 rounded-lg p-6">
                                <div className="flex gap-1 text-amber-500 mb-5">
                                    {[...Array(5)].map((_, index) => <span key={index}>*</span>)}
                                </div>
                                <p className="text-gray-800 font-medium leading-relaxed">"{item.quote}"</p>
                                <div className="mt-6 pt-5 border-t border-gray-950/10">
                                    <p className="font-black">{item.name}</p>
                                    <p className="text-sm text-gray-500">{item.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="pricing" className="py-24 bg-gray-950 text-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 items-center">
                        <div>
                            <p className="text-sm font-black uppercase tracking-[0.25em] text-amber-300 mb-3">Start Lean</p>
                            <h2 className="text-4xl md:text-5xl font-black tracking-tight">Try the workflow before you commit.</h2>
                            <p className="mt-4 text-lg text-white/70">Use guest mode, make a document, export a backup, and upgrade your process when it feels right.</p>
                        </div>
                        <div className="bg-white text-gray-950 rounded-lg p-6 md:p-8 shadow-2xl">
                            <div className="flex items-start justify-between gap-6">
                                <div>
                                    <p className="text-sm font-black uppercase tracking-widest text-indigo-600">Starter</p>
                                    <div className="mt-3 flex items-end gap-2">
                                        <span className="text-5xl font-black">₦0</span>
                                        <span className="text-gray-500 font-semibold mb-2">to begin</span>
                                    </div>
                                </div>
                                <BadgeCheck className="text-emerald-600" size={32} />
                            </div>
                            <div className="mt-8 grid sm:grid-cols-2 gap-3">
                                {['Invoices and receipts', 'Client records', 'Finance ledger', 'PDF export', 'Email sending setup', 'Backup import/export'].map((item) => (
                                    <div key={item} className="flex items-center gap-2 text-sm font-semibold">
                                        <Check size={17} className="text-emerald-600" />
                                        {item}
                                    </div>
                                ))}
                            </div>
                            <Link to="/auth/register" className="mt-8 inline-flex w-full items-center justify-center gap-2 bg-gray-950 text-white px-7 py-4 rounded-lg font-bold hover:bg-gray-800 transition-colors">
                                Open BizMaker <ArrowRight size={20} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="bg-[#f7f8f5] border-t border-gray-950/10 py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2">
                            <img src="/bizmaker-icon.png" alt="BizMaker" className="w-8 h-8 rounded-lg object-cover" />
                            <span className="font-black text-lg">BizMaker</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-3">Professional documents, clearer records, calmer admin.</p>
                    </div>
                    <div className="flex flex-wrap gap-5 text-sm font-semibold text-gray-600">
                        <a href="#features" className="hover:text-gray-950">Features</a>
                        <a href="#workflow" className="hover:text-gray-950">Workflow</a>
                        <a href="#testimonials" className="hover:text-gray-950">Customers</a>
                        <a href="#pricing" className="hover:text-gray-950">Pricing</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

const ProductScene = () => (
    <div className="relative h-[34rem] sm:h-[38rem] w-full">
        <Motion.div
            className="absolute inset-x-0 top-0 mx-auto w-full max-w-[38rem] bg-white border border-gray-950/10 rounded-lg shadow-2xl overflow-hidden landing-float"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        >
            <div className="h-11 bg-gray-950 text-white flex items-center px-4 gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="ml-auto text-xs text-white/60 font-mono">bizmaker.app/dashboard</span>
            </div>
            <div className="p-6">
                <div className="flex justify-between items-start mb-7">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Total Revenue</p>
                        <p className="text-4xl font-black mt-1">₦24.5M</p>
                    </div>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-3 py-1 text-xs font-black">+12.5%</span>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-6">
                    {['Paid', 'Pending', 'Overdue'].map((label, index) => (
                        <div key={label} className="border border-gray-950/10 rounded-lg p-3">
                            <p className="text-xs text-gray-500 font-bold">{label}</p>
                            <div className="mt-3 h-16 flex items-end gap-1">
                                {[28, 52, 38, 68].map((height, bar) => (
                                    <span
                                        key={bar}
                                        className="flex-1 rounded-t bg-indigo-600 landing-bar"
                                        style={{ height: `${Math.max(18, height - index * 8)}%`, animationDelay: `${(index + bar) * 0.18}s` }}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="space-y-3">
                    {dashboardRows.map(([number, client, amount, status], index) => (
                        <Motion.div
                            key={number}
                            className="flex items-center gap-3 border border-gray-950/10 rounded-lg p-3 bg-gray-50"
                            animate={{ x: [0, 8, 0] }}
                            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: index * 0.35 }}
                        >
                            <div className="w-10 h-10 rounded-lg bg-white border border-gray-950/10 flex items-center justify-center text-indigo-600">
                                {status === 'Paid' ? <ReceiptText size={19} /> : <FileText size={19} />}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-black">{number}</p>
                                <p className="text-xs text-gray-500">{client}</p>
                            </div>
                            <p className="font-black">{amount}</p>
                        </Motion.div>
                    ))}
                </div>
            </div>
        </Motion.div>

        <Motion.div
            className="absolute left-0 sm:left-4 bottom-2 sm:bottom-10 w-72 bg-gray-950 text-white border border-white/10 rounded-lg p-5 shadow-2xl"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        >
            <div className="flex items-center justify-between mb-5">
                <div className="w-10 h-10 rounded-lg bg-emerald-400/20 text-emerald-300 flex items-center justify-center">
                    <CheckCircle size={22} />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-emerald-300">Paid</span>
            </div>
            <p className="text-sm text-white/60 font-semibold">Receipt generated</p>
            <p className="text-3xl font-black mt-1">₦860,000</p>
            <div className="mt-5 h-2 bg-white/10 rounded-full overflow-hidden">
                <span className="block h-full w-4/5 bg-emerald-300 landing-progress" />
            </div>
        </Motion.div>

        <Motion.div
            className="absolute right-0 sm:right-8 bottom-28 sm:bottom-40 w-64 bg-white border border-gray-950/10 rounded-lg p-4 shadow-xl"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
        >
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Clock3 size={20} />
                </div>
                <div>
                    <p className="text-sm font-black">2 overdue invoices</p>
                    <p className="text-xs text-gray-500">₦1.78M needs follow-up</p>
                </div>
            </div>
        </Motion.div>

        <Motion.div
            className="absolute right-4 top-16 w-44 bg-white border border-indigo-200 rounded-lg p-3 shadow-xl"
            animate={{ rotate: [0, 2, -1, 0], y: [0, -12, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        >
            <div className="flex items-center gap-2 text-indigo-700">
                <Mail size={18} />
                <span className="text-xs font-black uppercase tracking-wide">Email sent</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-indigo-100 overflow-hidden">
                <span className="block h-full w-3/4 bg-indigo-600 landing-progress" />
            </div>
        </Motion.div>
    </div>
);

export default LandingPage;
