import React, { useState, useEffect } from 'react';

function NetworkStatus() {
    const [online, setOnline] = useState(navigator.onLine);
    const [showMessage, setShowMessage] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setOnline(true);
            setShowMessage(true);
            setTimeout(() => setShowMessage(false), 3000);
        };

        const handleOffline = () => {
            setOnline(false);
            setShowMessage(true);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return (
        <>
            {/* Persistent indicator */}
            <div style={{
                position: 'fixed',
                bottom: '20px',
                left: '20px',
                background: online ? '#4CAF50' : '#ff6b6b',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '25px',
                fontSize: '14px',
                fontWeight: 'bold',
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease'
            }}>
                <span style={{ fontSize: '16px' }}>
                    {online ? '🟢' : '🔴'}
                </span>
                <span>{online ? 'Online' : 'Offline'}</span>
            </div>

            {/* Toast notification on status change */}
            {showMessage && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: online ? '#4CAF50' : '#ff6b6b',
                    color: 'white',
                    padding: '15px 30px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    zIndex: 1001,
                    animation: 'slideDown 0.3s ease'
                }}>
                    {online ? '✅ Connection restored' : '⚠️ You are offline'}
                </div>
            )}
        </>
    );
}

export default NetworkStatus;