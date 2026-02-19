
import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, BarChart3, Users, FileText, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
    const { user, isLoading } = useAuth();

    if (!isLoading && user) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">B</div>
                            <span className="font-bold text-xl text-gray-900">BizMaker</span>
                        </div>
                        <div className="hidden md:flex items-center gap-8">
                            <a href="#features" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Features</a>
                            <a href="#testimonials" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Testimonials</a>
                            <a href="#pricing" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Pricing</a>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link to="/auth/login" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Log In</Link>
                            <Link to="/auth/register" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-indigo-600/20">
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative overflow-hidden pt-16 pb-24 lg:pt-32 lg:pb-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full font-medium text-sm mb-6">
                                <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                                New: AI-Powered Receipt Scanning
                            </div>
                            <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 leading-[1.1] mb-6">
                                Manage your business with <span className="text-indigo-600">confidence.</span>
                            </h1>
                            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-lg">
                                Create professional invoices, track expenses, and manage clients—all in one beautiful, easy-to-use platform designed for modern freelancers.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link to="/auth/register" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2">
                                    Start for Free <ArrowRight size={20} />
                                </Link>
                                <a href="#demo" className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center">
                                    View Demo
                                </a>
                            </div>
                            <div className="mt-8 flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex text-yellow-400">
                                    {'★★★★★'.split('').map((star, i) => <span key={i}>{star}</span>)}
                                </div>
                                <span>Trusted by 10,000+ freelancers</span>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-200 to-purple-200 rounded-3xl blur-3xl opacity-30 transform rotate-3"></div>
                            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transform transition-transform hover:scale-[1.02] duration-500">
                                {/* Abstract UI Representation */}
                                <div className="p-2 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
                                    <div className="flex gap-1.5 ml-2">
                                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                    </div>
                                    <div className="mx-auto bg-white px-4 py-1 rounded-md text-xs text-gray-400 border border-gray-100 w-64 text-center">bizmaker.app/dashboard</div>
                                </div>
                                <div className="p-6">
                                    <div className="flex justify-between items-end mb-8">
                                        <div>
                                            <div className="text-sm text-gray-500 mb-1">Total Revenue</div>
                                            <div className="text-3xl font-bold text-gray-900">$24,500.00</div>
                                        </div>
                                        <div className="text-green-600 bg-green-50 px-3 py-1 rounded-lg text-sm font-medium">+12.5%</div>
                                    </div>
                                    <div className="space-y-4">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-colors">
                                                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                                                    <FileText size={20} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-medium text-gray-900">Invoice #00{i}</div>
                                                    <div className="text-sm text-gray-500">Acme Corp • Web Design</div>
                                                </div>
                                                <div className="font-bold text-gray-900">$1,200</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div id="features" className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-3">Our Features</h2>
                        <h3 className="text-3xl font-bold text-gray-900 mb-4">Everything you need to run your business</h3>
                        <p className="text-gray-600">Stop juggling multiple tools. BizMaker brings invoices, expenses, and client management into one seamless workflow.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <FileText size={24} />,
                                title: "Smart Invoicing",
                                desc: "Create beautiful, professional invoices in seconds. Get paid faster with integrated payment links."
                            },
                            {
                                icon: <BarChart3 size={24} />,
                                title: "Financial Insights",
                                desc: "Track your income and expenses automatically. visualize your cash flow with intuitive charts."
                            },
                            {
                                icon: <Users size={24} />,
                                title: "Client Management",
                                desc: "Keep all client details, projects, and communication in one organized place."
                            }
                        ].map((feature, i) => (
                            <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow">
                                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
                                    {feature.icon}
                                </div>
                                <h4 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h4>
                                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="py-24">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-indigo-600 rounded-3xl p-12 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full opacity-10">
                            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <path d="M0 100 C 20 0 50 0 100 100 Z" fill="#fff" />
                            </svg>
                        </div>
                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to streamline your business?</h2>
                            <p className="text-indigo-100 text-lg mb-8 max-w-2xl mx-auto">Join thousands of freelancers who are saving time and getting paid faster with BizMaker.</p>
                            <Link to="/auth/register" className="inline-flex items-center gap-2 bg-white text-indigo-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all shadow-xl">
                                Get Started Now <ArrowRight size={20} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-8 mb-12">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">B</div>
                                <span className="font-bold text-xl text-white">BizMaker</span>
                            </div>
                            <p className="max-w-xs">The simple, professional way to manage your freelance business.</p>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-4">Product</h4>
                            <ul className="space-y-2">
                                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Testimonials</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-4">Company</h4>
                            <ul className="space-y-2">
                                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p>© 2024 BizMaker. All rights reserved.</p>
                        <div className="flex gap-6">
                            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
