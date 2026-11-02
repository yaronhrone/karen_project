import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChocolateBoxBuilder from './ChocolateBoxBuilder';
import { CHOCOLATE_BOXES, boxCells } from '../../config/chocolateBoxes';

jest.mock('../../service/apiService', () => ({
  getAllChocolate: jest.fn(),
  getChocolateBox: jest.fn(),
}));

const api = () => require('../../service/apiService');
// A catalog item for every configured box, as Keren would have created them.
const boxCatalog = (size) => ({ data: [{ id: 1000 + size, price: 80 + size, image: null, category: `chocolate-box-${size}` }] });

// CRA resets mock implementations before every test, so set it here.
beforeEach(() => {
  api().getAllChocolate.mockResolvedValue({ data: [] });
  api().getChocolateBox.mockImplementation((size) => Promise.resolve(boxCatalog(size)));
});

const openBox = async (size, props = {}) => {
  render(<ChocolateBoxBuilder {...props} />);
  const box = CHOCOLATE_BOXES.find((b) => b.size === size);
  fireEvent.click(await screen.findByText(box.label));
  return box;
};

test('lists every configured box', async () => {
  render(<ChocolateBoxBuilder />);
  for (const b of CHOCOLATE_BOXES) {
    expect(await screen.findByText(b.label)).toBeInTheDocument();
  }
});

test('choosing a box shows that many empty squares and a disabled button', async () => {
  const box = await openBox(CHOCOLATE_BOXES[0].size);
  expect(screen.getAllByLabelText(/ריבוע \d+: ריק/)).toHaveLength(box.size);
  expect(screen.getByText(`0 / ${box.size} פרלינים`)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /להשלמת המארז/ })).toBeDisabled();
});

test('the same chocolate can fill several squares and counts add up', async () => {
  const box = await openBox(CHOCOLATE_BOXES[0].size);
  for (let i = 1; i <= 2; i++) {
    fireEvent.click(screen.getByLabelText(`ריבוע ${i}: ריק`));
    fireEvent.click(await screen.findByRole('button', { name: 'בחירת שוקולד חלב' }));
  }
  expect(screen.getByText(`2 / ${box.size} פרלינים`)).toBeInTheDocument();
  expect(screen.getByText('2', { selector: 'strong' })).toBeInTheDocument();
});

test('filling every square enables the button; clearing a square disables it again', async () => {
  const box = await openBox(CHOCOLATE_BOXES[0].size);
  for (let i = 1; i <= box.size; i++) {
    fireEvent.click(screen.getByLabelText(`ריבוע ${i}: ריק`));
    fireEvent.click(await screen.findByRole('button', { name: 'בחירת קרמל מלוח' }));
  }
  // Full, but these are demo chocolates, so ordering stays off (see the demo note).
  expect(screen.getByRole('button', { name: /הוספה להזמנה/ })).toBeDisabled();
  expect(screen.getByText(/אי אפשר להזמין אותם/)).toBeInTheDocument();

  fireEvent.click(screen.getByLabelText('ריבוע 1: קרמל מלוח'));
  fireEvent.click(await screen.findByRole('button', { name: /הסרת הפרלין/ }));
  expect(await screen.findByText(`${box.size - 1} / ${box.size} פרלינים`)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /להשלמת המארז/ })).toBeDisabled();
});

test('going back to box selection resets the squares', async () => {
  await openBox(CHOCOLATE_BOXES[0].size);
  fireEvent.click(screen.getByLabelText('ריבוע 1: ריק'));
  fireEvent.click(await screen.findByRole('button', { name: 'בחירת פיסטוק' }));
  fireEvent.click(screen.getByText(/בחירת מארז אחר/));
  fireEvent.click(await screen.findByText(CHOCOLATE_BOXES[0].label));
  expect(screen.getByText(`0 / ${CHOCOLATE_BOXES[0].size} פרלינים`)).toBeInTheDocument();
});

test('a failed catalog request shows an error, not demo chocolates', async () => {
  require('../../service/apiService').getAllChocolate.mockRejectedValue(new Error('down'));
  await openBox(CHOCOLATE_BOXES[0].size).catch(() => {});
  expect(await screen.findByRole('alert')).toHaveTextContent('לא הצלחנו לטעון');
  expect(screen.queryByText(/מוצגים פרלינים לדוגמה/)).not.toBeInTheDocument();
});

test('rows without id/name and repeated ids are ignored', async () => {
  require('../../service/apiService').getAllChocolate.mockResolvedValue({
    data: [{ id: 1, name: 'א' }, { id: 1, name: 'כפול' }, { name: 'בלי מזהה' }, { id: 2 }],
  });
  await openBox(CHOCOLATE_BOXES[0].size);
  fireEvent.click(screen.getByLabelText('ריבוע 1: ריק'));
  expect(await screen.findByRole('button', { name: 'בחירת א' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'בחירת כפול' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'בחירת בלי מזהה' })).not.toBeInTheDocument();
});

