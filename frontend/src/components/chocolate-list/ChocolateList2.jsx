import React, { useContext, useEffect, useState } from 'react'
import { getAllChocolate, getAllFavoriteItems } from '../../service/apiServise';
import CardItem from '../card/CardItem';
import './ChocolateList.css';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import UserContext from '../../contexts/UserContext';
import { FavoriteContext } from '../../contexts/FavoriteContext';
import useCarouselPageSize from '../../utils/useCarouselPageSize';

// A boutique catalog, not a warehouse - fetching the whole category once and
// paging through it client-side avoids guessing a page count from the
// server (which had no way to report "you've reached the end" and just
// returned an empty page past it - a blank carousel instead of a loop).
const FETCH_ALL_SIZE = 100;

function ChocolateList2() {
    const [chocolates, setChocolates] = useState([]);
    const [pageIndex, setPageIndex] = useState(0);
    const [favorites, setFavorites] = useState([]);
    const { currentUser, isRequstToGetCurrentUserDone } = useContext(UserContext);
    const { favorites: favoriteItems } = useContext(FavoriteContext);
    const pageSize = useCarouselPageSize();
    const totalPages = Math.max(1, Math.ceil(chocolates.length / pageSize));

    const fetchChocolates = async () => {
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
            }else{
                setFavorites(favoriteItems);
            }

            const { data } = await getAllChocolate(1, FETCH_ALL_SIZE);
            setChocolates(data);
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
        fetchChocolates();
    }, []);
    useEffect(() => {
        setPageIndex(0);
    }, [pageSize]);
    const visibleChocolates = chocolates.slice(pageIndex * pageSize, pageIndex * pageSize + pageSize);
    return (
        <div>
            <div className="cards-container ">
                <h2>פרלינים</h2>

                <div key={pageIndex} className="cards-wrapper fade">
                    <ArrowBackIcon onClick={handleNextPage} className='arrow' />
                    {visibleChocolates.map((chocolate, index) => (
                        <div key={chocolate.id} className="card-wrapper" style={{ animationDelay: `${index * 0.3}s` }}>
                            <CardItem key={chocolate.id} item={chocolate} isFavoriteDefault={favorites?.includes(chocolate.id)} categoryPath="/chocolates" />
                        </div>))}
                    <ArrowForwardIcon onClick={handlePreviousPage} disabled={pageIndex === 0} className='arrow' />
                </div>
            </div>
            <div className="pagination">
            </div>
        </div>
    )
}

export default ChocolateList2
