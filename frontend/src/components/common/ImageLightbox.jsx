import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import './ImageLightbox.css';

// Rendered through a portal: product cards have overflow:hidden and a
// transform, which would clip or mis-position a fixed overlay inside them.
function ImageLightbox({ src, alt, onClose }) {
    const closeRef = useRef(null);
    useEffect(() => {
        const opener = document.activeElement;
        closeRef.current?.focus();
        return () => opener?.focus?.();
    }, []);
    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    return createPortal(
        <div className="lightbox-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={alt}>
            <button ref={closeRef} className="lightbox-close" onClick={onClose} aria-label="סגור">×</button>
            <img className="lightbox-image" src={src} alt={alt} onClick={(e) => e.stopPropagation()} />
        </div>,
        document.body
    );
}

export default ImageLightbox;
