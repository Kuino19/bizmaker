import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Download, Edit, Mail, Share2 } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import toast from 'react-hot-toast';
import emailjs from '@emailjs/browser';
import InvoiceTemplate from '../../components/InvoiceTemplate';
import { storageService } from '../../lib/storageService';
import { calculateDocumentTotals } from '../../lib/documentUtils';

const DocumentPreview = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { docData, docType, currency, logo, status } = location.state || {};
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [emailMessage, setEmailMessage] = useState(`Please find attached your ${docType || 'document'}.`);
    const { total } = calculateDocumentTotals(docData?.items || [], docData?.taxRate || 0, docData?.discount || 0);
    const documentTotal = docData?.total ?? total;

    if (!docData) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
                <p className="text-gray-500 mb-4">No document data found.</p>
                <button
                    onClick={() => navigate('/')}
                    className="text-indigo-600 hover:underline"
                >
                    Return to Dashboard
                </button>
            </div>
        );
    }

    const generatePDF = () => {
        setIsGenerating(true);
        const element = document.getElementById('document-preview');
        const opt = {
            margin: 0,
            filename: `${docType}_${docData.number}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        // Delay to ensure rendering (especially images)
        setTimeout(() => {
            console.log("Starting PDF generation...");
            try {
                html2pdf().set(opt).from(element).save().then(() => {
                    setIsGenerating(false);
                    toast.success('PDF Downloaded!');
                }).catch(err => {
                    console.error('PDF Generation Error Promise:', err);
                    setIsGenerating(false);
                    toast.error('Failed: ' + (err.message || 'Unknown Error'));
                });
            } catch (e) {
                console.error('PDF Generation Synchronous Error:', e);
                setIsGenerating(false);
                toast.error('Crash: ' + e.message);
            }
        }, 800);
    };

    const handleSendEmail = async () => {
        const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
        const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
        const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

        if (!serviceId || !templateId || !publicKey) {
            toast.error('Email configuration missing in .env');
            return;
        }

        if (!docData.recipient.email) {
            toast.error('Recipient email is missing!');
            return;
        }

        setIsSending(true);
        const toastId = toast.loading('Preparing email...');

        try {
            // Generate PDF Blob
            const element = document.getElementById('document-preview');
            const opt = {
                margin: 0,
                filename: `${docType}_${docData.number}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
            };

            const pdfWorker = html2pdf().set(opt).from(element).toPdf();
            const pdfBlob = await pdfWorker.output('blob');

            // Convert Blob to Base64 using Promise
            const base64data = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(pdfBlob);
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
            });

            const templateParams = {
                to_name: docData.recipient.name || 'Valued Client',
                to_email: docData.recipient.email,
                from_name: docData.sender.name || 'BizMaker User',
                invoice_number: docData.number,
                amount: `${currency}${documentTotal.toFixed(2)}`,
                message: emailMessage,
                content: base64data
            };

            await emailjs.send(serviceId, templateId, templateParams, publicKey);
            if (docData.id) {
                await storageService.markDocumentEmailed(docData.id);
                if (docType === 'Invoice' && !['Paid', 'Cancelled'].includes(status)) {
                    await storageService.updateInvoiceStatus(docData.id, 'Sent');
                }
            }

            toast.success('Email sent successfully!', { id: toastId });
        } catch (error) {
            console.error('Email error:', error);
            toast.error('Failed to send email: ' + (error.text || error.message), { id: toastId });
        } finally {
            setIsSending(false);
        }
    };

    const handleShare = async () => {
        const text = `${docType} ${docData.number} for ${docData.recipient?.name || 'client'}: ${currency}${documentTotal.toFixed(2)}`;
        try {
            if (navigator.share) {
                await navigator.share({ title: text, text });
            } else {
                await navigator.clipboard.writeText(text);
                toast.success('Summary copied');
            }
        } catch (error) {
            if (error.name !== 'AbortError') toast.error('Unable to share document');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Toolbar */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col md:flex-row justify-between items-center sticky top-0 z-20 shadow-sm gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
                        title="Back to Editor"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-bold text-gray-800">{docType} Preview</h1>
                </div>

                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-white text-gray-700 rounded-lg shadow-sm hover:bg-gray-50 transition-colors text-xs font-medium border border-gray-200"
                    >
                        <Edit size={14} /> Edit
                    </button>

                    <button
                        onClick={handleSendEmail}
                        disabled={isSending}
                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-2 text-white rounded-lg shadow-sm transition-all text-xs font-medium ${isSending ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                    >
                        <Mail size={16} /> {isSending ? 'Email' : 'Email'}
                    </button>

                    <button
                        onClick={handleShare}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-white text-gray-700 rounded-lg shadow-sm hover:bg-gray-50 transition-colors text-xs font-medium border border-gray-200"
                    >
                        {navigator.share ? <Share2 size={16} /> : <Copy size={16} />} Share
                    </button>


                    <button
                        onClick={generatePDF}
                        disabled={isGenerating}
                        className={`hidden md:flex flex-1 md:flex-none items-center justify-center gap-2 px-6 py-2 text-white rounded-lg shadow-md transition-all text-xs font-medium ${isGenerating ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg'}`}
                    >
                        {isGenerating ? '...' : <><Download size={16} /> PDF</>}
                    </button>
                </div>
            </div>

            {/* Preview Area */}
            <div className="flex-1 overflow-auto p-8 flex justify-center">
                <div className="space-y-4">
                    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Email Message</label>
                        <textarea
                            value={emailMessage}
                            onChange={(e) => setEmailMessage(e.target.value)}
                            rows="2"
                            className="w-full text-sm p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                        />
                    </div>
                    <InvoiceTemplate
                        docData={docData}
                        docType={docType}
                        currency={currency}
                        templateId={location.state?.templateId || 'professional'}
                        logo={logo}
                    />
                </div>
            </div>
        </div>
    );
};

export default DocumentPreview;
