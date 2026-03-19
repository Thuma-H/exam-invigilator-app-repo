// src/App.js - Main application component with routing
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LibrarianDashboard from './pages/LibrarianDashboard';
import NotificationsPage from './pages/NotificationsPage';
import AttendancePage from './pages/AttendancePage';
import IncidentPage from './pages/IncidentPage';
import ReportsPage from './pages/ReportsPage';
import BarcodeManagementPage from './pages/BarcodeManagementPage';
import StudentRegistrationPage from './pages/StudentRegistrationPage';
import ExamSchedulerPage from './pages/ExamSchedulerPage';

function App() {
    // Initialize auth state immediately from storage (prevents redirect flash on refresh)
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
        // Validate token format — a JWT must have exactly 2 periods
        if (token && (token.split('.').length - 1) === 2) {
            return true;
        }
        // Bad or missing token — clear everything
        if (token) {
            console.warn('Invalid token format detected — clearing session');
            sessionStorage.clear();
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('role');
        }
        return false;
    });

    // Protected Route wrapper
    const ProtectedRoute = ({ children }) => {
        return isAuthenticated ? children : <Navigate to="/login" />;
    };

    // Librarian-only Route wrapper
    const LibrarianRoute = ({ children }) => {
        const role = sessionStorage.getItem('role') || localStorage.getItem('role');
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
                            localStorage.removeItem('token');
                            localStorage.removeItem('user');
                            localStorage.removeItem('role');
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
                <Route path="/notifications" element={<LibrarianRoute><NotificationsPage /></LibrarianRoute>} />
                <Route path="/attendance/:examId" element={<ProtectedRoute><AttendancePage /></ProtectedRoute>} />
                <Route path="/incident/:examId" element={<ProtectedRoute><IncidentPage /></ProtectedRoute>} />
                <Route path="/reports/:examId" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
                <Route path="/barcodes" element={<ProtectedRoute><BarcodeManagementPage /></ProtectedRoute>} />
                <Route path="/register-student" element={<ProtectedRoute><StudentRegistrationPage /></ProtectedRoute>} />
                <Route path="/exam-scheduler" element={<ProtectedRoute><ExamSchedulerPage /></ProtectedRoute>} />

                {/* Redirect unknown routes to dashboard */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;