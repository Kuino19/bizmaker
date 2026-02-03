import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FilePlus, History, Users, Settings, LogOut, CheckCircle, FileText, PieChart, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

const Sidebar = ({ className, onLinkClick }) => {
    const { logout } = useAuth();
    const [isIos, setIsIos] = useState(false);
    const [showIosInstructions, setShowIosInstructions] = useState(false);

    useEffect(() => {
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handler);

        // Check for iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIos(isIosDevice);

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = async () => {
        if (isIos) {
            setShowIosInstructions(true);
            return;
        }

        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
        }
    };

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: FilePlus, label: 'New Invoice', path: '/editor' },
        { icon: CheckCircle, label: 'New Receipt', path: '/receipt-editor' },
        { icon: History, label: 'Invoices', path: '/history' },
        { icon: FileText, label: 'Receipts', path: '/receipts-history' },
        { icon: PieChart, label: 'Finance', path: '/finance' }, // Finance Link
        { icon: Users, label: 'Clients', path: '/clients' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <>
            <aside className={cn("w-64 bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0 z-20 hidden md:flex", className)}>
                <div className="p-6 border-b border-gray-100 flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">B</div>
                    <span className="text-xl font-bold text-gray-800">BizMaker</span>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={onLinkClick}
                            className={({ isActive }) => cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
                                isActive
                                    ? "bg-indigo-50 text-indigo-600 shadow-sm"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            )}
                        >
                            <item.icon size={20} className="stroke-[1.5]" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-100 space-y-2">
                    {(deferredPrompt || isIos) && (
                        <button
                            onClick={handleInstallClick}
                            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-all"
                        >
                            <Download size={20} className="stroke-[1.5]" />
                            Install App
                        </button>
                    )}
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
                    >
                        <LogOut size={20} className="stroke-[1.5]" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* iOS Instructions Modal */}
            {showIosInstructions && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowIosInstructions(false)}>
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl relative" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setShowIosInstructions(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            ×
                        </button>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-indigo-600">
                                <Download size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Install BizMaker</h3>
                            <p className="text-gray-600 mb-6 text-sm">
                                To install this app on your iPhone:
                                <br /><br />
                                1. Tap the <span className="font-bold">Share</span> button <span className="inline-block align-middle"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg></span> below.
                                <br />
                                2. Scroll down and tap <br /><span className="font-bold">Add to Home Screen</span> <span className="inline-block align-middle"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg></span>
                            </p>
                            <button
                                onClick={() => setShowIosInstructions(false)}
                                className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
                            >
                                Got it
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Sidebar;
