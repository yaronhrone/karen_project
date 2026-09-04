import React, { useContext } from 'react'
import UserContext from '../../contexts/UserContext';
import { useNavigate, Outlet } from 'react-router-dom';
import AdminNav from './AdminNav';
import './Admin.css';

// Was one 400-line monolith rendering orders/products/users all on one
// scrolling page - now a thin layout: does the auth check once, then
// AdminOrders/AdminProducts/AdminUsers each own their own page via
// nested routes (see App.js) + this <Outlet/>.
function Admin() {
    const { currentUser, isRequstToGetCurrentUserDone } = useContext(UserContext);
    const navigate = useNavigate();
    const isAdmin = currentUser?.role?.includes('ADMIN');

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
            <h2 className='tital'>דף מנהל</h2>
            <AdminNav />
            <Outlet />
        </div>
    )
}

export default Admin
