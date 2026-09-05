import React, { useContext, useEffect, useState } from 'react'
import { getAllOrders, getItemById } from '../../service/apiServise';
import OrderCard from './OrderCard';
import GuestCartCard from './GuestCartCard';
import UserContext from '../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import OrderFinish from './OrderFinish';
import './Order.css';
import { addItemToOrder, deleteOrderById, removeItemFromOredr, updateOrder } from '../../service/apiServise';
import { cartContext } from '../../contexts/CartContext';




function Order() {
  const { currentUser, isRequstToGetCurrentUserDone } = useContext(UserContext);
  const [orders, setOrder] = useState([]);
  const navigate = useNavigate();
  const [errorFromServer, setErrorFromServer] = useState('');
  const { cartItems, addToCart, decrementFromCart } = useContext(cartContext);
  const [guestCartDetails, setGuestCartDetails] = useState([]);



  const fetchOrders = async () => {


    try {
      const { data } = await getAllOrders();
      setOrder(data);
    } catch (err) {
      if (err.response?.status == 400 || err.response?.status == 500) {
        setErrorFromServer(err.response.data);
      } if (err.code === "ERR_NETWORK") {
        setErrorFromServer("שגיאת רשת: בדוק/י את החיבור לאינטרנט ונסה/י שוב.");
      }
      setTimeout(() => {
        setErrorFromServer('');
      }, 5000);
    }
  };

  // Guest view: there's no real order on the server to fetch (that's the
  // whole point - login is only required at final checkout), so instead of
  // calling getAllOrders() (which 401s and used to leave the page silently
  // showing "no orders yet"), build a cart view straight from CartContext's
  // local item ids. CartContext only stores raw ids, not item details, so
  // fetch each unique one via getItemById - the same approach Favorite.jsx
  // already uses to render a guest's favorites.
  const fetchGuestCartDetails = async () => {
    const uniqueIds = [...new Set(cartItems)];
    try {
      const items = await Promise.all(uniqueIds.map(id => getItemById(id)));
      const details = items.map(item => ({
        item,
        quantity: cartItems.filter(id => id === item.id).length,
      }));
      setGuestCartDetails(details);
    } catch (err) {
    }
  };

  useEffect(() => {
    if (!isRequstToGetCurrentUserDone) {
      return;
    }
    if (currentUser) {
      fetchOrders();
    } else {
      fetchGuestCartDetails();
    }
  }, [currentUser, isRequstToGetCurrentUserDone, cartItems]);
const remove = async (id) => {
        try {
            await removeItemFromOredr(id )
            fetchOrders();
        } catch (err) {};
    }
    const add = async (id) => {


        try {
            await addItemToOrder(id )
            fetchOrders();
        } catch (err) {};
    }
    const deleteOrder = async (id) => {
        try {
            await deleteOrderById(id);
            fetchOrders();
        } catch (err) {
      if (err.response?.status == 400 || err.response?.status == 500) {
        setErrorFromServer(err.response.data);
      } if (err.code === "ERR_NETWORK") {
        setErrorFromServer("שגיאת רשת: בדוק/י את החיבור לאינטרנט ונסה/י שוב.");
      }
      setTimeout(() => {
        setErrorFromServer('');
      }, 5000);
    }
  };
    const sendOrder = async () => {
        try {
            await updateOrder();
            // No alert() here anymore - fetchOrders() below re-renders the
            // card with the new status ("התקבלה") right away, which is
            // already the confirmation that it went through.
            fetchOrders();
        }catch(err){
      if (err.response?.status == 400 || err.response?.status == 500) {
        setErrorFromServer(err.response.data);
      } if (err.code === "ERR_NETWORK") {
        setErrorFromServer("שגיאת רשת: בדוק/י את החיבור לאינטרנט ונסה/י שוב.");
      }
      setTimeout(() => {
        setErrorFromServer('');
      }, 5000);
    }
  };
  
  const lastOrder = orders[orders.length - 1];
  const previousOrders = orders.slice(0, -1);

  const guestTotalPrice = guestCartDetails.reduce((sum, { item, quantity }) => sum + item.price * quantity, 0);

  if (!isRequstToGetCurrentUserDone) {
    return null;
  }

  if (!currentUser) {
    // Guest: no server order exists yet, login is only required once they
    // actually want to send it - see GuestCartCard/mergeGuestDataToAccount.
    return (
      <div>
        {guestCartDetails.length === 0
          ? <h2>העגלה שלך ריקה</h2>
          : (
            <GuestCartCard
              items={guestCartDetails}
              totalPrice={guestTotalPrice}
              onIncrement={(id) => addToCart(id)}
              onDecrement={(id) => decrementFromCart(id)}
            />
          )}
      </div>
    );
  }

  return (
    <>
        <div>
          {orders.length === 0 ? <h2>אין הזמנות עדיין</h2> :
            <div>
              {lastOrder.status === "OPEN" ?
                <div>
                  <h2> הזמנות שלי</h2>
                  <OrderCard
                    key={lastOrder.id}
                    order={lastOrder}
                    remove={remove}
                    add={add}
                    deleteOrder={deleteOrder}
                    sendOrder={sendOrder}

                  />
                </div>
              :
               <OrderFinish
                    key={lastOrder.id}
                    order={lastOrder}

                  />
              }


              {previousOrders.map((item) => (
                <div key={item.id}>
                  <div className='line'></div>

                  <OrderFinish
                    key={item.id}
                    order={item}

                  />

                </div>
              ))}
            </div>

          }
        </div>

    </>
  )
}

export default Order