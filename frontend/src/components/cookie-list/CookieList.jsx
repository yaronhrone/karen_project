import React, { useContext } from 'react'
import './CookieList.css';
import { useState, useEffect } from 'react';
import { getAllCookie, getAllFavoriteItems } from '../../service/apiServise';
import UserContext from '../../contexts/UserContext';
import CardItem from '../card/CardItem';
import { FavoriteContext } from '../../contexts/FavoriteContext';

export const CookieList = () => {
  const { currentUser, isRequstToGetCurrentUserDone } = useContext(UserContext);
  const [cookie, setCookie] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [page, setPage] = useState(1);
  const { favorites: favoriteItems } = useContext(FavoriteContext);
  const [errorFromServer, setErrorFromServer] = useState("");
  const getCookies = async () => {
    try {
      if (currentUser && isRequstToGetCurrentUserDone) {
        const { data: fav } = await getAllFavoriteItems();
        console.log(fav);
        setFavorites(fav.map(fav => fav.id));
      } else {
        console.log(favoriteItems);
        setFavorites(favoriteItems);
      }
      const { data } = await getAllCookie(page, 20);
      setCookie([...cookie, ...data]);
      setPage(page + 1);
    } catch (err) {
        console.log(err + " " + err.response?.data + " " + err.code);
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
    getCookies();
  }, []);

  return (
    <>
      <h1 className='title'>עוגיות</h1>
      <div className="cart">
        {cookie.map((cookie) => (
          <CardItem
            key={cookie.id}
            item={cookie}
            isFavoriteDefault={favorites.includes(cookie.id)}
          />
        ))}
      </div>
      <div className="load-more">
        <button className="btn" onClick={getCookies}>עוד עוגיות</button>
      </div>
    </>
  )


}
export default CookieList; 