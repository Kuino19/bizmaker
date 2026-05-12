import React from 'react';

const InvoiceTemplate = ({ docData, currency = '$', templateId = 'professional', logo, docType = 'Invoice' }) => {

    // Helper to avoid crashes
    const safeData = docData || {};
    const items = Array.isArray(safeData.items) ? safeData.items : [];
    const sender = safeData.sender || {};
    const recipient = safeData.recipient || {};

    // Standard HEX Colors for manual styling (Bypassing Tailwind v4 oklch/oklab)
    const COLORS = {
        white: '#ffffff',
        black: '#000000',
        slate900: '#0f172a',
        slate600: '#475569',
        emerald400: '#34d399',
        emerald500: '#10b981',
        blue50: '#eff6ff',
        blue900: '#1e3a8a',
        blue800: '#1e40af',
        gray900: '#111827',
        gray800: '#1f2937',
        gray600: '#4b5563',
        gray500: '#6b7280',
        gray400: '#9ca3af',
        gray200: '#e5e7eb',
        gray100: '#f3f4f6',
        gray50: '#f9fafb',
        borderLight: '#e5e7eb', // gray-200
    };

    // Template Configs
    const templates = {
        professional: {
            font: 'font-sans',
            style: { backgroundColor: COLORS.white },
            headerStyle: { backgroundColor: COLORS.white },
            headerTitleStyle: { color: COLORS.gray900 },
            headerTextStyle: { color: COLORS.gray500 },
            docTypeStyle: { color: '#e5e7eb' }, // gray-200
            detailsTextStyle: { color: COLORS.gray800 },
            accent: '#475569', // Slate-600
            borderStyle: 'rounded-none',
            labelStyle: { textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem', fontWeight: 600, color: COLORS.gray500 }
        },
        tech: {
            font: 'font-mono',
            style: { backgroundColor: COLORS.white },
            headerStyle: { backgroundColor: COLORS.slate900 },
            headerTitleStyle: { color: COLORS.emerald400 },
            headerTextStyle: { color: '#cbd5e1' }, // slate-300
            docTypeStyle: { color: 'rgba(255,255,255,0.2)' },
            detailsTextStyle: { color: COLORS.white },
            accent: '#10b981', // Emerald-500
            borderStyle: 'rounded-none',
            labelStyle: { fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' } // slate-500
        },
        business: {
            font: 'font-serif',
            style: { backgroundColor: COLORS.white },
            headerStyle: { backgroundColor: COLORS.blue50 },
            headerTitleStyle: { color: COLORS.blue900 },
            headerTextStyle: { color: COLORS.gray500 },
            docTypeStyle: { color: '#bfdbfe' }, // blue-200
            detailsTextStyle: { color: COLORS.blue900 },
            accent: '#1e3a8a', // Blue-900
            borderStyle: 'rounded-sm',
            labelStyle: { textTransform: 'uppercase', letterSpacing: '0.025em', fontSize: '0.75rem', fontWeight: 700, color: 'rgba(30, 58, 138, 0.6)' }
        },
        creative: {
            font: 'font-sans',
            style: { backgroundColor: COLORS.white },
            headerStyle: { background: 'linear-gradient(to right, #a855f7, #ec4899)' },
            headerTitleStyle: { color: COLORS.white },
            headerTextStyle: { color: 'rgba(255,255,255,0.9)' },
            docTypeStyle: { color: 'rgba(255,255,255,0.2)' },
            detailsTextStyle: { color: COLORS.white },
            accent: '#d946ef', // Fuchsia-500
            borderStyle: 'rounded-2xl',
            labelStyle: { fontSize: '0.75rem', fontWeight: 700, color: '#c026d3', textTransform: 'uppercase', letterSpacing: '0.1em' }
        },
        minimal: {
            font: 'font-sans',
            style: { backgroundColor: COLORS.white },
            headerStyle: { backgroundColor: COLORS.white },
            headerTitleStyle: { color: COLORS.black },
            headerTextStyle: { color: COLORS.black },
            docTypeStyle: { color: '#e5e7eb' },
            detailsTextStyle: { color: COLORS.black },
            accent: '#000000',
            borderStyle: 'rounded-none',
            labelStyle: { fontSize: '0.75rem', color: COLORS.black, fontWeight: 500, textTransform: 'uppercase', borderBottom: '1px solid black', paddingBottom: '4px', display: 'inline-block' }
        }
    };

    const currentTemplate = templates[templateId] || templates.professional;

    // Calculations
    const subtotal = items.reduce((acc, item) => acc + ((item.quantity || 0) * (item.price || 0)), 0);
    const taxRate = safeData.taxRate || 0;
    const discount = safeData.discount || 0;
    const taxAmount = (subtotal * (taxRate / 100));
    const total = subtotal + taxAmount - discount;

    return (
        <div
            id="document-preview"
            style={{
                ...currentTemplate.style.font === 'font-sans' ? { fontFamily: 'ui-sans-serif, system-ui, sans-serif' } : {},
                ...currentTemplate.style.font === 'font-mono' ? { fontFamily: 'ui-monospace, monospace' } : {},
                ...currentTemplate.style.font === 'font-serif' ? { fontFamily: 'ui-serif, serif' } : {},
                width: '800px',
                minWidth: '800px',
                minHeight: '1000px',
                backgroundColor: 'white',
                position: 'relative',
                margin: '0 auto',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
            className={currentTemplate.font}
        >
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                <div
                    style={{
                        color: COLORS.gray900,
                        opacity: 0.03,
                        fontSize: '120px',
                        transform: 'rotate(-45deg)',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        userSelect: 'none',
                        whiteSpace: 'nowrap'
                    }}
                >
                    {sender.name || 'BizMaker'}
                </div>
            </div>

            <div className="h-full flex flex-col justify-between relative z-10">

                {/* Header Section */}
                <div style={{ ...currentTemplate.headerStyle, padding: '2rem', transition: 'background-color 0.3s' }}>
                    <div className="flex justify-between items-start">
                        <div className="w-1/2">
                            {logo ? (
                                <img src={logo} alt="Logo" crossOrigin="anonymous" style={{ height: '5rem', width: 'auto', objectFit: 'contain', marginBottom: '1rem' }} />
                            ) : (
                                <div style={{ height: '4rem', width: '4rem', backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', borderRadius: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5, marginBottom: '1rem', fontSize: '0.75rem', color: 'currentColor' }}>
                                    No Logo
                                </div>
                            )}
                            <h1 style={{ ...currentTemplate.headerTitleStyle, fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.25rem' }}>{sender.name || 'Your Business'}</h1>
                            <div style={currentTemplate.headerTextStyle}>
                                <p style={{ fontSize: '0.875rem', whiteSpace: 'pre-line' }}>{sender.address}</p>
                                <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>{sender.email}</p>
                                <p style={{ fontSize: '0.875rem' }}>{sender.phone}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <h2 style={{ ...currentTemplate.docTypeStyle, fontSize: '3rem', fontWeight: 300, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                {docType}
                            </h2>
                            <div style={{ marginTop: '1.5rem', textAlign: 'right', ...currentTemplate.detailsTextStyle }}>
                                <div className="mb-2">
                                    <span style={{ display: 'block', opacity: 0.7, fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Number</span>
                                    <span style={{ fontSize: '1.125rem', fontWeight: 500 }}>{safeData.number}</span>
                                </div>
                                <div className="mb-2">
                                    <span style={{ display: 'block', opacity: 0.7, fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Date</span>
                                    <span style={{ fontSize: '1rem' }}>{safeData.date}</span>
                                </div>
                                <div>
                                    <span style={{ display: 'block', opacity: 0.7, fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>{docType === 'Invoice' ? 'Due Date' : 'Paid Date'}</span>
                                    <span style={{ fontSize: '1rem' }}>{safeData.dueDate}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ padding: '2rem', flex: 1 }}>
                    {/* Recipient Section */}
                    <div style={{ marginBottom: '3rem' }}>
                        <span style={currentTemplate.labelStyle}>{docType === 'Receipt' ? 'Bill From' : 'Bill To'}</span>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: COLORS.gray800, marginTop: '0.5rem', marginBottom: '0.25rem' }}>{recipient.name || 'Client Name'}</h3>
                        <p style={{ fontSize: '0.875rem', color: COLORS.gray600, whiteSpace: 'pre-line' }}>{recipient.address}</p>
                        <p style={{ fontSize: '0.875rem', color: COLORS.gray600, marginTop: '0.25rem' }}>{recipient.email}</p>
                    </div>

                    {/* Table */}
                    <table style={{ width: '100%', marginBottom: '2rem', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: `2px solid ${currentTemplate.accent === '#000000' ? '#000000' : COLORS.gray100}` }}>
                                <th style={{ textAlign: 'left', padding: '0.75rem 0', width: '50%', ...currentTemplate.labelStyle }}>Description</th>
                                <th style={{ textAlign: 'right', padding: '0.75rem 0', ...currentTemplate.labelStyle }}>Quantity</th>
                                <th style={{ textAlign: 'right', padding: '0.75rem 0', ...currentTemplate.labelStyle }}>Price</th>
                                <th style={{ textAlign: 'right', padding: '0.75rem 0', ...currentTemplate.labelStyle }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => (
                                <tr key={item.id || index} style={{ borderBottom: `1px solid ${COLORS.gray50}` }}>
                                    <td style={{ padding: '1rem 0', color: COLORS.gray800, fontWeight: 500 }}>{item.description}</td>
                                    <td style={{ padding: '1rem 0', textAlign: 'right', color: COLORS.gray600 }}>{item.quantity}</td>
                                    <td style={{ padding: '1rem 0', textAlign: 'right', color: COLORS.gray600 }}>{currency}{(item.price || 0).toFixed(2)}</td>
                                    <td style={{ padding: '1rem 0', textAlign: 'right', color: COLORS.gray800, fontWeight: 700 }}>{currency}{((item.quantity || 0) * (item.price || 0)).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer / Totals */}
                <div style={{ padding: '2rem', backgroundColor: 'rgba(249, 250, 251, 0.5)' }}>
                    <div className="flex justify-end mb-12">
                        <div className="w-1/2 space-y-2">
                            <div className="flex justify-between">
                                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: COLORS.gray500 }}>Subtotal</span>
                                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: COLORS.gray800 }}>{currency}{subtotal.toFixed(2)}</span>
                            </div>
                            {taxRate > 0 && (
                                <div className="flex justify-between">
                                    <span style={{ fontSize: '0.875rem', fontWeight: 500, color: COLORS.gray500 }}>Tax ({taxRate}%)</span>
                                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: COLORS.gray800 }}>{currency}{taxAmount.toFixed(2)}</span>
                                </div>
                            )}
                            {discount > 0 && (
                                <div className="flex justify-between" style={{ color: '#16a34a' }}> {/* green-600 */}
                                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Discount</span>
                                    <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>-{currency}{discount.toFixed(2)}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', marginTop: '0.5rem', borderTop: `1px solid ${COLORS.gray200}` }}>
                                <span style={{ fontSize: '1.125rem', fontWeight: 700, textTransform: 'uppercase', color: COLORS.gray900 }}>{docType === 'Invoice' ? 'Amount Due' : 'Total Paid'}</span>
                                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: currentTemplate.accent }}>{currency}{total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    {safeData.notes && (
                        <div style={{
                            padding: '1rem',
                            backgroundColor: templateId === 'tech' ? '#f1f5f9' : '#ffffff',
                            border: templateId === 'tech' ? 'none' : `1px solid ${COLORS.gray200}`,
                            borderLeft: templateId === 'tech' ? '4px solid #10b981' : `1px solid ${COLORS.gray200}`,
                            ...currentTemplate.borderStyle === 'rounded-2xl' ? { borderRadius: '1rem' } : {},
                            ...currentTemplate.borderStyle === 'rounded-sm' ? { borderRadius: '0.125rem' } : {}
                        }}>
                            <h4 style={currentTemplate.labelStyle}>Notes & Terms</h4>
                            <p style={{ fontSize: '0.875rem', color: COLORS.gray600, lineHeight: 1.625, marginTop: '0.25rem', whiteSpace: 'pre-line' }}>{safeData.notes}</p>
                        </div>
                    )}

                    {safeData.paymentDetails && docType === 'Invoice' && (
                        <div style={{
                            marginTop: '1.5rem',
                            padding: '1rem',
                            backgroundColor: '#eff6ff', // blue-50
                            border: `1px solid #bfdbfe`, // blue-200
                            borderRadius: '0.5rem'
                        }}>
                            <h4 style={{ ...currentTemplate.labelStyle, color: '#1e40af' }}>Payment Details</h4>
                            <p style={{ fontSize: '0.875rem', color: '#1e3a8a', lineHeight: 1.625, marginTop: '0.25rem', whiteSpace: 'pre-line', fontFamily: 'monospace' }}>
                                {safeData.paymentDetails}
                            </p>
                        </div>
                    )}

                    {/* Footer Branding */}
                    <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: `1px solid ${COLORS.gray200}`, textAlign: 'center' }}>
                        <p style={{ fontSize: '0.75rem', color: COLORS.gray400 }}>Generated with BizMaker</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceTemplate;
