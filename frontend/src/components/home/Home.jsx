import React from 'react'
import HomeBoxes from './HomeBoxes';
import CakeCarousel from '../product-lists/CakeCarousel';
import CookieCarousel from '../product-lists/CookieCarousel';
import './Home.css'

const Home = () => {
  return (
    <div>
      <h2 className='title_karn'>הניצוץ שמאחורי היהלומים של קרן</h2>
      <div className="hero">
        <p>
          היי, אני קרן 🤍
          <br />
          <br />
          קונדיטורית ושוקולטיירית, בוגרת בית הספר תדמור.
          <br />
          <br />
          אני אופה ויוצרת פרלינים ועוגות בעבודת יד, מחומרי גלם איכותיים ובתשומת לב לכל פרט קטן, כדי להפוך רגעים מתוקים לזיכרונות נוצצים.
          <br />
          <br />
          אצלי כל עוגה וכל פרלין הם דרך להראות אהבה, הערכה ופינוק אמיתי.
          <br />
          <br />
          כי אצלי, כל לקוח ולקוחה הם יהלום 💎
        </p>
        <img src="/image/karn.jpg" alt="קרן" className='hero_image' />
      </div>

      <h2 className='section_title'>היהלומים שלי</h2>
      <HomeBoxes />
      <CakeCarousel />
      <CookieCarousel />
    </div>
  )
}

export default Home
