import React from 'react';
import './RoundPhoto.css';

// A photo filling a round frame: scaled to cover the whole circle, so the
// edges of a rectangular photo are cropped by the curve.
function RoundPhoto({ src, alt = '', className = '' }) {
    return (
        <span className={`round-photo ${className}`}>
            <img src={src} alt={alt} />
        </span>
    );
}

export default RoundPhoto;
