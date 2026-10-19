import React from 'react'
import ChocolateList2 from '../chocolate-list/ChocolateList2';
import CakeList2 from '../cake-list/CakeList2';
import CookieList2 from '../cookie-list/CookieList2';
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
      <ChocolateList2 />
      <CakeList2 />
      <CookieList2 />
    </div>
  )
}

export default Home
