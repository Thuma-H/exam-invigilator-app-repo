import React, { useEffect, useRef, useState } from 'react';
import Quagga from '@ericblade/quagga2';

function BarcodeScanner({ onScan, onError }) {
    const scannerRef = useRef(null);
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

    const startScanner = () => {
        Quagga.init({
            inputStream: {
                type: 'LiveStream',
                target: scannerRef.current,
                constraints: {
                    width: 640,
                    height: 480,
                    facingMode: 'environment' // Use back camera
                }
            },
            decoder: {
                readers: ['code_128_reader'] // Match your backend barcode format
            }
        }, (err) => {
            if (err) {
                console.error('Scanner initialization error:', err);
                if (onError) onError(err);
                return;
            }
            Quagga.start();
        });

        Quagga.onDetected((result) => {
            const code = result.codeResult.code;
            console.log('✅ Barcode detected:', code);
            if (onScan) onScan(code);
            stopScanner();
        });
    };

    const stopScanner = () => {
        Quagga.stop();
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
                    📷 Start Scanning
                </button>
            ) : (
                <>
                    <div ref={scannerRef} style={{ width: '100%', maxWidth: '640px' }} />
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
