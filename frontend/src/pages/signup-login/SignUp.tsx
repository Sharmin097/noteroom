import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import SignUpImage from "../../assets/signup_image.png"
import "../../public/css/signup-login.css"
import { useUserAuth } from '../../context/userauth.context';
import slug from 'slug';
import GoogleLogin from '../../partials/GoogleLogin';
import MainLayout from './MainLayout';

let API_SERVER_URL = import.meta.env.VITE_API_SERVER_URL

const SignUp = () => {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [displayname, setDisplayname] = useState<string>("")
    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [isBtnDisabled, setIsBtnDisabled] = useState<boolean>(true)
    const [authError, setAuthError] = useState<string>("")
    const [hasError, setHasError] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)
    const { setUserAuth } = useUserAuth()!
    const username = useRef<string>("")
    const navigate = useNavigate();

    async function signup() {
        try {
            // Reset any previous errors
            setHasError(false)
            setAuthError("")
            setLoading(true)
            
            const formData = new FormData()
            formData.append("displayname", displayname)
            formData.append("email", email)
            formData.append("password", password)
            formData.append("username", username.current)

            const response = await fetch(`${API_SERVER_URL}/api/auth/signup`, {
                method: "post",
                body: formData,
                credentials: "include"
            })
            setLoading(false)
            if (response.ok) {
                const data = await response.json()
                if (data.ok) {
                    //TODO: when the profession selection section is done
                    // navigate("/profession", { replace: true })
                    setUserAuth(data.userAuth)
                } else {
                    if (!data.displayname) {
                        setHasError(true)
                        setAuthError(data.message || "Invalid username or password.")
                    } else {
                        const suggested = slug(data.displayname, {
                            lower: true,
                            symbols: false
                        }) + "-sdff21db"
                        const result = await withReactContent(Swal).fire({
                            input: "text",
                            title: data.message,
                            html: `Suggested format: <b>${suggested}</b> (no whitespace)`,
                            confirmButtonText: "Proceed",
                            showCancelButton: true,
                            preConfirm: (value: string) => {
                                if (value.match(/\s/) === null && value.trim() !== "") {
                                    username.current = value?.toLowerCase()
                                } else {
                                    Swal.showValidationMessage("No whitespaces are allowed")
                                    return false
                                }
                            }
                        })
                        if (result.isConfirmed) {
                            signup()
                        }
                    }
                }
            } else {
                setHasError(true)
                setAuthError("Something went wrong. Please try again later.")
            }
        } catch (error) {
            setHasError(true)
            setAuthError("Something went wrong. Please try again later.")
        }
    }

    // Clear error when user changes input
    useEffect(() => {
        if (hasError) {
            setHasError(false)
            setAuthError("")
        }
    }, [displayname, email, password])

    useEffect(() => {
        setIsBtnDisabled(displayname.trim() === "" || email.trim() === "" || password.trim() === "" || loading)
    }, [displayname, email, password, loading])

    return (
        <MainLayout imagePath={SignUpImage}>
            <div className="auth-form-welcome-section">
                <h2 className="auth-form-welcome-text">Welcome to NoteRoom</h2>
            </div>

            <div className="auth-form-form">
                <div className="auth-form-google-container">
                    <GoogleLogin setUserAuth={setUserAuth} />
                </div>
                
                <div className="auth-form-or-separator">
                    <span className="auth-form-or-text">— OR —</span>
                </div>

                <div className="auth-form-input-fields">
                    <div className="auth-form-input-label">Your Name</div>
                    <input
                        type="text"
                        value={displayname}
                        onChange={(e) => setDisplayname(e.target.value)}
                        name="displayname"
                        className={`auth-form-input-field ${hasError ? 'auth-form-input-error' : ''}`}
                        required
                    />
                    
                    <div className="auth-form-input-label">Email</div>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        name="email"
                        className={`auth-form-input-field ${hasError ? 'auth-form-input-error' : ''}`}
                        required
                    />
                    
                    <div className="auth-form-input-label">Password</div>
                    <div className="auth-form-password-container">
                        <input
                            type={passwordVisible ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            id="password"
                            name="password"
                            className={`auth-form-input-field ${hasError ? 'auth-form-input-error' : ''}`}
                            required
                        />
                        <button 
                            type="button" 
                            onClick={() => setPasswordVisible(prev => !prev)} 
                            className="auth-form-password-toggle"
                        >
                            {passwordVisible ? "hide" : "show"}
                        </button>
                    </div>
                    
                    {hasError && (
                        <div className="auth-form-error-message">
                            {authError}
                        </div>
                    )}

                    <button 
                        className="auth-form-button" 
                        disabled={isBtnDisabled} 
                        onClick={() => !isBtnDisabled && signup()}
                    >
                        { loading ? "SIGNIN UP ..." : "SIGN UP" }
                    </button>
                </div>
            </div>
            
            <div className="auth-form-login-link">
                <p>Don't have an account? <a href="/login">Sign In</a></p>
            </div>
        </MainLayout>
    );
};

export default SignUp;