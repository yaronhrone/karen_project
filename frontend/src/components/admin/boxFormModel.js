import { boxLayout, boxSizeFromCategory } from '../../config/chocolateBoxes';

// The "הוספת מארז" form as plain data, and what it turns into: the number of
// chocolates (= squares) and the layout JSON saved with the box product.
// Three kinds of shape: a plain grid (rows of N columns), floors (the same grid
// stacked), and a free drawing where each square is switched on or off (a heart,
// for example).

export const MAX_SQUARES = 100;
export const HEART_TEMPLATE = ['xx..xx', 'xxxxxx', 'xxxxxx', '.xxxx.', '..xx..'];

const allOn = (rows, cols) => Array.from({ length: rows }, () => Array(cols).fill(true));

export const emptyBoxForm = () => ({
  name: '',
  count: '9',
  price: '',
  stock: null,
  shapeType: 'grid', // 'grid' | 'floors' | 'free'
  cols: '3',
  floors: '2',
  freeRows: 5,
  freeCols: 6,
  cells: allOn(5, 6),
  heart: false,
});

export const countSquares = (cells) => cells.flat().filter(Boolean).length;

// A free-drawing grid changed to rows x cols: squares that still fit keep
// their on/off state, new ones start on.
export const resizeCells = (cells, rows, cols) => Array.from({ length: rows }, (_, r) => (
  Array.from({ length: cols }, (_, c) => (cells[r] && cells[r][c] !== undefined ? cells[r][c] : true))
));

export const heartTemplateForm = (form) => ({
  ...form,
  shapeType: 'free',
  freeRows: HEART_TEMPLATE.length,
  freeCols: HEART_TEMPLATE[0].length,
  cells: HEART_TEMPLATE.map((row) => row.split('').map((c) => c === 'x')),
  heart: true,
});

const wholeNumber = (value) => {
  const n = Number(value);
  return value !== '' && value !== null && Number.isInteger(n) ? n : null;
};

// -> { size, layout, problem }: problem is a message to show (and size/layout
// are then not usable), or null.
export const buildBox = (form) => {
  if (form.shapeType === 'free') {
    const size = countSquares(form.cells);
    if (size < 1) return { problem: 'סמנו לפחות ריבוע אחד בצורה' };
    if (size > MAX_SQUARES) return { problem: `אפשר עד ${MAX_SQUARES} פרלינים במארז` };
    const shape = form.cells.map((row) => row.map((on) => (on ? 'x' : '.')).join(''));
    return { size, layout: { cols: form.freeCols, shape, frame: form.heart ? 'heart' : undefined } };
  }
  const size = wholeNumber(form.count);
  if (size === null || size < 1 || size > MAX_SQUARES) {
    return { problem: `כמות הפרלינים חייבת להיות מספר שלם בין 1 ל-${MAX_SQUARES}` };
  }
  const cols = wholeNumber(form.cols);
  if (cols === null || cols < 1) return { problem: 'מספר העמודות חייב להיות מספר שלם, 1 או יותר' };
  if (form.shapeType === 'floors') {
    const floors = wholeNumber(form.floors);
    if (floors === null || floors < 2) return { problem: 'מספר הקומות חייב להיות 2 או יותר' };
    if (size % floors !== 0) return { problem: `${size} פרלינים לא מתחלקים שווה ב-${floors} קומות` };
    return { size, layout: { cols: Math.min(cols, size / floors), layers: floors } };
  }
  return { size, layout: { cols: Math.min(cols, size) } };
};

// The form for editing an existing box product (what buildBox made, reversed).
export const formFromBox = (item) => {
  const size = boxSizeFromCategory(item.category) || 1;
  const layout = boxLayout(item, size);
  const base = { ...emptyBoxForm(), name: item.name || '', count: String(size), price: item.price == null ? '' : String(item.price), stock: item.stock == null ? null : item.stock };
  if (layout.shape) {
    return {
      ...base,
      shapeType: 'free',
      cols: String(layout.cols),
      freeRows: layout.shape.length,
      freeCols: layout.cols,
      cells: layout.shape.map((row) => row.split('').map((c) => c === 'x')),
      heart: layout.frame === 'heart',
    };
  }
  if (layout.layers > 1) return { ...base, shapeType: 'floors', cols: String(layout.cols), floors: String(layout.layers) };
  return { ...base, shapeType: 'grid', cols: String(layout.cols) };
};
