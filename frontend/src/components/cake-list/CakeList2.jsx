import React, { useContext, useEffect, useState } from 'react'
import { getAllCake, getAllFavoriteItems } from '../../service/apiServise';
import CardItem from '../card/CardItem';
import './CakeList.css';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { FavoriteContext } from '../../contexts/FavoriteContext';
import UserContext from '../../contexts/UserContext';
import useCarouselPageSize from '../../utils/useCarouselPageSize';
import { visibleWindow, stepStart } from '../../utils/carouselWindow';

// A boutique catalog, not a warehouse - fetching the whole category once and
// paging through it client-side avoids guessing a page count from the
// server (which had no way to report "you've reached the end" and just
// returned an empty page past it - a blank carousel instead of a loop).
const FETCH_ALL_SIZE = 100;

function CakeList2() {
    const [cakes, setCakes] = useState([]);
    const [startIndex, setStartIndex] = useState(0);
    const [favorites, setFavorites] = useState([]);
    const { currentUser, isRequstToGetCurrentUserDone } = useContext(UserContext);
    const { favorites: favoriteItems } = useContext(FavoriteContext);
    const pageSize = useCarouselPageSize();

    const fetchCakes = async () => {
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
            const { data } = await getAllCake(1, FETCH_ALL_SIZE);
            setCakes(data);
        } catch (error) {
        }
    }

    const handleNextPage = () => {
        setStartIndex((prev) => stepStart(prev, 1, pageSize, cakes.length));
    }
    const handlePreviousPage = () => {
        setStartIndex((prev) => stepStart(prev, -1, pageSize, cakes.length));
    }
    useEffect(() => {
        fetchCakes();
    }, []);
    useEffect(() => {
        setStartIndex(0);
    }, [pageSize]);
    const visibleCakes = visibleWindow(cakes, startIndex, pageSize);
    return (
        <div>
            <div className="cards-container ">
                <h2>עוגות</h2>
                <div key={startIndex} className="cards-wrapper fade">
                    <ArrowBackIcon onClick={handleNextPage} className='arrow' />
                    {visibleCakes.map((cake, index) => (
                        <div key={cake.id} className="card-wrapper" style={{ animationDelay: `${index * 0.3}s` }}>
                            <CardItem key={cake.id} item={cake} isFavoriteDefault={favorites.includes(cake.id)} categoryPath="/cakes" />
                        </div>))}
                    <ArrowForwardIcon onClick={handlePreviousPage} className='arrow' />
                </div>
            </div>
            <div className="pagination">
            </div>
        </div>
    )
}

export default CakeList2
