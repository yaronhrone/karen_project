import React from 'react'
import './Order.css';
import { getOrderStatusLabel } from '../../utils/orderStatus';

function OrderFinish({ order }) {
    // See the matching guard/comment in OrderCard.jsx.
    const orderItems = Array.isArray(order.order_items) ? order.order_items : [];
    // Same statuses the admin board's own "ביטול הזמנה" button allows
    // cancelling from (see OrderService.SETTABLE_STATUSES/AdminOrders.jsx) -
    // there's no customer-facing cancel action, so this only makes sense to
    // show while cancelling is actually still possible on Keren's side.
    const isCancellable = order.status === 'RECEIVED' || order.status === 'IN_PROGRESS';

    return (
        <div className='orderCard'>
            <div className='orderHeader'>
                <h3>הזמנה מס' {order.id}</h3>
                <h3>מצב הזמנה: {getOrderStatusLabel(order.status)}</h3>
                <h3>תאריך הזמנה: {order.order_date}</h3>
                {order.ready_by && <h3>מוכן ב-: {order.ready_by}</h3>}
                {/* ready_at/sent_at are the actual dates each stage happened
                    (server-stamped when Keren advances the status) -
                    different from ready_by above, which is a target date she
                    optionally sets while the order is still RECEIVED. */}
                {order.ready_at && <h3>מוכן בתאריך: {order.ready_at}</h3>}
                {order.sent_at && <h3>נשלח בתאריך: {order.sent_at}</h3>}
                <h3>מחיר כולל: ₪{order.total_price}</h3>
                {isCancellable && (
                    <p className='cancel-note'>לביטול ההזמנה יש לשלוח הודעת WhatsApp לקרן</p>
                )}
            </div>
            <div className='orderItemContainer'>
                {orderItems.map(oi => (
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
