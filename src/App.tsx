
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Profile from '@/pages/Profile';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import NotFound from '@/pages/NotFound';
import Header from '@/components/Header';
import { Toaster } from '@/components/ui/toaster';
import Produse from '@/pages/Produse';
import Comanda from '@/pages/Comanda';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminValidarePreturi from '@/pages/AdminValidarePreturi';
import CentralizatorComenzi from '@/pages/CentralizatorComenzi';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Header />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/produse"
                element={
                  <ProtectedRoute>
                    <Produse />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/comanda"
                element={
                  <ProtectedRoute>
                    <Comanda />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/centralizator-comenzi"
                element={
                  <ProtectedRoute>
                    <CentralizatorComenzi />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin-dashboard"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/validare-preturi"
                element={
                  <ProtectedRoute>
                    <AdminValidarePreturi />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
