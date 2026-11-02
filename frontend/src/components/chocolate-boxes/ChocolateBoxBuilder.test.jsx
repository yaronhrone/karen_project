import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChocolateBoxBuilder from './ChocolateBoxBuilder';
import { boxCells } from '../../config/chocolateBoxes';

jest.mock('../../service/apiService', () => ({
  getAllChocolate: jest.fn(),
  getChocolateBoxes: jest.fn(),
}));

const api = () => require('../../service/apiService');

// A box product as Keren would create it in Admin (the sizes below also have a
// default shape in config/chocolateBoxes.js, used when no shape is saved).
const boxItem = (size, extra = {}) => ({
  id: 1000 + size,
  name: `מארז ${size} פרלינים`,
  price: 80 + size,
  image: null,
  category: `chocolate-box-${size}`,
  ...extra,
});
const label = (size) => `מארז ${size} פרלינים`;
const SIZES = [5, 18, 22, 27];

// CRA resets mock implementations before every test, so set them here.
const catalog = (items = SIZES.map((s) => boxItem(s))) => api().getChocolateBoxes.mockResolvedValue({ data: items });
beforeEach(() => {
  api().getAllChocolate.mockResolvedValue({ data: [] });
  catalog();
});

const openBox = async (size, props = {}) => {
  render(<ChocolateBoxBuilder {...props} />);
  fireEvent.click(await screen.findByText(label(size)));
  return size;
};

test('lists every box in the catalog, by the name Keren gave it', async () => {
  render(<ChocolateBoxBuilder />);
  for (const size of SIZES) {
    expect(await screen.findByText(label(size))).toBeInTheDocument();
  }
});

test('a box created in Admin with its own shape is drawn that way', async () => {
  catalog([boxItem(4, { name: 'מארז זוגי', layout: JSON.stringify({ cols: 2 }) })]);
  render(<ChocolateBoxBuilder />);
  fireEvent.click(await screen.findByText('מארז זוגי'));
  expect(screen.getAllByLabelText(/ריבוע \d+: ריק/)).toHaveLength(4);
  expect(document.querySelector('.box-builder-grid').style.gridTemplateColumns).toBe('repeat(2, 1fr)');
});

test('a drawn shape leaves its gaps empty and counts only the squares', async () => {
  catalog([boxItem(3, { name: 'מארז צורה', layout: JSON.stringify({ cols: 3, shape: ['x.x', '.x.'] }) })]);
  render(<ChocolateBoxBuilder />);
  fireEvent.click(await screen.findByText('מארז צורה'));
  expect(screen.getAllByLabelText(/ריבוע \d+: ריק/)).toHaveLength(3);
  expect(document.querySelectorAll('.box-builder-grid > *')).toHaveLength(6);
});

test('a saved shape that does not add up to the size is ignored (plain grid instead)', async () => {
  catalog([boxItem(4, { name: 'מארז שבור', layout: JSON.stringify({ cols: 3, shape: ['x.x', '.x.'] }) })]);
  render(<ChocolateBoxBuilder />);
  fireEvent.click(await screen.findByText('מארז שבור'));
  expect(screen.getAllByLabelText(/ריבוע \d+: ריק/)).toHaveLength(4);
});

test('two boxes with the same number of chocolates are told apart', async () => {
  catalog([boxItem(9, { id: 1, name: 'מארז קלאסי' }), boxItem(9, { id: 2, name: 'מארז חגיגי', layout: JSON.stringify({ cols: 9 }) })]);
  render(<ChocolateBoxBuilder />);
  fireEvent.click(await screen.findByText('מארז חגיגי'));
  expect(document.querySelector('.box-builder-grid').style.gridTemplateColumns).toBe('repeat(9, 1fr)');
});

test('choosing a box shows that many empty squares and a disabled button', async () => {
  await openBox(5);
  expect(screen.getAllByLabelText(/ריבוע \d+: ריק/)).toHaveLength(5);
  expect(screen.getByText('0 / 5 פרלינים')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /להשלמת המארז/ })).toBeDisabled();
});

test('the same chocolate can fill several squares and counts add up', async () => {
  await openBox(5);
  for (let i = 1; i <= 2; i++) {
    fireEvent.click(screen.getByLabelText(`ריבוע ${i}: ריק`));
    fireEvent.click(await screen.findByRole('button', { name: 'בחירת שוקולד חלב' }));
  }
  expect(screen.getByText('2 / 5 פרלינים')).toBeInTheDocument();
  expect(screen.getByText('2', { selector: 'strong' })).toBeInTheDocument();
});

test('filling every square enables the button; clearing a square disables it again', async () => {
  await openBox(5);
  for (let i = 1; i <= 5; i++) {
    fireEvent.click(screen.getByLabelText(`ריבוע ${i}: ריק`));
    fireEvent.click(await screen.findByRole('button', { name: 'בחירת קרמל מלוח' }));
  }
  // Full, but these are demo chocolates, so ordering stays off (see the demo note).
  expect(screen.getByRole('button', { name: /הוספה להזמנה/ })).toBeDisabled();
  expect(screen.getByText(/אי אפשר להזמין אותם/)).toBeInTheDocument();

  fireEvent.click(screen.getByLabelText('ריבוע 1: קרמל מלוח'));
  fireEvent.click(await screen.findByRole('button', { name: /הסרת הפרלין/ }));
  expect(await screen.findByText('4 / 5 פרלינים')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /להשלמת המארז/ })).toBeDisabled();
});

