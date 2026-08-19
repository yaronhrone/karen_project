import React, { useContext, useEffect, useState } from 'react'
import UserContext from '../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { advanceOrderStatus, createItem, deleteItemById, deltedUser, fetchAllUsers, getActiveOrders, getAllItems, getAllOrderByEmail, updateItem } from '../../service/apiServise';
import CardItem from '../card/CardItem';
import './Admin.css';
import OrderFinish from '../order/OrderFinish';
import { getOrderStatusLabel } from '../../utils/orderStatus';

// RECEIVED -> IN_PROGRESS -> READY, the same 3-stage flow OrderService
// enforces server-side (advanceOrderStatus there rejects anything else).
const NEXT_STATUS = {
    RECEIVED: 'IN_PROGRESS',
    IN_PROGRESS: 'READY',
};

function Admin() {
    const { currentUser, isRequstToGetCurrentUserDone } = useContext(UserContext);
    const navigate = useNavigate();
    const isAdmin = currentUser?.role?.includes('ADMIN');
    const [userOrder, setUserOrder] = useState([]);
    const [activeOrders, setActiveOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUserEmail, setSelectedUserEmail] = useState('');
    const [pageUser, setPageUser] = useState(1);
    const [pageItem, setPageItem] = useState(1);
    const [updateId, setUpdateId] = useState(null);
    const [error, setError] = useState('');
    const [item, setItem] = useState([]);
    const [file, setFile] = useState(null);
    const [itemsFrom, setItemsFrom] = useState({
        name: '',
        description: '',
        price: 0,
        image: file,
        category: '',
        veg: false,

    });

    const handelItems = async () => {
        try {
            const { data } = await getAllItems(pageItem);
            setPageItem(prev => prev + 1);
            setItem(prev => [...prev, ...data]);
        } catch (error) {
            console.log(error);
            if (error.response?.status === 400 || error.response?.status === 500) {
                setError(error.response.data);
            }
        }
    }
    const handelUsers = async () => {
        try {
            const { data } = await fetchAllUsers(pageUser);
            setPageUser(prev => prev + 1);
            setUsers(prev => [...prev, ...data]);
        } catch (error) {
            console.log(error);
            if (error.response?.status === 400 || error.response?.status === 500) {
                setError(error.response.data);
            }
        }
    }
    const handelOrderUser = async (email) => {
        try {
            const { data } = await getAllOrderByEmail(email);
            setSelectedUserEmail(email);

            setUserOrder(data);
        } catch (error) {
            console.log(error);
            if (error.response?.status === 400 || error.response?.status === 500) {
                setError(error.response.data);
            }
        }
    }
    const loadActiveOrders = async () => {
        try {
            const { data } = await getActiveOrders();
            setActiveOrders(data);
        } catch (error) {
            console.log(error);
            if (error.response?.status === 400 || error.response?.status === 500) {
                setError(error.response.data);
            }
        }
    }
    const handleAdvanceStatus = async (order) => {
        const nextStatus = NEXT_STATUS[order.status];
        if (!nextStatus) {
            return;
        }
        try {
            await advanceOrderStatus(order.id, nextStatus);
            // READY orders drop out of the inbox entirely (no longer
            // "active"), so just reload rather than patch the one row.
            loadActiveOrders();
        } catch (error) {
            console.log(error);
            if (error.response?.status === 400 || error.response?.status === 500) {
                setError(error.response.data);
            }
        }
    }
    // Loads as soon as the admin check passes, not only after a click - so
    // Keren sees right away whether there's a new order waiting.
    useEffect(() => {
        if (isAdmin) {
            loadActiveOrders();
        }
    }, [isAdmin]);
    const handleCreateItem = async (e) => {
        e.preventDefault();
        if (!file || !itemsFrom.name || !itemsFrom.description || !itemsFrom.price || !itemsFrom.category) {
            setError('All fields are required');
            return;
        }
        const formData = new FormData();
if (!file instanceof File) {
    setError('Invalid file');
    return;
}
        const realFile = new File([file], "upload.jpg", { type: file.type || "image/jpeg" });
console.log(realFile + "file ");

        formData.append('file', realFile);
        formData.append('item', new Blob([JSON.stringify({
            name: itemsFrom.name.trim(),
            category: itemsFrom.category.trim(),
            description: itemsFrom.description.trim(),
            price: Number(itemsFrom.price),
            veg: itemsFrom.veg
        })], { type: 'application/json' }));
        for (const [key, value] of formData.entries()) {
              if (value instanceof Blob && value.type === "application/json") {
    value.text().then(text => console.log(key, text));
  } else {
    console.log(key, value);
  }
        }
        try {


            await createItem(formData);
            setItemsFrom({
                name: '',
                description: '',
                price: 0,
                image: null,
                category: '',
                veg: false
            });
            setItem([]);
            setPageItem(1);
            handelItems();

        } catch (error) {
            console.log(error);
            if (error.response?.status === 400 || error.response?.status === 500) {
                setError(error.response.data);
            }
            if (error.code === "ERR_NETWORK") {
                setError("שגיאת רשת: בדוק/י את החיבור לאינטרנט ונסה/י שוב.");
            }
        }
    };
    const deleteItem = async (id) => {
        try {
            await deleteItemById(id);
            setItem(item.filter(item => item.id !== id));
        } catch (error) {
            console.log(error);
            if (error.response?.status === 400 || error.response?.status === 500) {
                setError(error.response.data);
            }
        }
    }
    const toggleupdate = (id) => {
        setUpdateId(id === updateId ? null : id);
        const itemToEdite = item.find(item => item.id === id);
        if (itemToEdite) {
            setItemsFrom({ ...itemToEdite })
        };
    };
    const updateItemId = async (e) => {
        e.preventDefault();
        try {
            await updateItem({ ...itemsFrom, id: updateId });
            setItem(prev => prev.map(i => i.id === updateId ? { ...itemsFrom, id: updateId } : i));
            setUpdateId(null);
        } catch (error) {
            console.log(error);
            if (error.response?.status === 400 || error.response?.status === 500) {
                setError(error.response.data);
            }
        };
    }
    const deleteUser = async (email) => {
        try {
            const { data } = await deltedUser(email);
            setUsers(prev => prev.filter(user => user.email !== email));
        } catch (error) {
            console.log(error);
            if (error.response?.status === 400 || error.response?.status === 500) {
                setError(error.response.data);
            }
        }
    }

    if (!isRequstToGetCurrentUserDone) {
        return <div>Loading...</div>;
    }
    if (!isAdmin) {
        return (<div className='center'>
            <h2>Unauthorized Access</h2>
            <h3>You need to login to access this page.</h3>
            <button className='login-btn' onClick={() => navigate("/login")}>Login</button>
        </div>
        )
    }
    return (
        <div className='admin'>
            <h2 className='tital'>Admin page</h2>
            {error && <p>{error}</p>}

            <div className='active_orders_container'>
                <h2 className='tital'>הזמנות פעילות</h2>
                {activeOrders.length === 0
                    ? <p>אין הזמנות פעילות כרגע</p>
                    : activeOrders.map(order => (
                        <div key={order.id}>
                            <OrderFinish order={order} />
                            {NEXT_STATUS[order.status] && (
                                <button className='btn' type='button' onClick={() => handleAdvanceStatus(order)}>
                                    העבר ל"{getOrderStatusLabel(NEXT_STATUS[order.status])}"
                                </button>
                            )}
                        </div>
                    ))}
            </div>

            <form onSubmit={handleCreateItem} className='form_item'>
                <h2 className='tital'>הוספת מוצר</h2>
                <input type="text" placeholder="שם במוצר" value={itemsFrom.name} onChange={(e) => setItemsFrom({ ...itemsFrom, name: e.target.value })} />
                <input type="text" placeholder="תיאור" value={itemsFrom.description} onChange={(e) => setItemsFrom({ ...itemsFrom, description: e.target.value })} />
                <input type="number" placeholder="מחיר" value={itemsFrom.price} onChange={(e) => setItemsFrom({ ...itemsFrom, price: parseFloat(e.target.value) })} />
                <input type="file" placeholder="העלאת תמונה"   accept="image/*"  onChange={(e) => setFile(  e.target.files[0] )} />
                <select value={itemsFrom.category} onChange={(e) => setItemsFrom({ ...itemsFrom, category: e.target.value })}>
                    <option value="">בחר קטגוריה</option>
                    <option value="chocolate">שוקולד</option>
                    <option value="cake">עוגה</option>
                    <option value="cookie">עוגיה</option>
                </select>
                <label>
                    Veg:
                    <input type="checkbox" checked={itemsFrom.veg} onChange={(e) => setItemsFrom({ ...itemsFrom, veg: e.target.checked })} />
                </label>
                <button className='btn' type="submit">Add Item</button>
            </form>
            <h2 className='tital'>מוצרים</h2>
            <div className='items_container'>

                {item.length > 0 && item.map(item => (
                    <div key={item.id} >
                        <CardItem item={item} />
                        <button className='btn' type='button' onClick={() => deleteItem(item.id)}>Delete</button>
                        <button className='btn' type='button' onClick={() => toggleupdate(item.id)}>
                            {updateItemId === item.id ? 'Cancel' : 'Update'}
                        </button>
                        {updateId === item.id && (
                            <form onSubmit={updateItemId} className='form_item'>

                                <input type="text" placeholder="Name" value={itemsFrom.name} onChange={(e) => setItemsFrom({ ...itemsFrom, name: e.target.value })} />
                                <input type="text" placeholder="Description" value={itemsFrom.description} onChange={(e) => setItemsFrom({ ...itemsFrom, description: e.target.value })} />
                                <input type="number" placeholder="Price" value={itemsFrom.price} onChange={(e) => setItemsFrom({ ...itemsFrom, price: parseFloat(e.target.value) })} />
                                <input type="file" placeholder="Upload Image" onChange={(e) => setFile({ image: e.target.files[0] })} />
                                <select value={itemsFrom.category} onChange={(e) => setItemsFrom({ ...itemsFrom, category: e.target.value })}>
                                    <option value="">Select Category</option>
                                    <option value="chocolate">Chocolate</option>
                                    <option value="cake">Cake</option>
                                    <option value="cookie">Cookie</option>
                                </select>
                                <label>  Veg:  <input className='veg' type="checkbox" checked={itemsFrom.veg} onChange={(e) => setItemsFrom({ ...itemsFrom, veg: e.target.checked })} /> </label>
                                <button className='btn' type="submit">Save</button>
                            </form>

                        )}
                    </div>
                ))}

            </div>
            <button className='btn' onClick={handelItems}>קבל מוצרים</button>
            <div className='users_container'>
                <h2 className='tital'>משתמשים</h2>
                {users.map(user => (
                    <div key={user.id}>
                        <p> First Name: {user.first_name} </p><p> Last Name: {user.last_name} </p><p> Email: {user.email} </p><p>  Role: {user.role} </p><p>  Id: {user.id}</p>
                        <button className='btn' type='button' onClick={() => handelOrderUser(user.email)}>Get orders</button>
                        <button className='btn' type='button' onClick={() => deleteUser(user.email)}>Delete</button>
                    </div>
                ))}
                <button className='btn' onClick={handelUsers}>קבל משתמשים</button>

                {(selectedUserEmail.length > 0 && userOrder.length <= 0) && <h2>{selectedUserEmail} don't have orders</h2>}
                {userOrder.length > 0
                    && <div >
                        <h2>Orders for {selectedUserEmail}</h2>
                        {userOrder.map(order => (
                            <OrderFinish order={order} key={order.id} />
                        ))}
                    </div>}
            </div>

        </div>
    )
}

export default Admin