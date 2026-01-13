// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AttendancePage from './pages/AttendancePage';
import ReportsPage from './pages/ReportsPage';
import LibrarianDashboard from './pages/LibrarianDashboard';
import './App.css';

function App() {
    const isAuthenticated = () => {
        return localStorage.getItem('token') !== null;
    };

    const ProtectedRoute = ({ children }) => {
        return isAuthenticated() ? children : <Navigate to="/login" replace />;
    };

    // Simple inline Login component since LoginPage doesn't exist
    const LoginPage = () => {
        const [username, setUsername] = React.useState('');
        const [password, setPassword] = React.useState('');
        const [error, setError] = React.useState('');

        const handleLogin = async (e) => {
            e.preventDefault();

            // Mock login for testing
            if (username === 'invigilator1' && password === 'password123') {
                localStorage.setItem('token', 'mock-token-12345');
                localStorage.setItem('username', username);
                window.location.href = '/';
            } else {
                setError('Invalid credentials');
            }
        };

        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}>
                <div style={{
                    background: 'white',
                    padding: '40px',
                    borderRadius: '10px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    width: '100%',
                    maxWidth: '400px'
                }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Login</h2>
                    {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}
                    <form onSubmit={handleLogin}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #ddd',
                                    borderRadius: '5px'
                                }}
                                required
                            />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #ddd',
                                    borderRadius: '5px'
                                }}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: '#667eea',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontSize: '16px',
                                fontWeight: 'bold'
                            }}
                        >
                            Login
                        </button>
                    </form>
                    <p style={{ marginTop: '20px', textAlign: 'center', color: '#666', fontSize: '14px' }}>
                        Test credentials: invigilator1 / password123
                    </p>
                </div>
            </div>
        );
    };

    // Simple inline IncidentReportPage since it doesn't exist
    const IncidentReportPage = () => {
        return (
            <div style={{ padding: '20px' }}>
                <h1>Incident Report Page</h1>
                <p>This page is under construction.</p>
                <button onClick={() => window.location.href = '/'}>Back to Dashboard</button>
            </div>
        );
    };

    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/attendance/:examId"
                        element={
                            <ProtectedRoute>
                                <AttendancePage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/incident/:examId"
                        element={
                            <ProtectedRoute>
                                <IncidentReportPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports/:examId"
                        element={
                            <ProtectedRoute>
                                <ReportsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/librarian"
                        element={
                            <ProtectedRoute>
                                <LibrarianDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;