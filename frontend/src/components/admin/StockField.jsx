import React from 'react';

// "How many are left" for any product or box. Empty = Keren does not count
// this one (it is never shown as sold out). Two lines: the name, then the field,
// then a short hint.
function StockField({ value, onChange }) {
  return (
    <label className="stock-field">
      <span className="stock-title">מלאי</span>
      <input type="number" inputMode="numeric" min="0" step="1" value={value ?? ''} onChange={onChange} />
      <span className="stock-hint">כמה יחידות יש. ריק = לא סופרים מלאי</span>
    </label>
  );
}

export default StockField;
