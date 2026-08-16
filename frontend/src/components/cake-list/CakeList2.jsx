import React, { useContext, useEffect, useState } from 'react'
import { getAllCake, getAllFavoriteItems } from '../../service/apiServise';
import CardItem from '../card/CardItem';
import './CakeList.css';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { FavoriteContext } from '../../contexts/FavoriteContext';
import UserContext from '../../contexts/UserContext';
function CakeList2() {
    const [cakes, setCakes] = useState([]);
    const [page, setPage] = useState(1);
    const [favorites, setFavorites] = useState([]);
    const { currentUser, isRequstToGetCurrentUserDone } = useContext(UserContext);
    const { favorites: favoriteItems } = useContext(FavoriteContext);

    const fetchCakes = async (pageNumber) => {
        try {
            if (currentUser && isRequstToGetCurrentUserDone) {
                const { data: fav } = await getAllFavoriteItems();
                console.log(fav);
                setFavorites(fav.map(fav => fav.id));
            } else {
                console.log(favoriteItems);
                setFavorites(favoriteItems);
            }
            const { data } = await getAllCake(pageNumber, 3);
            setCakes(data);
        } catch (error) {
            console.log(error);
        }
    }

    const handleNextPage = () => {
        if (page === 4) {
            setPage(1);
            fetchCakes(1);
            return;
        }
        const nextPage = page + 1;
        fetchCakes(nextPage);
        setPage(nextPage);
    }
    const handlePreviousPage = () => {
        if (page > 1) {
            const prevPage = page - 1;
            fetchCakes(prevPage);
            setPage(prevPage);
        } else if (page === 1) {
            setPage(4);
            fetchCakes(4);
        }
    }
    useEffect(() => {
        fetchCakes(page);
    }, []);
    return (
        <div>
            <div className="cards-container ">
                <h2>עוגות</h2>
                <div key={page} className="cards-wrapper fade">
                    <ArrowBackIcon onClick={handleNextPage} className='arrow' />
                    {cakes.map((cake, index) => (
                        <div key={cake.id} className="card-wrapper" style={{ animationDelay: `${index * 0.3}s` }}>
                            <CardItem key={cake.id} item={cake} isFavoriteDefault={favorites.includes(cake.id)}/>
                        </div>))}
                    <ArrowForwardIcon onClick={handlePreviousPage} disabled={page === 1} className='arrow' />
                </div>
            </div>
            <div className="pagination">
            </div>
        </div>
    )
}

export default CakeList2