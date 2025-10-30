import React, { useState, useEffect } from 'react';

function ExamTimer({ exam }) {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [examStatus, setExamStatus] = useState('NOT_STARTED'); // NOT_STARTED, IN_PROGRESS, ENDED
    const [timeDisplay, setTimeDisplay] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        calculateExamStatus();
    }, [currentTime]);

    const calculateExamStatus = () => {
        const now = new Date();
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
                    color: '#2196F3', // Blue
                    message: 'Exam Not Started'
                };
            case 'IN_PROGRESS':
                return {
                    icon: '⏱️',
                    label: 'Time Left',
                    color: timeDisplay < '00:10:00' ? '#ff6b6b' : '#4CAF50', // Red if <10min, else green
                    message: 'Exam In Progress'
                };
            case 'ENDED':
                return {
                    icon: '✅',
                    label: 'Exam Ended',
                    color: '#9e9e9e', // Gray
                    message: 'Time Expired'
                };
            default:
                return {
                    icon: '⏱️',
                    label: 'Timer',
                    color: '#4CAF50',
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
                top: '80px',
                right: '20px',
                background: config.color,
                color: 'white',
                padding: '20px',
                borderRadius: '10px',
                fontSize: '18px',
                fontWeight: 'bold',
                boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                zIndex: 1000,
                minWidth: '180px',
                textAlign: 'center',
                transition: 'background 0.3s ease'
            }}
        >
            <div style={{ fontSize: '24px', marginBottom: '5px' }}>
                {config.icon}
            </div>
            <div style={{ fontSize: '14px', marginBottom: '10px', opacity: 0.9 }}>
                {config.label}
            </div>
            <div style={{ fontSize: '32px', fontFamily: 'monospace', marginBottom: '10px' }}>
                {timeDisplay}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.8, textTransform: 'uppercase' }}>
                {config.message}
            </div>
            <div style={{ fontSize: '11px', marginTop: '10px', opacity: 0.7 }}>
                {exam.courseCode}
            </div>
        </div>
    );
}

export default ExamTimer;