import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BarcodeScanner from '../components/BarcodeScanner';
import axios from 'axios';
import { API_CONFIG } from '../config/environment';

function StudentRegistrationPage() {
    const navigate = useNavigate();
    const [studentId, setStudentId] = useState('');
    const [fullName, setFullName] = useState('');
    const [program, setProgram] = useState('Computer Science');
    const [showScanner, setShowScanner] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleScan = (scannedCode) => {
        console.log('Scanned code:', scannedCode);
        setStudentId(scannedCode);
        setShowScanner(false);
        setMessage('✅ Barcode scanned: ' + scannedCode);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const token = sessionStorage.getItem('token');
            const response = await axios.post(
                `${API_CONFIG.BASE_URL}/students`,
                { studentId, fullName, program },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            setMessage('✅ ' + response.data.message);

            // Reset form
            setStudentId('');
            setFullName('');
            setProgram('Computer Science');

            alert('Student registered successfully! Email sent to librarian.');
        } catch (error) {
            setMessage('❌ ' + (error.response?.data || 'Registration failed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Navbar />
            <div className="container" style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
                <button onClick={() => navigate('/')} className="btn btn-primary">
                    ← Back to Dashboard
                </button>

                <h2>Register New Student</h2>

                {message && (
                    <div className="alert">
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Student ID *</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input
                                type="text"
                                value={studentId}
                                onChange={(e) => setStudentId(e.target.value)}
                                placeholder="e.g., BCS25165344"
                                required
                                style={{ flex: 1 }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowScanner(!showScanner)}
                                className="btn btn-primary"
                            >
                                {showScanner ? '❌ Cancel' : '📷 Scan'}
                            </button>
                        </div>

                        {showScanner && (
                            <div style={{ marginTop: '10px' }}>
                                <BarcodeScanner
                                    onScan={handleScan}
                                    onError={(err) => setMessage('❌ Scanner error: ' + err.message)}
                                />
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Full Name *</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="e.g., John Doe"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Program *</label>
                        <select value={program} onChange={(e) => setProgram(e.target.value)} required>
                            <option>Computer Science</option>
                            <option>Information Technology</option>
                            <option>Software Engineering</option>
                            <option>Data Science</option>
                        </select>
                    </div>

                    <button type="submit" className="btn btn-success" disabled={loading}>
                        {loading ? 'Registering...' : '✅ Register Student'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default StudentRegistrationPage;
