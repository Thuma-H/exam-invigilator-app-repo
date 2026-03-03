import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

function BarcodeAttendanceScanner({ examId, students, onAttendanceMarked }) {
    const [scanning, setScanning] = useState(false);
    const [lastScanned, setLastScanned] = useState(null);
    const [scannedStudents, setScannedStudents] = useState([]);
    const [message, setMessage] = useState('');
    const html5QrCodeRef = useRef(null);
    const cooldownRef = useRef(null);

    useEffect(() => {
        if (scanning) {
            startScanner();
        } else {
            stopScanner();
        }

        return () => {
            stopScanner();
        };
    }, [scanning]);

    const startScanner = async () => {
        try {
            const html5QrCode = new Html5Qrcode('qr-attendance-scanner');
            html5QrCodeRef.current = html5QrCode;

            await html5QrCode.start(
                { facingMode: 'environment' },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 }
                },
                (decodedText) => {
                    handleBarcodeScan(decodedText);
                },
                (errorMessage) => {
                    // Ignore scan misses
                }
            );
            console.log('✅ QR Scanner initialized');
        } catch (err) {
            console.error('Scanner initialization error:', err);
            setMessage('❌ Camera access denied or not available');
            setScanning(false);
        }
    };

    const stopScanner = async () => {
        if (html5QrCodeRef.current) {
            try {
                await html5QrCodeRef.current.stop();
            } catch (err) {
                console.log('Scanner stop:', err);
            }
            html5QrCodeRef.current = null;
        }
    };

    const handleBarcodeScan = async (decodedText) => {
        if (!decodedText) return;

        const code = decodedText;

        // Prevent duplicate scans within 2 seconds
        if (cooldownRef.current) return;

        console.log('📷 QR Code detected:', code);

        // Find student
        const student = students.find(s => s.studentId === code);

        if (!student) {
            setMessage(`❌ Student ${code} not found or already marked`);
            playBeep(400, 200);
            setTimeout(() => setMessage(''), 3000);
            return;
        }

        // Check if already scanned
        if (scannedStudents.find(s => s.studentId === code)) {
            setMessage(`⚠️ ${student.fullName} already scanned`);
            playBeep(400, 200);
            setTimeout(() => setMessage(''), 3000);
            return;
        }

        // Mark attendance
        try {
            await onAttendanceMarked(student.id, 'PRESENT');

            setLastScanned(student);
            setScannedStudents(prev => [...prev, student]);
            setMessage(`✅ ${student.fullName} - PRESENT`);
            playBeep(800, 100);

            // Cooldown
            cooldownRef.current = setTimeout(() => {
                cooldownRef.current = null;
            }, 2000);

            setTimeout(() => setMessage(''), 3000);

        } catch (error) {
            setMessage(`❌ Error: ${error.message}`);
            playBeep(400, 200);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const playBeep = (frequency, duration) => {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration / 1000);
        } catch (e) {
            console.log('Audio not supported');
        }
    };

    return (
        <div className="card">
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem'
            }}>
                <h3 style={{ margin: 0 }}>📷 QR Code Scanner</h3>
                <button
                    onClick={() => setScanning(!scanning)}
                    className={`btn ${scanning ? 'btn-danger' : 'btn-success'}`}
                    style={{
                        padding: '0.75rem 1.5rem',
                        fontWeight: 'bold',
                        fontSize: '1rem'
                    }}
                >
                    {scanning ? '⏹️ Stop Scanner' : '▶️ Start Scanner'}
                </button>
            </div>

            {message && (
                <div style={{
                    padding: '1rem',
                    backgroundColor: message.includes('✅') ? '#d4edda' :
                        message.includes('⚠️') ? '#fff3cd' : '#f8d7da',
                    color: message.includes('✅') ? '#155724' :
                        message.includes('⚠️') ? '#856404' : '#721c24',
                    borderRadius: '6px',
                    marginBottom: '1rem',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    textAlign: 'center'
                }}>
                    {message}
                </div>
            )}

            {scanning ? (
                <div style={{
                    position: 'relative',
                    backgroundColor: '#000',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    marginBottom: '1rem'
                }}>
                    <div id="qr-attendance-scanner" style={{ width: '100%' }} />
                </div>
            ) : (
                <div style={{
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    padding: '3rem',
                    textAlign: 'center',
                    marginBottom: '1rem'
                }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📷</div>
                    <p style={{ color: '#666', fontSize: '1.1rem' }}>
                        Click "Start Scanner" to begin scanning student QR codes
                    </p>
                </div>
            )}

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '1rem',
                marginBottom: '1rem'
            }}>
                <div style={{
                    backgroundColor: '#e3f2fd',
                    padding: '1rem',
                    borderRadius: '6px',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1976d2' }}>
                        {students.length}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>Remaining</div>
                </div>
                <div style={{
                    backgroundColor: '#c8e6c9',
                    padding: '1rem',
                    borderRadius: '6px',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#388e3c' }}>
                        {scannedStudents.length}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>Scanned</div>
                </div>
            </div>

            {lastScanned && (
                <div style={{
                    backgroundColor: '#d4edda',
                    border: '2px solid #27ae60',
                    borderRadius: '8px',
                    padding: '1rem',
                    marginBottom: '1rem'
                }}>
                    <div style={{ fontWeight: 'bold', color: '#155724', marginBottom: '0.5rem' }}>
                        Last Scanned:
                    </div>
                    <div style={{ fontSize: '1.1rem', color: '#155724' }}>
                        {lastScanned.studentId} - {lastScanned.fullName}
                    </div>
                </div>
            )}

            {scannedStudents.length > 0 && (
                <div>
                    <h4>Recently Scanned ({scannedStudents.length})</h4>
                    <div style={{
                        maxHeight: '200px',
                        overflowY: 'auto',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        padding: '0.5rem'
                    }}>
                        {scannedStudents.slice().reverse().map((student, index) => (
                            <div
                                key={student.id}
                                style={{
                                    padding: '0.5rem',
                                    backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white',
                                    borderRadius: '4px',
                                    marginBottom: '0.25rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <span style={{ color: '#27ae60', fontSize: '1.2rem' }}>✓</span>
                                <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                  {student.studentId}
                </span>
                                <span>-</span>
                                <span>{student.fullName}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default BarcodeAttendanceScanner;