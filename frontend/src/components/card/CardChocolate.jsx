import React, { useContext, useEffect, useState } from 'react'
import UserContext from '../../contexts/UserContext';
import { FavoriteContext } from '../../contexts/FavoriteContext';
import { cartContext } from '../../contexts/CartContext';
import { addItemToFavorite, removeItemFromFavorite } from '../../service/apiServise';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import InfoIcon from '@mui/icons-material/Info';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { Clear, Done } from '@mui/icons-material';
import { addItemToOrder, removeItemFromOredr } from '../../service/apiServise';

const CardChocolate = ({ item, isFavoriteDefault, addToList, removeFromList, removedItemId, click }) => {
    const { currentUser, isRequstToGetCurrentUserDone } = useContext(UserContext);
    const { toggleFavoriteContext } = useContext(FavoriteContext);
    const [error, setError] = useState("");
    const [clicked, setClicked] = useState(click);
    const [isFavorite, setIsFavorite] = useState(isFavoriteDefault);
    const { addToCart } = useContext(cartContext);





    const toggleFavorite = async (id) => {
        if (!currentUser) {
            if (isFavorite) {
                toggleFavoriteContext(id);
                setIsFavorite(false);
            } else {
                toggleFavoriteContext(id);
                setIsFavorite(true);
            }
            return;
        }
        try {

            if (isFavorite) {
                await removeItemFromFavorite(id);

                setIsFavorite(false);
            } else {
                await addItemToFavorite(id);

                setIsFavorite(true);
            }
        } catch (error) {
            console.log(error);
            if (error.response && error.response.data) {
                setError(error.response.data);
            }

            setTimeout(() => {
                setError("");
            }, 2000);
        }
        setClicked(false);
    }
    const addToOrder = () => {
        const quantity = 1;
        const chocolateWithQuantity = { ...item, quantity };
        console.log(chocolateWithQuantity + " chocolate withe quentity");

        addToList(chocolateWithQuantity);
        setClicked(true);
    }
    const removeFromOrder = () => {
        removeFromList(item);
        setClicked(false);
    }
    useEffect(() => {
        if (removedItemId === item.id) {
            setClicked(false);
        }
    }, [removedItemId]);

    useEffect(() => {


        setIsFavorite(isFavoriteDefault);
    }, []);

    return (
        <div className="wrapper" key={item.id} >
            <div className="container" >
                <div className="top" style={{ "--bg-url": `url(${item.image})` }}>  <div onClick={() => toggleFavorite(item.id)}> {isFavorite ? <FavoriteIcon className='icon' /> : <FavoriteBorderIcon className='icon' />} </div> </div>
                <div className={`bottom ${clicked ? 'clicked' : ''}`}>
                    <div className="left">
                        <div className="details">
                            {error && <div className="error">{error}</div>}
                            <h3>{item.name} </h3>
                            <h3>${item.price}</h3>
                        </div>

                        <div>
                            <div className='buy' onClick={addToOrder}><AddShoppingCartIcon className='icon' /> </div>
                        </div>

                    </div>

                    <div className="error">{error}</div>
                    <div className="right">
                        <div className="done"><Done className='icon' /></div>
                        <div className="details">
                            <h3>{item.name}</h3>

                        </div>
                        <div className="remove" onClick={removeFromOrder}>
                            <Clear className='icon' /></div>
                    </div>
                </div>
            </div>
            <div className="inside">
                <div className="icon"><InfoIcon style={{ marginLeft: '90px' }} /></div>
                <div className="contents">
                    <h4>מידע: {item.description}</h4>
                    <h4>טיבועוני: {item.veg ? 'כן' : 'לא'}</h4>

                </div>
            </div>
        </div>
    )
}

export default CardChocolate