import React, { createContext, useContext, useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../supabaseClient';
import { storageService } from '../lib/storageService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isGuest, setIsGuest] = useState(localStorage.getItem('isGuest') === 'true');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            if (isGuest) {
                const localUser = await storageService.getLocalUser();
                setUser(localUser);
                setIsLoading(false);
            } else {
                // Check active session
                supabase.auth.getSession().then(({ data: { session } }) => {
                    const currentUser = session?.user ?? null;
                    if (currentUser?.user_metadata) {
                        const metadataSize = new Blob([JSON.stringify(currentUser.user_metadata)]).size;
                        if (metadataSize > 50000) { // > 50KB
                            console.warn('CRITICAL: User metadata is very large (' + (metadataSize / 1024).toFixed(1) + 'KB). This will cause "Failed to Fetch" errors.');
                        }
                    }
                    setUser(currentUser);
                    setIsLoading(false);
                }).catch(err => {
                    console.error('Session check failed', err);
                    setIsLoading(false);
                });

                const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
                    setUser(session?.user ?? null);
                    setIsLoading(false);
                });

                return () => subscription.unsubscribe();
            }
        };
        checkAuth();
    }, [isGuest]);

    const login = async (email, password) => {
        if (isGuest) {
            const localUser = await storageService.getLocalUser();
            if (localUser && localUser.email === email && localUser.password === password) {
                setUser(localUser);
                toast.success('Welcome back!');
                return true;
            }
            toast.error('Invalid credentials');
            return false;
        } else {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                toast.error(error.message);
                return false;
            }

            toast.success('Welcome back!');
            return true;
        }
    };

    const register = async (name, email, password, country, currency, address) => {
        if (isGuest) {
            const newUser = {
                id: crypto.randomUUID(),
                email,
                password,
                user_metadata: {
                    full_name: name,
                    country,
                    currency,
                    address,
                    name,
                }
            };
            await storageService.setLocalUser(newUser);
            setUser(newUser);
            toast.success('Guest account created!');
            return true;
        } else {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name,
                        country,
                        currency,
                        address,
                        name: name,
                        email: email,
                        phone: ''
                    },
                },
            });

            if (error) {
                toast.error(error.message);
                return false;
            }

            toast.success('Account created! Please check your email.');
            return true;
        }
    };

    const logout = async () => {
        if (isGuest) {
            localStorage.removeItem('isGuest');
            localStorage.removeItem('local_user');
            setIsGuest(false);
            setUser(null);
        } else {
            await supabase.auth.signOut();
            setUser(null);
        }
        toast.success('Logged out');
    };

    const continueAsGuest = async () => {
        const guestUser = {
            id: 'guest',
            email: 'guest@example.com',
            user_metadata: {
                full_name: 'Guest User',
                name: 'Guest User',
                currency: '$'
            }
        };
        localStorage.setItem('isGuest', 'true');
        await storageService.setLocalUser(guestUser);
        setIsGuest(true);
        setUser(guestUser);
        toast.success('Continuing as Guest');
        return true;
    };

    const updateProfile = async (updates) => {
        if (isGuest) {
            const updatedUser = {
                ...user,
                user_metadata: {
                    ...user.user_metadata,
                    ...updates
                }
            };
            await storageService.setLocalUser(updatedUser);
            setUser(updatedUser);
            toast.success('Profile updated successfully');
            return true;
        } else {
            const { error } = await supabase.auth.updateUser({
                data: updates
            });

            if (error) {
                toast.error(error.message);
                return false;
            }

            setUser(prev => ({
                ...prev,
                user_metadata: {
                    ...prev.user_metadata,
                    ...updates
                }
            }));

            toast.success('Profile updated successfully');
            return true;
        }
    };

    const repairProfile = async () => {
        if (!user || isGuest) return;
        
        // Strip out common bulky fields to restore functionality
        const minimalMetadata = { ...user.user_metadata };
        delete minimalMetadata.logo;
        
        const { error } = await supabase.auth.updateUser({
            data: minimalMetadata
        });

        if (error) throw error;
        
        setUser(prev => ({ ...prev, user_metadata: minimalMetadata }));
        return true;
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, isGuest, login, register, logout, updateProfile, continueAsGuest, repairProfile }}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};

export const ProtectedRoute = ({ children }) => {
    const { user } = useAuth();
    if (!user) {
        return <Navigate to="/auth/login" replace />;
    }
    return children;
};
