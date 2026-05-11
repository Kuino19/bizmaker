import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, ProtectedRoute, useAuth } from './context/AuthContext';
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
          <Suspense fallback={<div className="min-h-screen grid place-items-center text-gray-400">Loading...</div>}>
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
          </Suspense>
        </MobileInitialRoute>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
