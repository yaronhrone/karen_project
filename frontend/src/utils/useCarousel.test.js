import { renderHook, act } from '@testing-library/react';
import useCarousel, { AUTO_ADVANCE_MS } from './useCarousel';

const list = [1, 2, 3, 4, 5, 6, 7];

beforeEach(() => {
    jest.useFakeTimers();
    // a desktop-wide window: 3 cards per page
    window.innerWidth = 1600;
});
afterEach(() => {
    jest.useRealTimers();
});

test('turns to the next page by itself every 6 seconds and wraps around', () => {
    const { result } = renderHook(() => useCarousel(list));
    expect(result.current.visible).toEqual([1, 2, 3]);
    act(() => { jest.advanceTimersByTime(AUTO_ADVANCE_MS - 1); });
    expect(result.current.visible).toEqual([1, 2, 3]);
    act(() => { jest.advanceTimersByTime(1); });
    expect(result.current.visible).toEqual([4, 5, 6]);
    act(() => { jest.advanceTimersByTime(AUTO_ADVANCE_MS); });
    expect(result.current.visible).toEqual([7, 1, 2]);
});

test('an arrow click gets a full 6 seconds before the next automatic turn', () => {
    const { result } = renderHook(() => useCarousel(list));
    act(() => { jest.advanceTimersByTime(5000); });
    act(() => { result.current.next(); });
    expect(result.current.visible).toEqual([4, 5, 6]);
    act(() => { jest.advanceTimersByTime(5999); });
    expect(result.current.visible).toEqual([4, 5, 6]);
    act(() => { jest.advanceTimersByTime(1); });
    expect(result.current.visible).toEqual([7, 1, 2]);
});

test('does not rotate when everything already fits on screen', () => {
    const { result } = renderHook(() => useCarousel([1, 2, 3]));
    act(() => { jest.advanceTimersByTime(AUTO_ADVANCE_MS * 3); });
    expect(result.current.visible).toEqual([1, 2, 3]);
});

test('a mouse over the carousel pauses it; a touch does not', () => {
    const { result } = renderHook(() => useCarousel(list));
    act(() => { result.current.hoverProps.onPointerEnter({ pointerType: 'mouse' }); });
    act(() => { jest.advanceTimersByTime(AUTO_ADVANCE_MS * 2); });
    expect(result.current.visible).toEqual([1, 2, 3]);
    act(() => { result.current.hoverProps.onPointerLeave(); });
    act(() => { jest.advanceTimersByTime(AUTO_ADVANCE_MS); });
    expect(result.current.visible).toEqual([4, 5, 6]);

    act(() => { result.current.hoverProps.onPointerEnter({ pointerType: 'touch' }); });
    act(() => { jest.advanceTimersByTime(AUTO_ADVANCE_MS); });
    expect(result.current.visible).toEqual([7, 1, 2]);
});

test('one card per page on a phone', () => {
    window.innerWidth = 400;
    const { result } = renderHook(() => useCarousel(list));
    expect(result.current.visible).toEqual([1]);
    act(() => { jest.advanceTimersByTime(AUTO_ADVANCE_MS); });
    expect(result.current.visible).toEqual([2]);
});
