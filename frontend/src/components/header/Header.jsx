import CustomeLink from '../navbar/CustomeLink'
import React from 'react'
import './Header.css'
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
const Header = () => {

  return (
    <header>
 <div className='delivery'>

<p >משלוח חינם מעל 200 שקל
</p>
<DeliveryDiningIcon className='delivery_icon'/>
 </div>
<CustomeLink to={'/'}> <img src=
'/image/logo.jpg' 
// 'https://dynamic.design.com/preview/logodraft/00203028-b829-4d7d-b3a9-204c77781063/image/large.png'
 alt="icon" className='icon'/></CustomeLink>
    </header>
  )
}

export default Header