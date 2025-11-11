import React, { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * StudentBarcodeCard - Component to display student info with barcode
 * Fetches barcode from backend API and displays it
 */
function StudentBarcodeCard({ student }) {
    const [barcodeUrl, setBarcodeUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_BASE = 'http://localhost:8080/api';

    useEffect(() => {
        if (student && student.studentId) {
            fetchBarcode();
        }
    }, [student]);

    const fetchBarcode = async () => {
        try {
            setLoading(true);
            const token = sessionStorage.getItem('token');

            const response = await axios.get(
                `${API_BASE}/barcode/${student.studentId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    responseType: 'blob' // Important for image data
                }
            );

            // Create object URL from blob
            const imageBlob = new Blob([response.data], { type: 'image/png' });
            const imageUrl = URL.createObjectURL(imageBlob);
            setBarcodeUrl(imageUrl);
            setLoading(false);

        } catch (err) {
            console.error('Error fetching barcode:', err);
            setError('Failed to load barcode');
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        try {
            const token = sessionStorage.getItem('token');

            const response = await axios.get(
                `${API_BASE}/barcode/download/${student.studentId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    responseType: 'blob'
                }
            );

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${student.studentId}_barcode.png`);
            document.body.appendChild(link);
            link.click();
            link.remove();

        } catch (err) {
            console.error('Error downloading barcode:', err);
            alert('Failed to download barcode');
        }
    };

    const handleRegenerate = () => {
        fetchBarcode();
    };

    return (
        <div style={{
            border: '2px solid #e0e0e0',
            borderRadius: '10px',
            padding: '20px',
            margin: '10px',
            backgroundColor: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            maxWidth: '400px'
        }}>
            {/* Student Info */}
            <div style={{ marginBottom: '15px' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>
                    {student.fullName}
                </h3>
                <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
                    <strong>ID:</strong> {student.studentId}
                </p>
                <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
                    <strong>Program:</strong> {student.program}
                </p>
            </div>

            {/* Barcode Display */}
            <div style={{
                backgroundColor: '#f5f5f5',
                padding: '15px',
                borderRadius: '8px',
                textAlign: 'center',
                marginBottom: '15px'
            }}>
                {loading && (
                    <div style={{ padding: '20px', color: '#666' }}>
                        Loading barcode...
                    </div>
                )}

                {error && (
                    <div style={{ padding: '20px', color: '#d32f2f' }}>
                        {error}
                    </div>
                )}

                {!loading && !error && barcodeUrl && (
                    <>
                        <img
                            src={barcodeUrl}
                            alt={`Barcode for ${student.studentId}`}
                            style={{
                                maxWidth: '100%',
                                height: 'auto',
                                border: '1px solid #ddd',
                                backgroundColor: 'white',
                                padding: '10px',
                                borderRadius: '4px'
                            }}
                        />
                        <p style={{
                            marginTop: '10px',
                            fontSize: '12px',
                            color: '#666',
                            fontFamily: 'monospace'
                        }}>
                            {student.studentId}
                        </p>
                    </>
                )}
            </div>

            {/* Action Buttons */}
            <div style={{
                display: 'flex',
                gap: '10px',
                justifyContent: 'center'
            }}>
                <button
                    onClick={handleDownload}
                    disabled={!barcodeUrl}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: barcodeUrl ? 'pointer' : 'not-allowed',
                        fontSize: '14px',
                        opacity: barcodeUrl ? 1 : 0.5
                    }}
                >
                    📥 Download
                </button>

                <button
                    onClick={handleRegenerate}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                >
                    🔄 Refresh
                </button>
            </div>
        </div>
    );
}

export default StudentBarcodeCard;