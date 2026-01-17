// src/components/Navbar.js - Navigation bar component
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../services/apiService';

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    const role = sessionStorage.getItem('role');

    // Check if we're on the librarian dashboard
    const isLibrarianDashboard = location.pathname === '/librarian';
    const isLibrarian = role === 'LIBRARIAN';

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
        <div className="navbar-user">
            <span>Welcome, <strong>{user.fullName}</strong> ({role})</span>

            {/* Show different buttons based on role and location */}
            {isLibrarian ? (
                // Librarian sees: Back to Dashboard when on librarian page
                isLibrarianDashboard ? (
                    <button onClick={() => navigate('/register-student')}>
                        ➕ Register Student
                    </button>
                ) : (
                    <>
                        <button onClick={() => navigate('/librarian')}>
                            📚 Librarian Dashboard
                        </button>
                        <button onClick={() => navigate('/register-student')}>
                            ➕ Register Student
                        </button>
                    </>
                )
            ) : (
                // Invigilator sees: Standard invigilator buttons (no librarian access)
                <>
                    <button onClick={() => navigate('/barcodes')}>
                        📊 Student Barcodes
                    </button>
                    <button onClick={() => navigate('/register-student')}>
                        ➕ Register Student
                    </button>
                </>
            )}

            <button onClick={handleLogout} className="btn-logout">
                Logout
            </button>
        </div>
    );
}

export default Navbar;