import React from 'react';

const InvoiceTemplate = ({ docData, currency = '$', templateId = 'professional', logo, docType = 'Invoice' }) => {

    // Helper to avoid crashes
    const safeData = docData || {};
    const items = Array.isArray(safeData.items) ? safeData.items : [];
    const sender = safeData.sender || {};
    const recipient = safeData.recipient || {};

    // Template Configs
    const templates = {
        professional: {
            font: 'font-sans',
            headerBg: 'bg-white',
            headerText: 'text-gray-900',
            accent: '#475569', // Slate-600
            borderStyle: 'rounded-none',
            labelStyle: 'uppercase tracking-wider text-xs font-semibold text-gray-500'
        },
        tech: {
            font: 'font-mono',
            headerBg: 'bg-slate-900',
            headerText: 'text-emerald-400',
            accent: '#10b981', // Emerald-500
            borderStyle: 'rounded-none',
            labelStyle: 'text-xs font-bold text-slate-500 uppercase'
        },
        business: {
            font: 'font-serif',
            headerBg: 'bg-blue-50',
            headerText: 'text-blue-900',
            accent: '#1e3a8a', // Blue-900
            borderStyle: 'rounded-sm',
            labelStyle: 'uppercase tracking-wide text-xs font-bold text-blue-800/60'
        },
        creative: {
            font: 'font-sans',
            headerBg: 'bg-gradient-to-r from-purple-500 to-pink-500',
            headerText: 'text-white',
            accent: '#d946ef', // Fuchsia-500
            borderStyle: 'rounded-2xl',
            labelStyle: 'text-xs font-bold text-fuchsia-600 uppercase tracking-widest'
        },
        minimal: {
            font: 'font-sans',
            headerBg: 'bg-white',
            headerText: 'text-black',
            accent: '#000000',
            borderStyle: 'rounded-none',
            labelStyle: 'text-xs text-black font-medium uppercase border-b border-black pb-1 inline-block'
        }
    };

    const style = templates[templateId] || templates.professional;

    // Calculations
    const subtotal = items.reduce((acc, item) => acc + ((item.quantity || 0) * (item.price || 0)), 0);
    const taxRate = safeData.taxRate || 0;
    const discount = safeData.discount || 0;
    const taxAmount = (subtotal * (taxRate / 100));
    const total = subtotal + taxAmount - discount;

    return (
        <div
            id="document-preview"
            className={`w-[800px] min-w-[800px] min-h-[1131px] bg-white shadow-2xl relative mx-auto ${style.font}`}
        >
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                <div
                    className="text-gray-900 opacity-[0.03] font-bold uppercase transform -rotate-45 whitespace-nowrap select-none"
                    style={{ fontSize: '120px' }}
                >
                    {sender.name || 'BizMaker'}
                </div>
            </div>

            <div className="h-full flex flex-col justify-between relative z-10">

                {/* Header Section (Dynamic Background) */}
                <div className={`${style.headerBg} p-12 transition-colors`}>
                    <div className="flex justify-between items-start">
                        <div className="w-1/2">
                            {logo ? (
                                <img src={logo} alt="Logo" className="h-20 w-auto object-contain mb-4" />
                            ) : (
                                <div className="h-16 w-16 bg-white/20 backdrop-blur-sm rounded flex items-center justify-center text-current opacity-50 mb-4 text-xs">
                                    No Logo
                                </div>
                            )}
                            <h1 className={`text-3xl font-bold mb-1 ${style.headerText}`}>{sender.name || 'Your Business'}</h1>
                            <div className={style.headerText === 'text-white' ? 'text-white/80' : 'text-gray-500'}>
                                <p className="text-sm whitespace-pre-line">{sender.address}</p>
                                <p className="text-sm mt-1">{sender.email}</p>
                                <p className="text-sm">{sender.phone}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <h2 className={`text-5xl font-light tracking-wide uppercase ${style.headerText === 'text-white' ? 'text-white/20' : 'text-gray-200'}`}>
                                {docType}
                            </h2>
                            <div className={`mt-6 text-right ${style.headerText === 'text-white' ? 'text-white' : 'text-gray-800'}`}>
                                <div className="mb-2">
                                    <span className={`block opacity-70 text-xs uppercase mb-1`}>Number</span>
                                    <span className="text-lg font-medium">{safeData.number}</span>
                                </div>
                                <div className="mb-2">
                                    <span className={`block opacity-70 text-xs uppercase mb-1`}>Date</span>
                                    <span className="text-md">{safeData.date}</span>
                                </div>
                                <div>
                                    <span className={`block opacity-70 text-xs uppercase mb-1`}>{docType === 'Invoice' ? 'Due Date' : 'Paid Date'}</span>
                                    <span className="text-md">{safeData.dueDate}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-12 flex-1">
                    {/* Recipient Section */}
                    <div className="mb-12">
                        <span className={style.labelStyle}>Bill To</span>
                        <h3 className="text-xl font-bold text-gray-800 mt-2 mb-1">{recipient.name || 'Client Name'}</h3>
                        <p className="text-sm text-gray-600 whitespace-pre-line">{recipient.address}</p>
                        <p className="text-sm text-gray-600 mt-1">{recipient.email}</p>
                    </div>

                    {/* Table */}
                    <table className="w-full mb-8">
                        <thead>
                            <tr className={`border-b-2 ${style.accent === '#000000' ? 'border-black' : 'border-gray-100'}`}>
                                <th className={`text-left py-3 ${style.labelStyle} w-1/2`}>Description</th>
                                <th className={`text-right py-3 ${style.labelStyle}`}>Quantity</th>
                                <th className={`text-right py-3 ${style.labelStyle}`}>Price</th>
                                <th className={`text-right py-3 ${style.labelStyle}`}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => (
                                <tr key={item.id || index} className="border-b border-gray-50 text-sm">
                                    <td className="py-4 text-gray-800 font-medium">{item.description}</td>
                                    <td className="py-4 text-right text-gray-600">{item.quantity}</td>
                                    <td className="py-4 text-right text-gray-600">{currency}{(item.price || 0).toFixed(2)}</td>
                                    <td className="py-4 text-right text-gray-800 font-bold">{currency}{((item.quantity || 0) * (item.price || 0)).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer / Totals */}
                <div className="p-12 bg-gray-50/50">
                    <div className="flex justify-end mb-12">
                        <div className="w-1/2 space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-gray-500">Subtotal</span>
                                <span className="text-sm font-bold text-gray-800">{currency}{subtotal.toFixed(2)}</span>
                            </div>
                            {taxRate > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium text-gray-500">Tax ({taxRate}%)</span>
                                    <span className="text-sm font-bold text-gray-800">{currency}{taxAmount.toFixed(2)}</span>
                                </div>
                            )}
                            {discount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span className="text-sm font-medium">Discount</span>
                                    <span className="text-sm font-bold">-{currency}{discount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className={`flex justify-between py-4 mt-2 border-t border-gray-200`}>
                                <span className="text-lg font-bold uppercase text-gray-900">{docType === 'Invoice' ? 'Amount Due' : 'Total Paid'}</span>
                                <span className="text-2xl font-bold" style={{ color: style.accent }}>{currency}{total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    {safeData.notes && (
                        <div className={`p-4 ${style.borderStyle} ${templateId === 'tech' ? 'bg-slate-100 border-l-4 border-emerald-500' : 'bg-white border border-gray-200'}`}>
                            <h4 className={style.labelStyle}>Notes & Terms</h4>
                            <p className="text-sm text-gray-600 leading-relaxed mt-1">{safeData.notes}</p>
                        </div>
                    )}

                    {/* Footer Branding */}
                    <div className="mt-12 pt-6 border-t border-gray-200 text-center">
                        <p className="text-xs text-gray-400">Generated by BizMaker Pro</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceTemplate;
