import React, { useContext, useEffect, useState } from 'react'
import { getAllCookie, getAllFavoriteItems } from '../../service/apiServise';
import CardItem from '../card/CardItem';
import './CookieList.css';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { FavoriteContext } from '../../contexts/FavoriteContext';
import UserContext from '../../contexts/UserContext';
function CookieList2() {
    const [cookies, setCookies] = useState([]);
    const [page, setPage] = useState(1);
    const [favorites, setFavorites] = useState([]);
    const { currentUser, isRequstToGetCurrentUserDone } = useContext(UserContext);
    const { favorites: favoriteItems } = useContext(FavoriteContext);

    const fetchCookies = async (pageNumber) => {
        try {
            if (currentUser && isRequstToGetCurrentUserDone) {
                const { data: fav } = await getAllFavoriteItems();
                console.log(fav);
                setFavorites(fav.map(fav => fav.id));
            } else {
                console.log(favoriteItems);
                setFavorites(favoriteItems);
            }
            const { data } = await getAllCookie(pageNumber, 3);
            setCookies(data);
        } catch (error) {
            console.log(error);
        }
    }

    const handleNextPage = () => {
        if (page === 4) {
            setPage(1);
            fetchCookies(1);
            return;
        }
        const nextPage = page + 1;
        fetchCookies(nextPage);
        setPage(nextPage);
    }
    const handlePreviousPage = () => {
        if (page > 1) {
            const prevPage = page - 1;
            fetchCookies(prevPage);
            setPage(prevPage);
        } else if (page === 1) {
            setPage(4);
            fetchCookies(4);
        }
    }
    useEffect(() => {
        fetchCookies(page);
    }, []);
    return (
        <div>
            <div className="cards-container ">
                <h2>עוגיות</h2>
                <div key={page} className="cards-wrapper fade">
                    <ArrowBackIcon onClick={handleNextPage} className='arrow' />
                    {cookies.map((cookie, index) => (
                        <div key={cookie.id} className="card-wrapper" style={{ animationDelay: `${index * 0.3}s` }}>
                            <CardItem key={cookie.id} item={cookie} isFavoriteDefault={favorites.includes(cookie.id)}/>
                        </div>))}
                    <ArrowForwardIcon onClick={handlePreviousPage} disabled={page === 1} className='arrow' />
                </div>
            </div>
            <div className="pagination">
            </div>
        </div>
    )
}

export default CookieList2