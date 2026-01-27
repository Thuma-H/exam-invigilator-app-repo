// src/components/Navbar.js - Modern navigation bar
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/apiService';
import '../styles/Navbar.css';

function Navbar() {
    const navigate = useNavigate();
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    const role = sessionStorage.getItem('role');

    const handleLogout = async () => {
        try {
            await logout();
            sessionStorage.clear();
            localStorage.clear();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
            sessionStorage.clear();
            localStorage.clear();
            navigate('/login');
        }
    };

    const handleDashboardClick = () => {
        if (role === 'LIBRARIAN') {
            navigate('/librarian');
        } else {
            navigate('/');
        }
    };

    return (
        <nav className="modern-navbar">
            <div className="navbar-brand" onClick={handleDashboardClick}>
                <div className="brand-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M12 12H15M12 16H15M9 12H9.01M9 16H9.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                </div>
                <div className="brand-text">
                    <span className="brand-title">ExamGuard</span>
                    <span className="brand-subtitle">Invigilation System</span>
                </div>
            </div>

            <div className="navbar-actions">
                <div className="user-profile">
                    <div className="user-avatar">
                        {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="user-details">
                        <span className="user-name">{user.fullName || 'User'}</span>
                        <span className={`user-role role-${role?.toLowerCase()}`}>
                            {role || 'INVIGILATOR'}
                        </span>
                    </div>
                </div>

                <button onClick={handleLogout} className="logout-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17 16L21 12M21 12L17 8M21 12H7M13 16V17C13 18.6569 11.6569 20 10 20H6C4.34315 20 3 18.6569 3 17V7C3 5.34315 4.34315 4 6 4H10C11.6569 4 13 5.34315 13 7V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Logout</span>
                </button>
            </div>
        </nav>
    );
}

export default Navbar;
