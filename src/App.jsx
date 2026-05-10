import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, ProtectedRoute, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Layout from './layout/Layout';
import Dashboard from './pages/dashboard/Dashboard';
import InvoiceEditor from './pages/editor/InvoiceEditor';
import History from './pages/history/History';
import Clients from './pages/clients/Clients';
import DocumentPreview from './pages/preview/DocumentPreview';
import Finance from './pages/finance/Finance';
import Settings from './pages/settings/Settings';
import MarketingCapture from './pages/debug/MarketingCapture';
import LandingPage from './pages/LandingPage';

const isGuest = () => localStorage.getItem('isGuest') === 'true';

// Mobile redirect component
const MobileInitialRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return null;

  // If we are at root and not logged in, but not guest, we stay on landing
  if (!user && !isGuest() && (location.pathname === '/' || location.pathname === '')) {
    return children;
  }

  return children;
};

function AppContent() {
  return (
    <Toaster position="top-center" />
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
        <MobileInitialRoute>
          <Routes>
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />

            <Route path="/" element={<LandingPage />} />

            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/editor" element={
              <ProtectedRoute>
                <Layout>
                  <InvoiceEditor initialDocType="Invoice" strictMode={true} />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/receipt-editor" element={
              <ProtectedRoute>
                <Layout>
                  <InvoiceEditor initialDocType="Receipt" strictMode={true} />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/history" element={
              <ProtectedRoute>
                <Layout>
                  <History typeFilter="Invoice" />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/receipts-history" element={
              <ProtectedRoute>
                <Layout>
                  <History typeFilter="Receipt" />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/clients" element={
              <ProtectedRoute>
                <Layout>
                  <Clients />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/finance" element={
              <ProtectedRoute>
                <Layout>
                  <Finance />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/settings" element={
              <ProtectedRoute>
                <Layout>
                  <Settings />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/preview" element={
              <ProtectedRoute>
                <DocumentPreview />
              </ProtectedRoute>
            } />

            <Route path="/marketing-capture" element={
              <ProtectedRoute>
                <MarketingCapture />
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MobileInitialRoute>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
