import React, { useContext, useEffect, useState } from 'react'
import InfoIcon from '@mui/icons-material/Info';
import './CardItem.css'
import UserContext from '../../contexts/UserContext';
import { addItemToFavorite, addItemToOrder, removeItemFromFavorite, removeItemFromOredr } from '../../service/apiServise';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { Clear, Done } from '@mui/icons-material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { FavoriteContext } from '../../contexts/FavoriteContext';
import { cartContext } from '../../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

// categoryPath: when set (Home's preview lists pass e.g. "/chocolates"), the
// cart button no longer orders the item directly - it routes to the item's
// dedicated category page instead. That page owns the real ordering flow
// (for chocolates specifically, the box-size package-builder), which a
// direct add-to-order here would silently bypass.
function CardItem({ item, isFavoriteDefault, categoryPath }) {
    const { currentUser, isRequstToGetCurrentUserDone } = useContext(UserContext);
    const { toggleFavoriteContext } = useContext(FavoriteContext);
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [clicked, setClicked] = useState(false);
    const [isFavorite, setIsFavorite] = useState(isFavoriteDefault);
    const{addToCart} = useContext(cartContext);

    useEffect(() => {


        setIsFavorite(isFavoriteDefault);
    }, []);




    const toggleFavorite = async (id) => {
        // See the matching fix/comment in CardChocolate.jsx's toggleFavorite -
        // same missing isRequstToGetCurrentUserDone guard, same bug.
        if (!isRequstToGetCurrentUserDone) {
            return;
        }
        if(!currentUser){
            if(isFavorite){
             toggleFavoriteContext(id);
                setIsFavorite(false);
            }else{
             toggleFavoriteContext(id);
                setIsFavorite(true);
            }
        return;}
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

    const addToOrder = async () => {
        if (categoryPath) {
            navigate(categoryPath);
            return;
        }
        if (currentUser === null) {
         
            setClicked(true);
            addToCart(item.id);
            return;
        }

        try {
            await addItemToOrder(item.id);
            setClicked(true);
        } catch (error) {
            console.log(error);
            if (error.response && error.response.data) {
                setError(error.response.data);

                setTimeout(() => {
                    setError("");
                }, 3000);
            } setClicked(false);
        }
    }

    const removeFromOrder = async () => {
        try {
            await removeItemFromOredr(item.id);
        } catch (error) {
            console.log(error);
            if (error.response && error.response.data) {

                setError(error.response.data);

                setTimeout(() => {
                    setError("");
                }, 3000);
            };
        }
        setClicked(false);
    }


    return (
        <div className="wrapper" key={item.id} >
            <div className="container" >
                <div className="top" style={{ "--bg-url": `url(${item.image})` }}>  <div onClick={() => toggleFavorite(item.id)}> {isFavorite ? <FavoriteIcon className='icon' /> : <FavoriteBorderIcon className='icon' />} </div> </div>
                <div className={`bottom ${clicked ? 'clicked' : ''}`}>
                    <div className="left">
                        <div className="details">
                            {error && <div className="error">{error}</div>}
                            <h3>{item.name} </h3>
                            <h3>₪{item.price}</h3>
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
                    <h4>טיבעוני: {item.veg ? 'כן' : 'לא'}</h4>

                </div>
            </div>
        </div>
    )


}
export default CardItem
