import { useEffect, useState } from 'react';
import useCarouselPageSize from './useCarouselPageSize';
import { visibleWindow, stepStart } from './carouselWindow';

// How long a page of the home carousels stays before the next one slides in.
export const AUTO_ADVANCE_MS = 6000;

const prefersReducedMotion = () => (
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
);

// State shared by the home carousels (cakes, cookies, boxes): which cards are
// visible, the arrows' next/previous, and the automatic turn every 6 seconds.
// The timer starts over after every change, so a click on an arrow gets a full
// 6 seconds before the next automatic turn. It stops while a mouse is over the
// carousel (so a card can be read and clicked), when everything already fits
// on screen, and for visitors who asked their device for reduced motion.
export default function useCarousel(list) {
    const pageSize = useCarouselPageSize();
    const [startIndex, setStartIndex] = useState(0);
    const [paused, setPaused] = useState(false);

    const next = () => setStartIndex((prev) => stepStart(prev, 1, pageSize, list.length));
    const previous = () => setStartIndex((prev) => stepStart(prev, -1, pageSize, list.length));

    useEffect(() => {
        setStartIndex(0);
    }, [pageSize]);

    const rotates = list.length > pageSize;
    useEffect(() => {
        if (!rotates || paused || prefersReducedMotion()) return undefined;
        const timer = setTimeout(next, AUTO_ADVANCE_MS);
        return () => clearTimeout(timer);
        // next only depends on the values listed here
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [startIndex, rotates, paused, pageSize, list.length]);

    // pointerType: a tap on a phone also fires "enter" and never "leave", which
    // would stop the rotation for good - only a real mouse pauses it.
    const hoverProps = {
        onPointerEnter: (e) => { if (e.pointerType === 'mouse') setPaused(true); },
        onPointerLeave: () => setPaused(false),
    };

    return {
        visible: visibleWindow(list, startIndex, pageSize),
        startIndex,
        next,
        previous,
        hoverProps,
    };
}
