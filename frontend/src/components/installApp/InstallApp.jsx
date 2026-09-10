import React, { useEffect, useState } from 'react'
import GetAppIcon from '@mui/icons-material/GetApp';
import './InstallApp.css';

const DISMISS_KEY = 'installAppDismissed';

function isStandalone() {
    // Already installed/running as an app - both checks needed, no single
    // API covers iOS + everything else.
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function isIOS() {
    // iOS Safari has never supported beforeinstallprompt at all (no
    // programmatic install exists there) - the only path is the user doing
    // Share -> "הוסף למסך הבית" themselves, so this is the one platform that
    // always gets the instructions banner, never the real button.
    return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

// Real browser-native install button when the browser actually offers one
// (mainly Android Chrome, and only once its own installability criteria are
// met); an instructions banner otherwise - this project deliberately has no
// service worker (see the manifest/icons commit for why), which on some
// browsers is itself enough to keep beforeinstallprompt from ever firing, so
// the banner fallback is the realistic common case, not an edge case.
function InstallApp() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [dismissed, setDismissed] = useState(() => {
        try { return localStorage.getItem(DISMISS_KEY) === 'true'; } catch { return false; }
    });

    useEffect(() => {
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    if (isStandalone() || dismissed) {
        return null;
    }

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        setDeferredPrompt(null);
    };

    const dismiss = () => {
        setDismissed(true);
        try { localStorage.setItem(DISMISS_KEY, 'true'); } catch { }
    };

    if (deferredPrompt) {
        return (
            <button className='btn install-app-btn' type='button' onClick={handleInstallClick}>
                <GetAppIcon fontSize='small' /> התקנת האפליקציה
            </button>
        );
    }

    return (
        <div className='install-app-banner'>
            <span>
                {isIOS()
                    ? 'להתקנת האפליקציה: לחצו על כפתור השיתוף ואז על "הוסף למסך הבית"'
                    : 'להתקנת האפליקציה: פתחו את תפריט הדפדפן ובחרו "הוסף למסך הבית" (או "התקן אפליקציה")'}
            </span>
            <button className='install-app-banner-close' type='button' onClick={dismiss} aria-label='סגור'>✕</button>
        </div>
    );
}

export default InstallApp
