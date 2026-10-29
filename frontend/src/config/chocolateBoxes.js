// The chocolate boxes a customer can choose from. Changing the offering later
// (sizes, layout, photo, price) means editing this list only - nothing else
// in the builder depends on specific sizes.
//
// - size:   number of chocolates (= number of squares) in the box
// - cols:   squares per row (rows = size / cols, last row may be shorter)
// - shape:  optional, instead of a plain grid: one string per row, 'x' = a
//           square, '.' = empty space (cols is then the row width). The number
//           of 'x' must equal size.
// - image:  optional photo of the real box, shown on the box card and on Home
//           (file in public/image/boxes/). The squares are always drawn, so a
//           box without a photo still works.
// - price:  price of the whole box in NIS. PLACEHOLDER VALUES - set Keren's
//           real prices before this goes live.
export const CHOCOLATE_BOXES = [
  { size: 9, cols: 3, label: 'מארז 9 פרלינים', image: '/image/boxes/box-9.jpeg', price: 80 },
  { size: 22, cols: 7, shape: ['.xx.xx.', 'xxxxxxx', 'xxxxxxx', '..xxx..', '...x...'], label: 'מארז 22 פרלינים', image: '/image/boxes/box-22.jpg', price: 180 },
];

// One entry per grid cell, row by row: true = a square, false = empty space.
export const boxCells = (box) => (box.shape
  ? box.shape.join('').split('').map((c) => c === 'x')
  : Array(box.size).fill(true));

// Shown only when the shop has no chocolates in the catalog yet, so the
// builder can still be tried out.
export const DEMO_CHOCOLATES = [
  { id: -1, name: 'שוקולד חלב', description: 'גנאש שוקולד חלב קטיפתי', image: null, color: '#8b5a3c' },
  { id: -2, name: 'שוקולד מריר', description: 'גנאש שוקולד מריר עשיר', image: null, color: '#4a2e22' },
  { id: -3, name: 'קרמל מלוח', description: 'קרמל חמאה עם פתיתי מלח ים', image: null, color: '#b9803f' },
  { id: -4, name: 'פיסטוק', description: 'קרם פיסטוק ביתי', image: null, color: '#7b8f4a' },
  { id: -5, name: 'פירות יער', description: 'מוס פירות יער בציפוי שוקולד לבן', image: null, color: '#a23b5c' },
];
