import React, { useContext, useEffect, useState } from 'react'
import UserContext from '../../contexts/UserContext';
import CardItem from '../card/CardItem';
import { getAllFavoriteItems, getItemById } from '../../service/apiServise';
import { useNavigate } from 'react-router-dom';
import './Favorite.css'
import { FavoriteContext } from '../../contexts/FavoriteContext';
function Favorite() {
  const { currentUser, isRequstToGetCurrentUserDone } = useContext(UserContext);
  const [favoriteItems, setFavoriteItems] = useState([]);
  const navigate = useNavigate();
  const {favorites} = useContext(FavoriteContext);
  const [errorFromServer, setErrorFromServer] = useState('');

  const getFavoriteItems = async () => {
    try {
    if (!currentUser) {
      const items = [];
      for(let i = 0 ; i < favorites.length ; i++){
      const data = await getItemById(favorites[i])
      items.push(data);
      }
      setFavoriteItems(items);
    return;
    }
      const { data } = await getAllFavoriteItems();
      setFavoriteItems(data);
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
    getFavoriteItems();
  }, [currentUser]);
  return (
    <div className='favorite-page'>
   { (favoriteItems.length > 0) ?
        <div> 
          <h2>המועדים שלי</h2>
             <div className='favorite-list'>
          {favoriteItems.map((item) => (
            <CardItem key={item.id} item={item} isFavoriteDefault={true} />
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