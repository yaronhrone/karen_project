import React, { useContext, useEffect, useState } from 'react'
import { getAllOrders } from '../../service/apiServise';
import OrderCard from './OrderCard';
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
  const {cartItems} = useContext(cartContext);

  

  const fetchOrders = async () => {
 
      
    try {
      const { data } = await getAllOrders();
      setOrder(data);
    } catch (err) {
    console.log(err + " " + err.response?.data + " " + err.code);
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
  useEffect(() => {
    fetchOrders();
  }, []);
const remove = async (id) => {
        try {
            await removeItemFromOredr(id )
            fetchOrders();
        } catch (err) { console.log(err) };
    }
    const add = async (id) => {


        try {
            await addItemToOrder(id )
            fetchOrders();
        } catch (err) { console.log(err) };
    }
    const deleteOrder = async (id) => {
        try {
            await deleteOrderById(id);
            fetchOrders();
        } catch (err) {
       console.log(err + " " + err.response?.data + " " + err.code);
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
            fetchOrders();
            alert("ההזמנה נשלחה בהצלחה");
        }catch(err){
      console.log(err + " " + err.response?.data + " " + err.code);
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