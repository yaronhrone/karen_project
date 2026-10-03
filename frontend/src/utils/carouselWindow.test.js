import { visibleWindow, stepStart } from './carouselWindow';

const items = [1, 2, 3, 4, 5, 6, 7];

test('every page is full: the last one wraps around to the first products', () => {
    expect(visibleWindow(items, 0, 3)).toEqual([1, 2, 3]);
    expect(visibleWindow(items, 3, 3)).toEqual([4, 5, 6]);
    expect(visibleWindow(items, 6, 3)).toEqual([7, 1, 2]);
});

test('stepping forward and back stays in range and is reversible', () => {
    let start = 0;
    const seen = [];
    for (let i = 0; i < 4; i++) {
        seen.push(start);
        start = stepStart(start, 1, 3, items.length);
    }
    expect(seen).toEqual([0, 3, 6, 2]);
    for (let i = 0; i < 4; i++) {
        start = stepStart(start, -1, 3, items.length);
    }
    expect(start).toBe(0);
});

test('one card per page and two cards per page', () => {
    expect(visibleWindow(items, 6, 1)).toEqual([7]);
    expect(stepStart(6, 1, 1, items.length)).toBe(0);
    expect(visibleWindow(items, 6, 2)).toEqual([7, 1]);
});

test('fewer products than fit: show them all, no duplicates, no crash', () => {
    expect(visibleWindow([1, 2], 0, 3)).toEqual([1, 2]);
    expect(visibleWindow([], 0, 3)).toEqual([]);
    expect(stepStart(0, 1, 3, 0)).toBe(0);
    expect(stepStart(0, 1, 3, 2)).toBe(1);
});
