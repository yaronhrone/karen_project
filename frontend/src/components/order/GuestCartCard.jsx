import React from 'react'
import './Order.css';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import LoginIcon from '@mui/icons-material/Login';
import { useNavigate } from 'react-router-dom';

// Guest equivalent of OrderCard - same look, but backed by CartContext's
// local (not-yet-a-real-order) items instead of a server order, and its
// "send" action is just a login redirect: the actual order only gets
// created once mergeGuestDataToAccount runs after that login succeeds.
function GuestCartCard({ items, totalPrice, onIncrement, onDecrement }) {
    const navigate = useNavigate();

    return (
        <div className='orderCard'>
            <div className='orderHeader'>
                <h3>העגלה שלי</h3>
                <h3>מחיר כולל: ₪{totalPrice}</h3>
            </div>

            <div className='orderItemContainer'>
                {items.map(({ item, quantity }) => (
                    <div key={item.id} className='orderItem'>
                        {item.image
                            ? <img src={item.image} alt={item.name} />
                            : <div className='img-placeholder' aria-hidden="true" />}
                        <div className='orderItemInfo'>
                            <h3>{item.name}</h3>
                            <p>{item.description}</p>
                        </div>
                        <div className='orderItemQuantity'>
                            <div className='quantity'>
                                <RemoveIcon className='icon' onClick={() => onDecrement(item.id)} />
                                <h3 className='number'>{quantity}</h3>
                                <AddIcon className='icon' onClick={() => onIncrement(item.id)} />
                            </div>
                            <h3 className='number'>₪{item.price * quantity}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className='orderTotal'>
                <span className='label'>סה"כ לתשלום</span>
                <span className='number'>₪{totalPrice}</span>
            </div>

            <div className='btns'>
                <button className='btn btn-primary' onClick={() => navigate('/login')}>
                    התחברות להשלמת ההזמנה <LoginIcon fontSize="small" />
                </button>
            </div>
        </div>
    )
}

export default GuestCartCard
