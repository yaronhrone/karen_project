import React, { useRef, useState } from 'react'
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../../service/apiServise';
import './Login.css'

// Deliberately shows the exact same message no matter what the server
// responds with (and even if the request itself fails on the network) - the
// backend already guarantees an identical response either way, but the
// point of that guarantee is defeated if this component then branches on
// the outcome, so it doesn't.
const GENERIC_MESSAGE = 'אם קיים חשבון עם האימייל הזה, נשלח אליו קישור לאיפוס הסיסמה';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    // A ref alongside the state: setSubmitting(true) doesn't take effect
    // (and re-render/disable the button) until after this handler returns,
    // so a very fast double-click could still fire twice before that -
    // the ref is checked+set synchronously and closes that gap. The
    // backend also has its own 60s cooldown per email as a second layer,
    // in case the request ever fires twice anyway (e.g. two tabs).
    const submittingRef = useRef(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submittingRef.current) {
            return;
        }
        submittingRef.current = true;
        setSubmitting(true);
        try {
            await requestPasswordReset(email);
        } catch (err) {
        } finally {
            setSubmitted(true);
            setSubmitting(false);
        }
    }

    return (
        <div className='container_login'>
            <h2>שכחתי סיסמה</h2>
            {submitted ? (
                <p style={{ width: "min(340px, 90vw)", textAlign: "center" }}>{GENERIC_MESSAGE}</p>
            ) : (
                <form className='formLogin' onSubmit={handleSubmit}>
                    <div>
                        <input type="email" name="email" required onChange={(e) => setEmail(e.target.value)} placeholder='אימייל' style={{ width: "90%", marginRight: "1rem" }} />
                    </div>
                    <button type="submit" className='btnLogin' disabled={submitting}>שלח קישור לאיפוס</button>
                </form>
            )}
            <Link to="/login" style={{ marginTop: "1rem", color: "var(--color-accent)" }}>חזרה לכניסה</Link>
        </div>
    )
}

export default ForgotPassword
