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

    setcartItems([...cartItems, item]);
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