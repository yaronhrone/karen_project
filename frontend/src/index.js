import React from 'react';
import ReactDOM from 'react-dom/client';
import './theme.css';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { FavoriteProvider } from './contexts/FavoriteContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
    <FavoriteProvider>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </FavoriteProvider>
  </GoogleOAuthProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// Production only - registering this against the dev server would just add
// noise/staleness risk to every `npm start` reload for zero benefit (nothing
// there needs to satisfy Chrome's installability check). See
// public/service-worker.js for why this is safe to register unconditionally
// in prod: it never caches anything, so it cannot make any page look stale.
if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch(() => {
      // Not fatal - the site works identically either way, this only
      // affects whether Chrome offers a one-tap install button vs. the
      // manual "add to home screen" instructions (see InstallApp.jsx).
    });
  });
}
