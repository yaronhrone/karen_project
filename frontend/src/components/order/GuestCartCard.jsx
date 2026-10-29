import React from 'react'
import './Order.css';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import LoginIcon from '@mui/icons-material/Login';
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import BoxContents from './BoxContents';
import RoundPhoto from '../common/RoundPhoto';
import { readyEstimateText } from '../../utils/readyEstimate';

// Guest equivalent of OrderCard - same look, but backed by CartContext's
// local (not-yet-a-real-order) items instead of a server order, and its
// "send" action is just a login redirect: the actual order only gets
// created once mergeGuestDataToAccount runs after that login succeeds.
function GuestCartCard({ items, boxes = [], totalPrice, onIncrement, onDecrement, onRemoveBox, onEditBox }) {
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
                {boxes.map((box) => (
                    <div key={box.key} className='orderItem orderItem-box'>
                        {box.image
                            ? <RoundPhoto className='box-photo' src={box.image} alt={box.label} />
                            : <div className='img-placeholder' aria-hidden="true" />}
                        <div className='orderItemInfo'>
                            <h3>{box.label}</h3>
                            <BoxContents composition={box.chocolates} />
                        </div>
                        <div className='orderItemQuantity'>
                            <div className='box-actions'>
                                <button type='button' className='btn btn-ghost' onClick={() => onEditBox(box)}>
                                    <EditIcon fontSize="small" /> עריכת המארז
                                </button>
                                <button type='button' className='btn btn-ghost' onClick={() => onRemoveBox(box.key)}>
                                    <DeleteIcon fontSize="small" /> הסרת המארז
                                </button>
                            </div>
                            <h3 className='number'>₪{box.price}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className='orderTotal'>
                <span className='label'>סה"כ לתשלום</span>
                <span className='number'>₪{totalPrice}</span>
            </div>

            <p className='lead-time'>{readyEstimateText()} (2-5 ימי עסקים)</p>

            <div className='btns'>
                <button className='btn btn-primary' onClick={() => navigate('/login')}>
                    התחברות להשלמת ההזמנה <LoginIcon fontSize="small" />
                </button>
            </div>
        </div>
    )
}

export default GuestCartCard
