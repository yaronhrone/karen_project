import React, { useState } from 'react'
import { deltedUser, fetchAllUsers, getAllOrderByEmail } from '../../service/apiServise';
import OrderFinish from '../order/OrderFinish';
import './Admin.css';

function AdminUsers() {
    const [userOrder, setUserOrder] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUserEmail, setSelectedUserEmail] = useState('');
    const [pageUser, setPageUser] = useState(1);
    const [error, setError] = useState('');

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
    const deleteUser = async (email) => {
        if (!window.confirm(`למחוק את המשתמש ${email}? הפעולה בלתי הפיכה.`)) {
            return;
        }
        try {
            await deltedUser(email);
            setUsers(prev => prev.filter(user => user.email !== email));
        } catch (error) {
            console.log(error);
            if (error.response?.status === 400 || error.response?.status === 500) {
                setError(error.response.data);
            }
        }
    }

    return (
        <div className='users_container'>
            {error && <p>{error}</p>}
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
    )
}

export default AdminUsers
