import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminDashboard from './pages/AdminDashboard';
import CoordenadorDashboard from './pages/CoordenadorDashboard';
import AlunoDashboard from './pages/AlunoDashboard';
import AIRecommendationPage from './pages/AIRecommendationPage';

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