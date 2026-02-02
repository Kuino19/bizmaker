import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Edit } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import toast from 'react-hot-toast';
import InvoiceTemplate from '../../components/InvoiceTemplate';

const DocumentPreview = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { docData, docType, themeColor, currency, logo } = location.state || {};
    const [isGenerating, setIsGenerating] = useState(false);

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

        html2pdf().set(opt).from(element).save().then(() => {
            setIsGenerating(false);
            toast.success('PDF Downloaded!');
        }).catch(err => {
            console.error(err);
            setIsGenerating(false);
            toast.error('Failed to generate PDF');
        });
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

                <div className="flex gap-3 w-full md:w-auto">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg shadow-sm hover:bg-gray-50 transition-colors text-sm font-medium border border-gray-200"
                    >
                        <Edit size={16} /> Edit
                    </button>
                    <button
                        onClick={generatePDF}
                        disabled={isGenerating}
                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 text-white rounded-lg shadow-md transition-all text-sm font-medium ${isGenerating ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg'}`}
                    >
                        {isGenerating ? 'Processing...' : <><Download size={18} /> Download PDF</>}
                    </button>
                </div>
            </div>

            {/* Preview Area */}
            <div className="flex-1 overflow-auto p-8 flex justify-center">
                <div className="shadow-2xl">
                    <InvoiceTemplate
                        docData={docData}
                        docType={docType}
                        currency={currency}
                        themeColor={themeColor}
                        logo={logo}
                    />
                </div>
            </div>
        </div>
    );
};

export default DocumentPreview;