test('going back to box selection resets the squares', async () => {
  await openBox(5);
  fireEvent.click(screen.getByLabelText('ריבוע 1: ריק'));
  fireEvent.click(await screen.findByRole('button', { name: 'בחירת פיסטוק' }));
  fireEvent.click(screen.getByText(/בחירת מארז אחר/));
  fireEvent.click(await screen.findByText(label(5)));
  expect(screen.getByText('0 / 5 פרלינים')).toBeInTheDocument();
});

test('a failed catalog request shows an error, not demo chocolates', async () => {
  api().getAllChocolate.mockRejectedValue(new Error('down'));
  await openBox(5).catch(() => {});
  expect(await screen.findByRole('alert')).toHaveTextContent('לא הצלחנו לטעון');
});

test('rows without id/name and repeated ids are ignored', async () => {
  api().getAllChocolate.mockResolvedValue({
    data: [{ id: 1, name: 'א' }, { id: 1, name: 'עותק' }, { name: 'בלי מזהה' }, { id: 2 }, null, { id: 3, name: 'ג' }],
  });
  await openBox(5);
  fireEvent.click(screen.getByLabelText('ריבוע 1: ריק'));
  expect(await screen.findByRole('button', { name: 'בחירת א' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'בחירת ג' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'בחירת עותק' })).toBeNull();
  expect(document.querySelectorAll('.box-builder-pick-choose')).toHaveLength(2);
});

test('"עוד מידע" reveals the description and the photo opens enlarged', async () => {
  api().getAllChocolate.mockResolvedValue({ data: [{ id: 1, name: 'א', description: 'תיאור ארוך של הפרלין', image: '/a.jpg' }] });
  await openBox(5);
  fireEvent.click(screen.getByLabelText('ריבוע 1: ריק'));
  expect(screen.queryByText('תיאור ארוך של הפרלין')).toBeNull();
  fireEvent.click(await screen.findByText('עוד מידע'));
  expect(screen.getByText('תיאור ארוך של הפרלין')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /הגדלת התמונה של א/ }));
  expect(screen.getByRole('dialog', { name: 'א' })).toBeInTheDocument();
});

test('Escape closes the picker', async () => {
  await openBox(5);
  fireEvent.click(screen.getByLabelText('ריבוע 1: ריק'));
  expect(await screen.findByText('בחרו פרלין')).toBeInTheDocument();
  fireEvent.keyDown(document, { key: 'Escape' });
  await waitFor(() => expect(screen.queryByText('בחרו פרלין')).toBeNull());
});

test('every default box layout has exactly `size` squares', () => {
  const { CHOCOLATE_BOXES } = require('../../config/chocolateBoxes');
  for (const b of CHOCOLATE_BOXES) {
    expect(boxCells(b).filter(Boolean)).toHaveLength(b.size);
    if (b.shape) expect(b.shape.every((row) => row.length === b.cols)).toBe(true);
  }
});

test('the largest box renders its squares in order, gaps do not count', async () => {
  await openBox(27);
  expect(screen.getAllByLabelText(/ריבוע \d+: ריק/)).toHaveLength(27);
  expect(screen.getByLabelText('ריבוע 27: ריק')).toBeInTheDocument();
});

test('the heart (22) leaves its gaps empty', async () => {
  await openBox(22);
  expect(screen.getAllByLabelText(/ריבוע \d+: ריק/)).toHaveLength(22);
  expect(document.querySelectorAll('.box-builder-grid > *').length).toBeGreaterThan(22);
});

test('a box with no products in the catalog lists nothing', async () => {
  catalog([]);
  render(<ChocolateBoxBuilder />);
  await waitFor(() => expect(api().getChocolateBoxes).toHaveBeenCalled());
  expect(screen.queryByText(label(5))).toBeNull();
});

test('a full box is handed to onAddToOrder with its chocolate counts', async () => {
  api().getAllChocolate.mockResolvedValue({ data: [{ id: 1, name: 'א' }, { id: 2, name: 'ב' }] });
  const onAddToOrder = jest.fn().mockResolvedValue(null);
  await openBox(5, { onAddToOrder });
  for (let i = 1; i <= 5; i++) {
    fireEvent.click(screen.getByLabelText(`ריבוע ${i}: ריק`));
    fireEvent.click(await screen.findByRole('button', { name: i === 1 ? 'בחירת ב' : 'בחירת א' }));
  }
  const button = await screen.findByRole('button', { name: 'הוספה להזמנה' });
  await waitFor(() => expect(button).toBeEnabled());
  fireEvent.click(button);
  await waitFor(() => expect(onAddToOrder).toHaveBeenCalledTimes(1));
  const { box: sent, chocolates } = onAddToOrder.mock.calls[0][0];
  expect(sent.itemId).toBe(1005);
  expect(chocolates).toEqual([
    { id: 2, name: 'ב', quantity: 1 },
    { id: 1, name: 'א', quantity: 4 },
  ]);
});

