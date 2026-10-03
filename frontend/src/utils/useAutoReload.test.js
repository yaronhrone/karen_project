import React from 'react';
import { render, act } from '@testing-library/react';
import useAutoReload from './useAutoReload';

const CHECK_EVERY_MS = 5 * 60 * 1000;
const RETRY_EVERY_MS = 15 * 1000;

function Host() {
    useAutoReload();
    return <textarea data-testid="note" />;
}

const originalLocation = window.location;
let reload;

// jsdom has no real script loading, so put a script tag in the document that
// looks like the one CRA emits - that's what the hook reads as "running".
const setRunningBundle = (name) => {
    document.head.innerHTML = `<script src="http://localhost/static/js/${name}"></script>`;
};
const setServedIndex = (name) => {
    global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(`<html><script defer src="/static/js/${name}"></script></html>`),
    });
};
const tick = async (ms) => {
    await act(async () => {
        jest.advanceTimersByTime(ms);
    });
};

beforeEach(() => {
    jest.useFakeTimers();
    process.env.NODE_ENV = 'production';
    reload = jest.fn();
    delete window.location;
    window.location = { ...originalLocation, reload };
    sessionStorage.clear();
});

afterEach(() => {
    jest.useRealTimers();
    process.env.NODE_ENV = 'test';
    window.location = originalLocation;
});

test('reloads when a newer bundle is deployed and nothing is in progress', async () => {
    setRunningBundle('main.aaaa1111.js');
    setServedIndex('main.bbbb2222.js');
    render(<Host />);
    await tick(CHECK_EVERY_MS);
    expect(reload).toHaveBeenCalledTimes(1);
});

test('does nothing when the served bundle is the running one', async () => {
    setRunningBundle('main.aaaa1111.js');
    setServedIndex('main.aaaa1111.js');
    render(<Host />);
    await tick(CHECK_EVERY_MS * 2);
    expect(reload).not.toHaveBeenCalled();
});

test('holds the reload while the user has typed text, then does it once cleared', async () => {
    setRunningBundle('main.aaaa1111.js');
    setServedIndex('main.bbbb2222.js');
    const { getByTestId } = render(<Host />);
    const note = getByTestId('note');
    note.value = 'בלי אגוזים';
    await tick(CHECK_EVERY_MS);
    await tick(RETRY_EVERY_MS * 3);
    expect(reload).not.toHaveBeenCalled();

    note.value = '';
    await tick(RETRY_EVERY_MS);
    expect(reload).toHaveBeenCalledTimes(1);
});

test('tries only once per deployed bundle, so a stale cache cannot cause a reload loop', async () => {
    setRunningBundle('main.aaaa1111.js');
    setServedIndex('main.bbbb2222.js');
    const first = render(<Host />);
    await tick(CHECK_EVERY_MS);
    expect(reload).toHaveBeenCalledTimes(1);
    first.unmount();

    // The "reloaded" page still runs the old bundle (stale cache).
    render(<Host />);
    await tick(CHECK_EVERY_MS * 2);
    expect(reload).toHaveBeenCalledTimes(1);
});