test('"עוד מידע" reveals the description and the photo opens enlarged', async () => {
  require('../../service/apiService').getAllChocolate.mockResolvedValue({
    data: [{ id: 1, name: 'פרלין', description: 'פירוט הפרלין', image: '/x.jpg' }],
  });
  await openBox(CHOCOLATE_BOXES[0].size);
  fireEvent.click(screen.getByLabelText('ריבוע 1: ריק'));
  expect(screen.queryByText('פירוט הפרלין')).not.toBeInTheDocument();
  fireEvent.click(await screen.findByRole('button', { name: 'עוד מידע' }));
  expect(screen.getByText('פירוט הפרלין')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'הגדלת התמונה של פרלין' }));
  expect(screen.getByRole('dialog', { name: 'פרלין' })).toBeInTheDocument();
});

test('Escape closes the picker', async () => {
  await openBox(CHOCOLATE_BOXES[0].size);
  fireEvent.click(screen.getByLabelText('ריבוע 1: ריק'));
  expect(await screen.findByText('בחרו פרלין')).toBeInTheDocument();
  fireEvent.keyDown(window, { key: 'Escape' });
  expect(screen.queryByText('בחרו פרלין')).not.toBeInTheDocument();
});

test('every box layout has exactly `size` squares', () => {
  for (const b of CHOCOLATE_BOXES) {
    expect(boxCells(b).filter(Boolean)).toHaveLength(b.size);
    if (b.shape) expect(b.shape.every((row) => row.length === b.cols)).toBe(true);
  }
});

test('the largest box renders its squares in order, gaps do not count', async () => {
  const big = CHOCOLATE_BOXES[CHOCOLATE_BOXES.length - 1];
  await openBox(big.size);
  expect(screen.getAllByLabelText(/ריבוע \d+: ריק/)).toHaveLength(big.size);
  expect(screen.getByLabelText(`ריבוע ${big.size}: ריק`)).toBeInTheDocument();
});

test('a box without a catalog item shows as not available and cannot be ordered', async () => {
  api().getChocolateBox.mockResolvedValue({ data: [] });
  api().getAllChocolate.mockResolvedValue({ data: [{ id: 1, name: 'א' }] });
  const onAddToOrder = jest.fn();
  const box = await openBox(CHOCOLATE_BOXES[0].size, { onAddToOrder });
  for (let i = 1; i <= box.size; i++) {
    fireEvent.click(screen.getByLabelText(`ריבוע ${i}: ריק`));
    fireEvent.click(await screen.findByRole('button', { name: 'בחירת א' }));
  }
  expect(screen.getByRole('button', { name: /הוספה להזמנה/ })).toBeDisabled();
  expect(screen.getByText('המארז הזה עדיין לא זמין להזמנה.')).toBeInTheDocument();
  expect(onAddToOrder).not.toHaveBeenCalled();
});

test('a full box is handed to onAddToOrder with its chocolate counts', async () => {
  api().getAllChocolate.mockResolvedValue({ data: [{ id: 1, name: 'א' }, { id: 2, name: 'ב' }] });
  const onAddToOrder = jest.fn().mockResolvedValue(null);
  const box = await openBox(CHOCOLATE_BOXES[0].size, { onAddToOrder });
  for (let i = 1; i <= box.size; i++) {
    fireEvent.click(screen.getByLabelText(`ריבוע ${i}: ריק`));
    fireEvent.click(await screen.findByRole('button', { name: i === 1 ? 'בחירת ב' : 'בחירת א' }));
  }
  const button = await screen.findByRole('button', { name: 'הוספה להזמנה' });
  await waitFor(() => expect(button).toBeEnabled());
  fireEvent.click(button);
  await waitFor(() => expect(onAddToOrder).toHaveBeenCalledTimes(1));
  const { box: sent, chocolates } = onAddToOrder.mock.calls[0][0];
  expect(sent.itemId).toBe(1000 + box.size);
  expect(chocolates).toEqual([
    { id: 2, name: 'ב', quantity: 1 },
    { id: 1, name: 'א', quantity: box.size - 1 },
  ]);
});

test('a failed add shows the error and keeps the box', async () => {
  api().getAllChocolate.mockResolvedValue({ data: [{ id: 1, name: 'א' }] });
  const onAddToOrder = jest.fn().mockResolvedValue('המארז לא נמצא');
  const box = await openBox(CHOCOLATE_BOXES[0].size, { onAddToOrder });
  for (let i = 1; i <= box.size; i++) {
    fireEvent.click(screen.getByLabelText(`ריבוע ${i}: ריק`));
    fireEvent.click(await screen.findByRole('button', { name: 'בחירת א' }));
  }
  const button = await screen.findByRole('button', { name: 'הוספה להזמנה' });
  await waitFor(() => expect(button).toBeEnabled());
  fireEvent.click(button);
  expect(await screen.findByRole('alert')).toHaveTextContent('המארז לא נמצא');
  expect(screen.getByText(`${box.size} / ${box.size} פרלינים`)).toBeInTheDocument();
});

