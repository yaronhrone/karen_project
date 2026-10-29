import React, { useState } from 'react'
import './Order.css';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import { getOrderStatusLabel } from '../../utils/orderStatus';
import BoxContents from './BoxContents';
import { boxImageForCategory } from '../../config/chocolateBoxes';
import { readyEstimateText } from '../../utils/readyEstimate';

// Matches orders.note VARCHAR(500) and the check in OrderController.
const MAX_NOTE_LENGTH = 500;

function OrderCard({ order, remove, add, removeBox, deleteOrder, sendOrder }) {
    const [note, setNote] = useState('');
    // Defensive - a "TypeError: .map is not a function" crashed this whole
    // page (before the ErrorBoundary existed to at least catch it) on an
    // order whose order_items apparently wasn't an array at render time.
    // Root cause not confirmed (server-side, order_items is always set to a
    // list, never left null/undefined) - guarding here either way, same as
    // the null-favorite crash fix, rather than leaving every render of this
    // component one bad response away from taking down the page again.
    const orderItems = Array.isArray(order.order_items) ? order.order_items : [];
    return (
        <>
            <div key={order.id} className='orderCard'>

                <div className='orderHeader'>
                    <h3>הזמנה מס' {order.id}</h3>
                    <h3>מצב הזמנה: {getOrderStatusLabel(order.status)}</h3>
                    <h3>תאריך הזמנה: {order.order_date}</h3>
                    <h3>מחיר כולל: ₪{order.total_price}</h3>
                </div>

                <div className='orderItemContainer'>
                    {orderItems.map(oi => (
                        <div key={oi.id} className='orderItem'>
                            {(oi.image || boxImageForCategory(oi.category))
                                ? <img src={oi.image || boxImageForCategory(oi.category)} alt={oi.name} />
                                : <div className='img-placeholder' aria-hidden="true" />}
                            <div className='orderItemInfo'>
                                <h3>{oi.name}</h3>
                                <p>{oi.description}</p>
                                <BoxContents composition={oi.composition} />
                            </div>
                            <div className='orderItemQuantity'>
                                {oi.composition ? (
                                    // A box is one fixed line: no +/- steppers, it can only be removed.
                                    <button type='button' className='btn btn-ghost' onClick={() => { removeBox(oi.id) }}>
                                        <DeleteIcon fontSize="small" /> הסרת המארז
                                    </button>
                                ) : (
                                    <div className='quantity'>
                                        <RemoveIcon className='icon' onClick={() => { remove(oi.product_id, oi.product_type) }} />
                                        <h3 className='number'>{oi.quantity}</h3>
                                        <AddIcon className='icon' onClick={() => { add(oi.product_id, oi.product_type) }} />
                                    </div>
                                )}
                                <h3 className='number'>₪{oi.total_price}</h3>
                            </div>
                        </div>
                    ))}
                </div>

                <div className='orderTotal'>
                    <span className='label'>סה"כ לתשלום</span>
                    <span className='number'>₪{order.total_price}</span>
                </div>

                <div className='orderNote'>
                    <label htmlFor={`order-note-${order.id}`}>הערה להזמנה (לא חובה)</label>
                    <textarea
                        id={`order-note-${order.id}`}
                        rows={3}
                        maxLength={MAX_NOTE_LENGTH}
                        placeholder="למשל: בקשות מיוחדות, שעת איסוף מועדפת..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                    <span className='note-counter'>{note.length}/{MAX_NOTE_LENGTH}</span>
                </div>

                <p className='lead-time'>{readyEstimateText()} (2-5 ימי עסקים)</p>

                <div className='btns'>
                    <button className='btn btn-ghost' onClick={() => { deleteOrder(order.id) }}>
                        <DeleteIcon fontSize="small" /> מחיקת הזמנה
                    </button>
                    <button
                        className='btn btn-primary'
                        onClick={() => { sendOrder(note) }}
                    >
                        שליחת הזמנה <SendIcon fontSize="small" />
                    </button>
                </div>
            </div>
        </>
    )
}

export default OrderCard
