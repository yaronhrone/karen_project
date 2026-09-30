import { useState, useEffect } from 'react';

// Matches the breakpoint NavBar.css switches to its mobile menu at, so "mobile"
// means the same thing across the whole app.
const MOBILE_QUERY = '(max-width: 768px)';

export default function useIsMobile() {
    const [isMobile, setIsMobile] = useState(
        () => window.matchMedia(MOBILE_QUERY).matches
    );

    useEffect(() => {
        const mql = window.matchMedia(MOBILE_QUERY);
        const handler = (e) => setIsMobile(e.matches);
        mql.addEventListener('change', handler);
        return () => mql.removeEventListener('change', handler);
    }, []);

    return isMobile;
}
