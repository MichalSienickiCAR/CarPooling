import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * A wrapper component that checks for authentication.
 * If the user has a token in localStorage, it renders the child routes (Outlet).
 * Otherwise, it redirects to the login page.
 */
export const ProtectedRoute = () => {
    const token = localStorage.getItem('token');

    // Simple check: if token exists, user is considered authenticated.
    // For a more robust solution, we would verify token validity.
    const isAuthenticated = !!token;

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};
