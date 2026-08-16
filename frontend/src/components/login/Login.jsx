import React, { useContext, useState } from 'react'
import { fetchCurrentUser, loging, loginWithGoogle } from '../../service/apiServise';
import UserContext from '../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import './Login.css'
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { updateCurrentUserContext } = useContext(UserContext);
    const [error, setError] = useState('');
    const native = useNavigate();

    const goToHomeAfterLogin = async () => {
        const { data } = await fetchCurrentUser();
        updateCurrentUserContext(data);
        setTimeout(() => {
            native('/');
        }, 200);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            setError('יש למלא את כל השדות');
            setTimeout(() => {
                setError('');
            }, 5000)
            return;
        }
        try {
            await loging({ email: email, password: password });
            await goToHomeAfterLogin();
        } catch (err) {
            setError('אימייל או סיסמה שגויים');
            console.log(err);

        }
    }
    const handleGoogleLogin = async (credentialResponse) => {
        try {
            await loginWithGoogle(credentialResponse.credential);
            await goToHomeAfterLogin();
        } catch (err) {
            setError('הכניסה עם Google נכשלה, נסה/י שוב');
            console.log(err);
        }
    }
    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    }
    return (
        <div className='container_login'>
            <h2>כניסה</h2>
            {error && <p style={{ color: 'var(--color-danger)' }}>{error}</p>}
            <form className='formLogin' onSubmit={handleSubmit}>
                <div>
                    <input type="text" name="email" onChange={(e) => setEmail(e.target.value)} placeholder='אימייל' style={{ width: "90%", marginRight: "1rem" }}/>
                </div>

                    <div style={{ position: "relative", marginBottom: "1rem", width: "90%", marginRight: "1rem" }}>

                        <input type={showPassword ? 'text' : 'password'} placeholder="סיסמה" name='password'
                            value={password} onChange={(e) => setPassword(e.target.value)}
                            style={{ width: "100%", paddingRight: "0", paddingLeft: "0.5rem", marginBottom: "0" }} />
                        <span onClick={togglePasswordVisibility} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", cursor: "pointer" }}>
                            {showPassword ? <VisibilityIcon style={{ fontSize: "20px" }} /> : <VisibilityOffIcon style={{ fontSize: "20px" }} />}
                        </span>
                    </div>

                <button type="submit" className='btnLogin'>כניסה</button>
            </form>
            <div style={{ marginTop: "1rem" }}>
                <GoogleLogin onSuccess={handleGoogleLogin} onError={() => setError('הכניסה עם Google נכשלה, נסה/י שוב')} />
            </div>

        </div>
    )
}

export default Login