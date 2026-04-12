import React, { useState, useEffect, useRef } from 'react';

function ExamTimer({ exam, currentTime }) {
    const [internalTime, setInternalTime] = useState(new Date());
    const [examStatus, setExamStatus] = useState('NOT_STARTED');
    const [timeDisplay, setTimeDisplay] = useState('');
    const [isMinimized, setIsMinimized] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 80 });
    const dragDataRef = useRef({ dragging: false, offsetX: 0, offsetY: 0 });

    // Initialize default position anchored to top-right
    useEffect(() => {
        const widgetWidth = 220;
        const safeMargin = 20;
        setPosition({ x: Math.max(safeMargin, window.innerWidth - widgetWidth - safeMargin), y: 80 });
    }, []);

    useEffect(() => {
        if (currentTime) return undefined;
        const interval = setInterval(() => {
            setInternalTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, [currentTime]);

    const effectiveCurrentTime = currentTime || internalTime;

    useEffect(() => {
        calculateExamStatus();
    }, [effectiveCurrentTime, exam]);

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!dragDataRef.current.dragging) return;
            const newX = Math.min(
                Math.max(10, e.clientX - dragDataRef.current.offsetX),
                window.innerWidth - 200
            );
            const newY = Math.min(
                Math.max(10, e.clientY - dragDataRef.current.offsetY),
                window.innerHeight - 120
            );
            setPosition({ x: newX, y: newY });
        };
        const handleMouseUp = () => {
            dragDataRef.current.dragging = false;
        };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    const startDrag = (e) => {
        dragDataRef.current = {
            dragging: true,
            offsetX: e.clientX - position.x,
            offsetY: e.clientY - position.y,
        };
    };

    const toggleMinimize = () => setIsMinimized((prev) => !prev);

    const calculateExamStatus = () => {
        const now = effectiveCurrentTime;
        const examDate = new Date(exam.examDate);
        const [hours, minutes] = exam.startTime.split(':');

        // Set exam start time
        const examStart = new Date(examDate);
        examStart.setHours(parseInt(hours), parseInt(minutes), 0);

        // Set exam end time (start + duration)
        const examEnd = new Date(examStart);
        examEnd.setMinutes(examEnd.getMinutes() + exam.duration);

        if (now < examStart) {
            // Exam hasn't started
            setExamStatus('NOT_STARTED');
            const diff = examStart - now;
            setTimeDisplay(formatCountdown(diff));
        } else if (now >= examStart && now < examEnd) {
            // Exam in progress
            setExamStatus('IN_PROGRESS');
            const diff = examEnd - now;
            setTimeDisplay(formatCountdown(diff));
        } else {
            // Exam ended
            setExamStatus('ENDED');
            setTimeDisplay('00:00:00');
        }
    };

    const formatCountdown = (milliseconds) => {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hrs = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;

        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getStatusConfig = () => {
        switch(examStatus) {
            case 'NOT_STARTED':
                return {
                    icon: '🕐',
                    label: 'Starts In',
                    bg: 'rgba(33, 150, 243, 0.2)',
                    border: 'rgba(33, 150, 243, 0.35)',
                    glow: '0 0 25px rgba(33, 150, 243, 0.25), 0 8px 32px rgba(0,0,0,0.3)',
                    accent: '#60a5fa',
                    message: 'Exam Not Started'
                };
            case 'IN_PROGRESS':
                const isLow = timeDisplay < '00:10:00';
                return {
                    icon: '⏱️',
                    label: 'Time Left',
                    bg: isLow ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                    border: isLow ? 'rgba(239, 68, 68, 0.35)' : 'rgba(34, 197, 94, 0.35)',
                    glow: isLow
                        ? '0 0 25px rgba(239, 68, 68, 0.3), 0 8px 32px rgba(0,0,0,0.3)'
                        : '0 0 25px rgba(34, 197, 94, 0.25), 0 8px 32px rgba(0,0,0,0.3)',
                    accent: isLow ? '#fca5a5' : '#86efac',
                    message: 'Exam In Progress'
                };
            case 'ENDED':
                return {
                    icon: '✅',
                    label: 'Exam Ended',
                    bg: 'rgba(148, 163, 184, 0.12)',
                    border: 'rgba(148, 163, 184, 0.2)',
                    glow: '0 0 20px rgba(148, 163, 184, 0.15), 0 8px 32px rgba(0,0,0,0.3)',
                    accent: '#94a3b8',
                    message: 'Time Expired'
                };
            default:
                return {
                    icon: '⏱️',
                    label: 'Timer',
                    bg: 'rgba(34, 197, 94, 0.2)',
                    border: 'rgba(34, 197, 94, 0.35)',
                    glow: '0 0 25px rgba(34, 197, 94, 0.25), 0 8px 32px rgba(0,0,0,0.3)',
                    accent: '#86efac',
                    message: ''
                };
        }
    };

    const config = getStatusConfig();

    return (
        <div
            className="exam-timer"
            style={{
                position: 'fixed',
                left: `${position.x}px`,
                top: `${position.y}px`,
                background: config.bg,
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: `1px solid ${config.border}`,
                color: 'white',
                padding: isMinimized ? '10px 14px' : '20px',
                borderRadius: '16px',
                fontSize: '18px',
                fontWeight: 'bold',
                boxShadow: config.glow,
                zIndex: 99999,
                minWidth: isMinimized ? '160px' : '200px',
                textAlign: 'center',
                transition: 'all 0.4s ease',
                cursor: 'grab',
                userSelect: 'none',
            }}
            onMouseDown={startDrag}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMinimized ? 0 : 8 }}>
                <span style={{ fontSize: '20px', lineHeight: 1 }}>{config.icon}</span>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleMinimize();
                    }}
                    style={{
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        color: 'rgba(255,255,255,0.7)',
                        borderRadius: '8px',
                        padding: '4px 10px',
                        cursor: 'pointer',
                        fontSize: '11px',
                        fontWeight: 600,
                        letterSpacing: '0.3px',
                        transition: 'all 0.2s ease',
                    }}
                >
                    {isMinimized ? 'Expand' : 'Minimize'}
                </button>
            </div>

            {!isMinimized && (
                <>
                    <div style={{ fontSize: '13px', marginBottom: '10px', color: config.accent, fontWeight: 600, letterSpacing: '0.3px' }}>
                        {config.label}
                    </div>
                    <div style={{ fontSize: '32px', fontFamily: 'monospace', marginBottom: '10px', color: '#ffffff', textShadow: `0 0 20px ${config.border}` }}>
                        {timeDisplay}
                    </div>
                    <div style={{ fontSize: '11px', color: 'rgba(203, 213, 225, 0.7)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
                        {config.message}
                    </div>
                    <div style={{ fontSize: '11px', marginTop: '10px', color: 'rgba(148, 163, 184, 0.5)', fontWeight: 500 }}>
                        {exam.courseCode}
                    </div>
                </>
            )}

            {isMinimized && (
                <div style={{ fontSize: '14px', display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center' }}>
                    <span style={{ opacity: 0.7, fontSize: '12px' }}>{config.label}</span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, color: config.accent }}>{timeDisplay}</span>
                </div>
            )}
        </div>
    );
}

export default ExamTimer;