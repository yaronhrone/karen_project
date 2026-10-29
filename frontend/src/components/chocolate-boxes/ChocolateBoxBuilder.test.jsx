import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ChocolateBoxBuilder from './ChocolateBoxBuilder';
import { CHOCOLATE_BOXES } from '../../config/chocolateBoxes';

jest.mock('../../service/apiServise', () => ({
  getAllChocolate: jest.fn(),
}));

// CRA resets mock implementations before every test, so set it here.
beforeEach(() => {
  require('../../service/apiServise').getAllChocolate.mockResolvedValue({ data: [] });
});

const openBox = async (size) => {
  render(<ChocolateBoxBuilder />);
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
  expect(screen.getByText('× 2')).toBeInTheDocument();
});

test('filling every square enables the button; clearing a square disables it again', async () => {
  const box = await openBox(CHOCOLATE_BOXES[0].size);
  for (let i = 1; i <= box.size; i++) {
    fireEvent.click(screen.getByLabelText(`ריבוע ${i}: ריק`));
    fireEvent.click(await screen.findByRole('button', { name: 'בחירת קרמל מלוח' }));
  }
  expect(screen.getByRole('button', { name: /הוספה להזמנה/ })).toBeEnabled();

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
  require('../../service/apiServise').getAllChocolate.mockRejectedValue(new Error('down'));
  await openBox(CHOCOLATE_BOXES[0].size).catch(() => {});
  expect(await screen.findByRole('alert')).toHaveTextContent('לא הצלחנו לטעון');
  expect(screen.queryByText(/מוצגים פרלינים לדוגמה/)).not.toBeInTheDocument();
});

test('rows without id/name and repeated ids are ignored', async () => {
  require('../../service/apiServise').getAllChocolate.mockResolvedValue({
    data: [{ id: 1, name: 'א' }, { id: 1, name: 'כפול' }, { name: 'בלי מזהה' }, { id: 2 }],
  });
  await openBox(CHOCOLATE_BOXES[0].size);
  fireEvent.click(screen.getByLabelText('ריבוע 1: ריק'));
  expect(await screen.findByRole('button', { name: 'בחירת א' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'בחירת כפול' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'בחירת בלי מזהה' })).not.toBeInTheDocument();
});

test('"עוד מידע" reveals the description and the photo opens enlarged', async () => {
  require('../../service/apiServise').getAllChocolate.mockResolvedValue({
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
