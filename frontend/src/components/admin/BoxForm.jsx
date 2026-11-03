import React, { useMemo, useRef, useState } from 'react';
import { BoxPreview } from '../chocolate-boxes/ChocolateBoxBuilder';
import '../chocolate-boxes/ChocolateBoxBuilder.css';
import StockField from './StockField';
import { buildBox, emptyBoxForm, formFromBox, heartTemplateForm, resizeCells } from './boxFormModel';

// "הוספת מארז" / editing a box: its name, how many chocolates, price, shape and
// photo. The shape decides how the customer's builder draws and fills the box.
// onSave(formData) sends it (create, or update when `initial` is a saved box)
// and rejects with the server's error, which is shown here under the button.
function BoxForm({ initial = null, onSave, onCancel }) {
  const [form, setForm] = useState(() => (initial ? formFromBox(initial) : emptyBoxForm()));
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const fileInput = useRef(null);
  const set = (changes) => setForm((prev) => ({ ...prev, ...changes }));

  const built = useMemo(() => buildBox(form), [form]);
  const free = form.shapeType === 'free';
  const num = (key) => (e) => set({ [key]: e.target.value });

  const setGridSize = (rows, cols) => {
    const r = Math.max(1, Math.min(12, Number(rows) || 1));
    const c = Math.max(1, Math.min(12, Number(cols) || 1));
    set({ freeRows: r, freeCols: c, cells: resizeCells(form.cells, r, c) });
  };
  const toggleCell = (r, c) => set({ cells: form.cells.map((row, i) => (i === r ? row.map((on, j) => (j === c ? !on : on)) : row)) });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) return setError('יש למלא שם למארז');
    if (built.problem) return setError(built.problem);
    const price = Number(form.price);
    if (form.price === '' || !(price > 0)) return setError('המחיר חייב להיות גדול מ-0');
    if (form.stock !== null && (!Number.isInteger(form.stock) || form.stock < 0)) return setError('המלאי חייב להיות מספר שלם, 0 או יותר');
    if (!initial && !file) return setError('יש להעלות תמונה');
    if (file && !(file instanceof File)) return setError('הקובץ לא תקין, יש לבחור תמונה');

    const data = new FormData();
    if (file) data.append('file', new File([file], 'upload.jpg', { type: file.type || 'image/jpeg' }));
    data.append('item', new Blob([JSON.stringify({
      ...(initial ? { id: initial.id } : {}),
      name: form.name.trim(),
      category: `chocolate-box-${built.size}`,
      description: `מארז של ${built.size} פרלינים`,
      price,
      veg: false,
      stock: form.stock,
      layout: JSON.stringify(built.layout),
    })], { type: 'application/json' }));
    setSaving(true);
    try {
      await onSave(data, form.name.trim());
      if (!initial) {
        setForm(emptyBoxForm());
        setFile(null);
        if (fileInput.current) fileInput.current.value = '';
      }
    } catch (err) {
      setError((err.response && typeof err.response.data === 'string' && err.response.data) || 'לא הצלחנו לשמור את המארז. נסו שוב.');
    }
    setSaving(false);
  };

  return (
    <form onSubmit={submit} className="form_item box-form">
      {!initial && <h2 className="tital">הוספת מארז</h2>}
      <input type="text" placeholder="שם המארז" value={form.name} onChange={(e) => set({ name: e.target.value })} />

      <label className="box-form-field">
        <span className="stock-title">צורה</span>
        <select value={form.shapeType} onChange={(e) => set({ shapeType: e.target.value })}>
          <option value="grid">מרובע - שורות ועמודות</option>
          <option value="floors">כמה קומות</option>
          <option value="free">ציור חופשי (למשל לב)</option>
        </select>
      </label>

      {!free && (
        <label className="box-form-field">
          <span className="stock-title">כמות פרלינים</span>
          <input type="number" inputMode="numeric" min="1" max="100" value={form.count} onChange={num('count')} />
        </label>
      )}
      {form.shapeType === 'floors' && (
        <label className="box-form-field">
          <span className="stock-title">מספר קומות</span>
          <input type="number" inputMode="numeric" min="2" value={form.floors} onChange={num('floors')} />
        </label>
      )}
      {!free && (
        <label className="box-form-field">
          <span className="stock-title">{form.shapeType === 'floors' ? 'עמודות בכל קומה' : 'עמודות בכל שורה'}</span>
          <input type="number" inputMode="numeric" min="1" value={form.cols} onChange={num('cols')} />
        </label>
      )}

      {free && (
        <div className="box-form-free">
          <div className="box-form-free-size">
            <label className="box-form-field">
              <span className="stock-title">שורות</span>
              <input type="number" inputMode="numeric" min="1" max="12" value={form.freeRows} onChange={(e) => setGridSize(e.target.value, form.freeCols)} />
            </label>
            <label className="box-form-field">
              <span className="stock-title">עמודות</span>
              <input type="number" inputMode="numeric" min="1" max="12" value={form.freeCols} onChange={(e) => setGridSize(form.freeRows, e.target.value)} />
            </label>
          </div>
          <p className="stock-hint">לחצו על ריבוע כדי להדליק או לכבות אותו. הריבועים הדלוקים הם המקומות לפרלינים.</p>
          <div className="shape-grid" style={{ gridTemplateColumns: `repeat(${form.freeCols}, minmax(0, 40px))` }}>
            {form.cells.map((row, r) => row.map((on, c) => (
              <button
                key={`${r}-${c}`}
                type="button"
                className={`shape-cell ${on ? 'shape-cell-on' : ''}`}
                aria-pressed={on}
                aria-label={`שורה ${r + 1}, עמודה ${c + 1}`}
                onClick={() => toggleCell(r, c)}
              />
            )))}
          </div>
          <label className="box-form-check">
            <input type="checkbox" checked={form.heart} onChange={(e) => set({ heart: e.target.checked })} />
            מסגרת בצורת לב
          </label>
          <button type="button" className="btn btn-ghost" onClick={() => setForm(heartTemplateForm(form))}>תבנית לב של 22</button>
          <p className="box-form-count">כמות פרלינים: <strong>{built.size || 0}</strong></p>
        </div>
      )}

      <div className="box-form-preview" aria-label="תצוגה של הצורה">
        {built.problem
          ? <p className="stock-hint">{built.problem}</p>
          : <BoxPreview box={{ ...built.layout, size: built.size }} preview />}
      </div>

      <label className="box-form-field">
        <span className="stock-title">מחיר</span>
        <input type="number" inputMode="decimal" min="0" step="0.01" value={form.price} onChange={num('price')} />
      </label>
      <StockField value={form.stock} onChange={(e) => set({ stock: e.target.value === '' ? null : parseInt(e.target.value, 10) })} />
      <label className="box-form-field">
        <span className="stock-title">תמונה{initial ? ' (להחלפה)' : ''}</span>
        <input type="file" accept="image/*" ref={fileInput} onChange={(e) => setFile(e.target.files[0] || null)} />
      </label>

      {error && <p className="admin-error" role="alert">{error}</p>}
      <div className="box-form-buttons">
        <button className="btn" type="submit" disabled={saving}>{initial ? 'שמירה' : 'הוספת מארז'}</button>
        {onCancel && <button className="btn btn-ghost" type="button" onClick={onCancel}>ביטול</button>}
      </div>
    </form>
  );
}

export default BoxForm;
