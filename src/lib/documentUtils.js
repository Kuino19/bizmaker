export const DOCUMENT_STATUSES = ['Draft', 'Sent', 'Pending', 'Paid', 'Overdue', 'Cancelled'];

export const STATUS_STYLES = {
    Draft: 'bg-slate-50 text-slate-700 border-slate-200',
    Sent: 'bg-blue-50 text-blue-700 border-blue-200',
    Pending: 'bg-amber-50 text-amber-700 border-amber-200',
    Paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Overdue: 'bg-red-50 text-red-700 border-red-200',
    Cancelled: 'bg-gray-100 text-gray-500 border-gray-200'
};

export const getDefaultStatus = (docType) => (docType === 'Receipt' ? 'Paid' : 'Draft');

export const normalizeStatus = (status, docType, dueDate) => {
    if (status && DOCUMENT_STATUSES.includes(status)) return status;
    if (docType === 'Receipt') return 'Paid';
    if (dueDate && new Date(dueDate) < startOfToday()) return 'Overdue';
    return 'Pending';
};

export const startOfToday = () => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
};

export const isOverdueInvoice = (doc) => {
    if ((doc.docType || doc.doc_type) !== 'Invoice') return false;
    const status = doc.status || 'Pending';
    const dueDate = doc.dueDate || doc.due_date;
    return !['Paid', 'Cancelled'].includes(status) && dueDate && new Date(dueDate) < startOfToday();
};

export const calculateDocumentTotals = (items = [], taxRate = 0, discount = 0) => {
    const subtotal = items.reduce((acc, item) => acc + ((Number(item.quantity) || 0) * (Number(item.price) || 0)), 0);
    const taxAmount = subtotal * ((Number(taxRate) || 0) / 100);
    const total = subtotal + taxAmount - (Number(discount) || 0);
    return { subtotal, taxAmount, total };
};

export const parseDocumentNumber = (number, prefix) => {
    const match = String(number || '').match(new RegExp(`^${prefix}-(\\d+)$`, 'i'));
    return match ? Number(match[1]) : 0;
};

export const getNextDocumentNumber = (documents = [], docType, settings = {}) => {
    const defaultPrefix = docType === 'Receipt' ? 'REC' : 'INV';
    const prefix = (docType === 'Receipt' ? settings.receiptPrefix : settings.invoicePrefix) || defaultPrefix;
    const width = Number(settings.numberPadding) || 4;
    const max = documents
        .filter((doc) => (doc.doc_type || doc.docType) === docType)
        .reduce((acc, doc) => Math.max(acc, parseDocumentNumber(doc.unique_number || doc.number, prefix)), 0);

    return `${prefix}-${String(max + 1).padStart(width, '0')}`;
};

export const mapStoredDocumentToEditor = (doc) => ({
    id: doc.id,
    number: doc.unique_number || doc.number,
    date: doc.date,
    dueDate: doc.due_date || doc.dueDate,
    sender: doc.sender || {},
    recipient: {
        name: doc.recipient_name || doc.recipient?.name || '',
        email: doc.recipient_email || doc.recipient?.email || '',
        address: doc.recipient_address || doc.recipient?.address || '',
        phone: doc.recipient_phone || doc.recipient?.phone || ''
    },
    items: Array.isArray(doc.items) ? doc.items : [],
    notes: doc.notes || '',
    paymentDetails: doc.payment_details || doc.paymentDetails || '',
    taxRate: Number(doc.tax_rate ?? doc.taxRate ?? 0),
    discount: Number(doc.discount || 0),
    themeColor: doc.theme_color,
    currency: doc.currency,
    logo: doc.logo,
    templateId: doc.template_id || doc.templateId || 'professional',
    docType: doc.doc_type || doc.docType || 'Invoice',
    status: normalizeStatus(doc.status, doc.doc_type || doc.docType, doc.due_date || doc.dueDate)
});

export const mapStoredDocumentToSummary = (doc) => {
    const editorDoc = mapStoredDocumentToEditor(doc);
    const totals = calculateDocumentTotals(editorDoc.items, editorDoc.taxRate, editorDoc.discount);

    return {
        ...doc,
        id: doc.id,
        number: editorDoc.number,
        recipient: editorDoc.recipient,
        date: editorDoc.date,
        dueDate: editorDoc.dueDate,
        currency: editorDoc.currency,
        total: Number(doc.total ?? totals.total),
        docType: editorDoc.docType,
        status: normalizeStatus(editorDoc.status, editorDoc.docType, editorDoc.dueDate),
        updatedAt: doc.updated_at || doc.updatedAt,
        templateId: editorDoc.templateId,
        logo: editorDoc.logo
    };
};

export const escapeCsvValue = (value) => {
    const stringValue = String(value ?? '');
    if (/[",\n]/.test(stringValue)) return `"${stringValue.replaceAll('"', '""')}"`;
    return stringValue;
};
