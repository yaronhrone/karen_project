import { mergeGuestDataToAccount } from './mergeGuestData';
import { addItemToOrder, addItemToFavorite, addBoxToOrder } from './apiService';

jest.mock('./apiService', () => ({
    addItemToOrder: jest.fn(),
    addItemToFavorite: jest.fn(),
    addBoxToOrder: jest.fn(),
}));

const httpError = (status) => Object.assign(new Error('x'), { response: { status } });
const noResponse = () => new Error('Network Error');

let clearCart, clearFavorites, addToCart;

beforeEach(() => {
    jest.clearAllMocks();
    addItemToOrder.mockResolvedValue({});
    addItemToFavorite.mockResolvedValue({});
    addBoxToOrder.mockResolvedValue({});
    clearCart = jest.fn();
    clearFavorites = jest.fn();
    addToCart = jest.fn();
});

const run = (cart, favs = []) => mergeGuestDataToAccount(cart, favs, { clearCart, clearFavorites, addToCart });

test('merges every unit, clears the guest data, reports it had a cart', async () => {
    const had = await run([1, 1, 2], [5, 5]);
    expect(addItemToOrder.mock.calls.map((c) => c[0])).toEqual([1, 1, 2]);
    expect(addItemToFavorite.mock.calls.map((c) => c[0])).toEqual([5]);
    expect(clearCart).toHaveBeenCalled();
    expect(clearFavorites).toHaveBeenCalled();
    expect(addToCart).not.toHaveBeenCalled();
    expect(had).toBe(true);
});

test('a transient failure is retried once and then succeeds', async () => {
    addItemToOrder.mockRejectedValueOnce(noResponse());
    await run([7]);
    expect(addItemToOrder).toHaveBeenCalledTimes(2);
    expect(addToCart).not.toHaveBeenCalled();
});

test('an item that keeps failing transiently goes back into the guest cart', async () => {
    addItemToOrder.mockImplementation((id) => (id === 8 ? Promise.reject(httpError(503)) : Promise.resolve({})));
    await run([7, 8, 9]);
    expect(addToCart.mock.calls.map((c) => c[0])).toEqual([8]);
    expect(clearCart).toHaveBeenCalled();
});

test('a permanent failure (4xx) is dropped, not retried and not kept', async () => {
    addItemToOrder.mockImplementation((id) => (id === 8 ? Promise.reject(httpError(404)) : Promise.resolve({})));
    await run([7, 8, 9]);
    expect(addItemToOrder.mock.calls.filter((c) => c[0] === 8)).toHaveLength(1);
    expect(addToCart).not.toHaveBeenCalled();
});

test('an empty cart reports false and touches nothing', async () => {
    expect(await run([])).toBe(false);
    expect(addItemToOrder).not.toHaveBeenCalled();
});

describe('chocolate boxes', () => {
    const box = { key: 'k1', boxItemId: 1009, chocolates: [{ id: 1, name: 'א', quantity: 4 }, { id: 2, name: 'ב', quantity: 5 }] };
    let addBox;
    beforeEach(() => { addBox = jest.fn(); });
    const runBoxes = (boxes, cart = []) => mergeGuestDataToAccount(cart, [], { clearCart, clearFavorites, addToCart, boxes, addBox });

    test('each box becomes its own order line, sending only ids and quantities', async () => {
        const had = await runBoxes([box, { ...box, key: 'k2' }]);
        expect(addBoxToOrder).toHaveBeenCalledTimes(2);
        expect(addBoxToOrder).toHaveBeenCalledWith(1009, [{ id: 1, quantity: 4 }, { id: 2, quantity: 5 }]);
        expect(clearCart).toHaveBeenCalled();
        expect(had).toBe(true);
    });

    test('a box alone counts as a guest cart', async () => {
        expect(await runBoxes([box])).toBe(true);
    });

    test('a box that keeps failing for a temporary reason goes back into the cart', async () => {
        addBoxToOrder.mockRejectedValue(noResponse());
        await runBoxes([box]);
        expect(addBoxToOrder).toHaveBeenCalledTimes(2);
        expect(addBox).toHaveBeenCalledWith(box);
    });

    test('a box the server rejects is dropped, not kept', async () => {
        addBoxToOrder.mockRejectedValue(httpError(400));
        await runBoxes([box]);
        expect(addBoxToOrder).toHaveBeenCalledTimes(1);
        expect(addBox).not.toHaveBeenCalled();
    });
});
