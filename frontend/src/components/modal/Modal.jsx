// Modal.jsx
import React, { useEffect } from "react";
import "./Modal.css";

const Modal = ({ isOpen, onClose, title, children, footer }) => {
  // useEffect(() => {
  //   const onKey = (e) => {
  //     if (e.key === "Escape") onClose();
  //   };
  //   if (isOpen) window.addEventListener("keydown", onKey);
  //   return () => window.removeEventListener("keydown", onKey);
  // }, [isOpen, onClose]);

  
  // useEffect(() => {
  //     if (!isOpen) return ;
  //   const original = document.body.style.overflow;
  //   document.body.style.overflow = "hidden";
  //   return () => (document.body.style.overflow = original);
  // }, [isOpen]);
if (!isOpen) return null;
  return (
    <div className="modal-overlay"  aria-modal="true" role="dialog">
      <div
        className="modal-card"
        onMouseDown={(e) => e.stopPropagation()} // למנוע סגירה כשקליקים בתוך התיבה
        role="document"
      >
        <header className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
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
