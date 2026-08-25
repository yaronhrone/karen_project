import React, { useContext, useState } from 'react'
import Modal from '../modal/Modal';
import UserContext from '../../contexts/UserContext';
import { updateCurrentUser } from '../../service/apiServise';

// Google Sign-In never provides a phone number, so an account created that
// way has an empty `phone` field - and Keren has no way to reach that
// customer over WhatsApp when their order comes in. Shown as a blocking
// modal (no skip) anywhere in the app for any logged-in user missing a
// phone, not just right after a Google login/register, so it also catches
// Google accounts created before this existed.
function PhoneNumberPrompt() {
    const { currentUser, updateCurrentUserContext } = useContext(UserContext);
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');
    const phoneRegex = /^[0-9]{10}$/;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!phoneRegex.test(phone)) {
            setError('מספר טלפון לא תקין (10 ספרות)');
            return;
        }
        try {
            const { data } = await updateCurrentUser({ ...currentUser, phone });
            updateCurrentUserContext(data);
        } catch (err) {
            console.log(err);
            setError('שמירת מספר הטלפון נכשלה, נסי/ה שוב');
        }
    };

    return (
        <Modal isOpen={true} onClose={() => {}} title="נשארה רק שאלה אחת">
            <form onSubmit={handleSubmit}>
                <p>כדי שנוכל ליצור איתך קשר לגבי ההזמנה (כולל בוואטסאפ), נשלים מספר טלפון:</p>
                <input
                    type="text"
                    placeholder="מספר טלפון"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{ width: '100%', marginBottom: '0.75rem' }}
                />
                {error && <p style={{ color: 'var(--color-danger)' }}>{error}</p>}
                <button type="submit" className="btn btn-primary">שמירה</button>
            </form>
        </Modal>
    );
}

export default PhoneNumberPrompt
