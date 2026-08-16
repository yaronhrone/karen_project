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
    setcartItems(cartItems.filter(item => item.id !== itemId));
};      
const clearCart = () => {
    setcartItems([]);
}  
return (
    <cartContext.Provider value={{ cartItems, addToCart, removeFromCart }} >
        {children}
    </cartContext.Provider>
);
}