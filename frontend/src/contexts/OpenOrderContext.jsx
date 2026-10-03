import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import UserContext from './UserContext';
import { getAllOrders } from '../service/apiServise';

// Which products are already in the logged-in customer's open (cart) order.
// Product cards read this to show their "added" state, so the mark survives
// leaving the page and coming back - it used to live only in each card's own
// useState, which resets every time the card remounts.
// (Guests don't need this: their cart is in CartContext.)
export const OpenOrderContext = createContext({
    openOrderItemIds: new Set(),
    refreshOpenOrder: () => {},
    markInOrder: () => {},
    syncFromOrders: () => {},
});

export const OpenOrderProvider = ({ children }) => {
    const { currentUser, isRequstToGetCurrentUserDone } = useContext(UserContext);
    const [openOrderItemIds, setOpenOrderItemIds] = useState(() => new Set());

    // Takes the customer's orders as GET /order returned them - lets a page
    // that already fetched them (the order page) update the cards' state
    // without a second request.
    const syncFromOrders = useCallback((orders) => {
        const openOrder = (Array.isArray(orders) ? orders : []).find(o => o.status === 'OPEN');
        const items = Array.isArray(openOrder?.order_items) ? openOrder.order_items : [];
        setOpenOrderItemIds(new Set(items.map(oi => oi.product_id)));
    }, []);

    const refreshOpenOrder = useCallback(async () => {
        if (!currentUser) {
            setOpenOrderItemIds(new Set());
            return;
        }
        try {
            const { data } = await getAllOrders();
            syncFromOrders(data);
        } catch (err) {
            // Keep whatever we had - a failed refresh must not un-mark cards.
        }
    }, [currentUser, syncFromOrders]);

    // Instant feedback right after an add, before the refresh above returns.
    const markInOrder = useCallback((itemId) => {
        setOpenOrderItemIds(prev => new Set(prev).add(itemId));
    }, []);

    useEffect(() => {
        if (isRequstToGetCurrentUserDone) {
            refreshOpenOrder();
        }
    }, [isRequstToGetCurrentUserDone, refreshOpenOrder]);

    return (
        <OpenOrderContext.Provider value={{ openOrderItemIds, refreshOpenOrder, markInOrder, syncFromOrders }}>
            {children}
        </OpenOrderContext.Provider>
    );
};
