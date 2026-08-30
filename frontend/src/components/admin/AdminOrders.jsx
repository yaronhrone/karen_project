import React, { useEffect, useState } from 'react'
import { advanceOrderStatus, getAdminOrdersBoard } from '../../service/apiServise';
import OrderFinish from '../order/OrderFinish';
import { getOrderStatusLabel } from '../../utils/orderStatus';
import './Admin.css';

// RECEIVED -> IN_PROGRESS -> READY, the same 3-stage flow OrderService
// enforces server-side (advanceOrderStatus there rejects anything else).
const NEXT_STATUS = {
    RECEIVED: 'IN_PROGRESS',
    IN_PROGRESS: 'READY',
};

// One board endpoint (GET /admin/orders/board, already newest-first server
// side) split into 3 sections client-side by status - simpler than 3
// separate requests, and keeps "newest first within each group" for free
// since Array.filter preserves relative order.
const GROUPS = [
    { status: 'RECEIVED', title: 'הזמנות פתוחות' },
    { status: 'IN_PROGRESS', title: 'בהכנה' },
    { status: 'READY', title: 'הזמנות סגורות' },
];

function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState('');

    const loadOrders = async () => {
        try {
            const { data } = await getAdminOrdersBoard();
            setOrders(data);
        } catch (error) {
            console.log(error);
            if (error.response?.status === 400 || error.response?.status === 500) {
                setError(error.response.data);
            }
        }
    };

    // This page only ever mounts after Admin.jsx's own admin check already
    // passed (it's rendered via <Outlet/>), so a plain mount-once load is
    // enough - no need to re-gate on isAdmin here too.
    useEffect(() => {
        loadOrders();
    }, []);

    const handleAdvanceStatus = async (order) => {
        const nextStatus = NEXT_STATUS[order.status];
        if (!nextStatus) {
            return;
        }
        try {
            await advanceOrderStatus(order.id, nextStatus);
            // The order moves to a different section (or drops off the
            // board entirely once READY -> nothing further) - just reload
            // rather than patch one row across groups.
            loadOrders();
        } catch (error) {
            console.log(error);
            if (error.response?.status === 400 || error.response?.status === 500) {
                setError(error.response.data);
            }
        }
    };

    return (
        <div className='admin-orders'>
            {error && <p>{error}</p>}
            {GROUPS.map(group => {
                const groupOrders = orders.filter(order => order.status === group.status);
                return (
                    <div className='order_group' key={group.status}>
                        <h2 className='tital'>{group.title}</h2>
                        {groupOrders.length === 0
                            ? <p>אין הזמנות כאן כרגע</p>
                            : groupOrders.map(order => (
                                <div key={order.id} className='order_row'>
                                    <OrderFinish order={order} />
                                    {NEXT_STATUS[order.status] && (
                                        <button className='btn' type='button' onClick={() => handleAdvanceStatus(order)}>
                                            העבר ל"{getOrderStatusLabel(NEXT_STATUS[order.status])}"
                                        </button>
                                    )}
                                </div>
                            ))}
                    </div>
                );
            })}
        </div>
    )
}

export default AdminOrders
