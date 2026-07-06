import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

// Pages
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Search from '../pages/Search';
import ProvidersDirectory from '../pages/ProvidersDirectory';
import ProviderProfile from '../pages/ProviderProfile';
import BookingPage from '../pages/BookingPage';
import ChatPage from '../pages/ChatPage';
import Profile from '../pages/Profile';
import NotFound from '../pages/NotFound';

// Dashboards
import CustomerDashboard from '../pages/Dashboard/CustomerDashboard';
import ProviderDashboard from '../pages/Dashboard/ProviderDashboard';
import AdminDashboard from '../pages/Dashboard/AdminDashboard';

// Route Guards
import ProtectedRoute from './ProtectedRoute';
import RoleBasedRoute from './RoleBasedRoute';

const AppRoutes = () => {
  const { checkAuth, loading } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/search" element={<Search />} />
      <Route path="/providers" element={<ProvidersDirectory />} />
      <Route path="/providers/:id" element={<ProviderProfile />} />


      {/* Booking Scheduler (Customers Only) */}
      <Route
        path="/bookings/new"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['customer']}>
              <BookingPage />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      {/* Chat Room */}
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />

      {/* User Profile Settings */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Dashboards (Requires Auth + Role restriction) */}

      <Route
        path="/dashboard/customer"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['customer']}>
              <CustomerDashboard />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/dashboard/provider"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['provider']}>
              <ProviderDashboard />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/admin"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      {/* fallback 404 handler */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
