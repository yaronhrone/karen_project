// Modal.jsx
import React, { useEffect, useRef } from "react";
import "./Modal.css";

const Modal = ({ isOpen, onClose, title, children, footer }) => {
  const closeRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = original; };
  }, [isOpen]);

  // Move focus into the dialog and hand it back to whatever opened it.
  useEffect(() => {
    if (!isOpen) return undefined;
    const opener = document.activeElement;
    closeRef.current?.focus();
    return () => opener?.focus?.();
  }, [isOpen]);

  if (!isOpen) return null;
  return (
    <div className="modal-overlay" aria-modal="true" role="dialog" aria-labelledby="modal-title">
      <div
        className="modal-card"
        onMouseDown={(e) => e.stopPropagation()} // למנוע סגירה כשקליקים בתוך התיבה
        role="document"
      >
        <header className="modal-header">
          <h3 className="modal-title" id="modal-title">{title}</h3>
          <button ref={closeRef} className="modal-close" onClick={onClose} aria-label="Close modal">
            ×
          </button>
        </header>

        <div className="modal-body">{children}</div>

        {footer && <footer className="modal-footer">{footer}</footer>}
      </div>
    </div>
  );
};

export default Modal;
