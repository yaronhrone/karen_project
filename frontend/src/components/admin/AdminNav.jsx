import React from 'react'
import CustomLink from '../layout/CustomLink';
import './Admin.css';

// Reuses CustomLink - the same active-link component every other nav in the
// app already uses (useMatch + .active class) - rather than a second,
// duplicate nav-link implementation just for this tab bar.
function AdminNav() {
    return (
        <div className='admin-nav'>
            <CustomLink to="/admin/orders">הזמנות</CustomLink>
            <CustomLink to="/admin/products">מוצרים</CustomLink>
            <CustomLink to="/admin/users">משתמשים</CustomLink>
        </div>
    )
}

export default AdminNav
