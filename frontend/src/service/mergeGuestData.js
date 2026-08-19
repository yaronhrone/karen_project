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
export const mergeGuestDataToAccount = async (cartItems, favorites, { clearCart, clearFavorites }) => {
  const hadCartItems = cartItems.length > 0;

  for (const itemId of cartItems) {
    try {
      await addItemToOrder(itemId);
    } catch (err) {
      console.log(err + " - failed to merge guest cart item " + itemId);
    }
  }

  const uniqueFavoriteIds = [...new Set(favorites)];
  for (const itemId of uniqueFavoriteIds) {
    try {
      await addItemToFavorite(itemId);
    } catch (err) {
      console.log(err + " - failed to merge guest favorite " + itemId);
    }
  }

  clearCart();
  clearFavorites();

  return hadCartItems;
};
