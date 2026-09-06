import React, { useContext, useEffect, useState } from 'react'
import './ChocolateList.css';
import { addItemToOrder, getAllChocolate, getAllFavoriteItems, getAllOrders } from '../../service/apiServise';
import UserContext from '../../contexts/UserContext';
import { FavoriteContext } from '../../contexts/FavoriteContext';
import CardChocolate from '../card/CardChocolate';
import { cartContext } from '../../contexts/CartContext';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';
import { calculatePackages } from '../../utils/chocolatePackaging';


function ChocolateList() {
  const { currentUser, isRequstToGetCurrentUserDone } = useContext(UserContext);
  const navigate = useNavigate();
  const [chocolates, setChocolates] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [page, setPage] = useState(1);
  const { favorites: favoriteItems } = useContext(FavoriteContext);
  const [chocolateList, setChocolateList] = useState([]);
  const [removedItemIdState, setRemovedItemId] = useState([]);
  const { cartItems, addToCart, removeFromCart } = useContext(cartContext);
  const [errorFromServer, setErrorFromServer] = useState("");
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  // Chocolates already sitting in an open (not-yet-sent) order from a
  // previous visit - the package math below needs to count these too, or
  // completing a box across two visits looked wrong (picking 2 more here
  // showed "need X more" with no idea 3 were already reserved, when the
  // true combined total may already be a complete box).
  const [existingOrderChocolateQty, setExistingOrderChocolateQty] = useState(0);
  const getChocolates = async () => {
    try {
      // Favorites are a nice-to-have (which hearts show filled) - a hiccup
      // fetching them used to throw out of this whole function and silently
      // skip the actual product fetch below, leaving the page looking empty
      // until a manual refresh. Isolated so it can never block products.
      if (currentUser && isRequstToGetCurrentUserDone) {
        try {
          const { data: fav } = await getAllFavoriteItems();
          setFavorites(fav.filter(Boolean).map(fav => fav.id));
        } catch {
          setFavorites(favoriteItems);
        }
      } else {
        setFavorites(favoriteItems);
      }

      const { data } = await getAllChocolate(page, 20);
      setChocolates([...chocolates, ...data]);
      setPage(page + 1);
    }
    catch (err) {
      if (err.response?.status == 400 || err.response?.status == 500) {
        setErrorFromServer(err.response.data);
      } if (err.code === "ERR_NETWORK") {
        setErrorFromServer("שגיאת רשת: בדוק/י את החיבור לאינטרנט ונסה/י שוב.");
      }
      setTimeout(() => {
        setErrorFromServer('');
      }, 5000);
    }
  };

  const addToListChocolate = (item) => {
    setChocolateList([...chocolateList, item]);

  }
  const removeFromListChocolate = (item) => {
    setChocolateList(chocolateList.filter(chocId => chocId.id !== item.id));
  }

  const updateQuantity = (id, delta) => {
    let removedItemId = null;

    setChocolateList(prev => {
      const updated = prev
        .map(item =>
          item.id === id ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter(item => {
          if (item.id === id && item.quantity + delta <= 0) {
            removedItemId = id;
            return false;
          }
          return true;
        });

      if (removedItemId) {
        notifyChild(removedItemId);
      }
      return updated;
    });

  };
  const notifyChild = (removedItemId) => {
    // Functional update - reads the previous state directly instead of the
    // removedItemIdState closure, which matters when notifyChild fires
    // several times in the same tick (clearList below calls it once per
    // item in a .forEach): each call in a loop would otherwise read the
    // same stale array and overwrite the previous call's result instead of
    // accumulating, so only the last cleared item actually got marked
    // removed - which is exactly why "נקה" only ever un-highlighted one card.
    setRemovedItemId(prev => [...prev, removedItemId]);
  }

  const totalQuantity = chocolateList.reduce((sum, item) => sum + item.quantity, 0);



  // Package math runs on the combined total (already-reserved + new picks
  // this session) - see the fetch effect above for why.
  const combinedChocolateQuantity = totalQuantity + existingOrderChocolateQty;
  const { packages, remaining, needToComplete } = calculatePackages(combinedChocolateQuantity);

  const clearList = () => {
    chocolateList.forEach(item => {
      notifyChild(item.id);
    });
    setChocolateList([]);
  };
  const sendOrder = async () => {

    if (currentUser === null) {
      for (const choc of chocolateList) {
        for (let i = 0; i < choc.quantity; i++) {
          addToCart(choc.id);
        }
      };
      clearList();
      // Was a browser alert() - blocks until dismissed and needs an explicit
      // click just to go away. Replaced with a brief inline green-checkmark
      // banner, then land on /order same as the logged-in path below - the
      // cart is now visible there too (as a guest cart, login required only
      // to actually send it), instead of leaving the guest stranded on the
      // catalog page with no way to see what they just added.
      setOrderConfirmed(true);
      setTimeout(() => {
        setOrderConfirmed(false);
        navigate('/order');
      }, 900);
      return;
    }
    for (const choc of chocolateList) {
      try {
        for (let i = 0; i < choc.quantity; i++) {
          await addItemToOrder(choc.id);
        }
      } catch (err) {
        if (err.response?.status == 400 || err.response?.status == 500) {
          setErrorFromServer(err.response.data);
        } if (err.code === "ERR_NETWORK") {
          setErrorFromServer("שגיאת רשת: בדוק/י את החיבור לאינטרנט ונסה/י שוב.");
        }
        setTimeout(() => {
          setErrorFromServer('');
        }, 5000);
      }
    };
    clearList();
    // The alert already promised this ("...לעמוד ההזמנות...") but nothing
    // actually navigated there - only reachable by then manually clicking
    // "הזמנות" in the navbar.
    navigate('/order');
  };

  useEffect(() => {
    getChocolates();
    const saved = localStorage.getItem("chocolate_list");
    if (saved) {
      setChocolateList(JSON.parse(saved));
    }
  }, []);

  // getChocolates() above ran once on mount, closing over whatever
  // currentUser/isRequstToGetCurrentUserDone were at that instant - the "who
  // am I" check (App.js) usually hasn't resolved yet at that point, so a
  // logged-in user landing directly here (refresh/direct link) got guest
  // favorites and it never self-corrected. Re-sync just the favorites once
  // the auth check actually resolves, same dependency Favorite.jsx already
  // uses correctly.
  useEffect(() => {
    if (!isRequstToGetCurrentUserDone) {
      return;
    }
    if (currentUser) {
      getAllFavoriteItems().then(({ data }) => setFavorites((data || []).filter(Boolean).map(fav => fav.id))).catch(() => {});
    } else {
      setFavorites(favoriteItems);
    }
  }, [currentUser, isRequstToGetCurrentUserDone]);

  useEffect(() => {
    if (chocolateList.length === 0) {
      localStorage.removeItem("chocolate_list");
    } else {
      localStorage.setItem("chocolate_list", JSON.stringify(chocolateList));
    }
  }, [chocolateList]);

  // Same "auth check resolves after mount" reasoning as the favorites
  // re-sync above - can't fetch a logged-in customer's order before we
  // actually know they're logged in.
  useEffect(() => {
    if (!isRequstToGetCurrentUserDone || !currentUser) {
      setExistingOrderChocolateQty(0);
      return;
    }
    getAllOrders().then(({ data }) => {
      const openOrder = (Array.isArray(data) ? data : []).find(o => o.status === 'OPEN');
      const items = Array.isArray(openOrder?.order_items) ? openOrder.order_items : [];
      const qty = items
        .filter(oi => oi.category === 'chocolate')
        .reduce((sum, oi) => sum + oi.quantity, 0);
      setExistingOrderChocolateQty(qty);
    }).catch(() => {
      // Not critical - the package math just falls back to counting only
      // this session's new picks, same as before this existed.
      setExistingOrderChocolateQty(0);
    });
  }, [currentUser, isRequstToGetCurrentUserDone]);

  const hasSelection = chocolateList.length > 0;

  return (
    <div className={`chocolate-page ${hasSelection ? 'with-builder' : ''}`}>
      <div className="chocolate-main">
        <h1 className='title'>פרלינים</h1>
        <p className="package-hint">הפרלינים מגיעים במארזים של 5 \ 6 \ 9 \ 12 \ 22 \ 30</p>
        {errorFromServer && <p className='error_server'>{errorFromServer}</p>}

        <div className="cart">
          {chocolates.map((chocolate) => (
            <CardChocolate
              key={chocolate.id}
              item={chocolate}
              isFavoriteDefault={favorites.includes(chocolate.id)}
              addToList={addToListChocolate}
              removeFromList={removeFromListChocolate}
              removedItemId={removedItemIdState.includes(chocolate.id)}
              click={chocolateList.some(item => item.id === chocolate.id)}
            />
          ))}
        </div>
        <div className='load-more'>
          <button className='btn' onClick={getChocolates}>עוד שוקולדים</button>
        </div>
      </div>

      {/* Persistent package-builder sidebar - replaces the old popup modal so
          it stays visible while browsing instead of interrupting each pick */}
      <aside className={`builder-sidebar ${hasSelection ? 'open' : ''}`}>
        <div className="builder-sidebar-inner">
          <h2 className="builder-title">הקופסה שלי</h2>
          <p className="builder-subtitle">הפרלינים מגיעים במארזים של 5 \ 6 \ 9 \ 12 \ 22 \ 30</p>

          {hasSelection ? (
            <>
              <ul className="builder-list">
                {chocolateList.map(it => (
                  <li key={it.id} className="builder-item">
                    <div className="builder-item-info">
                      <strong>{it.name}</strong>
                      <span className="builder-item-price">₪{it.price * it.quantity}</span>
                    </div>
                    <div className="builder-stepper">
                      <span className="stepper-btn" onClick={() => updateQuantity(it.id, -1)}><RemoveIcon fontSize="inherit" /></span>
                      <span className="stepper-qty">{it.quantity}</span>
                      <span className="stepper-btn" onClick={() => updateQuantity(it.id, 1)}><AddIcon fontSize="inherit" /></span>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="builder-summary">
                {existingOrderChocolateQty > 0 && (
                  <div className="builder-summary-row">
                    <span>כבר בהזמנה פתוחה</span>
                    <strong>{existingOrderChocolateQty}</strong>
                  </div>
                )}
                <div className="builder-summary-row">
                  <span>סה"כ פריטים חדשים</span>
                  <strong>{totalQuantity}</strong>
                </div>
                <div className="builder-summary-row">
                  <span>סה"כ לתשלום</span>
                  <strong className="builder-total">₪{chocolateList.reduce((total, item) => total + item.price * item.quantity, 0)}</strong>
                </div>
                {packages.length > 0 && (
                  <p className="builder-note builder-note-success">מארזים שנוצרו: {packages.join(", ")}</p>
                )}
                {remaining > 0 ? (
                  <p className="builder-note builder-note-pending">עוד {needToComplete} להשלמת המארז הבא</p>
                ) : (
                  packages.length === 0 && <p className="builder-note builder-note-pending">לא ניתן להתאים לחבילה</p>
                )}
              </div>

              <div className="builder-actions">
                <button className="btn btn-ghost" onClick={clearList}>
                  <CloseIcon fontSize="inherit" /> נקה
                </button>
                <button className="btn btn-primary" onClick={sendOrder} disabled={remaining > 0}>
                  שלח הזמנה
                </button>
              </div>
            </>
          ) : orderConfirmed ? (
            <div className="builder-confirmed">
              <CheckCircleIcon className="builder-confirmed-icon" />
              <p>ההזמנה נשלחה בהצלחה</p>
            </div>
          ) : (
            <p className="builder-empty">בחרו פרלינים מהרשימה כדי להתחיל להרכיב מארז</p>
          )}
        </div>
      </aside>
    </div>

  )
}

export default ChocolateList
