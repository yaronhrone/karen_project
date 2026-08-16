import React from 'react'
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import CustomerLink from '../navbar/CustomeLink';
import './Footer.css'
function Footer() {
  return (
    <div className='footer_container'>
      <div className='footer_social'>
        <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer"><InstagramIcon className='icon_f' /></a>
        <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer"><FacebookIcon className='icon_f' /></a>
      </div>
      <ul className='footer_col'>
        <li className='footer_col_title'>המוצרים שלי</li>
        <li><CustomerLink to={'/chocolates'}>פרלינים</CustomerLink></li>
        <li><CustomerLink to={'/cakes'}>עוגות</CustomerLink></li>
        <li><CustomerLink to={'/cookies'}>עוגיות</CustomerLink></li>
      </ul>
      <ul className='footer_col'>
        <li className='footer_col_title'>יצירת קשר</li>
        <li>טלפון: 050-9422951</li>
        <li>כתובת: לפי תיאום מראש</li>
      </ul>
      <p className='footer_copy'>Yaron Haroni&copy; :כל הזכויות שמורות</p>
    </div>
  )
}

export default Footer
