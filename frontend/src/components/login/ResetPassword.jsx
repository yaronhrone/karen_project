import React, { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom';
import { resetPassword } from '../../service/apiServise';
import { passwordRegex } from '../../utils/validation';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import './Login.css'

function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [linkInvalid, setLinkInvalid] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!passwordRegex.test(newPassword)) {
            setError('סיסמה לא תקינה, חייבת להכיל לפחות 8 תווים, אות גדולה, אות קטנה, ספרה ותו מיוחד');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('הסיסמאות לא תואמות');
            return;
        }
        try {
            await resetPassword(token, newPassword);
            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            // Backend returns a generic 400 for an invalid/expired/already-used
            // token - never anything more specific.
            setLinkInvalid(true);
        }
    }

    if (linkInvalid) {
        return (
            <div className='container_login'>
                <h2>איפוס סיסמה</h2>
                <p style={{ color: 'var(--color-danger)', width: "min(340px, 90vw)", textAlign: "center" }}>הקישור אינו תקין או שפג תוקפו</p>
                <Link to="/forgot-password" style={{ marginTop: "1rem", color: "var(--color-accent)" }}>בקש קישור חדש</Link>
            </div>
        )
    }

    if (success) {
        return (
            <div className='container_login'>
                <h2>איפוס סיסמה</h2>
                <p style={{ color: 'green', width: "min(340px, 90vw)", textAlign: "center" }}>הסיסמה עודכנה בהצלחה, מעביר/ה אותך לדף הכניסה...</p>
            </div>
        )
    }

    return (
        <div className='container_login'>
            <h2>בחירת סיסמה חדשה</h2>
            {error && <p style={{ color: 'var(--color-danger)' }}>{error}</p>}
            <form className='formLogin' onSubmit={handleSubmit}>
                <div style={{ position: "relative", marginBottom: "1rem", width: "90%", marginRight: "1rem" }}>
                    <input type={showPassword ? 'text' : 'password'} placeholder="סיסמה חדשה" name='newPassword'
                        value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                        style={{ width: "100%", paddingRight: "0", paddingLeft: "0.5rem", marginBottom: "0" }} />
                    <span onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", cursor: "pointer" }}>
                        {showPassword ? <VisibilityIcon style={{ fontSize: "20px" }} /> : <VisibilityOffIcon style={{ fontSize: "20px" }} />}
                    </span>
                </div>
                <div>
                    <input type={showPassword ? 'text' : 'password'} placeholder="אימות סיסמה" name='confirmPassword'
                        value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                        style={{ width: "90%", marginRight: "1rem" }} />
                </div>
                <button type="submit" className='btnLogin'>עדכן סיסמה</button>
            </form>
        </div>
    )
}

export default ResetPassword
