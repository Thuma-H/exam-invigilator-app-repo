// src/components/Navbar.js - Navigation bar component
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/apiService';

function Navbar() {
    const navigate = useNavigate();
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
            window.location.reload(); // Force page refresh to clear state
        } catch (error) {
            console.error('Logout error:', error);
            navigate('/login');
        }
    };

    return (
        <nav className="navbar">
            <h1>📋 Exam Invigilator System</h1>
            <div className="navbar-user">
                <span>Welcome, <strong>{user.fullName}</strong></span>
                <button onClick={handleLogout} className="btn-logout">
                    Logout
                </button>
                <button onClick={() => navigate('/barcodes')}>
                    📊 Student Barcodes
                </button>
                <button onClick={() => navigate('/register-student')}>
                    ➕ Register Student
                </button>
            </div>
        </nav>
    );
}

export default Navbar;