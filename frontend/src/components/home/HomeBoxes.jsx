import React from 'react';
import { Link } from 'react-router-dom';
import { CHOCOLATE_BOXES } from '../../config/chocolateBoxes';
import './HomeBoxes.css';

// Home's chocolates section: the boxes themselves (chocolates are picked
// inside a box on /chocolates, not sold one by one).
function HomeBoxes() {
  return (
    <section className="home-boxes">
      <h2>מארזי פרלינים</h2>
      <div className="home-boxes-row">
        {CHOCOLATE_BOXES.map((b) => (
          <Link key={b.size} to="/chocolates" className="home-box-card">
            {b.image
              ? <img src={b.image} alt={b.label} />
              : <span className="home-box-placeholder" aria-hidden="true">{b.size}</span>}
            <span className="home-box-label">{b.label}</span>
            <span className="home-box-price">₪{b.price}</span>
          </Link>
        ))}
      </div>
      <div className="carousel-more"><Link className="btn btn-ghost" to="/chocolates">לכל המארזים</Link></div>
    </section>
  );
}

export default HomeBoxes;
