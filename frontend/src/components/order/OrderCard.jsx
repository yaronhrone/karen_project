import React from 'react'
import './Order.css';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import Stack from '@mui/material/Stack';
function OrderCard({ order, remove, add, deleteOrder, sendOrder }) {


    

    return (
        <>


            <div key={order.id} className='orderCard'>
                
                <Stack direction="row" className='btns' spacing={2}>
                    <Button variant="outlined" className='btn' onClick={() => { deleteOrder(order.id) }} startIcon={<DeleteIcon />}>
                        מחיקת הזמנה
                    </Button>
                    <Button variant="contained" className='btn' onClick={() => { sendOrder() }} endIcon={<SendIcon />}>
                        שליחת הזמנה
                    </Button>
                </Stack>
             
                <div className='orderHeader'>
                    <h3>מצב הזמנה: {order.status === "CLOSE" ? "סגור" : "פתוח" }</h3>
                    <h3>תאריך הזמנה:{order.order_date}</h3>
                    <h3>מחיר כולל: {order.total_price}</h3>
                </div>
                {order.order_items.map(oi => (
                    <div key={oi.id} className='orderItem'>
                        <img src={oi.image} alt={oi.name} width={100} height={100} />
                        <div className='orderItemInfo'>
                            <h3>{oi.name}</h3>
                            <p>{oi.description}</p>
                            <div className='orderItemQuantity'>
                                <div className='quantity'>
                                    <RemoveIcon className='icon' onClick={() => { remove(oi.product_id, oi.product_type) }} />
                                    <h3 className='number'>{oi.quantity}</h3>
                                    <AddIcon className='icon' onClick={() => { add(oi.product_id, oi.product_type) }} />
                                </div>

                                <h3 className='number' style={{ marginLeft: '30px' }}>מחיר: {oi.price}</h3>
                            </div>
                        </div>
                        <h3 className='number'>מחיר כולל: {oi.total_price}</h3>
                    </div>
                ))}


            </div>

            
        
        </>
    )
}

export default OrderCard