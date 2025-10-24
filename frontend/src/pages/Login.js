// src/pages/Login.js - Login page component
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';

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

            // Store token and user info
            sessionStorage.setItem('token', response.data.token);
            sessionStorage.setItem('user', JSON.stringify(response.data));

            // Verify storage
            console.log('🔑 Token stored:', sessionStorage.getItem('token')?.substring(0, 20) + '...');
            console.log('👤 User stored:', JSON.parse(sessionStorage.getItem('user')));

            // Update auth state and redirect to dashboard
            setAuth(true);
            navigate('/');
        } catch (err) {
            console.error('❌ Login failed:', err);
            setError(err.response?.data || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
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

                <div style={{ marginTop: '1rem', textAlign: 'center', color: '#666', fontSize: '0.9rem' }}>
                    <p>Default credentials:</p>
                    <p><strong>Username:</strong> invigilator1</p>
                    <p><strong>Password:</strong> password123</p>
                </div>
            </div>
        </div>
    );
}

export default Login;