import { useEffect } from 'react';
import axios from 'axios';

// Reloads the page by itself after a new deploy, so an already-open tab or
// installed app doesn't keep running yesterday's JavaScript until someone
// refreshes by hand.
//
// How a "new version" is detected: every build gets a content-hashed main
// bundle (main.<hash>.js) and index.html - served with Cache-Control:
// no-cache, see nginx.conf - always points at the current one. So fetching
// index.html and comparing the bundle it names with the one this page is
// actually running tells us whether a deploy happened. No version file or
// CI step needed; the hash IS the version.
//
// When it reloads: only at a safe moment (see isSafeToReload) - a customer
// halfway through an order note or an admin mid-upload must never lose what
// they typed. Until then it just keeps asking.

const CHECK_EVERY_MS = 5 * 60 * 1000;
const RETRY_EVERY_MS = 15 * 1000;
const BUNDLE_PATTERN = /\/static\/js\/(main\.[\w.-]+\.js)/;
// Remembers which deployed bundle a reload was already attempted for, so a
// browser that keeps serving the old JS from some cache can never put the
// page into a reload loop - one automatic attempt per deploy per tab.
const STORAGE_KEY = 'autoReloadedFor';

// Requests currently in flight (uploads, order sends, ...). Counted via axios
// interceptors, registered once for the whole app - every service call goes
// through the default axios instance.
let pendingRequests = 0;
let interceptorsRegistered = false;
const registerRequestCounter = () => {
    if (interceptorsRegistered) return;
    interceptorsRegistered = true;
    axios.interceptors.request.use((config) => {
        pendingRequests += 1;
        return config;
    }, (error) => {
        pendingRequests = Math.max(0, pendingRequests - 1);
        return Promise.reject(error);
    });
    axios.interceptors.response.use((response) => {
        pendingRequests = Math.max(0, pendingRequests - 1);
        return response;
    }, (error) => {
        pendingRequests = Math.max(0, pendingRequests - 1);
        return Promise.reject(error);
    });
};

const runningBundle = () => {
    const src = Array.from(document.scripts)
        .map((s) => s.src)
        .find((s) => BUNDLE_PATTERN.test(s));
    return src ? src.match(BUNDLE_PATTERN)[1] : null;
};

const latestBundle = async () => {
    const res = await fetch(`/index.html?_=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const html = await res.text();
    const match = html.match(BUNDLE_PATTERN);
    return match ? match[1] : null;
};

const isSafeToReload = () => {
    if (pendingRequests > 0) return false;
    const active = document.activeElement;
    if (active && (active.isContentEditable
        || ['INPUT', 'TEXTAREA', 'SELECT'].includes(active.tagName))) {
        return false;
    }
    // Anything with text in it or a file picked. Deliberately cautious: React
    // keeps controlled inputs' defaultValue in sync with their value, so
    // "changed from default" can't be detected - a field that merely holds
    // text (e.g. a leftover search term) just postpones the reload, which
    // costs nothing, whereas guessing wrong the other way loses typed work.
    const dirtyField = Array.from(document.querySelectorAll('input, textarea')).some((el) => {
        if (el.type === 'file') return el.files && el.files.length > 0;
        if (['checkbox', 'radio', 'button', 'submit', 'hidden'].includes(el.type)) return false;
        return el.value !== '';
    });
    return !dirtyField;
};

const storageGet = () => {
    try { return sessionStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
};
const storageSet = (value) => {
    try { sessionStorage.setItem(STORAGE_KEY, value); } catch (e) { /* storage blocked - fine */ }
};

export default function useAutoReload() {
    useEffect(() => {
        // The dev server has no hashed bundle name to compare - nothing to do.
        if (process.env.NODE_ENV !== 'production') return undefined;
        const current = runningBundle();
        if (!current) return undefined;

        registerRequestCounter();
        let newerBundle = null;

        const check = async () => {
            try {
                const latest = await latestBundle();
                if (latest && latest !== current && latest !== storageGet()) {
                    newerBundle = latest;
                    tryReload();
                }
            } catch (e) {
                // Offline or a transient error - the next tick tries again.
            }
        };

        const tryReload = () => {
            if (!newerBundle || !isSafeToReload()) return;
            storageSet(newerBundle);
            window.location.reload();
        };

        const onVisible = () => {
            if (document.visibilityState === 'visible') check();
        };

        const checkTimer = setInterval(check, CHECK_EVERY_MS);
        const retryTimer = setInterval(tryReload, RETRY_EVERY_MS);
        document.addEventListener('visibilitychange', onVisible);
        window.addEventListener('online', check);
        return () => {
            clearInterval(checkTimer);
            clearInterval(retryTimer);
            document.removeEventListener('visibilitychange', onVisible);
            window.removeEventListener('online', check);
        };
    }, []);
}
