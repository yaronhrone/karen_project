import React, { createContext, useEffect, useState } from 'react';

export const FavoriteContext = createContext();

export const FavoriteProvider = ({ children }) => {
  const [favorites, setFavorites] = useState( () => {
    const saved = localStorage.getItem("favorites");
    return saved ? JSON.parse(saved) : [];
  });

  
  useEffect(() => {
     

    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

 
      
  const toggleFavoriteContext = (id) => {
    setFavorites(prev => {
      const isFav = prev.includes(id);
      return isFav ? prev.filter(f => f !== id) : [...prev, id];
    });
  };

  const clearFavorites = () => {
    setFavorites([]);
  };

  return (
    <FavoriteContext.Provider value={{ favorites, toggleFavoriteContext, clearFavorites }}>
      {children}
    </FavoriteContext.Provider>
  );
};
