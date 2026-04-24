import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext.jsx';
import ScrollToTop from '@/components/ScrollToTop.jsx';
import ProtectedRoute from '@/components/ProtectedRoute.jsx';
import Header from '@/components/Header.jsx';
import HomePage from '@/pages/HomePage.jsx';
import LoginPage from '@/pages/LoginPage.jsx';
import SignupPage from '@/pages/SignupPage.jsx';
import AdminDashboard from '@/pages/AdminDashboard.jsx';
import CoordenadorDashboard from '@/pages/CoordenadorDashboard.jsx';
import AlunoDashboard from '@/pages/AlunoDashboard.jsx';
import AIRecommendationPage from '@/pages/AIRecommendationPage.jsx';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />
        <Header />
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['administrador']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/coordenador"
            element={
              <ProtectedRoute allowedRoles={['coordenador']}>
                <CoordenadorDashboard />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/aluno"
            element={
              <ProtectedRoute allowedRoles={['aluno']}>
                <AlunoDashboard />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/ai-recommendations"
            element={
              <ProtectedRoute allowedRoles={['aluno']}>
                <AIRecommendationPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;