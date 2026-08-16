import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserContext from './contexts/UserContext';
import ChocolateList from './components/chocolate-list/ChocolateList';
import CakeList from './components/cake-list/CakeList';
import Home from './components/home/Home';
import NavBar from './components/navbar/NavBar';
import Login from './components/login/Login';
import Order from './components/order/Order';
import Register from './components/register/Register';
import NotFound from './components/not found/NotFound';
import Favorite from './components/Favorite/Favorite';
import { fetchCurrentUser } from './service/apiServise';
import CookieList from './components/cookie-list/CookieList';
import Admin from './components/admin/Admin';
import Footer from './components/footer/Footer';
import SearchPage from './components/searchPage/SearchPage';
import Header from './components/header/Header';
import { CartProvider } from './contexts/CartContext';



function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isRequstToGetCurrentUserDone, setIsRequstToGetCurrentUserDone] = useState(false);
  const updateCurrentUserContext = (user) => {
    console.log(user + " user update");

    setCurrentUser(user);
  };
  const getCurrentUserforContext = async () => {
    try {
      if (localStorage.getItem('token')) {
        const { data } = await fetchCurrentUser();
        updateCurrentUserContext(data);


      }
    } catch (error) {
      console.log(error);
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
                <Route path="/register" element={<Register />} />
                <Route path="*" element={<NotFound />} />
                <Route path="/admin/*" element={<Admin />} />
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
