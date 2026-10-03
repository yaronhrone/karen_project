// Sliding-window paging for the home-page carousels. The window wraps from
// the end of the list back to the start, so the last "page" is filled with
// the first products instead of showing a short row (e.g. one lone card).
// With fewer products than fit on screen there is nothing to fill with, so
// they are all shown as they are (never duplicated).

export const visibleWindow = (list, start, size) => {
    const n = list.length;
    if (n <= size) return list;
    return Array.from({ length: size }, (_, k) => list[(start + k) % n]);
};

// Next start index after moving `pages` pages (negative = backwards).
export const stepStart = (start, pages, size, length) => {
    if (length === 0) return 0;
    const next = (start + pages * size) % length;
    return (next + length) % length;
};
