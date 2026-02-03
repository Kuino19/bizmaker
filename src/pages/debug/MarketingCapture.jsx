import React, { useState } from 'react';
import html2canvas from 'html2canvas';

// Placeholder for components we want to capture
// We will reuse existing components if possible, or build quick mocks
import Dashboard from '../dashboard/Dashboard';
import InvoiceEditor from '../editor/InvoiceEditor';
import InvoiceTemplate from '../../components/InvoiceTemplate';

const MarketingCapture = () => {
    const [status, setStatus] = useState('Ready');

    // Demo Data
    const demoInvoiceData = {
        number: 'INV-2024-001',
        date: '2024-02-03',
        dueDate: '2024-02-10',
        sender: {
            name: 'Summit Solutions',
            address: '123 Tech Park, Innovation Way\nSan Francisco, CA 94107',
            email: 'hello@summitsolutions.com',
            phone: '+1 (555) 123-4567'
        },
        recipient: {
            name: 'Acme Corp',
            address: '456 Industrial Ave\nAustin, TX 78701',
            email: 'billing@acme.com'
        },
        items: [
            { id: 1, description: 'Strategic Consulting - Q3 Market Analysis', quantity: 1, price: 2500 },
            { id: 2, description: 'Website Performance Optimization', quantity: 1, price: 1200 },
            { id: 3, description: 'Cloud Infrastructure Migration', quantity: 15, price: 150 }
        ],
        taxRate: 5,
        discount: 0,
        total: 6247.50,
        notes: 'Payment due within 7 days. Thank you for your business!'
    };

    const captureScreen = async (elementId, filename) => {
        const element = document.getElementById(elementId);
        if (!element) {
            console.error(`Element ${elementId} not found`);
            return;
        }

        setStatus(`Capturing ${filename}...`);

        // Wait a bit for render
        await new Promise(r => setTimeout(r, 1000));

        try {
            const canvas = await html2canvas(element, {
                scale: 1, // High res for marketing
                useCORS: true,
                backgroundColor: '#f9fafb', // Gray-50 background usually
                logging: false,
                ignoreElements: (el) => el.tagName === 'BUTTON' && el.innerText.includes('Capture') // Ignore the capture button itself if inside
            });

            const link = document.createElement('a');
            link.download = filename;
            link.href = canvas.toDataURL('image/png');
            link.click();

            setStatus(`Saved ${filename}`);
        } catch (err) {
            console.error(err);
            setStatus('Error capturing ' + filename);
        }
    };

    return (
        <div className="p-8 space-y-12 bg-gray-50 min-h-screen">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-0 z-50 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">📸 Marketing Asset Generator</h1>
                    <p className="text-sm text-gray-500">Scroll down to see previews. Click buttons to snap.</p>
                </div>
                <div className="text-indigo-600 font-medium">Status: {status}</div>
            </div>

            {/* 1. PDF Preview Section (The Hero Shot) */}
            <div className="space-y-4">
                <div className="flex justify-between items-end">
                    <h2 className="text-xl font-bold text-gray-700">1. The "Payoff" (Professional Invoice)</h2>
                    <button
                        onClick={() => captureScreen('preview-capture-area', '01_professional_invoice.png')}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        Capture This
                    </button>
                </div>
                <div id="preview-capture-area" className="p-8 bg-gray-100 rounded-xl border border-gray-200 flex justify-center overflow-auto">
                    {/* Reuse the actual template */}
                    <div className="transform scale-75 origin-top shadow-2xl">
                        <InvoiceTemplate
                            docData={demoInvoiceData}
                            docType="Invoice"
                            currency="$"
                            templateId="professional"
                            logo={null} // Or pass a dummy logo URL if you have one
                        />
                    </div>
                </div>
            </div>

            {/* 2. Editor Section (The Flow) */}
            {/* Note: Rendering the full complex editor here might be hard due to contexts. 
                Instead, we'll create a "Visual Mock" of the editor using HTML/Tailwind to look perfect and clean. 
            */}
            <div className="space-y-4">
                <div className="flex justify-between items-end">
                    <h2 className="text-xl font-bold text-gray-700">2. The "Creation Flow" (Editor UI)</h2>
                    <button
                        onClick={() => captureScreen('editor-capture-area', '02_editor_ui.png')}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        Capture This
                    </button>
                </div>
                <div id="editor-capture-area" className="w-[1200px] h-[800px] bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col mx-auto relative">
                    {/* Mock Sidebar */}
                    <div className="absolute left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-100 p-6">
                        <div className="flex items-center gap-2 mb-8">
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">S</div>
                            <span className="font-bold text-gray-800">BizMaker</span>
                        </div>
                        <div className="space-y-2">
                            <div className="px-4 py-2 text-gray-500 rounded-lg">Dashboard</div>
                            <div className="px-4 py-2 bg-indigo-50 text-indigo-600 font-medium rounded-lg">New Invoice</div>
                            <div className="px-4 py-2 text-gray-500 rounded-lg">Clients</div>
                        </div>
                    </div>
                    {/* Mock Content */}
                    <div className="ml-64 flex-1 p-8 bg-gray-50 h-full">
                        <h2 className="text-2xl font-bold mb-6">New Invoice</h2>
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Invoice Number</label>
                                    <input type="text" value="INV-2024-001" readOnly className="w-full p-2 border rounded-lg bg-gray-50" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Date</label>
                                    <input type="date" value="2024-02-03" readOnly className="w-full p-2 border rounded-lg bg-gray-50" />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-700 mb-2 border-b pb-2">Client Details</h3>
                                <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100 text-indigo-900">
                                    <div className="font-bold">Acme Corp</div>
                                    <div className="text-sm">billing@acme.com</div>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-700 mb-2 border-b pb-2">Line Items</h3>
                                <div className="space-y-2">
                                    <div className="flex gap-4 items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                                        <div className="flex-1 font-medium">Strategic Consulting</div>
                                        <div className="w-24 text-right">1</div>
                                        <div className="w-32 text-right">$2,500.00</div>
                                    </div>
                                    <div className="flex gap-4 items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                                        <div className="flex-1 font-medium">Website Optimization</div>
                                        <div className="w-24 text-right">1</div>
                                        <div className="w-32 text-right">$1,200.00</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default MarketingCapture;
