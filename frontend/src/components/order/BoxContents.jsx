import React, { useState } from 'react';

// "The chocolates inside" button of a chocolate box line in an order or cart.
// composition: [{ id, name, quantity }]. Renders nothing for ordinary lines.
function BoxContents({ composition }) {
    const [open, setOpen] = useState(false);
    if (!Array.isArray(composition) || composition.length === 0) {
        return null;
    }
    return (
        <div className='box-contents'>
            <button type='button' className='btn btn-ghost' aria-expanded={open} onClick={() => setOpen((v) => !v)}>
                {open ? 'הסתרת הפרלינים' : 'הפרלינים שבפנים'}
            </button>
            {open && (
                <ul>
                    {composition.map((c) => (
                        <li key={c.id}>
                            <span className='box-line'>
                                <strong className='box-qty'>{c.quantity}</strong>
                                <span aria-hidden='true'>×</span>
                                <span>{c.name}</span>
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default BoxContents;
