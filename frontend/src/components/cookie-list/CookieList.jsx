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
        setFavorites(fav.map(fav => fav.id));
      } else {
        setFavorites(favoriteItems);
      }
      const { data } = await getAllCookie(page, 20);
      setCookie([...cookie, ...data]);
      setPage(page + 1);
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
    getCookies();
  }, []);

  // getCookies() above ran once on mount, closing over whatever
  // currentUser/isRequstToGetCurrentUserDone were at that instant - the "who
  // am I" check (App.js) usually hasn't resolved yet at that point, so a
  // logged-in user landing directly here (refresh/direct link) got guest
  // favorites and it never self-corrected. Re-sync just the favorites once
  // the auth check actually resolves, same dependency Favorite.jsx already
  // uses correctly.
  useEffect(() => {
    if (!isRequstToGetCurrentUserDone) {
      return;
    }
    if (currentUser) {
      getAllFavoriteItems().then(({ data }) => setFavorites(data.map(fav => fav.id)));
    } else {
      setFavorites(favoriteItems);
    }
  }, [currentUser, isRequstToGetCurrentUserDone]);

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