test('edit mode opens the box already filled and saves through onAddToOrder', async () => {
  api().getAllChocolate.mockResolvedValue({ data: [{ id: 1, name: 'א' }, { id: 2, name: 'ב' }] });
  const onAddToOrder = jest.fn().mockResolvedValue(null);
  const size = CHOCOLATE_BOXES[0].size;
  const initial = { size, chocolates: [{ id: 1, name: 'א', quantity: size - 2 }, { id: 2, name: 'ב', quantity: 2 }] };
  render(<ChocolateBoxBuilder onAddToOrder={onAddToOrder} initial={initial} />);

  expect(await screen.findByText(`${size} / ${size} פרלינים`)).toBeInTheDocument();
  expect(screen.getByText(/ביטול העריכה/)).toBeInTheDocument();
  const save = await screen.findByRole('button', { name: 'שמירת השינויים' });
  await waitFor(() => expect(save).toBeEnabled());

  // change one square from ב to א, then save
  fireEvent.click(screen.getByLabelText(`ריבוע ${size - 1}: ב`));
  fireEvent.click(await screen.findByRole('button', { name: 'בחירת א' }));
  fireEvent.click(screen.getByRole('button', { name: 'שמירת השינויים' }));
  await waitFor(() => expect(onAddToOrder).toHaveBeenCalledTimes(1));
  expect(onAddToOrder.mock.calls[0][0].chocolates).toEqual([
    { id: 1, name: 'א', quantity: size - 1 },
    { id: 2, name: 'ב', quantity: 1 },
  ]);
});

test('a box with no stock left is marked sold out and cannot be opened', async () => {
  const size = CHOCOLATE_BOXES[0].size;
  api().getChocolateBox.mockImplementation((s) => Promise.resolve(
    s === size ? { data: [{ id: 1000 + s, price: 50, stock: 0, category: `chocolate-box-${s}` }] } : boxCatalog(s),
  ));
  render(<ChocolateBoxBuilder />);
  const card = (await screen.findByText(CHOCOLATE_BOXES[0].label)).closest('button');
  await waitFor(() => expect(card).toBeDisabled());
  expect(screen.getAllByText('חסר במלאי')).toHaveLength(1);
});

test('a box with stock left (or no stock count) can be opened', async () => {
  const size = CHOCOLATE_BOXES[0].size;
  api().getChocolateBox.mockImplementation((s) => Promise.resolve(
    s === size ? { data: [{ id: 1000 + s, price: 50, stock: 3, category: `chocolate-box-${s}` }] } : boxCatalog(s),
  ));
  await openBox(size);
  expect(screen.getByText(`0 / ${size} פרלינים`)).toBeInTheDocument();
});

test('a chocolate can fill only as many squares as there are in stock', async () => {
  api().getAllChocolate.mockResolvedValue({ data: [{ id: 1, name: 'א', stock: 1 }, { id: 2, name: 'ב' }] });
  await openBox(CHOCOLATE_BOXES[0].size);
  fireEvent.click(screen.getByLabelText('ריבוע 1: ריק'));
  fireEvent.click(await screen.findByRole('button', { name: 'בחירת א' }));
  // א (1 in stock) is used up: the next square cannot take it, ב is free
  fireEvent.click(screen.getByLabelText('ריבוע 2: ריק'));
  expect(await screen.findByText('חסר במלאי')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'בחירת א' })).toBeNull();
  expect(screen.getByRole('button', { name: 'בחירת ב' })).toBeInTheDocument();
});

test('changing the square that holds the last one of a chocolate is still allowed', async () => {
  api().getAllChocolate.mockResolvedValue({ data: [{ id: 1, name: 'א', stock: 1 }] });
  await openBox(CHOCOLATE_BOXES[0].size);
  fireEvent.click(screen.getByLabelText('ריבוע 1: ריק'));
  fireEvent.click(await screen.findByRole('button', { name: 'בחירת א' }));
  fireEvent.click(screen.getByLabelText('ריבוע 1: א'));
  expect(await screen.findByRole('button', { name: 'בחירת א' })).toBeInTheDocument();
});

test('a box that is out of stock can still be edited when it is already in the order', async () => {
  const size = CHOCOLATE_BOXES[0].size;
  api().getChocolateBox.mockImplementation((s) => Promise.resolve(
    s === size ? { data: [{ id: 1000 + s, price: 50, stock: 0, category: `chocolate-box-${s}` }] } : boxCatalog(s),
  ));
  api().getAllChocolate.mockResolvedValue({ data: [{ id: 1, name: 'א' }, { id: 2, name: 'ב' }] });
  const onAddToOrder = jest.fn().mockResolvedValue(null);
  render(<ChocolateBoxBuilder onAddToOrder={onAddToOrder} initial={{ size, chocolates: [{ id: 1, name: 'א', quantity: size }] }} />);
  const save = await screen.findByRole('button', { name: 'שמירת השינויים' });
  await waitFor(() => expect(save).toBeEnabled());
});

test('a box of floors draws one titled tray per floor', async () => {
  const layered = CHOCOLATE_BOXES.find((b) => b.layers);
  await openBox(layered.size);
  for (let floor = 1; floor <= layered.layers; floor++) {
    expect(screen.getByText(`קומה ${floor}`)).toBeInTheDocument();
  }
  expect(screen.getAllByLabelText(/ריבוע \d+: ריק/)).toHaveLength(layered.size);
});
