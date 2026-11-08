import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import './BackButton.css';

// "Back to the previous page" under the nav bar, on every page except home.
// history.state.idx is 0 on the first page of a tab (a link opened from
// WhatsApp, a bookmark): there is nothing to go back to, so the button goes
// to the home page instead of leaving the site.
function BackButton() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  if (pathname === '/') return null;

  const canGoBack = (window.history.state && window.history.state.idx > 0);
  const goBack = () => (canGoBack ? navigate(-1) : navigate('/'));

  return (
    <div className="back-button-bar">
      <button type="button" className="back-button" onClick={goBack}>
        <ArrowForwardIcon fontSize="small" aria-hidden="true" />
        <span>{canGoBack ? 'חזרה' : 'לדף הבית'}</span>
      </button>
    </div>
  );
}

export default BackButton;
