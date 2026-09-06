import React from 'react'
import './Order.css';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import { getOrderStatusLabel } from '../../utils/orderStatus';
import { calculatePackages } from '../../utils/chocolatePackaging';
import ChocolatePackageStatus from './ChocolatePackageStatus';

function OrderCard({ order, remove, add, deleteOrder, sendOrder }) {
    // Defensive - a "TypeError: .map is not a function" crashed this whole
    // page (before the ErrorBoundary existed to at least catch it) on an
    // order whose order_items apparently wasn't an array at render time.
    // Root cause not confirmed (server-side, order_items is always set to a
    // list, never left null/undefined) - guarding here either way, same as
    // the null-favorite crash fix, rather than leaving every render of this
    // component one bad response away from taking down the page again.
    const orderItems = Array.isArray(order.order_items) ? order.order_items : [];
    // Chocolates are the only category sold in fixed box sizes - the +/-
    // steppers below adjust one unit at a time with no awareness of that, so
    // this is what actually stops "שליחת הזמנה" once they no longer add up
    // to a valid combination of boxes (same rule /chocolates enforces before
    // an order is even created - this is what closes the same gap once
    // chocolates are already in a real order and adjusted here instead).
    const chocolateQuantity = orderItems
        .filter(oi => oi.category === 'chocolate')
        .reduce((sum, oi) => sum + oi.quantity, 0);
    const chocolatePackagingInvalid = chocolateQuantity > 0 && calculatePackages(chocolateQuantity).remaining > 0;

    return (
        <>
            <div key={order.id} className='orderCard'>

                <div className='orderHeader'>
                    <h3>מצב הזמנה: {getOrderStatusLabel(order.status)}</h3>
                    <h3>תאריך הזמנה: {order.order_date}</h3>
                    <h3>מחיר כולל: ₪{order.total_price}</h3>
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

                <ChocolatePackageStatus totalQuantity={chocolateQuantity} />

                <div className='orderTotal'>
                    <span className='label'>סה"כ לתשלום</span>
                    <span className='number'>₪{order.total_price}</span>
                </div>

                <div className='btns'>
                    <button className='btn btn-ghost' onClick={() => { deleteOrder(order.id) }}>
                        <DeleteIcon fontSize="small" /> מחיקת הזמנה
                    </button>
                    <button
                        className='btn btn-primary'
                        onClick={() => { sendOrder() }}
                        disabled={chocolatePackagingInvalid}
                        title={chocolatePackagingInvalid ? 'כמות השוקולדים לא מתאימה למארז מלא - השלימו או הורידו כמות' : undefined}
                    >
                        שליחת הזמנה <SendIcon fontSize="small" />
                    </button>
                </div>
            </div>
        </>
    )
}

export default OrderCard
