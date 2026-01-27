import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { API_CONFIG } from '../config/environment';
import './LibrarianDashboard.css';

function LibrarianDashboard() {
    const navigate = useNavigate();

    // Students state
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterProgram, setFilterProgram] = useState('ALL');

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await axios.get(`${API_CONFIG.BASE_URL}/students`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setStudents(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching students:', error);
            setLoading(false);
        }
    };

    const downloadBarcode = async (studentId) => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await axios.get(
                `${API_CONFIG.BASE_URL}/barcode/download/${studentId}`,
                {
                    headers: { 'Authorization': `Bearer ${token}` },
                    responseType: 'blob'
                }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${studentId}_barcode.png`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            showMessage('success', `Barcode downloaded for ${studentId}`);
        } catch (error) {
            console.error('Error downloading barcode:', error);
            showMessage('error', 'Error downloading barcode');
        }
    };

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const programs = ['ALL', ...new Set(students.map(s => s.program))];

    const filteredStudents = students.filter(student => {
        const matchesSearch =
            student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.studentId?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesProgram =
            filterProgram === 'ALL' || student.program === filterProgram;

        return matchesSearch && matchesProgram;
    });


    return (
        <>
            <Navbar />
            <div className="librarian-dashboard">
                <div className="dashboard-content">
                    {/* Hero Section */}
                    <div className="page-hero">
                        <div className="hero-content">
                            <div className="hero-icon">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <div className="hero-text">
                                <h1>Librarian Dashboard</h1>
                                <p className="hero-subtitle">Student Barcode Management System</p>
                            </div>
                        </div>
                    </div>

                    {message.text && (
                        <div className={`message-banner ${message.type === 'success' ? 'success' : 'error'}`}>
                            {message.text}
                        </div>
                    )}

                    {/* Main Content */}
                    <div className="tab-content">
                        {/* Filters */}
                        <div className="card">
                            <div className="filters">
                                <input
                                    type="text"
                                    placeholder="Search by name or ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="search-input"
                                />
                                <select
                                    value={filterProgram}
                                    onChange={(e) => setFilterProgram(e.target.value)}
                                    className="filter-select"
                                >
                                    {programs.map(prog => (
                                        <option key={prog}>{prog}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Students Table */}
                        <div className="card">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>STUDENT ID</th>
                                        <th>FULL NAME</th>
                                        <th>PROGRAM</th>
                                        <th>EMAIL</th>
                                        <th>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" style={{textAlign: 'center', padding: '40px'}}>Loading students...</td></tr>
                                ) : filteredStudents.length === 0 ? (
                                    <tr><td colSpan="5" style={{textAlign: 'center', padding: '40px'}}>No students found</td></tr>
                                ) : (
                                    filteredStudents.map(student => (
                                        <tr key={student.id}>
                                            <td className="mono-text">{student.studentId}</td>
                                            <td>{student.fullName}</td>
                                            <td><span className="badge badge-info">{student.program}</span></td>
                                            <td>{student.email || 'N/A'}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        className="btn btn-sm btn-primary"
                                                        onClick={() => downloadBarcode(student.studentId)}
                                                        title="Download Barcode"
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                        </svg>
                                                        Download
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default LibrarianDashboard;