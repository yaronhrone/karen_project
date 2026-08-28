import React, { useContext } from 'react'
import './CakeList.css';
import { useState, useEffect } from 'react';
import { getAllCake, getAllFavoriteItems } from '../../service/apiServise';
import UserContext from '../../contexts/UserContext';
import CardItem from '../card/CardItem';
import { FavoriteContext } from '../../contexts/FavoriteContext';

export const CakeList = () => {
  const { currentUser, isRequstToGetCurrentUserDone } = useContext(UserContext);
  const [cakes, setCakes] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [page, setPage] = useState(1);
  const { favorites: favoriteItems } = useContext(FavoriteContext);
  const [errorFromServer, setErrorFromServer] = useState("");
  const getCakes = async () => {
    try {
      if (currentUser && isRequstToGetCurrentUserDone) {
        const { data: fav } = await getAllFavoriteItems();
        console.log(fav);
        setFavorites(fav.map(fav => fav.id));
      } else {
        console.log(favoriteItems);
        setFavorites(favoriteItems);
      }
      const { data } = await getAllCake(page, 20);
      setCakes([...cakes, ...data]);
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
    getCakes();
  }, []);

  // getCakes() above ran once on mount, closing over whatever
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
      <h1 className='title'>עוגות</h1>
      <div className="cart">
        {cakes.map((cake) => (
          <CardItem
            key={cake.id}
            item={cake}
            isFavoriteDefault={favorites.includes(cake.id)}
          />
        ))}
      </div>
      <div className="load-more">
        <button className="btn" onClick={getCakes}>עוד עוגות</button>
      </div>
    </>
  )


}
export default CakeList; 