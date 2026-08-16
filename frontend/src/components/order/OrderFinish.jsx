import React from 'react'

function OrderFinish({ order }) {

    return (
        <div key={order.id}>
            <div className='orderHeader'>
                <h3>מצב הזמנה: {order.status === "CLOSE" ? "סגור" : "פתוח"}</h3>
                <h3>תאריך הזמנה:{order.order_date}</h3>
                <h3>מחיר כולל: {order.total_price}</h3>
            </div>
            <div className='orderItemContainer'> 
            {order.order_items.map(oi => (
                <div key={oi.id} className='orderItem'     style={{
            padding: "8px",
            marginBottom: "5px",
            background: "#f8aeaeff",
            borderRadius: "4px",
          }} >
                    <img src={oi.image} alt={oi.name} width={100} height={100} />
                    <div className='orderItemInfo'>
                        <h3>{oi.name}</h3>
                        <p>{oi.description}</p>
                        <div className='orderItemQuantity'>
                                <h3>כמות:{oi.quantity}</h3>

                            <h3 style={{ marginLeft: '30px' }}>מחיר: {oi.price}</h3>
                        </div>
                    </div>
                    <h3>מחיר כולל: {oi.total_price}</h3>
                    </div>
            ))}
            </div>

        </div>
    )
}

export default OrderFinish