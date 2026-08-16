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
          היי, אני קרן, למדתי בבית ספר "תדמור" של המסעדה
          <br /><br />
          ואני קונדיטורית ושוקולדטיירית שאוהבת להפוך רגעים מתוקים לזיכרונות נוצצים.
          <br /><br />
          אני מאמינה שכל קינוח הוא חוויה, וכל עוגה או פרלין הם דרך להראות אהבה, הערכה ופינוק אמיתי.
          <br /><br />
          כל יצירה נוצרת בעבודת יד, מחומרי גלם איכותיים, עם תשומת לב לכל פרט קטן.
          <br /><br />
          <span>כי אצלנו, כל לקוח ולקוחה הם יהלום</span>
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
