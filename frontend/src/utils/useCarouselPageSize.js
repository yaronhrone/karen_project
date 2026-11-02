import { useState, useEffect } from 'react';

// How many product cards a home-page carousel shows at once, by viewport
// width: one on phones, two on tablets/small laptops (from 761px, so an iPad
// held upright gets two), three on a full desktop. The 3-card layout needs
// ~840px inside the carousel container, which only fits from about 1325px up.
const ONE_CARD_MAX = 760;
const TWO_CARDS_MAX = 1325;

const sizeForWidth = (width) => {
    if (width <= ONE_CARD_MAX) return 1;
    if (width <= TWO_CARDS_MAX) return 2;
    return 3;
};

export default function useCarouselPageSize() {
    const [pageSize, setPageSize] = useState(() => sizeForWidth(window.innerWidth));

    useEffect(() => {
        const handler = () => setPageSize(sizeForWidth(window.innerWidth));
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, []);

    return pageSize;
}
