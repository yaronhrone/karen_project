import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import UserContext from '../../contexts/UserContext';
import { cartContext } from '../../contexts/CartContext';
import { OpenOrderContext } from '../../contexts/OpenOrderContext';
import { addBoxToOrder } from '../../service/apiService';
import ChocolateBoxBuilder from './ChocolateBoxBuilder';

// The /chocolates route: the builder plus what "add to order" means for this
// visitor. A logged-in customer's box goes straight to their open order; a
// guest's goes to the local cart and is merged after login (see
// mergeGuestDataToAccount). Either way the next stop is the order page.
function ChocolateBoxesPage() {
  const { currentUser, isRequestToGetCurrentUserDone } = useContext(UserContext);
  const { addBox } = useContext(cartContext);
  const { refreshOpenOrder } = useContext(OpenOrderContext);
  const navigate = useNavigate();

  // Resolves to an error message to show, or null once the box is added.
  const addToOrder = async ({ box, chocolates }) => {
    if (!isRequestToGetCurrentUserDone) {
      return 'עוד רגע, בודקים את ההתחברות. נסו שוב.';
    }
    try {
      if (currentUser) {
        await addBoxToOrder(box.itemId, chocolates.map(({ id, quantity }) => ({ id, quantity })));
        await refreshOpenOrder();
      } else {
        addBox({
          boxItemId: box.itemId,
          size: box.size,
          label: box.label,
          price: box.price,
          image: box.image,
          chocolates,
        });
      }
      navigate('/order');
      return null;
    } catch (err) {
      return (err.response && typeof err.response.data === 'string' && err.response.data)
        || 'לא הצלחנו להוסיף את המארז להזמנה. נסו שוב.';
    }
  };

  return <ChocolateBoxBuilder onAddToOrder={addToOrder} />;
}

export default ChocolateBoxesPage;
