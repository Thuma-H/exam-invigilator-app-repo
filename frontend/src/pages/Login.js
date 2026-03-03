// src/pages/Login.js - Login page component
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/apiService';
import SpinningCrescents from '../components/SpinningCrescents';

function Login({ setAuth }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            console.log('🔐 Attempting login for:', username);
            const response = await login(username, password);

            console.log('✅ Login successful:', response.data);

            // Store token and user info (including role) — both storages for refresh persistence
            sessionStorage.setItem('token', response.data.token);
            sessionStorage.setItem('user', JSON.stringify(response.data));
            sessionStorage.setItem('role', response.data.role);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data));
            localStorage.setItem('role', response.data.role);

            // Verify storage
            console.log('🔑 Token stored:', sessionStorage.getItem('token')?.substring(0, 20) + '...');
            console.log('👤 User stored:', JSON.parse(sessionStorage.getItem('user')));
            console.log('🎭 Role:', response.data.role);

            // Update auth state
            setAuth(true);

            // Redirect based on role
            if (response.data.role === 'LIBRARIAN') {
                console.log('📚 Redirecting to Librarian Dashboard');
                navigate('/librarian');
            } else {
                console.log('📋 Redirecting to Invigilator Dashboard');
                navigate('/');
            }
        } catch (err) {
            console.error('❌ Login failed:', err);
            // fetch throws Error(message) from apiService; prefer err.message, fall back to axios-style err.response.data
            const message = err?.message || err?.response?.data || 'Login failed. Please check your credentials.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container" style={{
            backgroundImage: `url('${process.env.PUBLIC_URL}/nextphases-swirl.png')`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: '550px 550px',
            backgroundAttachment: 'fixed'
        }}>
            <SpinningCrescents />
            <div className="login-card">
                <h2>Exam Invigilator Login</h2>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter username"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
                    <p><strong style={{ color: 'rgba(255,255,255,0.7)' }}>Invigilator Credentials:</strong></p>
                    <p>Username: invigilator1 | Password: password123</p>
                    <p style={{ marginTop: '0.75rem' }}><strong style={{ color: 'rgba(255,255,255,0.7)' }}>Librarian Credentials:</strong></p>
                    <p>Username: librarian1 | Password: password123</p>
                    <p>Username: librarian2 | Password: password321</p>
                </div>
            </div>

            {/* Sponsor Footer */}
            <div className="login-sponsor-footer">
                <img src={`${process.env.PUBLIC_URL}/nextphases-logo.png`} alt="NextPhases.dev" className="sponsor-logo" />
                <div className="sponsor-text">
                    <span>© 2026 NextPhases.dev — All Rights Reserved</span>
                </div>
            </div>
        </div>
    );
}

export default Login;