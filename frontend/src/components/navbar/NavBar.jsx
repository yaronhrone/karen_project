import React, { useContext, useState } from 'react'
import CustomeLink from './CustomeLink';
import './NavBar.css';
import UserContext from '../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import {  getItemByName, logout } from '../../service/apiServise';
import SearchIcon from '@mui/icons-material/Search';

function NavBar() {
const {currentUser,updateCurrentUserContext ,isRequstToGetCurrentUserDone} = useContext(UserContext);
const navigate = useNavigate();
const [isOpen, setIsOpen] = useState(true);
const [search, setSearch] = useState('');
const [items, setItems] = useState([]);
const [error, setError] = useState("");
const [isSearch, setIsSearch] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
const handleLogout =()=>{
  logout();
  setTimeout(() => {
  navigate('/');
  updateCurrentUserContext(null);
  },200);
}
const toggleItem = () => {
  setIsOpen(!isOpen);
}
const handleSearch =  (e) => {
  const value = e.target.value.trim();
  setSearch(value);

     if (!value) {
      setIsSearch(false);
      setItems([]);
      return;
 }
   if (typingTimeout) clearTimeout(typingTimeout);
   const timeout = setTimeout(async () => {
     
     
     try {
       const data =  await getItemByName(value);
       setItems(data);
       console.log(data + " from apiService");
       
       setIsSearch(true);
      } catch (error) {
        console.log(error);
        if (error.response?.status === 400 || error.response?.status === 500) {
          setError(error.response.data);
        }
      }
    },500);
    setTypingTimeout(timeout);
    };

  return (
 
        <div className='links'>
 <div className='products' >
  <p onClick={toggleItem}   className='item'><ArrowDropDownIcon/> מוצרים</p>
<div className= {`items${isOpen ? '_Close' : '_Open'}`} onMouseLeave={toggleItem}>
<CustomeLink to={'/chocolates'}>פרלינים</CustomeLink>
<CustomeLink to={'/cakes'}>עוגות</CustomeLink>
<CustomeLink to={'/cookies'}>עוגיות</CustomeLink>
</div>
<div 
  className='search-area'
  onMouseLeave={() => setIsSearch(false)}
>
<div  className='search'>
  <input type="text" placeholder='...חיפוש' onChange={handleSearch} onFocus={() =>  items?.length > 0 && setIsSearch(true)} value={search}/><SearchIcon className='icon_search'/>
</div>
<div className= {`items_search ${isSearch ? ' Open' : ' Close'}`} >
  {error && <p>{error}</p>}
{items?.length > 0 &&  items.map((item) => (
  <p key={item.id} onClick={() => {  setSearch('');
  setIsSearch(false); setItems([]); navigate(`/search/${item.id}`);} } className='item_info'> {item.name} , {item.price}$ מחיר </p>
))
}
</div>
</div>
</div>
<div className='auth '>

<CustomeLink to={'/favorite'}>מועדפים</CustomeLink>
<CustomeLink to={'/order'}>הזמנות</CustomeLink>
</div>
{( isRequstToGetCurrentUserDone && !currentUser ) && 
<div className='auth'>
<CustomeLink to={'/login'}>כניסה</CustomeLink>
<CustomeLink to={'/register'}>הרשמה</CustomeLink>
 </div>
}
{(currentUser && isRequstToGetCurrentUserDone) && 
<div className='auth'>

<CustomeLink to={'/'} onClick={handleLogout}>התנתק</CustomeLink>
{currentUser?.role?.includes('ADMIN') && <CustomeLink to={'/admin'}>מנהל</CustomeLink>}
</div>
}
{!isRequstToGetCurrentUserDone && <div style={{color:'black'}}>Loading...
 </div>
}
    </div>

  )
}

export default NavBar