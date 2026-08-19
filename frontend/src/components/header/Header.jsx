import CustomeLink from '../navbar/CustomeLink'
import React from 'react'
import './Header.css'
// import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
const Header = () => {

  return (
    <header>
      {/* Free-delivery badge - disabled for now (not offering it yet). Kept
          here, ready to re-enable: it's already styled in Header.css to pin
          to the left edge instead of sitting inline next to the logo. */}
      {/* <div className='delivery'>
        <p>משלוח חינם מעל 200 שקל</p>
        <DeliveryDiningIcon className='delivery_icon'/>
      </div> */}
      <CustomeLink to={'/'}>
        <img src='/image/logo.jpg' alt="היהלומים של קרן" className='icon'/>
      </CustomeLink>
    </header>
  )
}

export default Header
