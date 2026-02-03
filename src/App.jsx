import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, ProtectedRoute } from './context/AuthContext';
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

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-center" />
        <Routes>
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />

          <Route path="/" element={
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

          <Route path="/receipt-editor" element={ // New Route
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

          <Route path="/receipts-history" element={ // New Receipt History Route
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

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
