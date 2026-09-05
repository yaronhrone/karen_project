import React, { useContext, useEffect, useState } from 'react'
import UserContext from '../../contexts/UserContext';
import CardItem from '../card/CardItem';
import { getAllFavoriteItems, getItemById, removeItemFromFavorite } from '../../service/apiServise';
import { useNavigate } from 'react-router-dom';
import './Favorite.css'
import { FavoriteContext } from '../../contexts/FavoriteContext';
function Favorite() {
  const { currentUser, isRequstToGetCurrentUserDone } = useContext(UserContext);
  const [favoriteItems, setFavoriteItems] = useState([]);
  const navigate = useNavigate();
  const {favorites, toggleFavoriteContext} = useContext(FavoriteContext);
  const [errorFromServer, setErrorFromServer] = useState('');

  const getFavoriteItems = async () => {
    try {
    if (!currentUser) {
      const items = [];
      for(let i = 0 ; i < favorites.length ; i++){
      // A guest-favorited item that's since been deleted 404s here - show
      // it as missing instead of letting it throw and abort the rest of
      // the list, or silently dropping it with no explanation.
      try {
        const data = await getItemById(favorites[i]);
        items.push(data || { id: favorites[i], missing: true });
      } catch {
        items.push({ id: favorites[i], missing: true });
      }
      }
      setFavoriteItems(items);
    return;
    }
      const { data } = await getAllFavoriteItems();
      // Defensive: the backend already filters out favorites pointing at a
      // deleted item, but this list has no error boundary above it, so a
      // stray null here would blank the whole page instead of just this one.
      setFavoriteItems((data || []).filter(Boolean));
    } catch (err) {
      if (err.response?.status == 400 || err.response?.status == 500) {
        setErrorFromServer(err.response.data);
      } if (err.code === "ERR_NETWORK") {
        setErrorFromServer("שגיאת רשת: בדוק/י את החיבור לאינטרנט ונסה/י שוב.");
      }
      setTimeout(() => {
        setErrorFromServer('');
      }, 5000);
    }
  };

  useEffect(() => {
    getFavoriteItems();
  }, [currentUser]);

  // The product behind this favorite was deleted from the catalog - nothing
  // real to show. Let the customer clear it instead of leaving a dead entry
  // sitting in their list forever.
  const removeMissing = async (id) => {
    if (currentUser) {
      try { await removeItemFromFavorite(id); } catch {}
    } else {
      toggleFavoriteContext(id);
    }
    setFavoriteItems(prev => prev.filter(i => i.id !== id));
  };

  return (
    <div className='favorite-page'>
   { (favoriteItems.length > 0) ?
        <div>
          <h2>המועדים שלי</h2>
             <div className='favorite-list'>
          {favoriteItems.map((item) => (
            item.missing ? (
              <div key={item.id} className='favorite-missing'>
                <span>המוצר כבר לא במלאי</span>
                <button className='btn' type='button' onClick={() => removeMissing(item.id)}>הסר ממועדפים</button>
              </div>
            ) : (
              <CardItem key={item.id} item={item} isFavoriteDefault={true} />
            )
          ))}
        </div>

        </div>
        :
        <h2>אין לך מועדיפים </h2>
      }


    </div>
  )
}

export default Favorite