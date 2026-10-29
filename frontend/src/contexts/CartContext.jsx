import React, { createContext, useEffect, useState } from 'react'

export const cartContext = createContext();
export const CartProvider = ({ children }) => {
    const [cartItems, setcartItems] = useState([]);
    // Chocolate boxes a guest has built: { key, boxItemId, label, price, image,
    // size, chocolates: [{ id, name, quantity }] }. Kept apart from cartItems
    // (plain product ids) because every box carries its own contents. label,
    // price and image are only for showing the cart - the server recomputes
    // the price when the box is merged into a real order.
    const [cartBoxes, setCartBoxes] = useState([]);

useEffect(() => {
  const saved = localStorage.getItem("cart");
  if (saved) setcartItems(JSON.parse(saved));
}, []);

useEffect(() => {
  localStorage.setItem("cart", JSON.stringify(cartItems));
}, [cartItems]);

useEffect(() => {
  try {
    const saved = JSON.parse(localStorage.getItem("cartBoxes"));
    if (Array.isArray(saved)) setCartBoxes(saved);
  } catch (e) { /* unreadable saved boxes: start empty */ }
}, []);

useEffect(() => {
  localStorage.setItem("cartBoxes", JSON.stringify(cartBoxes));
}, [cartBoxes]);


const addToCart = (item) => {
    // Functional update, like decrementFromCart below - addToCart is called
    // synchronously in a loop when a guest checks out multiple units
    // (ChocolateList.sendOrder), and closing over the outer `cartItems`
    // meant every call in that loop read the same stale snapshot, so only
    // the last call's result survived - a guest ordering several chocolates
    // at quantity >1 ended up with almost everything silently dropped from
    // their cart.
    setcartItems(prev => [...prev, item]);
};
const removeFromCart = (itemId) => {
    // cartItems holds raw item ids (addToCart is always called with an id,
    // e.g. addToCart(choc.id)), not objects - `item.id` here was always
    // undefined, so this filter never actually matched/removed anything.
    setcartItems(cartItems.filter(item => item !== itemId));
};
// Removes a single unit of itemId (one line of a quantity stepper's "-"),
// as opposed to removeFromCart which drops every unit of that id at once.
const decrementFromCart = (itemId) => {
    setcartItems(prev => {
        const idx = prev.indexOf(itemId);
        if (idx === -1) return prev;
        const updated = [...prev];
        updated.splice(idx, 1);
        return updated;
    });
};
const addBox = (box) => {
    setCartBoxes(prev => [...prev, { ...box, key: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` }]);
};
const updateBox = (key, changes) => {
    setCartBoxes(prev => prev.map(box => (box.key === key ? { ...box, ...changes } : box)));
};
const removeBox = (key) => {
    setCartBoxes(prev => prev.filter(box => box.key !== key));
};
const clearCart = () => {
    setcartItems([]);
    setCartBoxes([]);
}
return (
    <cartContext.Provider value={{ cartItems, addToCart, removeFromCart, decrementFromCart, clearCart, cartBoxes, addBox, updateBox, removeBox }} >
        {children}
    </cartContext.Provider>
);
}