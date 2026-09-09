import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { AppLayout } from './layouts/AppLayout';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { HowItWorksPage } from './pages/public/HowItWorksPage';
import { TechnologyPage } from './pages/public/TechnologyPage';
import { SafetyPage } from './pages/public/SafetyPage';
import { ContactPage } from './pages/public/ContactPage';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';

// Healthcare Worker Pages
import { DashboardPage } from './pages/app/DashboardPage';
import { NewScreeningPage } from './pages/app/NewScreeningPage';
import { ResultPage } from './pages/app/ResultPage';
import { HistoryPage } from './pages/app/HistoryPage';
import { PatientProfilePage } from './pages/app/PatientProfilePage';
import { ReportsPage } from './pages/app/ReportsPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { UsersPage } from './pages/admin/UsersPage';
import { AnalyticsPage } from './pages/admin/AnalyticsPage';
import { ModelPerformancePage } from './pages/admin/ModelPerformancePage';
import { SettingsPage } from './pages/admin/SettingsPage';

// Route Guards
const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({
  children,
  adminOnly = false,
}) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F8F6] text-xs text-[#667477]">
        Verifying credentials...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Website Routes */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="how-it-works" element={<HowItWorksPage />} />
            <Route path="technology" element={<TechnologyPage />} />
            <Route path="safety" element={<SafetyPage />} />
            <Route path="contact" element={<ContactPage />} />
          </Route>

          {/* Authentication Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Healthcare Worker Clinical Portal */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="new-screening" element={<NewScreeningPage />} />
            <Route path="result/:id" element={<ResultPage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="patients" element={<PatientProfilePage />} />
            <Route path="reports" element={<ReportsPage />} />
          </Route>

          {/* Admin Governance Portal */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboardPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="model-performance" element={<ModelPerformancePage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
