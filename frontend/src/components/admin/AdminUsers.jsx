import React, { useState } from 'react'
import { deltedUser, fetchAllUsers, getAllOrderByEmail } from '../../service/apiServise';
import OrderFinish from '../order/OrderFinish';
import './Admin.css';

// USER/ADMIN are the raw role values stored in the DB - shown in Hebrew here
// same as every other status/role label in this app, never the raw value.
const ROLE_LABELS = {
    USER: 'לקוח',
    ADMIN: 'מנהל/ת',
};

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
            if (error.response?.status === 400 || error.response?.status === 500) {
                setError(error.response.data);
            }
        }
    }

    return (
        <div className='users_container'>
            {error && <p>{error}</p>}
            <h2 className='tital'>משתמשים</h2>
            {users.length > 0 && (
                <div className='users-table-wrapper'>
                    <table className='users-table'>
                        <thead>
                            <tr>
                                <th>שם פרטי</th>
                                <th>שם משפחה</th>
                                <th>אימייל</th>
                                <th>תפקיד</th>
                                <th>מזהה</th>
                                <th>פעולות</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td>{user.first_name}</td>
                                    <td>{user.last_name}</td>
                                    <td>{user.email}</td>
                                    <td>{ROLE_LABELS[user.role] || user.role}</td>
                                    <td>{user.id}</td>
                                    <td className='users-table-actions'>
                                        <button className='btn' type='button' onClick={() => handelOrderUser(user.email)}>קבל הזמנות</button>
                                        <button className='btn btn-cancel' type='button' onClick={() => deleteUser(user.email)}>מחיקה</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <button className='btn' onClick={handelUsers}>קבל משתמשים</button>

            {(selectedUserEmail.length > 0 && userOrder.length <= 0) && <h2>ל-{selectedUserEmail} אין הזמנות</h2>}
            {userOrder.length > 0
                && <div >
                    <h2>הזמנות של {selectedUserEmail}</h2>
                    {userOrder.map(order => (
                        <OrderFinish order={order} key={order.id} />
                    ))}
                </div>}
        </div>
    )
}

export default AdminUsers
