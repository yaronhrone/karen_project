import React, { useEffect, useState } from 'react'
import GetAppIcon from '@mui/icons-material/GetApp';
import Modal from '../modal/Modal';
import './InstallApp.css';

function isStandalone() {
    // Already installed/running as an app - both checks needed, no single
    // API covers iOS + everything else.
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function isIOS() {
    // iOS Safari has never supported beforeinstallprompt at all (no
    // programmatic install exists there) - the only path is the user doing
    // Share -> "הוסף למסך הבית" themselves, so this is the one platform that
    // always gets the instructions modal, never the real one-tap prompt.
    return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

// A small icon button (top-left of the header, next to the logo - Yaron's
// own placement request) instead of a persistent banner. beforeinstallprompt
// only actually fires once Chrome's own installability criteria are met -
// this project registers a deliberately no-op service worker (see
// public/service-worker.js) specifically to satisfy that requirement without
// risking the stale-cache class of bug this project already fixed once.
function InstallApp() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showInstructions, setShowInstructions] = useState(false);

    useEffect(() => {
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    if (isStandalone()) {
        return null;
    }

    const handleClick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            await deferredPrompt.userChoice;
            setDeferredPrompt(null);
            return;
        }
        // No native prompt available (iOS always, or a browser that hasn't
        // met Chrome's own installability bar yet) - show instructions
        // instead of doing nothing on click.
        setShowInstructions(true);
    };

    return (
        <>
            <button className='install-app-icon-btn' type='button' onClick={handleClick} title='להורדה' aria-label='להורדת האפליקציה'>
                <GetAppIcon fontSize='small' />
                <span className='install-app-tooltip'>להורדה</span>
            </button>
            <Modal isOpen={showInstructions} onClose={() => setShowInstructions(false)} title='התקנת האפליקציה'>
                <p>
                    {isIOS()
                        ? 'לחצו על כפתור השיתוף בדפדפן ואז על "הוסף למסך הבית".'
                        : 'פתחו את תפריט הדפדפן ובחרו "הוסף למסך הבית" (או "התקן אפליקציה").'}
                </p>
            </Modal>
        </>
    );
}

export default InstallApp
