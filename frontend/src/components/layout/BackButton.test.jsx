import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import BackButton from './BackButton';

const Where = () => <p data-testid="where">{useLocation().pathname}</p>;
const renderAt = (path) => render(
  <MemoryRouter initialEntries={['/', path]} initialIndex={1}>
    <BackButton />
    <Routes><Route path="*" element={<Where />} /></Routes>
  </MemoryRouter>
);

afterEach(() => window.history.replaceState(null, ''));

test('is not shown on the home page', () => {
  render(<MemoryRouter initialEntries={['/']}><BackButton /></MemoryRouter>);
  expect(screen.queryByRole('button')).toBeNull();
});

test('first page of a tab (no history): offers the home page instead', () => {
  window.history.replaceState({ idx: 0 }, '');
  renderAt('/cakes');
  fireEvent.click(screen.getByRole('button', { name: 'לדף הבית' }));
  expect(screen.getByTestId('where').textContent).toBe('/');
});

test('with history: goes back to the previous page', () => {
  window.history.replaceState({ idx: 1 }, '');
  renderAt('/cakes');
  fireEvent.click(screen.getByRole('button', { name: 'חזרה' }));
  expect(screen.getByTestId('where').textContent).toBe('/');
});
