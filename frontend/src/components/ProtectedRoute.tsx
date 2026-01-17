import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export const ProtectedRoute: React.FC = () => {
  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};
