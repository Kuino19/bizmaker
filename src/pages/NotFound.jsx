import React from 'react';
import { Link } from 'react-router-dom';
import { Home, FileSearch } from 'lucide-react';

const NotFound = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
            <div className="mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-indigo-100 text-indigo-600 mb-6">
                    <FileSearch size={40} />
                </div>
                <h1 className="text-6xl font-extrabold text-gray-900 mb-4">404</h1>
                <p className="text-xl font-semibold text-gray-700 mb-2">Page Not Found</p>
                <p className="text-gray-500 max-w-sm">
                    The page you're looking for doesn't exist or has been moved.
                </p>
            </div>
            <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
            >
                <Home size={18} /> Back to Home
            </Link>
        </div>
    );
};

export default NotFound;
