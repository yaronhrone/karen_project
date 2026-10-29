import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import UserContext from './contexts/UserContext';
import ChocolateBoxesPage from './components/chocolate-boxes/ChocolateBoxesPage';
import CakeList from './components/product-lists/CakeList';
import Home from './components/home/Home';
import NavBar from './components/layout/NavBar';
import Login from './components/auth/Login';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import Order from './components/order/Order';
import Register from './components/auth/Register';
import NotFound from './components/not-found/NotFound';
import Favorite from './components/favorite/Favorite';
import { fetchCurrentUser } from './service/apiService';
import CookieList from './components/product-lists/CookieList';
import Admin from './components/admin/Admin';
import AdminOrders from './components/admin/AdminOrders';
import AdminProducts from './components/admin/AdminProducts';
import AdminUsers from './components/admin/AdminUsers';
import Footer from './components/layout/Footer';
import SearchPage from './components/search-page/SearchPage';
import Header from './components/layout/Header';
import { CartProvider } from './contexts/CartContext';
import { OpenOrderProvider } from './contexts/OpenOrderContext';
import PhoneNumberPrompt from './components/auth/PhoneNumberPrompt';
import ErrorBoundary from './components/common/ErrorBoundary';
import useAutoReload from './utils/useAutoReload';



function App() {
  // Picks up new deploys in already-open tabs/installed apps - see the hook.
  useAutoReload();
  const [currentUser, setCurrentUser] = useState(null);
  const [isRequestToGetCurrentUserDone, setIsRequstToGetCurrentUserDone] = useState(false);
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
      <UserContext.Provider value={{ currentUser, updateCurrentUserContext, isRequestToGetCurrentUserDone }}>
          <CartProvider>
           <OpenOrderProvider>
            <Router>
              {/* Blocking, no skip - Google Sign-In never provides a phone
                  number, and Keren needs one to reach the customer over
                  WhatsApp. Catches every entry point (login/register/an
                  older Google account), not just right after signing up. */}
              {isRequestToGetCurrentUserDone && currentUser && !currentUser.phone && <PhoneNumberPrompt />}
              <Header />
              <NavBar />
              {/* A render crash anywhere in a routed page used to blank the
                  entire app, nav/header/footer included, with zero
                  indication anything went wrong (found this the hard way -
                  a single bad favorite or a malformed order both did
                  exactly this). Scoped to the routed content only, so a
                  crash there still leaves navigation usable. */}
              <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/chocolates" element={<ChocolateBoxesPage />} />
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
              </ErrorBoundary>
              <Footer />
            </Router>
           </OpenOrderProvider>
          </CartProvider>
      </UserContext.Provider>
    </div>
  );
}

export default App;
