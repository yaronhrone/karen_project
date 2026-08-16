import React, { useContext } from 'react'
import UserContext from '../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';

const Payment = () => {

const { currentUser  } = useContext(UserContext);
const navigate = useNavigate();

const handleCheckout = () => {
  if ( !currentUser) {
    navigate("/signin?redirect=/checkout");
    return;
  }

 
};

    
  return (
    <div>
        <button className='btn' onClick={handleCheckout}>לתשלום</button>
    </div>
  )
}

export default Payment