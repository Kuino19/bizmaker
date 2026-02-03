import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { Users, Plus, Trash2, Mail, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const Clients = () => {
    const { user } = useAuth();
    const [clients, setClients] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newClient, setNewClient] = useState({ name: '', email: '', address: '' });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) fetchClients();
    }, [user]);

    const fetchClients = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) toast.error('Error fetching clients');
        else setClients(data || []);
        setIsLoading(false);
    };

    const saveClient = async (e) => {
        e.preventDefault();

        const { data, error } = await supabase
            .from('clients')
            .insert([{
                ...newClient,
                user_id: user.id
            }])
            .select();

        if (error) {
            toast.error(error.message);
        } else {
            setClients([data[0], ...clients]);
            setShowModal(false);
            setNewClient({ name: '', email: '', address: '' });
            toast.success('Client added');
        }
    };

    const deleteClient = async (id) => {
        if (confirm('Delete this client?')) {
            const { error } = await supabase
                .from('clients')
                .delete()
                .eq('id', id);

            if (error) {
                toast.error(error.message);
            } else {
                setClients(clients.filter(c => c.id !== id));
                toast.success('Client deleted');
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
                >
                    <Plus size={18} /> Add Client
                </button>
            </div>

            {isLoading ? (
                <div className="text-center py-12 text-gray-400">Loading clients...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {clients.map(client => (
                        <div key={client.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                                    {client.name.charAt(0)}
                                </div>
                                <button
                                    onClick={() => deleteClient(client.id)}
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">{client.name}</h3>
                            <div className="space-y-2 text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                    <Mail size={14} /> {client.email}
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin size={14} /> {client.address}
                                </div>
                            </div>
                        </div>
                    ))}

                    {clients.length === 0 && (
                        <div className="col-span-full py-12 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                            <Users size={48} className="mx-auto mb-4 opacity-50" />
                            <p>No clients yet. Add one to get started.</p>
                        </div>
                    )}
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl">
                        <h2 className="text-xl font-bold mb-4">Add New Client</h2>
                        <form onSubmit={saveClient} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    required
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={newClient.name}
                                    onChange={e => setNewClient({ ...newClient, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={newClient.email}
                                    onChange={e => setNewClient({ ...newClient, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <textarea
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={newClient.address}
                                    onChange={e => setNewClient({ ...newClient, address: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                >
                                    Save Client
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Clients;
