import React, { useEffect, useMemo, useState } from 'react';
import { getAllChocolate } from '../../service/apiServise';
import { CHOCOLATE_BOXES, DEMO_CHOCOLATES } from '../../config/chocolateBoxes';
import Modal from '../modal/Modal';
import './ChocolateBoxBuilder.css';

// Prototype of the new chocolates page: 1) pick a box, 2) click a square,
// 3) pick a chocolate for it. The same chocolate can fill any number of
// squares. NOT connected to ordering yet - see the final button.

const Swatch = ({ item, className = '' }) => (
  item.image
    ? <img className={`bb-swatch ${className}`} src={item.image} alt={item.name} />
    : <span className={`bb-swatch ${className}`} style={{ background: item.color || 'var(--color-accent-soft)' }} aria-hidden="true" />
);

function BoxPreview({ box, slots, onSlotClick, small = false }) {
  const style = box.image ? { backgroundImage: `url(${box.image})` } : undefined;
  return (
    <div className={`bb-tray ${small ? 'bb-tray-small' : ''}`} style={style}>
      <div className="bb-grid" style={{ gridTemplateColumns: `repeat(${box.cols}, 1fr)` }}>
        {Array.from({ length: box.size }).map((_, i) => {
          const chocolate = slots ? slots[i] : null;
          return (
            <button
              key={i}
              type="button"
              className={`bb-slot ${chocolate ? 'bb-slot-filled' : ''}`}
              tabIndex={small ? -1 : 0}
              onClick={() => onSlotClick && onSlotClick(i)}
              aria-label={chocolate ? `ריבוע ${i + 1}: ${chocolate.name}` : `ריבוע ${i + 1}: ריק`}
            >
              {chocolate ? <Swatch item={chocolate} /> : <span className="bb-plus">+</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ChocolateBoxBuilder() {
  const [chocolates, setChocolates] = useState([]);
  const [isDemo, setIsDemo] = useState(false);
  const [box, setBox] = useState(null);
  const [slots, setSlots] = useState([]);
  const [activeSlot, setActiveSlot] = useState(null);

  useEffect(() => {
    getAllChocolate(1, 100)
      .then(({ data }) => {
        if (Array.isArray(data) && data.length > 0) {
          setChocolates(data);
        } else {
          setChocolates(DEMO_CHOCOLATES);
          setIsDemo(true);
        }
      })
      .catch(() => { setChocolates(DEMO_CHOCOLATES); setIsDemo(true); });
  }, []);

  const chooseBox = (b) => { setBox(b); setSlots(Array(b.size).fill(null)); };
  const backToBoxes = () => { setBox(null); setSlots([]); setActiveSlot(null); };

  const setSlot = (value) => {
    setSlots((prev) => prev.map((s, i) => (i === activeSlot ? value : s)));
    setActiveSlot(null);
  };

  const filled = slots.filter(Boolean).length;
  const counts = useMemo(() => {
    const map = new Map();
    slots.filter(Boolean).forEach((c) => {
      map.set(c.id, { item: c, qty: (map.get(c.id) ? map.get(c.id).qty : 0) + 1 });
    });
    return [...map.values()];
  }, [slots]);

  const demoNote = isDemo && (
    <p className="bb-demo">דוגמה: עדיין אין פרלינים בקטלוג, מוצגים פרלינים לדוגמה</p>
  );

  if (!box) {
    return (
      <div className="bb-page" dir="rtl">
        <h1 className="title">בחרו מארז</h1>
        <p className="bb-sub">קודם בוחרים את גודל המארז, ואז ממלאים אותו בפרלינים שאתם אוהבים</p>
        {demoNote}
        <div className="bb-boxes">
          {CHOCOLATE_BOXES.map((b) => (
            <button key={b.size} type="button" className="bb-box-card" onClick={() => chooseBox(b)}>
              <BoxPreview box={b} small />
              <h3>{b.label}</h3>
              <span className="bb-price">₪{b.price}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bb-page" dir="rtl">
      <button type="button" className="bb-back" onClick={backToBoxes}>→ בחירת מארז אחר</button>
      <h1 className="title">{box.label}</h1>
      <p className="bb-sub">לחצו על ריבוע כדי לבחור פרלין. אפשר לבחור את אותו פרלין כמה פעמים.</p>
      {demoNote}

      <BoxPreview box={box} slots={slots} onSlotClick={setActiveSlot} />

      <div className="bb-summary">
        <div className="bb-progress">{filled} / {box.size} פרלינים</div>
        {counts.length > 0 && (
          <ul className="bb-counts">
            {counts.map(({ item, qty }) => (
              <li key={item.id}><Swatch item={item} className="bb-swatch-sm" /> {item.name} × {qty}</li>
            ))}
          </ul>
        )}
        <div className="bb-total">מחיר המארז: <strong>₪{box.price}</strong></div>
        <button
          type="button"
          className="btn btn-primary"
          disabled={filled < box.size}
          title="בגרסת הדוגמה הכפתור עדיין לא מוסיף להזמנה"
        >
          {filled < box.size ? `עוד ${box.size - filled} פרלינים להשלמת המארז` : 'הוספה להזמנה (דוגמה)'}
        </button>
      </div>

      <Modal isOpen={activeSlot !== null} onClose={() => setActiveSlot(null)} title="בחרו פרלין">
        <div className="bb-picker">
          {chocolates.map((c) => (
            <button key={c.id} type="button" className="bb-pick-card" onClick={() => setSlot(c)}>
              <Swatch item={c} />
              <span className="bb-pick-name">{c.name}</span>
              {c.description && <span className="bb-pick-desc">{c.description}</span>}
            </button>
          ))}
          {activeSlot !== null && slots[activeSlot] && (
            <button type="button" className="btn btn-ghost" onClick={() => setSlot(null)}>הסרת הפרלין מהריבוע</button>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default ChocolateBoxBuilder;
