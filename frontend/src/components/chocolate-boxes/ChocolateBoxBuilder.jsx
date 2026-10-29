import React, { useEffect, useMemo, useState } from 'react';
import { getAllChocolate } from '../../service/apiService';
import { CHOCOLATE_BOXES, DEMO_CHOCOLATES, boxCells } from '../../config/chocolateBoxes';
import Modal from '../common/Modal';
import ImageLightbox from '../common/ImageLightbox';
import './ChocolateBoxBuilder.css';

// Prototype of the new chocolates page: 1) pick a box, 2) click a square,
// 3) pick a chocolate for it. The same chocolate can fill any number of
// squares. NOT connected to ordering yet - see the final button.

const CATALOG_PAGE_SIZE = 100;

// The catalog is fetched, not trusted: drop rows we cannot identify or label
// and keep the first of any repeated id (counts and React keys depend on it).
const usableChocolates = (rows) => {
  const seen = new Set();
  return (Array.isArray(rows) ? rows : []).filter((c) => {
    if (!c || c.id == null || !c.name || seen.has(c.id)) return false;
    seen.add(c.id);
    return true;
  });
};

const Swatch = ({ item, className = '' }) => {
  const [broken, setBroken] = useState(false);
  if (item.image && !broken) {
    return <img className={`box-builder-swatch ${className}`} src={item.image} alt={item.name} onError={() => setBroken(true)} />;
  }
  return <span className={`box-builder-swatch ${className}`} style={{ background: item.color || 'var(--color-accent-hover)' }} aria-hidden="true" />;
};

// `preview` draws the squares as plain decoration (used inside a box card,
// which is itself a button - interactive squares there would nest buttons).
function BoxPreview({ box, slots, onSlotClick, preview = false }) {
  let squareIndex = 0;
  return (
    <span className={`box-builder-tray ${preview ? 'box-builder-tray-small' : ''}`}>
      <span className="box-builder-grid" style={{ gridTemplateColumns: `repeat(${box.cols}, 1fr)` }}>
        {boxCells(box).map((isSquare, cell) => {
          if (!isSquare) return <span key={`gap-${cell}`} aria-hidden="true" />;
          const i = squareIndex++;
          const chocolate = slots ? slots[i] : null;
          const className = `box-builder-slot ${chocolate ? 'box-builder-slot-filled' : ''}`;
          if (preview) {
            return <span key={i} className={className} aria-hidden="true" />;
          }
          return (
            <button
              key={i}
              type="button"
              className={className}
              onClick={() => onSlotClick(i)}
              aria-label={chocolate ? `ריבוע ${i + 1}: ${chocolate.name}` : `ריבוע ${i + 1}: ריק`}
            >
              {chocolate ? <Swatch item={chocolate} /> : <span className="box-builder-plus">+</span>}
            </button>
          );
        })}
      </span>
    </span>
  );
}

function PickCard({ chocolate, onChoose, onEnlarge }) {
  const [showInfo, setShowInfo] = useState(false);
  return (
    <div className="box-builder-pick-card">
      {chocolate.image ? (
        <button type="button" className="box-builder-pick-image" onClick={() => onEnlarge(chocolate)} aria-label={`הגדלת התמונה של ${chocolate.name}`}>
          <Swatch item={chocolate} />
        </button>
      ) : (
        <Swatch item={chocolate} />
      )}
      <span className="box-builder-pick-name">{chocolate.name}</span>
      {chocolate.description && (
        <>
          <button type="button" className="box-builder-pick-more" aria-expanded={showInfo} onClick={() => setShowInfo((v) => !v)}>
            {showInfo ? 'פחות' : 'עוד מידע'}
          </button>
          {showInfo && <span className="box-builder-pick-desc">{chocolate.description}</span>}
        </>
      )}
      <button type="button" className="btn btn-primary box-builder-pick-choose" onClick={() => onChoose(chocolate)} aria-label={`בחירת ${chocolate.name}`}>
        בחירה
      </button>
    </div>
  );
}

