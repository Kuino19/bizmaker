import React from 'react';

const InvoiceTemplate = ({ docData, currency = '$', themeColor = '#4f46e5', logo, docType = 'Invoice' }) => {

    // Helper to avoid crashes
    const safeData = docData || {};
    const items = Array.isArray(safeData.items) ? safeData.items : [];
    const sender = safeData.sender || {};
    const recipient = safeData.recipient || {};

    // Calculations
    const subtotal = items.reduce((acc, item) => acc + ((item.quantity || 0) * (item.price || 0)), 0);
    const taxRate = safeData.taxRate || 0;
    const discount = safeData.discount || 0;
    const taxAmount = (subtotal * (taxRate / 100));
    const total = subtotal + taxAmount - discount;

    return (
        <div
            id="document-preview"
            className="w-[800px] min-w-[800px] min-h-[1131px] bg-white shadow-2xl relative mx-auto"
            style={{
                borderTop: `8px solid ${themeColor}`
            }}
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

            <div className="p-12 h-full flex flex-col justify-between relative z-10">

                {/* Header Section */}
                <div>
                    <div className="flex justify-between items-start mb-12">
                        <div className="w-1/2">
                            {logo ? (
                                <img src={logo} alt="Logo" className="h-20 w-auto object-contain mb-4" />
                            ) : (
                                <div className="h-16 w-16 bg-gray-100 rounded flex items-center justify-center text-gray-400 mb-4 text-xs">
                                    No Logo
                                </div>
                            )}
                            <h1 className="text-3xl font-bold text-gray-900 mb-1">{sender.name || 'Your Business'}</h1>
                            <p className="text-sm text-gray-500 whitespace-pre-line">{sender.address}</p>
                            <p className="text-sm text-gray-500 mt-1">{sender.email}</p>
                            <p className="text-sm text-gray-500">{sender.phone}</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-5xl font-light text-gray-200 tracking-wide uppercase">{docType}</h2>
                            <div className="mt-6 text-right">
                                <div className="mb-2">
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Number</span>
                                    <span className="text-lg font-medium text-gray-800">{safeData.number}</span>
                                </div>
                                <div className="mb-2">
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Date</span>
                                    <span className="text-md text-gray-700">{safeData.date}</span>
                                </div>
                                <div>
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">{docType === 'Invoice' ? 'Due Date' : 'Paid Date'}</span>
                                    <span className="text-md text-gray-700">{safeData.dueDate}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recipient Section */}
                    <div className="mb-12 border-t border-gray-100 pt-8">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Bill To</span>
                        <h3 className="text-xl font-bold text-gray-800 mb-1">{recipient.name || 'Client Name'}</h3>
                        <p className="text-sm text-gray-600 whitespace-pre-line">{recipient.address}</p>
                        <p className="text-sm text-gray-600 mt-1">{recipient.email}</p>
                    </div>

                    {/* Table */}
                    <table className="w-full mb-8">
                        <thead>
                            <tr className="border-b-2 border-gray-100">
                                <th className="text-left py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-1/2">Description</th>
                                <th className="text-right py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Quantity</th>
                                <th className="text-right py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                                <th className="text-right py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => (
                                <tr key={item.id || index} className="border-b border-gray-50 text-sm">
                                    <td className="py-4 text-gray-800 font-medium">{item.description}</td>
                                    <td className="py-4 text-right text-gray-600">{item.quantity}</td>
                                    <td className="py-4 text-right text-gray-600">{currency}{(item.price || 0).toFixed(2)}</td>
                                    <td className="py-4 text-right text-gray-800 font-semibold">{currency}{((item.quantity || 0) * (item.price || 0)).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer / Totals */}
                <div>
                    <div className="flex justify-end mb-12">
                        <div className="w-1/2">
                            <div className="flex justify-between py-2 border-b border-gray-100">
                                <span className="text-sm font-medium text-gray-500">Subtotal</span>
                                <span className="text-sm font-bold text-gray-800">{currency}{subtotal.toFixed(2)}</span>
                            </div>
                            {taxRate > 0 && (
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-sm font-medium text-gray-500">Tax ({taxRate}%)</span>
                                    <span className="text-sm font-bold text-gray-800">{currency}{taxAmount.toFixed(2)}</span>
                                </div>
                            )}
                            {discount > 0 && (
                                <div className="flex justify-between py-2 border-b border-gray-100 text-green-600">
                                    <span className="text-sm font-medium">Discount</span>
                                    <span className="text-sm font-bold">-{currency}{discount.toFixed(2)}</span>
                                </div>
                            )}
                            <div
                                className="flex justify-between py-4 mt-2"
                                style={{ color: themeColor }}
                            >
                                <span className="text-lg font-bold uppercase">{docType === 'Invoice' ? 'Amount Due' : 'Total Paid'}</span>
                                <span className="text-2xl font-bold">{currency}{total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    {safeData.notes && (
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Notes & Terms</h4>
                            <p className="text-sm text-gray-600 leading-relaxed">{safeData.notes}</p>
                        </div>
                    )}

                    {/* Footer Branding */}
                    <div className="mt-12 pt-6 border-t border-gray-100 text-center">
                        <p className="text-xs text-gray-400">Generated by BizMaker Pro</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceTemplate;
