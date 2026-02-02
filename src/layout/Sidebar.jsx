import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FilePlus, History, Users, Settings, LogOut, CheckCircle, FileText, PieChart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

const Sidebar = ({ className, onLinkClick }) => {
    const { logout } = useAuth();

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: FilePlus, label: 'New Invoice', path: '/editor' },
        { icon: CheckCircle, label: 'New Receipt', path: '/receipt-editor' },
        { icon: History, label: 'Invoices', path: '/history' },
        { icon: FileText, label: 'Receipts', path: '/receipts-history' },
        { icon: PieChart, label: 'Finance', path: '/finance' }, // Finance Link
        { icon: Users, label: 'Clients', path: '/clients' },
    ];

    return (
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

            <div className="p-4 border-t border-gray-100">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
                >
                    <LogOut size={20} className="stroke-[1.5]" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
