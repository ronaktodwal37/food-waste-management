import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, UserRole } from '../context/AuthContext.tsx';
import { HomePage } from '../pages/HomePage.tsx';
import { HowItWorksPage } from '../pages/HowItWorksPage.tsx';
import { ImpactPage } from '../pages/ImpactPage.tsx';
import { AboutPage } from '../pages/AboutPage.tsx';
import { LoginPage } from '../pages/auth/LoginPage.tsx';
import { RegisterPage } from '../pages/auth/RegisterPage.tsx';
import { DonorDashboard } from '../pages/donor/DonorDashboard.tsx';
import { NgoDashboard } from '../pages/ngo/NgoDashboard.tsx';
import { VolunteerDashboard } from '../pages/volunteer/VolunteerDashboard.tsx';
import { CommunityDashboard } from '../pages/community/CommunityDashboard.tsx';
import { AdminDashboard } from '../pages/admin/AdminDashboard.tsx';
import { ProfilePage } from '../pages/profile/ProfilePage.tsx';

// Route Guard Component
interface GuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<GuardProps> = ({ children, allowedRoles }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="py-24 text-center text-xs text-stone-500">
        Authenticating user credentials...
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return (
      <div className="py-16 max-w-md mx-auto text-center space-y-4">
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs">
          <p className="font-bold text-sm">Access Restricted</p>
          <p className="mt-1">
            This portal requires one of [{allowedRoles.join(', ')}]. Your active role is <strong>{currentUser.role}</strong>.
          </p>
          <p className="mt-2 text-stone-500">Use the Demo Switcher in the top bar to switch into an authorized persona.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<HomePage />} />
      <Route path="/how-it-works" element={<HowItWorksPage />} />
      <Route path="/impact" element={<ImpactPage />} />
      <Route path="/about" element={<AboutPage />} />

      {/* Auth Pages */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Role-Specific Protected Portals */}
      <Route
        path="/donor/dashboard"
        element={
          <ProtectedRoute allowedRoles={['FOOD_DONOR', 'ADMIN']}>
            <DonorDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/ngo/dashboard"
        element={
          <ProtectedRoute allowedRoles={['NGO', 'ADMIN']}>
            <NgoDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/volunteer/dashboard"
        element={
          <ProtectedRoute allowedRoles={['VOLUNTEER', 'ADMIN']}>
            <VolunteerDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/community/dashboard"
        element={
          <ProtectedRoute allowedRoles={['COMMUNITY_USER', 'ADMIN']}>
            <CommunityDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Common User Profile */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Redirect Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
