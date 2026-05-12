import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, ProtectedRoute } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Layout from './layout/Layout';

const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const InvoiceEditor = lazy(() => import('./pages/editor/InvoiceEditor'));
const History = lazy(() => import('./pages/history/History'));
const Clients = lazy(() => import('./pages/clients/Clients'));
const DocumentPreview = lazy(() => import('./pages/preview/DocumentPreview'));
const Finance = lazy(() => import('./pages/finance/Finance'));
const Settings = lazy(() => import('./pages/settings/Settings'));
const MarketingCapture = lazy(() => import('./pages/debug/MarketingCapture'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-center" />
        <Suspense fallback={<div className="min-h-screen grid place-items-center text-gray-400">Loading...</div>}>
          <Routes>
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/" element={<LandingPage />} />

            <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
            <Route path="/editor" element={<ProtectedRoute><Layout><InvoiceEditor initialDocType="Invoice" strictMode={true} /></Layout></ProtectedRoute>} />
            <Route path="/receipt-editor" element={<ProtectedRoute><Layout><InvoiceEditor initialDocType="Receipt" strictMode={true} /></Layout></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><Layout><History typeFilter="Invoice" /></Layout></ProtectedRoute>} />
            <Route path="/receipts-history" element={<ProtectedRoute><Layout><History typeFilter="Receipt" /></Layout></ProtectedRoute>} />
            <Route path="/clients" element={<ProtectedRoute><Layout><Clients /></Layout></ProtectedRoute>} />
            <Route path="/finance" element={<ProtectedRoute><Layout><Finance /></Layout></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
            <Route path="/preview" element={<ProtectedRoute><DocumentPreview /></ProtectedRoute>} />
            <Route path="/marketing-capture" element={<ProtectedRoute><MarketingCapture /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
