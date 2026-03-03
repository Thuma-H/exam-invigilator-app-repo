import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

function BarcodeScanner({ onScan, onError }) {
    const html5QrCodeRef = useRef(null);
    const [isScanning, setIsScanning] = useState(false);

    useEffect(() => {
        if (isScanning) {
            startScanner();
        } else {
            stopScanner();
        }

        return () => {
            stopScanner();
        };
    }, [isScanning]);

    const startScanner = async () => {
        try {
            const html5QrCode = new Html5Qrcode('qr-scanner-region');
            html5QrCodeRef.current = html5QrCode;

            await html5QrCode.start(
                { facingMode: 'environment' },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 }
                },
                (decodedText) => {
                    console.log('✅ QR Code detected:', decodedText);
                    if (onScan) onScan(decodedText);
                    // Stop after successful scan
                    setIsScanning(false);
                },
                (errorMessage) => {
                    // Ignore scan misses — these fire constantly until a code is found
                }
            );
        } catch (err) {
            console.error('Scanner initialization error:', err);
            if (onError) onError(err);
            setIsScanning(false);
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

    return (
        <div>
            {!isScanning ? (
                <button
                    onClick={() => setIsScanning(true)}
                    style={{
                        padding: '15px 30px',
                        fontSize: '18px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer'
                    }}
                >
                    📷 Start QR Scanning
                </button>
            ) : (
                <>
                    <div id="qr-scanner-region" style={{ width: '100%', maxWidth: '640px' }} />
                    <button
                        onClick={() => setIsScanning(false)}
                        style={{
                            marginTop: '10px',
                            padding: '10px 20px',
                            backgroundColor: '#ff6b6b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        ❌ Stop Scanning
                    </button>
                </>
            )}
        </div>
    );
}

export default BarcodeScanner;