test('a failed add shows the error and keeps the box', async () => {
  api().getAllChocolate.mockResolvedValue({ data: [{ id: 1, name: 'א' }] });
  const onAddToOrder = jest.fn().mockResolvedValue('המארז לא נמצא');
  await openBox(5, { onAddToOrder });
  for (let i = 1; i <= 5; i++) {
    fireEvent.click(screen.getByLabelText(`ריבוע ${i}: ריק`));
    fireEvent.click(await screen.findByRole('button', { name: 'בחירת א' }));
  }
  const button = await screen.findByRole('button', { name: 'הוספה להזמנה' });
  await waitFor(() => expect(button).toBeEnabled());
  fireEvent.click(button);
  expect(await screen.findByRole('alert')).toHaveTextContent('המארז לא נמצא');
  expect(screen.getByText('5 / 5 פרלינים')).toBeInTheDocument();
});

test('edit mode opens the box already filled and saves through onAddToOrder', async () => {
  api().getAllChocolate.mockResolvedValue({ data: [{ id: 1, name: 'א' }, { id: 2, name: 'ב' }] });
  const onAddToOrder = jest.fn().mockResolvedValue(null);
  const initial = { itemId: 1005, size: 5, chocolates: [{ id: 1, name: 'א', quantity: 3 }, { id: 2, name: 'ב', quantity: 2 }] };
  render(<ChocolateBoxBuilder onAddToOrder={onAddToOrder} initial={initial} />);

  expect(await screen.findByText('5 / 5 פרלינים')).toBeInTheDocument();
  expect(screen.getByText(/ביטול העריכה/)).toBeInTheDocument();
  const save = await screen.findByRole('button', { name: 'שמירת השינויים' });
  await waitFor(() => expect(save).toBeEnabled());

  // change one square from ב to א, then save
  fireEvent.click(screen.getByLabelText('ריבוע 4: ב'));
  fireEvent.click(await screen.findByRole('button', { name: 'בחירת א' }));
  fireEvent.click(screen.getByRole('button', { name: 'שמירת השינויים' }));
  await waitFor(() => expect(onAddToOrder).toHaveBeenCalledTimes(1));
  expect(onAddToOrder.mock.calls[0][0].chocolates).toEqual([
    { id: 1, name: 'א', quantity: 4 },
    { id: 2, name: 'ב', quantity: 1 },
  ]);
});

const withStock = (size, stock) => catalog(SIZES.map((s) => boxItem(s, s === size ? { stock } : {})));

test('a box with no stock left is marked sold out and cannot be opened', async () => {
  withStock(5, 0);
  render(<ChocolateBoxBuilder />);
  const card = (await screen.findByText(label(5))).closest('button');
  await waitFor(() => expect(card).toBeDisabled());
  expect(screen.getAllByText('חסר במלאי')).toHaveLength(1);
});

test('a box with stock left (or no stock count) can be opened', async () => {
  withStock(5, 3);
  await openBox(5);
  expect(screen.getByText('0 / 5 פרלינים')).toBeInTheDocument();
});

test('a chocolate can fill only as many squares as there are in stock', async () => {
  api().getAllChocolate.mockResolvedValue({ data: [{ id: 1, name: 'א', stock: 1 }, { id: 2, name: 'ב' }] });
  await openBox(5);
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
  await openBox(5);
  fireEvent.click(screen.getByLabelText('ריבוע 1: ריק'));
  fireEvent.click(await screen.findByRole('button', { name: 'בחירת א' }));
  fireEvent.click(screen.getByLabelText('ריבוע 1: א'));
  expect(await screen.findByRole('button', { name: 'בחירת א' })).toBeInTheDocument();
});

test('a box that is out of stock can still be edited when it is already in the order', async () => {
  withStock(5, 0);
  api().getAllChocolate.mockResolvedValue({ data: [{ id: 1, name: 'א' }, { id: 2, name: 'ב' }] });
  const onAddToOrder = jest.fn().mockResolvedValue(null);
  render(<ChocolateBoxBuilder onAddToOrder={onAddToOrder} initial={{ itemId: 1005, size: 5, chocolates: [{ id: 1, name: 'א', quantity: 5 }] }} />);
  const save = await screen.findByRole('button', { name: 'שמירת השינויים' });
  await waitFor(() => expect(save).toBeEnabled());
});

test('a box of floors draws one titled tray per floor', async () => {
  await openBox(27);
  for (let floor = 1; floor <= 3; floor++) {
    expect(screen.getByText(`קומה ${floor}`)).toBeInTheDocument();
  }
  expect(screen.getAllByLabelText(/ריבוע \d+: ריק/)).toHaveLength(27);
});
