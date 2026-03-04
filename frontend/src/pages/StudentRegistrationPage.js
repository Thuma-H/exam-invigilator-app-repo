// src/pages/StudentRegistrationPage.js - Student Registration Page
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SpinningCrescents from '../components/SpinningCrescents';

const API_BASE = 'http://localhost:8080/api';

const StudentRegistrationPage = () => {
    const [studentId, setStudentId] = useState('');
    const [fullName, setFullName] = useState('');
    const [program, setProgram] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        if (!studentId.trim() || !fullName.trim() || !program.trim()) {
            setMessage({ text: 'Student ID, Full Name, and Program are required.', type: 'error' });
            return;
        }

        setLoading(true);
        try {
            const token = sessionStorage.getItem('token') || localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/students`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    studentId: studentId.trim(),
                    fullName: fullName.trim(),
                    program: program.trim(),
                    email: email.trim() || null
                }),
            });

            if (!response.ok) {
                const text = await response.text().catch(() => null);
                throw new Error(text || 'Failed to register student');
            }

            setMessage({ text: `Student "${fullName.trim()}" registered successfully!`, type: 'success' });
            setStudentId('');
            setFullName('');
            setProgram('');
            setEmail('');
        } catch (error) {
            console.error('Error registering student:', error);
            setMessage({ text: error.message || 'Failed to register student. Please try again.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div style={{
                minHeight: 'calc(100vh - 60px)',
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #7e57c2 100%)',
                padding: '2rem',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div className="blurred-watermark" style={{ backgroundImage: `url('${process.env.PUBLIC_URL}/nextphases-swirl.png')` }} />
                <SpinningCrescents />
                <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
                        <button
                            onClick={() => navigate(-1)}
                            style={{
                                background: 'rgba(255, 255, 255, 0.15)',
                                border: '1px solid rgba(255, 255, 255, 0.25)',
                                fontSize: '16px',
                                cursor: 'pointer',
                                marginRight: '15px',
                                color: 'white',
                                padding: '0.6rem 1.2rem',
                                borderRadius: '8px',
                                fontWeight: '600',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            ← Back
                        </button>
                        <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: 'white', margin: 0 }}>
                            📝 Register Student
                        </h1>
                    </div>

                    {message.text && (
                        <div style={{
                            padding: '1rem 1.25rem',
                            borderRadius: '12px',
                            marginBottom: '1.5rem',
                            background: message.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                            color: message.type === 'success' ? '#6ee7b7' : '#fca5a5',
                            fontWeight: '600',
                            backdropFilter: 'blur(16px)',
                            WebkitBackdropFilter: 'blur(16px)'
                        }}>
                            {message.type === 'success' ? '✅ ' : '❌ '}{message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{
                        background: 'rgba(15, 30, 60, 0.7)',
                        backdropFilter: 'blur(30px)',
                        WebkitBackdropFilter: 'blur(30px)',
                        borderRadius: '20px',
                        padding: '2rem',
                        border: '1.5px solid rgba(167, 139, 250, 0.25)',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(167, 139, 250, 0.15)'
                    }}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={labelStyle}>Student ID *</label>
                            <input
                                type="text"
                                value={studentId}
                                onChange={(e) => setStudentId(e.target.value)}
                                placeholder="e.g. STU-2024-001"
                                style={inputStyle}
                                required
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={labelStyle}>Full Name *</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="e.g. John Smith"
                                style={inputStyle}
                                required
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={labelStyle}>Program *</label>
                            <input
                                type="text"
                                value={program}
                                onChange={(e) => setProgram(e.target.value)}
                                placeholder="e.g. Computer Science"
                                style={inputStyle}
                                required
                            />
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={labelStyle}>Email (Optional)</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="e.g. john@university.edu"
                                style={inputStyle}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '0.85rem',
                                background: loading ? 'rgba(255, 255, 255, 0.1)' : 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
                                color: 'white',
                                border: '1px solid rgba(167, 139, 250, 0.4)',
                                borderRadius: '12px',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: loading ? 'none' : '0 4px 15px rgba(139, 92, 246, 0.25)'
                            }}
                        >
                            {loading ? '⏳ Registering...' : '➕ Register Student'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

const labelStyle = {
    display: 'block',
    marginBottom: '0.4rem',
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: '0.85rem',
    letterSpacing: '0.2px'
};

const inputStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    background: 'rgba(255, 255, 255, 0.06)',
    border: '1.5px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '12px',
    fontSize: '0.95rem',
    color: 'white',
    transition: 'all 0.3s ease',
    outline: 'none',
    boxSizing: 'border-box'
};

export default StudentRegistrationPage;

