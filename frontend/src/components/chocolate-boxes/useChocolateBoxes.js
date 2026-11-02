import { useEffect, useState } from 'react';
import { getChocolateBox } from '../../service/apiService';
import { CHOCOLATE_BOXES } from '../../config/chocolateBoxes';

// The configured boxes joined with their catalog items: layout comes from the
// config, while price, photo and the id an order needs come from the product
// in the category chocolate-box-<size> that Keren maintains in Admin.
// A box with no catalog item yet has `available: false` and `price: null`.
// `outOfStock` is true when Keren tracks the box's stock and none is left
// (stock null = not tracked = never out of stock).
function useChocolateBoxes() {
  const [items, setItems] = useState({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let ignore = false;
    Promise.all(CHOCOLATE_BOXES.map((b) => (
      Promise.resolve(getChocolateBox(b.size))
        .then(({ data }) => [b.size, Array.isArray(data) && data[0] ? data[0] : null])
        .catch(() => [b.size, null])
    ))).then((entries) => {
      if (ignore) return;
      setItems(Object.fromEntries(entries));
      setLoaded(true);
    });
    return () => { ignore = true; };
  }, []);

  const boxes = CHOCOLATE_BOXES.map((b) => {
    const item = items[b.size];
    return {
      ...b,
      itemId: item ? item.id : null,
      price: item ? item.price : null,
      image: (item && item.image) || b.image || null,
      available: Boolean(item),
      outOfStock: Boolean(item) && item.stock != null && item.stock <= 0,
    };
  });
  return { boxes, loaded };
}

export default useChocolateBoxes;
