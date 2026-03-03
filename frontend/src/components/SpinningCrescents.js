// src/components/SpinningCrescents.js — Animated crescent arcs background effect
import React from 'react';
import './SpinningCrescents.css';

const SpinningCrescents = () => {
    return (
        <div className="spinning-crescents-container" aria-hidden="true">
            {/* Large outer crescent — slow spin */}
            <div className="crescent crescent-1" />
            {/* Medium crescent — medium spin, opposite direction */}
            <div className="crescent crescent-2" />
            {/* Small inner crescent — faster spin */}
            <div className="crescent crescent-3" />
            {/* Extra-large background crescent — very slow */}
            <div className="crescent crescent-4" />
            {/* Tiny accent crescent — quick spin */}
            <div className="crescent crescent-5" />
        </div>
    );
};

export default SpinningCrescents;

