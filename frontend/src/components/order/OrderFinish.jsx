import React from 'react'
import './Order.css';
import { getOrderStatusLabel } from '../../utils/orderStatus';

function OrderFinish({ order }) {

    return (
        <div className='orderCard'>
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
                            <span className='number'>כמות: {oi.quantity}</span>
                            <span className='number'>₪{oi.total_price}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default OrderFinish
