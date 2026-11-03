import { useState, useEffect } from 'react';

// How many product cards a home-page carousel shows at once, by viewport
// width: one below 576px (phones), two from 576px to 992px (tablets), three
// above 992px.
const ONE_CARD_MAX = 575;
const TWO_CARDS_MAX = 992;

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
