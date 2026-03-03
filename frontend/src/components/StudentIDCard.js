// src/components/StudentIDCard.js — Glass-themed Student ID Card (front + back) with download
import React, { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import axios from 'axios';
import { API_CONFIG } from '../config/environment';
import './StudentIDCard.css';

function StudentIDCard({ student, onClose }) {
    const frontRef = useRef(null);
    const backRef = useRef(null);
    const [barcodeUrl, setBarcodeUrl] = useState(null);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        if (student?.studentId) {
            fetchBarcode();
        }
        // Close on Escape
        const onKey = (e) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [student]);

    const fetchBarcode = async () => {
        try {
            const token = sessionStorage.getItem('token') || localStorage.getItem('token');
            const response = await axios.get(
                `${API_CONFIG.BASE_URL}/barcode/download/${student.studentId}`,
                {
                    headers: { 'Authorization': `Bearer ${token}` },
                    responseType: 'blob'
                }
            );
            const url = URL.createObjectURL(new Blob([response.data], { type: 'image/png' }));
            setBarcodeUrl(url);
        } catch (err) {
            console.error('Error fetching barcode for ID card:', err);
        }
    };

    const captureCard = async (ref, filename) => {
        if (!ref.current) return;
        const canvas = await html2canvas(ref.current, {
            backgroundColor: null,
            scale: 3,
            useCORS: true,
            logging: false
        });
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    const handleDownloadBoth = async () => {
        setDownloading(true);
        try {
            await captureCard(frontRef, `${student.studentId}_ID_Front.png`);
            // Small delay so browser doesn't merge downloads
            await new Promise(r => setTimeout(r, 500));
            await captureCard(backRef, `${student.studentId}_ID_Back.png`);
        } finally {
            setDownloading(false);
        }
    };

    const handleDownloadFront = async () => {
        setDownloading(true);
        try {
            await captureCard(frontRef, `${student.studentId}_ID_Front.png`);
        } finally {
            setDownloading(false);
        }
    };

    if (!student) return null;

    const PUBLIC = process.env.PUBLIC_URL;

    return (
        <div className="id-card-overlay" onClick={onClose}>
            <div className="id-card-modal" onClick={(e) => e.stopPropagation()}>

                <div className="id-card-flip-row">
                    {/* ════ FRONT ════ */}
                    <div>
                        <div className="id-card-side-label">Front</div>
                        <div className="id-card-front" ref={frontRef}>
                            {/* Watermark */}
                            <img
                                src={`${PUBLIC}/nextphases-swirl.png`}
                                alt=""
                                className="id-card-front-watermark"
                                crossOrigin="anonymous"
                            />

                            {/* Header */}
                            <div className="id-card-header">
                                <div>
                                    <div className="id-card-uni-name">NextPhases University</div>
                                    <div className="id-card-uni-sub">Student Identification Card</div>
                                </div>
                                <img
                                    src={`${PUBLIC}/nextphases-swirl.png`}
                                    alt="Logo"
                                    className="id-card-header-logo"
                                    crossOrigin="anonymous"
                                />
                            </div>

                            {/* Body */}
                            <div className="id-card-body">
                                {/* Photo placeholder */}
                                <div className="id-card-photo">
                                    <div className="id-card-photo-placeholder">
                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                            <circle cx="12" cy="7" r="4"/>
                                        </svg>
                                        <span>ID Photo</span>
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="id-card-details">
                                    <div className="id-card-student-name">{student.fullName}</div>
                                    <div className="id-card-field">
                                        <span className="id-card-field-label">Student ID</span>
                                        <span className="id-card-field-value mono">{student.studentId}</span>
                                    </div>
                                    <div className="id-card-field">
                                        <span className="id-card-field-label">Program</span>
                                        <span className="id-card-field-value">{student.program}</span>
                                    </div>
                                    {student.email && (
                                        <div className="id-card-field">
                                            <span className="id-card-field-label">Email</span>
                                            <span className="id-card-field-value">{student.email}</span>
                                        </div>
                                    )}
                                    <div className="id-card-field">
                                        <span className="id-card-field-label">Valid</span>
                                        <span className="id-card-field-value">2025 – 2026 Academic Year</span>
                                    </div>
                                </div>
                            </div>

                            {/* QR Code — bottom left */}
                            {barcodeUrl && (
                                <div className="id-card-qr">
                                    <img src={barcodeUrl} alt={`QR ${student.studentId}`} crossOrigin="anonymous" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ════ BACK ════ */}
                    <div>
                        <div className="id-card-side-label">Back</div>
                        <div className="id-card-back" ref={backRef}>
                            {/* Large watermark */}
                            <img
                                src={`${PUBLIC}/nextphases-swirl.png`}
                                alt=""
                                className="id-card-back-watermark"
                                crossOrigin="anonymous"
                            />

                            <div className="id-card-back-content">
                                <img
                                    src={`${PUBLIC}/nextphases-logo.png`}
                                    alt="NextPhases"
                                    className="id-card-back-logo"
                                    crossOrigin="anonymous"
                                />
                                <div className="id-card-back-uni">NextPhases</div>
                                <div className="id-card-back-tagline">University of Innovation & Technology</div>
                                <div className="id-card-back-divider"></div>
                                <div className="id-card-back-info">
                                    This card is the property of NextPhases University.<br/>
                                    If found, please return to the Student Affairs Office.<br/>
                                    Unauthorized use is strictly prohibited.
                                </div>
                                <div className="id-card-back-divider"></div>
                                <div className="id-card-back-year">© {new Date().getFullYear()} NextPhases.dev — All Rights Reserved</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="id-card-actions">
                    <button
                        className="id-card-btn id-card-btn-download"
                        onClick={handleDownloadFront}
                        disabled={downloading}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        {downloading ? 'Rendering...' : 'Download Front'}
                    </button>
                    <button
                        className="id-card-btn id-card-btn-download"
                        onClick={handleDownloadBoth}
                        disabled={downloading}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="7" height="7"/>
                            <rect x="14" y="3" width="7" height="7"/>
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                        </svg>
                        {downloading ? 'Rendering...' : 'Download Both Sides'}
                    </button>
                    <button className="id-card-btn id-card-btn-close" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default StudentIDCard;

