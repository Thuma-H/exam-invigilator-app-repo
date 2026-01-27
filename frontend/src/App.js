// src/App.js - Main application component with routing
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LibrarianDashboard from './pages/LibrarianDashboard';
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

    // Librarian-only Route wrapper
    const LibrarianRoute = ({ children }) => {
        const role = sessionStorage.getItem('role');
        if (!isAuthenticated) {
            return <Navigate to="/login" />;
        }
        if (role !== 'LIBRARIAN') {
            // Not a librarian, show access denied or redirect
            return (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white'
                }}>
                    <h1>🚫 Access Denied</h1>
                    <p>You need librarian credentials to access this page.</p>
                    <button
                        onClick={() => {
                            sessionStorage.clear();
                            window.location.href = '/login';
                        }}
                        style={{
                            marginTop: '20px',
                            padding: '12px 30px',
                            background: 'white',
                            color: '#667eea',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        Back to Login
                    </button>
                </div>
            );
        }
        return children;
    };

    return (
        <Router>
            <Routes>
                {/* Public Route - Login */}
                <Route path="/login" element={<Login setAuth={setIsAuthenticated} />} />

                {/* Protected Routes */}
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/librarian" element={<LibrarianRoute><LibrarianDashboard /></LibrarianRoute>} />
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