import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    // 1. Not logged in -> Kick to Login
    if (!token || !role) {
        return <Navigate to="/login" replace />;
    }

    // 2. Unauthorized Role -> Redirect to their respective dashboard
    if (allowedRoles && !allowedRoles.includes(role)) {
        if (role === 'ADMIN') return <Navigate to="/admin" replace />;
        if (role === 'AGENT') return <Navigate to="/agent" replace />;
        if (role === 'RECEPTION') return <Navigate to="/reception" replace />;
        return <Navigate to="/login" replace />; // fallback
    }

    // 3. Authorized -> Render children (Outlet)
    return <Outlet />;
};

export default ProtectedRoute;
