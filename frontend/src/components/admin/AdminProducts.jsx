import React, { useState } from 'react'
import { createItem, deleteItemById, getAllItems, importItemsCsv, updateItem } from '../../service/apiServise';
import CardItem from '../card/CardItem';
import Modal from '../modal/Modal';
import './Admin.css';

function AdminProducts() {
    const [pageItem, setPageItem] = useState(1);
    const [updateId, setUpdateId] = useState(null);
    const [error, setError] = useState('');
    const [item, setItem] = useState([]);
    const [file, setFile] = useState(null);
    // Separate from `file` (the create form's) on purpose - sharing one
    // state let a stale File picked earlier in the create form leak into an
    // unrelated later edit that never touched the photo.
    const [updateFile, setUpdateFile] = useState(null);
    const [csvFile, setCsvFile] = useState(null);
    const [importResult, setImportResult] = useState(null);
    const [importing, setImporting] = useState(false);
    const [itemsFrom, setItemsFrom] = useState({
        name: '',
        description: '',
        price: 0,
        image: file,
        category: '',
        veg: false,

    });

    const handelItems = async () => {
        try {
            const { data } = await getAllItems(pageItem);
            setPageItem(prev => prev + 1);
            setItem(prev => [...prev, ...data]);
        } catch (error) {
            if (error.response?.status === 400 || error.response?.status === 500) {
                setError(error.response.data);
            }
        }
    }
    const handleCreateItem = async (e) => {
        e.preventDefault();
        if (!file || !itemsFrom.name || !itemsFrom.description || !itemsFrom.price || !itemsFrom.category) {
            setError('All fields are required');
            return;
        }
        if (Number(itemsFrom.price) <= 0) {
            setError('Price must be greater than 0');
            return;
        }
        const formData = new FormData();
if (!(file instanceof File)) {
    setError('Invalid file');
    return;
}
        const realFile = new File([file], "upload.jpg", { type: file.type || "image/jpeg" });

        formData.append('file', realFile);
        formData.append('item', new Blob([JSON.stringify({
            name: itemsFrom.name.trim(),
            category: itemsFrom.category.trim(),
            description: itemsFrom.description.trim(),
            price: Number(itemsFrom.price),
            veg: itemsFrom.veg
        })], { type: 'application/json' }));
        try {


            await createItem(formData);
            setItemsFrom({
                name: '',
                description: '',
                price: 0,
                image: null,
                category: '',
                veg: false
            });
            setItem([]);
            setPageItem(1);
            handelItems();

        } catch (error) {
            if (error.response?.status === 400 || error.response?.status === 500) {
                setError(error.response.data);
            }
            if (error.code === "ERR_NETWORK") {
                setError("שגיאת רשת: בדוק/י את החיבור לאינטרנט ונסה/י שוב.");
            }
        }
    };
    const handleImportCsv = async (e) => {
        e.preventDefault();
        if (!csvFile) {
            setError('בחר/י קובץ CSV קודם');
            return;
        }
        setImporting(true);
        setImportResult(null);
        try {
            const { data } = await importItemsCsv(csvFile);
            setImportResult(data);
            // Refresh the products list below so newly-imported items show
            // up without needing a manual "קבל מוצרים" click.
            setItem([]);
            setPageItem(1);
            handelItems();
        } catch (error) {
            if (error.response?.status === 400 || error.response?.status === 500) {
                setError(error.response.data);
            }
            if (error.code === "ERR_NETWORK") {
                setError("שגיאת רשת: בדוק/י את החיבור לאינטרנט ונסה/י שוב.");
            }
        }
        setImporting(false);
    };
    // Was window.confirm() - a native browser popup, not styled at all.
    // Now opens the shared Modal (same one PhoneNumberPrompt already uses)
    // instead - deleteTarget holds the pending item's id while it's open.
    const [deleteTarget, setDeleteTarget] = useState(null);
    const confirmDelete = async () => {
        if (deleteTarget == null) {
            return;
        }
        try {
            await deleteItemById(deleteTarget);
            setItem(item.filter(i => i.id !== deleteTarget));
        } catch (error) {
            if (error.response?.status === 400 || error.response?.status === 500) {
                setError(error.response.data);
            }
        }
        setDeleteTarget(null);
    }
    const toggleupdate = (id) => {
        setUpdateId(id === updateId ? null : id);
        // Opening a different edit, or canceling one - either way, any
        // photo picked for a previous edit session must not carry over.
        setUpdateFile(null);
        const itemToEdite = item.find(item => item.id === id);
        if (itemToEdite) {
            setItemsFrom({ ...itemToEdite })
        };
    };
    const updateItemId = async (e) => {
        e.preventDefault();
        if (Number(itemsFrom.price) <= 0) {
            setError('Price must be greater than 0');
            return;
        }
        // A new photo is optional here (unlike create) - only attach a
        // 'file' part when the admin actually picked one this edit; its
        // absence tells the backend to keep the item's existing image
        // untouched.
        if (updateFile && !(updateFile instanceof File)) {
            setError('Invalid file');
            return;
        }
        const formData = new FormData();
        if (updateFile) {
            const realFile = new File([updateFile], "upload.jpg", { type: updateFile.type || "image/jpeg" });
            formData.append('file', realFile);
        }
        formData.append('item', new Blob([JSON.stringify({
            id: updateId,
            name: itemsFrom.name.trim(),
            category: itemsFrom.category.trim(),
            description: itemsFrom.description.trim(),
            price: Number(itemsFrom.price),
            veg: itemsFrom.veg
        })], { type: 'application/json' }));
        try {
            await updateItem(formData);
            setUpdateId(null);
            setUpdateFile(null);
            // Re-fetch rather than merge itemsFrom locally - itemsFrom still
            // holds the OLD image URL (copied in toggleupdate before any
            // replace happened), so a local merge would keep showing the
            // old photo until a manual page refresh even though the
            // replace actually succeeded. Same refresh pattern already used
            // after a CSV import below.
            setItem([]);
            setPageItem(1);
            handelItems();
        } catch (error) {
            if (error.response?.status === 400 || error.response?.status === 500) {
                setError(error.response.data);
            }
        };
    }

    return (
        <div className='admin-products'>
            {error && <p className='admin-error'>{error}</p>}

            <form onSubmit={handleCreateItem} className='form_item'>
                <h2 className='tital'>הוספת מוצר</h2>
                <input type="text" placeholder="שם במוצר" value={itemsFrom.name} onChange={(e) => setItemsFrom({ ...itemsFrom, name: e.target.value })} />
                <input type="text" placeholder="תיאור" value={itemsFrom.description} onChange={(e) => setItemsFrom({ ...itemsFrom, description: e.target.value })} />
                <input type="number" placeholder="מחיר" value={itemsFrom.price} onChange={(e) => setItemsFrom({ ...itemsFrom, price: parseFloat(e.target.value) })} />
                <input type="file" placeholder="העלאת תמונה"   accept="image/*"  onChange={(e) => setFile(  e.target.files[0] )} />
                <select value={itemsFrom.category} onChange={(e) => setItemsFrom({ ...itemsFrom, category: e.target.value })}>
                    <option value="">בחר קטגוריה</option>
                    <option value="chocolate">שוקולד</option>
                    <option value="cake">עוגה</option>
                    <option value="cookie">עוגיה</option>
                </select>
                <label>
                    צמחוני:
                    <input type="checkbox" checked={itemsFrom.veg} onChange={(e) => setItemsFrom({ ...itemsFrom, veg: e.target.checked })} />
                </label>
                <button className='btn' type="submit">תוסיף מוצר</button>
            </form>

            <form onSubmit={handleImportCsv} className='form_item'>
                <h2 className='tital'>ייבוא מוצרים מקובץ CSV</h2>
                <p>
                    עמודות (שורה ראשונה בקובץ, שם העמודה קובע - לא הסדר): <code>name, description,
                    price, category, veg, image_url</code>. <code>category</code> חייבת להיות
                    <code> chocolate</code>/<code>cake</code>/<code>cookie</code>. <code>image_url</code>
                    אפשר להשאיר ריק - המוצר ייווצר בלי תמונה, אפשר להוסיף ידנית אחר כך.
                </p>
                <p>
                    <strong>מומלץ:</strong> תמונות ב-<code>keren-diamonds-product-images</code>
                    (S3) - יוצרים URL יציב ואמין: <code>https://keren-diamonds-product-images.s3.eu-central-1.amazonaws.com/שם-קובץ.jpg</code>.
                </p>
                <p>
                    <strong>לא מומלץ - Google Drive:</strong> שום פורמט קישור מ-Drive (לא קישור
                    שיתוף רגיל, לא <code>uc?export=download</code>, לא <code>lh3.googleusercontent.com</code>)
                    לא עובד בצורה אמינה להורדה אוטומטית - Drive מחזיר לרוב דף HTML במקום את
                    התמונה עצמה, גם כשהקובץ משותף כ"כל מי שיש לו את הקישור".
                </p>
                <p>דוגמה לשורה: <code>שוקולד תות,שוקולד עם תות מיובש,17.5,chocolate,true,https://...</code></p>
                <input type="file" accept=".csv" onChange={(e) => setCsvFile(e.target.files[0])} />
                <button className='btn' type="submit" disabled={importing}>{importing ? 'מייבא...' : 'ייבוא'}</button>
                {importResult && (
                    <div>
                        <p>נוצרו {importResult.created} מוצרים בהצלחה</p>
                        {importResult.errors?.length > 0 && (
                            <ul>
                                {importResult.errors.map((err, i) => (
                                    <li key={i}>שורה {err.row}: {err.message}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </form>
            <h2 className='tital'>מוצרים</h2>
            <div className='items_container'>

                {item.length > 0 && item.map(item => (
                    <div key={item.id} >
                        <CardItem item={item} />
                        <button className='btn' type='button' onClick={() => setDeleteTarget(item.id)}>מחיקה</button>
                        <button className='btn' type='button' onClick={() => toggleupdate(item.id)}>
                            {updateId === item.id ? 'ביטול' : 'עריכה'}
                        </button>
                        {updateId === item.id && (
                            <form onSubmit={updateItemId} className='form_item'>

                                <input type="text" placeholder="שם המוצר" value={itemsFrom.name} onChange={(e) => setItemsFrom({ ...itemsFrom, name: e.target.value })} />
                                <input type="text" placeholder="תיאור" value={itemsFrom.description} onChange={(e) => setItemsFrom({ ...itemsFrom, description: e.target.value })} />
                                <input type="number" placeholder="מחיר" value={itemsFrom.price} onChange={(e) => setItemsFrom({ ...itemsFrom, price: parseFloat(e.target.value) })} />
                                <input type="file" placeholder="העלאת תמונה" accept="image/*" onChange={(e) => setUpdateFile(e.target.files[0])} />
                                <select value={itemsFrom.category} onChange={(e) => setItemsFrom({ ...itemsFrom, category: e.target.value })}>
                                    <option value="">בחר קטגוריה</option>
                                    <option value="chocolate">שוקולד</option>
                                    <option value="cake">עוגה</option>
                                    <option value="cookie">עוגיה</option>
                                </select>
                                <label>  צמחוני:  <input className='veg' type="checkbox" checked={itemsFrom.veg} onChange={(e) => setItemsFrom({ ...itemsFrom, veg: e.target.checked })} /> </label>
                                <button className='btn' type="submit">שמירה</button>
                            </form>

                        )}
                    </div>
                ))}

            </div>
            <button className='btn' onClick={handelItems}>קבל מוצרים</button>
            <Modal
                isOpen={deleteTarget !== null}
                onClose={() => setDeleteTarget(null)}
                title="מחיקת מוצר"
                footer={
                    <>
                        <button className='btn' type='button' onClick={() => setDeleteTarget(null)}>ביטול</button>
                        <button className='btn btn-cancel' type='button' onClick={confirmDelete}>מחיקה</button>
                    </>
                }
            >
                <p>למחוק את המוצר הזה? הפעולה בלתי הפיכה.</p>
            </Modal>
        </div>
    )
}

export default AdminProducts
