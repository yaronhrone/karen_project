import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import UserContext from './contexts/UserContext';
import ChocolateList from './components/chocolate-list/ChocolateList';
import CakeList from './components/cake-list/CakeList';
import Home from './components/home/Home';
import NavBar from './components/navbar/NavBar';
import Login from './components/login/Login';
import ForgotPassword from './components/login/ForgotPassword';
import ResetPassword from './components/login/ResetPassword';
import Order from './components/order/Order';
import Register from './components/register/Register';
import NotFound from './components/not found/NotFound';
import Favorite from './components/Favorite/Favorite';
import { fetchCurrentUser } from './service/apiServise';
import CookieList from './components/cookie-list/CookieList';
import Admin from './components/admin/Admin';
import AdminOrders from './components/admin/AdminOrders';
import AdminProducts from './components/admin/AdminProducts';
import AdminUsers from './components/admin/AdminUsers';
import Footer from './components/footer/Footer';
import SearchPage from './components/searchPage/SearchPage';
import Header from './components/header/Header';
import { CartProvider } from './contexts/CartContext';
import PhoneNumberPrompt from './components/phone-prompt/PhoneNumberPrompt';



function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isRequstToGetCurrentUserDone, setIsRequstToGetCurrentUserDone] = useState(false);
  const updateCurrentUserContext = (user) => {

    setCurrentUser(user);
  };
  const getCurrentUserforContext = async () => {
    try {
      if (localStorage.getItem('token')) {
        const { data } = await fetchCurrentUser();
        updateCurrentUserContext(data);


      }
    } catch (error) {
    } finally {
      setIsRequstToGetCurrentUserDone(true);
    }
  }
  useEffect(() => {
    getCurrentUserforContext();
  }, []);
  return (
    <div className="App">
      <UserContext.Provider value={{ currentUser, updateCurrentUserContext, isRequstToGetCurrentUserDone }}>
          <CartProvider>
            <Router>
              {/* Blocking, no skip - Google Sign-In never provides a phone
                  number, and Keren needs one to reach the customer over
                  WhatsApp. Catches every entry point (login/register/an
                  older Google account), not just right after signing up. */}
              {isRequstToGetCurrentUserDone && currentUser && !currentUser.phone && <PhoneNumberPrompt />}
              <Header />
              <NavBar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/chocolates" element={<ChocolateList />} />
                <Route path="/cakes" element={<CakeList />} />
                <Route path="/cookies" element={<CookieList />} />
                <Route path="/favorite" element={<Favorite />} />
                <Route path="/order" element={<Order />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/register" element={<Register />} />
                <Route path="*" element={<NotFound />} />
                <Route path="/admin" element={<Admin />}>
                  <Route index element={<Navigate to="orders" replace />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="users" element={<AdminUsers />} />
                </Route>
                <Route path='/search/:id' element={<SearchPage />} />
              </Routes>
              <Footer />
            </Router>
          </CartProvider>
      </UserContext.Provider>
    </div>
  );
}

export default App;
