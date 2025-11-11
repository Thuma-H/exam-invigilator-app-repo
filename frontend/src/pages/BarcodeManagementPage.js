import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import StudentBarcodeCard from '../components/StudentBarcodeCard';

/**
 * BarcodeManagementPage - Page for managing student barcodes
 * Allows viewing, generating, and downloading barcodes for all students
 */
function BarcodeManagementPage() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const API_BASE = 'http://localhost:8080/api';

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await axios.get(`${API_BASE}/students`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setStudents(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching students:', error);
            setLoading(false);
        }
    };

    const handleGenerateAll = async () => {
        if (!window.confirm('Generate barcodes for all students? This may take a moment.')) {
            return;
        }

        try {
            setGenerating(true);
            const token = sessionStorage.getItem('token');

            const response = await axios.post(
                `${API_BASE}/barcode/generate-all`,
                {},
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );

            alert(`✅ Success! Generated ${response.data.generated} barcodes`);
            setGenerating(false);

            // Refresh the page to show new barcodes
            window.location.reload();

        } catch (error) {
            console.error('Error generating barcodes:', error);
            alert('❌ Failed to generate barcodes');
            setGenerating(false);
        }
    };

    const filteredStudents = students.filter(student =>
        student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.program.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <Navbar />

            <div style={{
                padding: '20px',
                maxWidth: '1400px',
                margin: '0 auto'
            }}>
                {/* Header */}
                <div style={{
                    marginBottom: '30px',
                    textAlign: 'center'
                }}>
                    <h1 style={{ color: '#333', marginBottom: '10px' }}>
                        📊 Student Barcode Management
                    </h1>
                    <p style={{ color: '#666', fontSize: '16px' }}>
                        Generate, view, and download student ID barcodes
                    </p>
                </div>

                {/* Controls */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px',
                    gap: '15px',
                    flexWrap: 'wrap'
                }}>
                    {/* Search */}
                    <input
                        type="text"
                        placeholder="🔍 Search students..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            flex: 1,
                            minWidth: '250px',
                            padding: '12px 15px',
                            fontSize: '14px',
                            border: '2px solid #e0e0e0',
                            borderRadius: '8px',
                            outline: 'none'
                        }}
                    />

                    {/* Generate All Button */}
                    <button
                        onClick={handleGenerateAll}
                        disabled={generating}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: generating ? '#9e9e9e' : '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            cursor: generating ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        {generating ? '⏳ Generating...' : '🎯 Generate All Barcodes'}
                    </button>
                </div>

                {/* Stats */}
                <div style={{
                    backgroundColor: '#f5f5f5',
                    padding: '15px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    display: 'flex',
                    justifyContent: 'space-around',
                    flexWrap: 'wrap',
                    gap: '15px'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2196F3' }}>
                            {students.length}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                            Total Students
                        </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4CAF50' }}>
                            {filteredStudents.length}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                            Filtered Results
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div style={{
                        textAlign: 'center',
                        padding: '50px',
                        color: '#666'
                    }}>
                        Loading students...
                    </div>
                )}

                {/* Student Cards Grid */}
                {!loading && (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
                        gap: '20px',
                        justifyContent: 'center'
                    }}>
                        {filteredStudents.map(student => (
                            <StudentBarcodeCard
                                key={student.id}
                                student={student}
                            />
                        ))}
                    </div>
                )}

                {/* No Results */}
                {!loading && filteredStudents.length === 0 && (
                    <div style={{
                        textAlign: 'center',
                        padding: '50px',
                        color: '#666'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '10px' }}>🔍</div>
                        <div>No students found matching "{searchTerm}"</div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default BarcodeManagementPage;