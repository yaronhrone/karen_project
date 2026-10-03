import React, { useContext, useEffect, useState } from 'react'
import { getAllCookie, getAllFavoriteItems } from '../../service/apiServise';
import CardItem from '../card/CardItem';
import './CookieList.css';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { FavoriteContext } from '../../contexts/FavoriteContext';
import UserContext from '../../contexts/UserContext';
import useCarouselPageSize from '../../utils/useCarouselPageSize';

// A boutique catalog, not a warehouse - fetching the whole category once and
// paging through it client-side avoids guessing a page count from the
// server (which had no way to report "you've reached the end" and just
// returned an empty page past it - a blank carousel instead of a loop).
const FETCH_ALL_SIZE = 100;

function CookieList2() {
    const [cookies, setCookies] = useState([]);
    const [pageIndex, setPageIndex] = useState(0);
    const [favorites, setFavorites] = useState([]);
    const { currentUser, isRequstToGetCurrentUserDone } = useContext(UserContext);
    const { favorites: favoriteItems } = useContext(FavoriteContext);
    const pageSize = useCarouselPageSize();
    const totalPages = Math.max(1, Math.ceil(cookies.length / pageSize));

    const fetchCookies = async () => {
        try {
            // Favorites are a nice-to-have (which hearts show filled) - a hiccup
            // fetching them used to throw out of this whole function and
            // silently skip the actual product fetch below.
            if (currentUser && isRequstToGetCurrentUserDone) {
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

    const handleNextPage = () => {
        setPageIndex((prev) => (prev + 1) % totalPages);
    }
    const handlePreviousPage = () => {
        setPageIndex((prev) => (prev - 1 + totalPages) % totalPages);
    }
    useEffect(() => {
        fetchCookies();
    }, []);
    useEffect(() => {
        setPageIndex(0);
    }, [pageSize]);
    const visibleCookies = cookies.slice(pageIndex * pageSize, pageIndex * pageSize + pageSize);
    return (
        <div>
            <div className="cards-container ">
                <h2>עוגיות</h2>
                <div key={pageIndex} className="cards-wrapper fade">
                    <ArrowBackIcon onClick={handleNextPage} className='arrow' />
                    {visibleCookies.map((cookie, index) => (
                        <div key={cookie.id} className="card-wrapper" style={{ animationDelay: `${index * 0.3}s` }}>
                            <CardItem key={cookie.id} item={cookie} isFavoriteDefault={favorites.includes(cookie.id)} categoryPath="/cookies" />
                        </div>))}
                    <ArrowForwardIcon onClick={handlePreviousPage} disabled={pageIndex === 0} className='arrow' />
                </div>
            </div>
            <div className="pagination">
            </div>
        </div>
    )
}

export default CookieList2
