import { Link } from 'react-router-dom';
import React, { useContext, useEffect, useState } from 'react'
import { getAllCookie, getAllFavoriteItems } from '../../service/apiService';
import CardItem from '../card/CardItem';
import './CookieList.css';
import './Carousel.css';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { FavoriteContext } from '../../contexts/FavoriteContext';
import UserContext from '../../contexts/UserContext';
import useCarousel from '../../utils/useCarousel';

// A boutique catalog, not a warehouse - fetching the whole category once and
// paging through it client-side avoids guessing a page count from the
// server (which had no way to report "you've reached the end" and just
// returned an empty page past it - a blank carousel instead of a loop).
const FETCH_ALL_SIZE = 100;

function CookieCarousel() {
    const [cookies, setCookies] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const { currentUser, isRequestToGetCurrentUserDone } = useContext(UserContext);
    const { favorites: favoriteItems } = useContext(FavoriteContext);
    const { visible: visibleCookies, startIndex, next, previous, hoverProps } = useCarousel(cookies);

    const fetchCookies = async () => {
        try {
            // Favorites are a nice-to-have (which hearts show filled) - a hiccup
            // fetching them used to throw out of this whole function and
            // silently skip the actual product fetch below.
            if (currentUser && isRequestToGetCurrentUserDone) {
                try {
                    const { data: fav } = await getAllFavoriteItems();
                    setFavorites(fav.filter(Boolean).map(fav => fav.id));
                } catch {
                    setFavorites(favoriteItems);
                }
            } else {
                setFavorites(favoriteItems);
            }
            const { data } = await getAllCookie(1, FETCH_ALL_SIZE);
            setCookies(data);
        } catch (error) {
        }
    }

    useEffect(() => {
        fetchCookies();
    }, []);
    return (
        <div>
            <div className="cards-container " {...hoverProps}>
                <h2>עוגיות</h2>
                <div key={startIndex} className="cards-wrapper fade">
                    <ArrowBackIcon onClick={next} className='arrow' />
                    {visibleCookies.map((cookie, index) => (
                        <div key={cookie.id} className="card-wrapper" style={{ animationDelay: `${index * 0.3}s` }}>
                            <CardItem key={cookie.id} item={cookie} isFavoriteDefault={favorites.includes(cookie.id)} categoryPath="/cookies" />
                        </div>))}
                    <ArrowForwardIcon onClick={previous} className='arrow' />
                </div>
                <div className="carousel-more"><Link className="btn btn-ghost" to="/cookies">לכל העוגיות</Link></div>
            </div>
            <div className="pagination">
            </div>
        </div>
    )
}

export default CookieCarousel
