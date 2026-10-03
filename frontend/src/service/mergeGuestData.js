import { addItemToOrder, addItemToFavorite } from './apiServise';

// Called right after a successful login/register (password or Google), once
// the JWT is already saved to localStorage. Replays whatever a guest built
// up locally (cart + favorites) onto their real account, then wipes the
// local copies so it isn't replayed again on a future login.
//
// addItemToOrder/addItemToFavorite already carry the auth header themselves
// (apiServise's getAuthHeader reads the token that was just saved), and this
// is the same "call once per unit" technique ChocolateList's logged-in
// sendOrder already uses to build up an order - no new backend behavior.
//
// Each call is wrapped individually so one failed item (e.g. it was deleted
// from the catalog since it was added to the guest cart) doesn't abort the
// rest of the merge.
//
// A failure that looks temporary (no response at all, or a 5xx) is retried
// once, and if it still fails the item goes back into the guest cart instead
// of being thrown away with the rest - the cart is cleared below either way,
// so before this a single network hiccup during login silently lost items.
// A 4xx (item no longer exists, bad request) is permanent: retrying or
// keeping it would just fail again at every future login, so it is dropped.
const tryOnce = async (action, itemId) => {
  try {
    await action(itemId);
    return 'ok';
  } catch (err) {
    const transient = !err.response || err.response.status >= 500;
    return transient ? 'transient' : 'permanent';
  }
};

const mergeItem = async (action, itemId) => {
  const first = await tryOnce(action, itemId);
  return first === 'transient' ? tryOnce(action, itemId) : first;
};

export const mergeGuestDataToAccount = async (cartItems, favorites, { clearCart, clearFavorites, addToCart }) => {
  const hadCartItems = cartItems.length > 0;
  const stillFailing = [];

  for (const itemId of cartItems) {
    if (await mergeItem(addItemToOrder, itemId) === 'transient') {
      stillFailing.push(itemId);
    }
  }

  const uniqueFavoriteIds = [...new Set(favorites)];
  for (const itemId of uniqueFavoriteIds) {
    await mergeItem(addItemToFavorite, itemId);
  }

  clearCart();
  clearFavorites();
  if (addToCart) {
    stillFailing.forEach((itemId) => addToCart(itemId));
  }

  return hadCartItems;
};
