import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
  const box = await openBox(6);
  expect(screen.getAllByLabelText(/ריבוע \d+: ריק/)).toHaveLength(box.size);
  expect(screen.getByText(`0 / ${box.size} פרלינים`)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /להשלמת המארז/ })).toBeDisabled();
});

test('the same chocolate can fill several squares and counts add up', async () => {
  await openBox(6);
  for (let i = 1; i <= 2; i++) {
    fireEvent.click(screen.getByLabelText(`ריבוע ${i}: ריק`));
    fireEvent.click(await screen.findByRole('button', { name: 'שוקולד חלב' }));
  }
  expect(screen.getByText('2 / 6 פרלינים')).toBeInTheDocument();
  expect(screen.getByText(/שוקולד חלב × 2/)).toBeInTheDocument();
});

test('filling every square enables the button; clearing a square disables it again', async () => {
  const box = await openBox(6);
  for (let i = 1; i <= box.size; i++) {
    fireEvent.click(screen.getByLabelText(`ריבוע ${i}: ריק`));
    fireEvent.click(await screen.findByRole('button', { name: 'קרמל מלוח' }));
  }
  expect(screen.getByRole('button', { name: /הוספה להזמנה/ })).toBeEnabled();

  fireEvent.click(screen.getByLabelText('ריבוע 1: קרמל מלוח'));
  fireEvent.click(await screen.findByRole('button', { name: /הסרת הפרלין/ }));
  await waitFor(() => expect(screen.getByText(`${box.size - 1} / ${box.size} פרלינים`)).toBeInTheDocument());
  expect(screen.getByRole('button', { name: /להשלמת המארז/ })).toBeDisabled();
});

test('going back to box selection resets the squares', async () => {
  await openBox(6);
  fireEvent.click(screen.getByLabelText('ריבוע 1: ריק'));
  fireEvent.click(await screen.findByRole('button', { name: 'פיסטוק' }));
  fireEvent.click(screen.getByText(/בחירת מארז אחר/));
  fireEvent.click(await screen.findByText(CHOCOLATE_BOXES[0].label));
  expect(screen.getByText(`0 / ${CHOCOLATE_BOXES[0].size} פרלינים`)).toBeInTheDocument();
});
