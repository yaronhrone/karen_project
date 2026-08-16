import React, { useContext, useEffect, useState } from 'react'
import './Register.css';
import { fetchCurrentUser, register, loginWithGoogle } from '../../service/apiServise';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useNavigate } from 'react-router-dom';
import UserContext from '../../contexts/UserContext';
import { GoogleLogin } from '@react-oauth/google';
function Register() {
  const { currentUser, updateCurrentUserContext } = useContext(UserContext);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    password: '',
    password2: '',
    email: '',
    phone: '',
    address: '',
    role: "USER"
  });
  const navigate = useNavigate();
  const [errorFromServer, setErrorFromServer] = useState('');
  const [massege, setMassege] = useState('');
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(false);

  const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9]{10}$/;

  const validFrom = (name, value) => {
    let error = '';
    switch (name) {
      case 'password':
        if (!passwordRegex.test(value)) {
          error = " סיסמה לא תקינה, חייבת להכיל לפחות 8 תווים, אות גדולה, אות קטנה, ספרה ותו מיוחד";
        }
        break;
      case 'password2':
        if (value !== formData.password) {
          error = "הסיסמה לא תואמת לסיסמה הראשית";
        }
        break;
      case 'email':
        if (!emailRegex.test(value)) {
          error = 'מייל לא תקין';
        }
        break;
      case 'phone':
        if (!phoneRegex.test(value)) {
          error = 'מספר טלפון לא תקין';
        }
        break;
    }
    setErrors({ ...errors, [name]: error });

  }
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  }
  const togglePasswordVisibility2 = () => {
    setShowPassword2(!showPassword2);
  }

  const handleChange = async (e) => {
    console.log(e.target.name + " " + e.target.value);

    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    })
    validFrom(name, value);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.password !== formData.password2) {
        setErrors({ ...errors, password2: 'הסיסמאות לא תואמות' });
        return;
      }
      await register(formData);
      setMassege(`ההרשמה בוצעה בהצלחה, ${formData.first_name}!`);

      const { data } = await fetchCurrentUser();
      updateCurrentUserContext(data);
      setTimeout(() => {
        navigate('/');
      }, 200);

    } catch (err) {
      console.log(err + " " + err.response?.data + " " + err.code);
      if (err.response?.status == 400 || err.response?.status == 500) {
        setErrorFromServer(err.response.data);
      } if (err.code === "ERR_NETWORK") {
        setErrorFromServer("שגיאת רשת: בדוק/י את החיבור לאינטרנט ונסה/י שוב.");
      }
      setTimeout(() => {
        setErrorFromServer('');
      }, 5000);
    }
  };
  useEffect(() => {
    const { first_name, last_name, password, address, email, phone } = formData;
    setIsValid(
      Boolean(first_name && last_name && password && address && email && phone) &&
      Object.values(errors).every(error => !error)
    )
  }, [errors, formData]);
  const handleGoogleRegister = async (credentialResponse) => {
    try {
      await loginWithGoogle(credentialResponse.credential);
      const { data } = await fetchCurrentUser();
      updateCurrentUserContext(data);
      setTimeout(() => {
        navigate('/');
      }, 200);
    } catch (err) {
      setErrorFromServer('הכניסה עם Google נכשלה, נסה/י שוב');
      setTimeout(() => {
        setErrorFromServer('');
      }, 5000);
    }
  };
  return (
    <div className='container_register'>

      <form className='register-form' onSubmit={handleSubmit}>

        <h2>
          יצירת משתמש חדש
        </h2>
        {massege && <p style={{ color: 'green' }}>{massege}</p>}
        {errorFromServer && <p style={{ color: 'red' }}>{errorFromServer}</p>}

        {errors.firstName && <span className="error">{errors.first_name}</span>}
        <input type="text" name="first_name" placeholder='שם פרטי' onChange={handleChange} value={formData.first_name} />

        {errors.lastName && <span className="error">{errors.last_name}</span>}
        <input type="text" name="last_name" placeholder='שם משפחה' onChange={handleChange} value={formData.last_name} />
        <div style={{ position: "relative", marginBottom: "1rem", width: "360px", marginRight: "1rem" }}>
          <input type={showPassword ? 'text' : 'password'} placeholder="סיסמה" name='password'
            value={formData.password} onChange={handleChange} className={errors.password ? "input-error" : ""}
            style={{ width: "100%", paddingRight: "0", paddingLeft: "0.5rem", marginBottom: "0" }} />
          <span onClick={togglePasswordVisibility} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", cursor: "pointer" }}>
            {showPassword ? <VisibilityIcon style={{ fontSize: "20px" }} /> : <VisibilityOffIcon style={{ fontSize: '20px' }} />}
          </span>
        </div>
        {errors.password && <span className="error">{errors.password}</span>}
        <div style={{ position: "relative", marginBottom: "1rem", width: "360px", marginRight: "1rem" }}>
          <input type={showPassword2 ? 'text' : 'password'} placeholder="אימות סיסמה" name='password2'
            value={formData.password2} onChange={handleChange} className={errors.password2 ? "input-error" : ""}
            style={{ width: "100%", paddingRight: "0", paddingLeft: "0.5rem", marginBottom: "0" }} />
          <span onClick={togglePasswordVisibility2} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", cursor: "pointer" }}>
            {showPassword2 ? <VisibilityIcon style={{ fontSize: "20px" }} /> : <VisibilityOffIcon style={{ fontSize: '20px' }} />}
          </span>
        </div>
        {errors.password2 && <span className="error">{errors.password2}</span>}
        {errors.email && <span className="error">{errors.email}</span>}
        <input type="email" name="email" placeholder='מייל' onChange={handleChange} value={formData.email} />
        {errors.phone && <span className="error">{errors.phone}</span>}
        <input type="text" name="phone" placeholder='מספר טלפון' onChange={handleChange} value={formData.phone} />
        {errors.address && <span className="error">{errors.address}</span>}
        <input type="text" name="address" placeholder='כתובת' onChange={handleChange} value={formData.address} />
        {errors.submit && <span className="error">{errors.submit}</span>}
        <button type="submit" disabled={!isValid}>הרשמה</button>

        <div style={{ marginTop: "1rem" }}>
          <GoogleLogin onSuccess={handleGoogleRegister} onError={() => setErrorFromServer('הכניסה עם Google נכשלה, נסה/י שוב')} />
        </div>

      </form>
    </div>
  )
}

export default Register