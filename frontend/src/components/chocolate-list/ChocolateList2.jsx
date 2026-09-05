import React, { useContext, useEffect, useState } from 'react'
import { getAllChocolate, getAllFavoriteItems } from '../../service/apiServise';
import CardItem from '../card/CardItem';
import './ChocolateList.css';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import UserContext from '../../contexts/UserContext';
import { FavoriteContext } from '../../contexts/FavoriteContext';
function ChocolateList2() {
    const [chocolates, setChocolates] = useState([]);
    const [page, setPage] = useState(1);
    const [favorites, setFavorites] = useState([]);
    const { currentUser, isRequstToGetCurrentUserDone } = useContext(UserContext);
    const { favorites: favoriteItems } = useContext(FavoriteContext);

    const fetchChocolates = async (pageNumber) => {
        try {
            if (currentUser && isRequstToGetCurrentUserDone) {
                const { data: fav } = await getAllFavoriteItems();
                setFavorites(fav.map(fav => fav.id ));
            }else{
                setFavorites(favoriteItems);
            }

            const { data } = await getAllChocolate(pageNumber, 3);
            setChocolates(data);
        } catch (error) {
        }
    }

    const handleNextPage = () => {
        if (page === 4) {
            setPage(1);
            fetchChocolates(1);
            return;
        }
        const nextPage = page + 1;
        fetchChocolates(nextPage);
        setPage(nextPage);
    }
    const handlePreviousPage = () => {
        if (page > 1) {
            const prevPage = page - 1;
            fetchChocolates(prevPage);
            setPage(prevPage);
        } else if (page === 1) {
            setPage(4);
            fetchChocolates(4);
        }

    }
    useEffect(() => {
        fetchChocolates(page);
    }, []);
    return (
        <div>
            <div className="cards-container ">
                <h2>פרלינים</h2>
              
                <div key={page} className="cards-wrapper fade">
                    <ArrowBackIcon onClick={handleNextPage} className='arrow' />
                    {chocolates.map((chocolate, index) => (
                        <div key={chocolate.id} className="card-wrapper" style={{ animationDelay: `${index * 0.3}s` }}>
                            <CardItem key={chocolate.id} item={chocolate} isFavoriteDefault={favorites?.includes(chocolate.id)} categoryPath="/chocolates" />
                        </div>))}
                    <ArrowForwardIcon onClick={handlePreviousPage} disabled={page === 1} className='arrow' />
                </div>
            </div>
            <div className="pagination">
            </div>
        </div>
    )
}

export default ChocolateList2