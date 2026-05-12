import { supabase } from '../supabaseClient';
import { getDefaultStatus } from './documentUtils';

const isGuest = () => localStorage.getItem('isGuest') === 'true';

const getLocal = (key) => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
};

const setLocal = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
};

const getObjectLocal = (key) => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : {};
};

const setObjectLocal = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
};

export const storageService = {
    // Storage (Logos)
    async uploadLogo(file, userId) {
        if (!file || !userId) return null;
        
        const fileExt = 'jpg'; // We optimize to JPEG in imageUtils
        const fileName = `${userId}_${Math.random().toString(36).slice(2)}.${fileExt}`;
        const filePath = `logos/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('assets') // Using 'assets' as the bucket name
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true
            });

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
            .from('assets')
            .getPublicUrl(filePath);
            
        return publicUrl;
    },

    // Auth Helper
    async getLocalUser() {
        const user = localStorage.getItem('local_user');
        return user ? JSON.parse(user) : null;
    },

    async setLocalUser(user) {
        localStorage.setItem('local_user', JSON.stringify(user));
    },

    // Invoices
    async getInvoices(userId, typeFilter) {
        if (!isGuest()) {
            let query = supabase
                .from('invoices')
                .select('*')
                .eq('user_id', userId)
                .order('updated_at', { ascending: false });
            
            if (typeFilter) {
                query = query.eq('doc_type', typeFilter);
            }
            
            const { data, error } = await query;
            if (error) throw error;
            return data;
        } else {
            let invoices = getLocal('invoices');
            if (typeFilter) {
                invoices = invoices.filter(inv => inv.doc_type === typeFilter);
            }
            return invoices.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        }
    },

    async saveInvoice(invoiceData) {
        const payload = {
            ...invoiceData,
            status: invoiceData.status || getDefaultStatus(invoiceData.doc_type)
        };

        if (!isGuest()) {
            const { data, error } = await supabase
                .from('invoices')
                .upsert([payload])
                .select();
            if (error) throw error;
            return data[0];
        } else {
            const invoices = getLocal('invoices');
            const index = invoices.findIndex(inv => inv.id === payload.id);
            const now = new Date().toISOString();
            
            const updatedInvoice = {
                ...payload,
                updated_at: now,
                created_at: payload.created_at || now
            };

            if (index > -1) {
                invoices[index] = updatedInvoice;
            } else {
                updatedInvoice.id = updatedInvoice.id || crypto.randomUUID();
                invoices.unshift(updatedInvoice);
            }
            
            setLocal('invoices', invoices);
            return updatedInvoice;
        }
    },

    async deleteInvoice(id) {
        if (!isGuest()) {
            const { error } = await supabase
                .from('invoices')
                .delete()
                .eq('id', id);
            if (error) throw error;
        } else {
            const invoices = getLocal('invoices').filter(inv => inv.id !== id);
            setLocal('invoices', invoices);
        }
    },

    async updateInvoiceStatus(id, status) {
        if (!isGuest()) {
            const { data, error } = await supabase
                .from('invoices')
                .update({ status, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select();
            if (error) throw error;
            return data?.[0];
        }

        const invoices = getLocal('invoices');
        const updated = invoices.map(inv => (
            inv.id === id ? { ...inv, status, updated_at: new Date().toISOString() } : inv
        ));
        setLocal('invoices', updated);
        return updated.find(inv => inv.id === id);
    },

    async markDocumentEmailed(id) {
        // For authenticated users, update emailed_at in Supabase
        if (!isGuest()) {
            const { data, error } = await supabase
                .from('invoices')
                .update({ emailed_at: new Date().toISOString() })
                .eq('id', id)
                .select();
            if (error) {
                // Supabase may not have this column yet — fall back gracefully
                console.warn('emailed_at column not found, falling back to localStorage:', error.message);
            } else {
                return data?.[0];
            }
        }
        // For guests OR if Supabase update failed, use localStorage
        const meta = getObjectLocal('documentMeta');
        meta[id] = {
            ...(meta[id] || {}),
            emailedAt: new Date().toISOString()
        };
        setObjectLocal('documentMeta', meta);
        return meta[id];
    },

    async getDocumentMeta() {
        return getObjectLocal('documentMeta');
    },

    // Clients
    async getClients(userId) {
        if (!isGuest()) {
            const { data, error } = await supabase
                .from('clients')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        } else {
            return getLocal('clients').sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }
    },

    async saveClient(clientData) {
        if (!isGuest()) {
            const { data, error } = await supabase
                .from('clients')
                .upsert([clientData])
                .select();
            if (error) throw error;
            return data[0];
        } else {
            const clients = getLocal('clients');
            const index = clients.findIndex(c => c.id === clientData.id);
            const now = new Date().toISOString();
            
            const updatedClient = {
                ...clientData,
                created_at: clientData.created_at || now
            };

            if (index > -1) {
                clients[index] = updatedClient;
            } else {
                updatedClient.id = updatedClient.id || crypto.randomUUID();
                clients.unshift(updatedClient);
            }
            
            setLocal('clients', clients);
            return updatedClient;
        }
    },

    async deleteClient(id) {
        if (!isGuest()) {
            const { error } = await supabase
                .from('clients')
                .delete()
                .eq('id', id);
            if (error) throw error;
        } else {
            const clients = getLocal('clients').filter(c => c.id !== id);
            setLocal('clients', clients);
        }
    }
};
