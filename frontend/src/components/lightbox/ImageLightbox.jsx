import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import './ImageLightbox.css';

// Rendered through a portal: product cards have overflow:hidden and a
// transform, which would clip or mis-position a fixed overlay inside them.
function ImageLightbox({ src, alt, onClose }) {
    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    return createPortal(
        <div className="lightbox-overlay" onClick={onClose} role="dialog" aria-modal="true">
            <button className="lightbox-close" onClick={onClose} aria-label="סגור">×</button>
            <img className="lightbox-image" src={src} alt={alt} onClick={(e) => e.stopPropagation()} />
        </div>,
        document.body
    );
}

export default ImageLightbox;
