import React, { createContext, useEffect, useState } from 'react'

export const cartContext = createContext();
export const CartProvider = ({ children }) => {
    const [cartItems, setcartItems] = useState([]);

useEffect(() => {
  const saved = localStorage.getItem("cart");
  if (saved) setcartItems(JSON.parse(saved));
}, []);

useEffect(() => {
  localStorage.setItem("cart", JSON.stringify(cartItems));
}, [cartItems]);


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
const clearCart = () => {
    setcartItems([]);
}
return (
    <cartContext.Provider value={{ cartItems, addToCart, removeFromCart, decrementFromCart, clearCart }} >
        {children}
    </cartContext.Provider>
);
}