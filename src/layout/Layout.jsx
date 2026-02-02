import React from 'react';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';
import { useState } from 'react';

const Layout = ({ children }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Sidebar />

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 w-full bg-white border-b border-gray-200 z-30 px-4 py-3 flex items-center justify-between">
                <span className="font-bold text-lg text-gray-800">BizMaker</span>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600">
                    <Menu size={24} />
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="bg-white h-full w-64 shadow-xl flex" onClick={e => e.stopPropagation()}>
                        <Sidebar
                            className="flex static w-full h-full border-r-0"
                            onLinkClick={() => setIsMobileMenuOpen(false)}
                        />
                    </div>
                </div>
            )}

            <main className="flex-1 md:ml-64 p-4 md:p-8 mt-14 md:mt-0 overflow-x-hidden">
                {children}
            </main>
        </div>
    );
};

export default Layout;
