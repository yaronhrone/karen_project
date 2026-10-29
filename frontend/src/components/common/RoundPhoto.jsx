import React from 'react';
import './RoundPhoto.css';

// A photo shown whole inside a round frame. The padding sits on the frame,
// not on the image: padding on an <img> with border-radius shrinks the
// clipping curve too, which cut the corners off wide photos.
function RoundPhoto({ src, alt = '', className = '' }) {
    return (
        <span className={`round-photo ${className}`}>
            <img src={src} alt={alt} />
        </span>
    );
}

export default RoundPhoto;
