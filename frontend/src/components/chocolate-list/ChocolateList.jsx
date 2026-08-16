import React, { useContext, useEffect, useState } from 'react'
import './ChocolateList.css';
import { addItemToOrder, getAllChocolate, getAllFavoriteItems } from '../../service/apiServise';
import UserContext from '../../contexts/UserContext';
import { FavoriteContext } from '../../contexts/FavoriteContext';
import CardChocolate from '../card/CardChocolate';
import { cartContext } from '../../contexts/CartContext';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { isDisabled } from '@testing-library/user-event/dist/utils';
import Modal from '../modal/Modal';


function ChocolateList() {
  const { currentUser, isRequstToGetCurrentUserDone } = useContext(UserContext);
  const [chocolates, setChocolates] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [page, setPage] = useState(1);
  const { favorites: favoriteItems } = useContext(FavoriteContext);
  const [chocolateList, setChocolateList] = useState([]);
  const packageSizes = [30, 22, 12, 9, 6, 5];
  const [removedItemIdState, setRemovedItemId] = useState([]);
  const { cartItems, addToCart, removeFromCart } = useContext(cartContext);
  const [errorFromServer, setErrorFromServer] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const getChocolates = async () => {
    try {
      if (currentUser && isRequstToGetCurrentUserDone) {
        const { data: fav } = await getAllFavoriteItems();

        setFavorites(fav.map(fav => fav.id));
      } else {
        setFavorites(favoriteItems);
      }

      const { data } = await getAllChocolate(page, 20);
      setChocolates([...chocolates, ...data]);
      setPage(page + 1);
    }
    catch (err) {
      console.log(err + " " + err.response?.data + " " + err.code);
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
    console.log("Added chocolate with ID:", item);
    setChocolateList([...chocolateList, item]);
    setIsModalOpen(true);

  }
  const removeFromListChocolate = (item) => {
    console.log("Removed chocolate with ID:", item);
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
    console.log(`Item with ID ${removedItemId} was removed from the list.`);
    setRemovedItemId([...removedItemIdState, removedItemId]);
    console.log(removedItemIdState);
  }

  const totalQuantity = chocolateList.reduce((sum, item) => sum + item.quantity, 0);

  const calculatePackages = (total) => {
    let remaining = total;
    const packages = [];
    for (let size of packageSizes) {
      while (remaining >= size) {
        packages.push(size);
        remaining -= size;
      }
    }
    let needToComplete = 0;
 

    if (remaining > 0) {
        
      const possiblePackages = packageSizes.filter(s => s > remaining);
      if (possiblePackages.length > 0) {
        needToComplete = Math.min(...possiblePackages) - remaining;
      } else {
        needToComplete = 0;
      }
      if (calculateOptimalCompletion(total) < needToComplete) {
        needToComplete = calculateOptimalCompletion(total);
      }
    }

    return { packages, remaining, needToComplete};
  }
  const calculateOptimalCompletion = (total) => {


    const possiblePackages = packageSizes.sort((a, b) => a - b).filter(size => size >= total);

    if (possiblePackages.length === 0) {
      return 0;
    }

    const closestPackage = possiblePackages[0];
    const needToComplete = closestPackage - total;

    return needToComplete;
  };



  const { packages, remaining, needToComplete  } = calculatePackages(totalQuantity);
  
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
      alert("ההזמנה נשלחה  לעמוד ההזמנות להמשך טיפול בהזמנה");
      setIsModalOpen(false);
      return;
    }
    for (const choc of chocolateList) {
      try {
        for (let i = 0; i < choc.quantity; i++) {
          await addItemToOrder(choc.id);
        }
      } catch (err) {
        console.log(err + " " + err.response?.data + " " + err.code);
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
    alert("ההזמנה נשלחה  לעמוד ההזמנות להמשך טיפול בהזמנה");
    setIsModalOpen(false);

  };

  useEffect(() => {
    getChocolates();
    const saved = localStorage.getItem("chocolate_list");
    if (saved) {
      setChocolateList(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    setIsModalOpen(chocolateList.length > 0);
    if (chocolateList.length === 0) {
      localStorage.removeItem("chocolate_list");
    } else {
      localStorage.setItem("chocolate_list", JSON.stringify(chocolateList));
    }
  }, [chocolateList]);

  return (

    <>
      <h1 className='title'>פרלינים</h1>
      <p>הפרלינים מגיעים במארזים של 5 \ 6 \ 9 \ 12 \ 22 \ 30   </p>
      <div className='list_chocolate'>
        {errorFromServer && <p className='error_server'>{errorFromServer}</p>}

      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="סקירת ההזמנה"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => { clearList(); setIsModalOpen(false); }}>
              נקה רשימה
            </button>
            <button className='btn' onClick={() => sendOrder()} disabled={remaining > 0}>שלח הזמנה</button>
          </>
        }
      >
        <div>
          {chocolateList.length === 0 ? (
            <p>הסל ריק</p>
          ) : (
            <>
              <p>הפרלינים מגיעים במארזים של 5 \ 6 \ 9 \ 12 \ 22 \ 30   </p>


              <ul style={{ paddingLeft: 18 }}>
                {chocolateList.map(it => (
                  <li key={it.id} style={{ marginBottom: 8 , listStyleType: "none" }}>
                    <AddIcon onClick={() => updateQuantity(it.id, 1)} className='btn_icon'>  +  </AddIcon>
                    <strong>{it.name}</strong>
                    <span>   — כמות:
                      <RemoveIcon onClick={() => updateQuantity(it.id, -1)} className='btn_icon'>  -  </RemoveIcon>
                      <span style={{ fontWeight: "bold", fontSize: "20px" }}>  {it.quantity}  </span>
                    </span>
                    <p>  מחיר: {it.price * it.quantity} </p>
                  </li>
                ))}
              </ul>



              <div style={{ marginTop: 10 }}>
                <p>סה"כ: {totalQuantity} פריטים</p>
                <p>סה"כ: {chocolateList.reduce((total, item) => total + item.price * item.quantity, 0)} ש"ח</p>
                {packages.length > 0 && <p>מארזים שנוצרו: {packages.join(", ")}</p>}
                {remaining ? (
                  <p>  חסר להשלים: {needToComplete}</p>

                ) : (
                  <p>לא ניתן להתאים לחבילה.</p>
                )}
              </div>
            </>
          )}
        </div>
      </Modal>
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
      <button className='btn' onClick={getChocolates}>עוד שוקולדים</button>

    </>

  )
}

export default ChocolateList