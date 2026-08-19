import React from 'react'
import './Order.css';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import { getOrderStatusLabel } from '../../utils/orderStatus';

function OrderCard({ order, remove, add, deleteOrder, sendOrder }) {

    return (
        <>
            <div key={order.id} className='orderCard'>

                <div className='orderHeader'>
                    <h3>מצב הזמנה: {getOrderStatusLabel(order.status)}</h3>
                    <h3>תאריך הזמנה: {order.order_date}</h3>
                    <h3>מחיר כולל: ₪{order.total_price}</h3>
                </div>

                <div className='orderItemContainer'>
                    {order.order_items.map(oi => (
                        <div key={oi.id} className='orderItem'>
                            {oi.image
                                ? <img src={oi.image} alt={oi.name} />
                                : <div className='img-placeholder' aria-hidden="true" />}
                            <div className='orderItemInfo'>
                                <h3>{oi.name}</h3>
                                <p>{oi.description}</p>
                            </div>
                            <div className='orderItemQuantity'>
                                <div className='quantity'>
                                    <RemoveIcon className='icon' onClick={() => { remove(oi.product_id, oi.product_type) }} />
                                    <h3 className='number'>{oi.quantity}</h3>
                                    <AddIcon className='icon' onClick={() => { add(oi.product_id, oi.product_type) }} />
                                </div>
                                <h3 className='number'>₪{oi.total_price}</h3>
                            </div>
                        </div>
                    ))}
                </div>

                <div className='orderTotal'>
                    <span className='label'>סה"כ לתשלום</span>
                    <span className='number'>₪{order.total_price}</span>
                </div>

                <div className='btns'>
                    <button className='btn btn-ghost' onClick={() => { deleteOrder(order.id) }}>
                        <DeleteIcon fontSize="small" /> מחיקת הזמנה
                    </button>
                    <button className='btn btn-primary' onClick={() => { sendOrder() }}>
                        שליחת הזמנה <SendIcon fontSize="small" />
                    </button>
                </div>
            </div>
        </>
    )
}

export default OrderCard
