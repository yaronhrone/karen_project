import { useEffect, useState } from 'react';
import { getChocolateBoxes } from '../../service/apiService';
import { boxLayout, boxSizeFromCategory, defaultBoxImage } from '../../config/chocolateBoxes';

// The chocolate boxes Keren created in Admin, ready to draw: each catalog item
// in a chocolate-box-<size> category becomes one box with its name (`label`),
// price, photo, stock and the layout of its squares (cols/shape/frame/layers).
// `itemId` is what an order needs. `outOfStock` is true when Keren tracks the
// box's stock and none is left (stock null = not tracked = never out of stock).
function useChocolateBoxes() {
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let ignore = false;
    Promise.resolve(getChocolateBoxes())
      .then(({ data }) => { if (!ignore) setItems(Array.isArray(data) ? data : []); })
      .catch(() => {})
      .finally(() => { if (!ignore) setLoaded(true); });
    return () => { ignore = true; };
  }, []);

  const boxes = items
    .map((item) => {
      const size = boxSizeFromCategory(item.category);
      if (!size || item.id == null) return null;
      return {
        ...boxLayout(item, size),
        itemId: item.id,
        size,
        label: item.name,
        price: item.price,
        image: item.image || defaultBoxImage(size),
        stock: item.stock == null ? null : item.stock,
        available: true,
        outOfStock: item.stock != null && item.stock <= 0,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.size - b.size || a.itemId - b.itemId);
  return { boxes, loaded };
}

export default useChocolateBoxes;
