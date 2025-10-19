// src/App.js - Main application component with routing
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AttendancePage from './pages/AttendancePage';
import IncidentPage from './pages/IncidentPage';
import ReportsPage from './pages/ReportsPage';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check if user is logged in on component mount
    useEffect(() => {
        const token = sessionStorage.getItem('token');
        setIsAuthenticated(!!token);
    }, []);

    // Protected Route wrapper
    const ProtectedRoute = ({ children }) => {
        return isAuthenticated ? children : <Navigate to="/login" />;
    };

    return (
        <Router>
            <Routes>
                {/* Public Route - Login */}
                <Route path="/login" element={<Login setAuth={setIsAuthenticated} />} />

                {/* Protected Routes */}
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/attendance/:examId" element={<ProtectedRoute><AttendancePage /></ProtectedRoute>} />
                <Route path="/incident/:examId" element={<ProtectedRoute><IncidentPage /></ProtectedRoute>} />
                <Route path="/reports/:examId" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />

                {/* Redirect unknown routes to dashboard */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;