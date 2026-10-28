// The chocolate boxes a customer can choose from. Changing the offering later
// (sizes, layout, photo, price) means editing this list only - nothing else
// in the builder depends on specific sizes.
//
// - size:   number of chocolates (= number of squares) in the box
// - cols:   squares per row (rows = size / cols)
// - image:  optional photo of the real box, shown behind the squares
//           (put the file in public/image/boxes/ and reference it here).
//           Without one, a drawn tray is used.
// - price:  price of the whole box in NIS. PLACEHOLDER VALUES - set Keren's
//           real prices before this goes live.
export const CHOCOLATE_BOXES = [
  { size: 6, cols: 3, label: 'מארז 6 פרלינים', image: null, price: 60 },
  { size: 12, cols: 4, label: 'מארז 12 פרלינים', image: null, price: 110 },
  { size: 18, cols: 6, label: 'מארז 18 פרלינים', image: null, price: 160 },
];

// Shown only when the shop has no chocolates in the catalog yet, so the
// builder can still be tried out.
export const DEMO_CHOCOLATES = [
  { id: -1, name: 'שוקולד חלב', description: '', image: null, price: 0, color: '#8b5a3c' },
  { id: -2, name: 'שוקולד מריר', description: '', image: null, price: 0, color: '#4a2e22' },
  { id: -3, name: 'קרמל מלוח', description: '', image: null, price: 0, color: '#b9803f' },
  { id: -4, name: 'פיסטוק', description: '', image: null, price: 0, color: '#7b8f4a' },
  { id: -5, name: 'פירות יער', description: '', image: null, price: 0, color: '#a23b5c' },
];
