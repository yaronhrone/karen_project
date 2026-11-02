import React from 'react';
import { Link } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RoundPhoto from '../common/RoundPhoto';
import useChocolateBoxes from '../chocolate-boxes/useChocolateBoxes';
import useCarousel from '../../utils/useCarousel';
import '../product-lists/Carousel.css';
import './HomeBoxes.css';

// Home's chocolates section: the boxes themselves (chocolates are picked
// inside a box on /chocolates, not sold one by one), in the same sliding
// carousel as the cakes and cookies.
function HomeBoxes() {
  const { boxes } = useChocolateBoxes();
  const { visible, startIndex, next, previous, hoverProps } = useCarousel(boxes);
  return (
    <div className="cards-container" {...hoverProps}>
      <h2>מארזי פרלינים</h2>
      <div key={startIndex} className="cards-wrapper fade">
        <ArrowBackIcon onClick={next} className="arrow" />
        {visible.map((b, index) => (
          <div key={b.itemId} className="card-wrapper" style={{ animationDelay: `${index * 0.3}s` }}>
            <Link to="/chocolates" className="home-box-card">
              {b.image
                ? <RoundPhoto src={b.image} />
                : <span className="home-box-placeholder" aria-hidden="true">{b.size}</span>}
              <span className="home-box-label">{b.label}</span>
              {b.outOfStock
                ? <span className="home-box-soldout">חסר במלאי</span>
                : (b.price != null && <span className="home-box-price">₪{b.price}</span>)}
            </Link>
          </div>
        ))}
        <ArrowForwardIcon onClick={previous} className="arrow" />
      </div>
      <div className="carousel-more"><Link className="btn btn-ghost" to="/chocolates">לכל המארזים</Link></div>
    </div>
  );
}

export default HomeBoxes;
