import React from 'react'
import './Order.css';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import LoginIcon from '@mui/icons-material/Login';
import { useNavigate } from 'react-router-dom';
import ChocolatePackageStatus from './ChocolatePackageStatus';

// Guest equivalent of OrderCard - same look, but backed by CartContext's
// local (not-yet-a-real-order) items instead of a server order, and its
// "send" action is just a login redirect: the actual order only gets
// created once mergeGuestDataToAccount runs after that login succeeds.
function GuestCartCard({ items, totalPrice, onIncrement, onDecrement }) {
    const navigate = useNavigate();
    // Informational here, not blocking: OrderCard enforces this for real
    // once the guest logs in and lands on their actual order (same fixed
    // box-size rule as /chocolates) - showing it already avoids surprising
    // them with a suddenly-disabled send button right after login.
    const chocolateQuantity = items
        .filter(({ item }) => item.category === 'chocolate')
        .reduce((sum, { quantity }) => sum + quantity, 0);

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

            <ChocolatePackageStatus totalQuantity={chocolateQuantity} />

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