function ChocolateBoxBuilder() {
  const [chocolates, setChocolates] = useState([]);
  const [isDemo, setIsDemo] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [box, setBox] = useState(null);
  const [slots, setSlots] = useState([]);
  const [activeSlot, setActiveSlot] = useState(null);
  const [enlarged, setEnlarged] = useState(null);

  useEffect(() => {
    let ignore = false;
    getAllChocolate(1, CATALOG_PAGE_SIZE)
      .then(({ data }) => {
        if (ignore) return;
        const usable = usableChocolates(data);
        if (usable.length > 0) {
          setChocolates(usable);
        } else {
          setChocolates(DEMO_CHOCOLATES);
          setIsDemo(true);
        }
      })
      // A failed request is not "no chocolates": never show demo products as if
      // they were real during an outage.
      .catch(() => { if (!ignore) setLoadFailed(true); });
    return () => { ignore = true; };
  }, []);

  const chooseBox = (b) => { setBox(b); setSlots(Array(b.size).fill(null)); };
  const backToBoxes = () => { setBox(null); setSlots([]); setActiveSlot(null); };

  const setSlot = (value) => {
    setSlots((prev) => prev.map((s, i) => (i === activeSlot ? value : s)));
    setActiveSlot(null);
  };

  const { filled, counts } = useMemo(() => {
    const map = new Map();
    let total = 0;
    slots.forEach((c) => {
      if (!c) return;
      total += 1;
      map.set(c.id, { item: c, qty: (map.get(c.id)?.qty || 0) + 1 });
    });
    return { filled: total, counts: [...map.values()] };
  }, [slots]);

  const catalogNote = isDemo && (
    <p className="box-builder-demo">דוגמה: עדיין אין פרלינים בקטלוג, מוצגים פרלינים לדוגמה</p>
  );
  const errorNote = loadFailed && (
    <p className="box-builder-error" role="alert">לא הצלחנו לטעון את הפרלינים כרגע. נסו לרענן את העמוד.</p>
  );

  if (!box) {
    return (
      <div className="box-builder-page" dir="rtl">
        <h1 className="title">בחרו מארז</h1>
        <p className="box-builder-sub">קודם בוחרים את גודל המארז, ואז ממלאים אותו בפרלינים שאתם אוהבים</p>
        {catalogNote}
        {errorNote}
        <div className="box-builder-boxes">
          {CHOCOLATE_BOXES.map((b) => (
            <button key={b.size} type="button" className="box-builder-box-card" onClick={() => chooseBox(b)}>
              {b.image
                ? <img className="box-builder-photo" src={b.image} alt="" />
                : <BoxPreview box={b} preview />}
              <h3>{b.label}</h3>
              <span className="box-builder-price">₪{b.price}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="box-builder-page" dir="rtl">
      <button type="button" className="box-builder-back" onClick={backToBoxes}>בחירת מארז אחר</button>
      <h1 className="title">{box.label}</h1>
      <p className="box-builder-sub">לחצו על ריבוע כדי לבחור פרלין. אפשר לבחור את אותו פרלין כמה פעמים.</p>
      {catalogNote}
      {errorNote}

      <BoxPreview box={box} slots={slots} onSlotClick={setActiveSlot} />

      <div className="box-builder-summary">
        <div className="box-builder-progress">{filled} / {box.size} פרלינים</div>
        {counts.length > 0 && (
          <ul className="box-builder-counts">
            {counts.map(({ item, qty }) => (
              <li key={item.id}><Swatch item={item} className="box-builder-swatch-sm" /> {item.name} <bdi>× {qty}</bdi></li>
            ))}
          </ul>
        )}
        <div className="box-builder-total">מחיר המארז: <strong>₪{box.price}</strong></div>
        <button
          type="button"
          className="btn btn-primary"
          disabled={filled < box.size}
          title="בגרסת הדוגמה הכפתור עדיין לא מוסיף להזמנה"
        >
          {filled < box.size ? `עוד ${box.size - filled} פרלינים להשלמת המארז` : 'הוספה להזמנה (דוגמה)'}
        </button>
      </div>

      <Modal
        isOpen={activeSlot !== null}
        onClose={() => { if (!enlarged) setActiveSlot(null); }}
        title="בחרו פרלין"
      >
        <div className="box-builder-picker">
          {chocolates.map((c) => (
            <PickCard key={c.id} chocolate={c} onChoose={setSlot} onEnlarge={setEnlarged} />
          ))}
          {activeSlot !== null && slots[activeSlot] && (
            <button type="button" className="btn btn-ghost" onClick={() => setSlot(null)}>הסרת הפרלין מהריבוע</button>
          )}
        </div>
      </Modal>

      {enlarged && <ImageLightbox src={enlarged.image} alt={enlarged.name} onClose={() => setEnlarged(null)} />}
    </div>
  );
}

export default ChocolateBoxBuilder;
