import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../public/css/signup-login.css'
import { useUserAuth } from '../../context/userauth.context';
import LoginImage from '../../assets/login_image.png'
import Swal from "sweetalert2"
import withReactContent from "sweetalert2-react-content"
import 'sweetalert2/dist/sweetalert2.min.css';
import GoogleLogin from '../../partials/GoogleLogin';
import MainLayout from './MainLayout';

let API_SERVER_URL = import.meta.env.VITE_API_SERVER_URL
const ReactSwal = withReactContent(Swal)

export default function Login() {
    const navigate = useNavigate();
    const { setUserAuth } = useUserAuth()!
    const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [isBtnDisabled, setIsBtnDisabled] = useState<boolean>(true)
    const [authError, setAuthError] = useState<string>("")
    const [hasError, setHasError] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)

    // Add ref for email input
    const emailInputRef = useRef<HTMLInputElement>(null);

    async function login() {
        try {
            setHasError(false)
            setAuthError("")
            setLoading(true)
            
            const loginData = new FormData()
            loginData.append("email", email)
            loginData.append("password", password)

            const response = await fetch(`${API_SERVER_URL}/api/auth/login`, {
                method: "post",
                body: loginData,
                credentials: "include"
            })
            setLoading(false)
            if (response.ok) {
                const data = await response.json()
                if (data && data.ok) {
                    setUserAuth(data.userAuth)
                    navigate("/", { replace: true })
                } else {
                    setHasError(true)
                    setAuthError(data.message || "Invalid username or password.")
                    // Focus on email input when error occurs
                    emailInputRef.current?.focus();
                }
            } else {
                setHasError(true)
                setAuthError("Invalid username or password.")
                // Focus on email input when error occurs
                emailInputRef.current?.focus();
            }
        } catch (error) {
            setHasError(true)
            setAuthError("Something went wrong! Please try again later.")
            // Focus on email input when error occurs
            emailInputRef.current?.focus();
        }
    }

    // Clear error when user changes input
    useEffect(() => {
        if (hasError) {
            setHasError(false)
            setAuthError("")
        }
    }, [email, password])

    useEffect(() => {
        setIsBtnDisabled(password.length === 0 || email.length === 0 || loading)
    }, [password, email, loading])

    return (
        <MainLayout imagePath={LoginImage}>
            <div className="auth-form-welcome-section">
                <h2 className="auth-form-welcome-text">Welcome back to noteroom</h2>
            </div>

            <div className="auth-form-form">
                <div className="auth-form-google-container">
                    <GoogleLogin setUserAuth={setUserAuth} setLoading={setLoading} />
                </div>
                
                <div className="auth-form-or-separator">
                    <span className="auth-form-or-text">— OR —</span>
                </div>

                <div className="auth-form-input-fields">
                    <div className="auth-form-input-label">Email</div>
                    <input 
                        ref={emailInputRef}
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        className={`auth-form-input-field ${hasError ? 'auth-form-input-error' : ''}`}
                        required 
                    />
                    
                    <div className="auth-form-input-label">Password</div>
                    <div className="auth-form-password-container">
                        <input 
                            type={passwordVisible ? "text" : "password"} 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            className={`auth-form-input-field ${hasError ? 'auth-form-input-error' : ''}`}
                            required 
                        />
                        <button 
                            className="auth-form-password-toggle" 
                            onClick={() => setPasswordVisible(prev => !prev)}
                        >
                            {passwordVisible ? "hide" : "show"}
                        </button>
                    </div>
                    
                    {hasError && (
                        <div className="auth-form-error-message">
                            {authError}
                        </div>
                    )}

                    <div className="auth-form-forgot-password">
                        <a href="/support">Forgot Password?</a>
                    </div>

                    <button 
                        className="auth-form-button" 
                        disabled={isBtnDisabled} 
                        onClick={() => !isBtnDisabled && login()}
                    >
                        { loading ? "SIGNING IN ..." : "SIGN IN" }
                    </button>
                </div>
            </div>
            
            <div className="auth-form-login-link">
                <p>Don't have an account? <a href="/signup">Create Today</a></p>
            </div>
        </MainLayout>
    );
};
