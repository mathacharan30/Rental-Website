// src/utils/ProtectedRoute.jsx
// Usage:
//   <ProtectedRoute allowedRoles={['super_admin']}>  → only super_admin
//   <ProtectedRoute allowedRoles={['store_owner']}>  → only store_owner
//   <ProtectedRoute allowedRoles={['customer']}>     → only customer
//   <ProtectedRoute>                                 → any authenticated user

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { firebaseUser, userProfile, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader />;

  // Not logged in → go to login
  if (!firebaseUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role check (if specified)
  if (allowedRoles && allowedRoles.length > 0) {
    if (!userProfile || !allowedRoles.includes(userProfile.role)) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
