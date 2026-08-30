import React from 'react'
import CustomeLink from '../navbar/CustomeLink';
import './Admin.css';

// Reuses CustomeLink - the same active-link component every other nav in the
// app already uses (useMatch + .active class) - rather than a second,
// duplicate nav-link implementation just for this tab bar.
function AdminNav() {
    return (
        <div className='admin-nav'>
            <CustomeLink to="/admin/orders">הזמנות</CustomeLink>
            <CustomeLink to="/admin/products">מוצרים</CustomeLink>
            <CustomeLink to="/admin/users">משתמשים</CustomeLink>
        </div>
    )
}

export default AdminNav
