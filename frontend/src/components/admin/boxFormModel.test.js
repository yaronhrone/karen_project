import { buildBox, emptyBoxForm, formFromBox, heartTemplateForm, resizeCells, countSquares } from './boxFormModel';

test('a plain grid: the count is what is typed, columns never exceed it', () => {
  const form = { ...emptyBoxForm(), count: '18', cols: '3' };
  expect(buildBox(form)).toEqual({ size: 18, layout: { cols: 3 } });
  expect(buildBox({ ...form, count: '2', cols: '5' }).layout).toEqual({ cols: 2 });
});

test('floors: the count is split evenly, columns are per floor', () => {
  const form = { ...emptyBoxForm(), shapeType: 'floors', count: '27', floors: '3', cols: '3' };
  expect(buildBox(form)).toEqual({ size: 27, layout: { cols: 3, layers: 3 } });
  expect(buildBox({ ...form, count: '26' }).problem).toMatch(/לא מתחלקים/);
  expect(buildBox({ ...form, floors: '1' }).problem).toMatch(/2 או יותר/);
});

test('a free drawing: the count is the number of squares switched on', () => {
  const heart = heartTemplateForm(emptyBoxForm());
  const built = buildBox(heart);
  expect(built.size).toBe(22);
  expect(built.layout).toEqual({ cols: 6, shape: ['xx..xx', 'xxxxxx', 'xxxxxx', '.xxxx.', '..xx..'], frame: 'heart' });
  const none = { ...heart, cells: heart.cells.map((r) => r.map(() => false)) };
  expect(buildBox(none).problem).toMatch(/ריבוע אחד/);
});

test('bad numbers are refused with a message', () => {
  expect(buildBox({ ...emptyBoxForm(), count: '' }).problem).toBeTruthy();
  expect(buildBox({ ...emptyBoxForm(), count: '2.5' }).problem).toBeTruthy();
  expect(buildBox({ ...emptyBoxForm(), count: '101' }).problem).toBeTruthy();
  expect(buildBox({ ...emptyBoxForm(), cols: '0' }).problem).toBeTruthy();
});

test('resizing the drawing keeps the squares that still fit', () => {
  const cells = [[true, false], [false, true]];
  const bigger = resizeCells(cells, 3, 3);
  expect(bigger[0]).toEqual([true, false, true]);
  expect(bigger[1]).toEqual([false, true, true]);
  expect(countSquares(resizeCells(cells, 1, 1))).toBe(1);
});

test('editing a saved box gives back the same shape', () => {
  const heartItem = { name: 'לב', category: 'chocolate-box-22', price: 199, stock: 4, layout: JSON.stringify(buildBox(heartTemplateForm(emptyBoxForm())).layout) };
  const form = formFromBox(heartItem);
  expect(form.shapeType).toBe('free');
  expect(form.heart).toBe(true);
  expect(form.stock).toBe(4);
  expect(buildBox(form).size).toBe(22);

  const floorsItem = { name: 'קומות', category: 'chocolate-box-27', price: 189, layout: '{"cols":3,"layers":3}' };
  expect(formFromBox(floorsItem)).toMatchObject({ shapeType: 'floors', floors: '3', cols: '3', count: '27' });

  const plain = { name: 'רגיל', category: 'chocolate-box-9', price: 80, layout: '{"cols":3}' };
  expect(formFromBox(plain)).toMatchObject({ shapeType: 'grid', cols: '3', count: '9' });
});

test('a box with no saved shape opens with the default for its size', () => {
  expect(formFromBox({ name: 'x', category: 'chocolate-box-22', price: 1 }).shapeType).toBe('free');
  expect(formFromBox({ name: 'x', category: 'chocolate-box-7', price: 1 })).toMatchObject({ shapeType: 'grid', cols: '3', count: '7' });
});
