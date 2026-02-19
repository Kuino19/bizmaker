import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
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
    }, []);

    const login = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            toast.error(error.message);
            return false;
        }

        toast.success('Welcome back!');
        return true;
    };

    const register = async (name, email, password, country, currency, address) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                    country,
                    currency,
                    address,

                    // We also map these to expected profile fields for easier access in app
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
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        toast.success('Logged out');
    };

    const updateProfile = async (updates) => {
        const { error } = await supabase.auth.updateUser({
            data: updates
        });

        if (error) {
            toast.error(error.message);
            return false;
        }

        // Manually update local state to reflect changes immediately
        setUser(prev => ({
            ...prev,
            user_metadata: {
                ...prev.user_metadata,
                ...updates
            }
        }));

        toast.success('Profile updated successfully');
        return true;
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateProfile }}>
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

