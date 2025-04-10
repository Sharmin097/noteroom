import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../public/css/signup-login.css'
import { useUserAuth } from '../../context/UserAuthContext';
import LoginImage from '../../assets/login_image.png'
import ngLogo from "../../assets/ng_logo.png"
import Swal from "sweetalert2"
import withReactContent from "sweetalert2-react-content"
import 'sweetalert2/dist/sweetalert2.min.css';
import GoogleLogin from '../../partials/GoogleLogin';

let API_SERVER_URL = import.meta.env.VITE_API_SERVER_URL
const ReactSwal = withReactContent(Swal)

export default function Login() {
    const navigate = useNavigate();
    const { setUserAuth } = useUserAuth()!
    const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [isBtnDisabled, setIsBtnDisabled] = useState<boolean>(true)

    function showSwal(text: any) {
        return ReactSwal.fire({
            title: "Unable to authenticate",
            html:
                <>
                    <svg fill="#000000" height="100px" width="100px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 612 612" xmlSpace="preserve">
                        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                        <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                        <g id="SVGRepo_iconCarrier">
                            <g> <path d="M460.537,373.781c-65.78,0-119.108,53.329-119.108,119.11S394.756,612,460.537,612s119.111-53.329,119.111-119.11 C579.647,427.11,526.319,373.781,460.537,373.781z M512.649,513.327H408.429c-11.287,0-20.435-9.15-20.435-20.437 c0-11.287,9.149-20.437,20.435-20.437h104.221c11.287,0,20.435,9.15,20.435,20.437 C533.086,504.177,523.936,513.327,512.649,513.327z M267.355,312.662c86.861-0.005,118.115-86.976,126.297-158.417 C403.73,66.237,362.113,0,267.355,0C172.61,0,130.971,66.232,141.058,154.245C149.249,225.686,180.492,312.669,267.355,312.662z M457.287,348.865c2.795,0,5.572,0.084,8.33,0.237c-4.134-5.897-8.918-11.098-14.518-15.276 c-16.691-12.457-38.307-16.544-57.416-24.055c-9.302-3.654-17.632-7.284-25.452-11.416 c-26.393,28.943-60.809,44.084-100.886,44.087c-40.067,0-74.478-15.141-100.867-44.087c-7.82,4.134-16.152,7.762-25.452,11.416 c-19.11,7.51-40.725,11.597-57.416,24.055c-28.866,21.545-36.325,70.012-42.187,103.071c-4.838,27.291-8.086,55.141-9.036,82.862 c-0.735,21.472,9.867,24.483,27.831,30.965c22.492,8.112,45.716,14.135,69.097,19.071c45.153,9.535,91.696,16.862,138.038,17.191 c22.455-0.16,44.956-1.972,67.322-4.873c-16.562-23.996-26.276-53.063-26.276-84.36 C308.401,415.654,375.191,348.865,457.287,348.865z" /> </g>
                        </g>
                    </svg>,
                    <p>{text}</p>
                </>,
            confirmButtonText: 'OK'
        })
    }

    async function login() {
        try {
            const loginData = new FormData()
            loginData.append("email", email)
            loginData.append("password", password)

            const response = await fetch(`${API_SERVER_URL}/api/auth/login`, {
                method: "post",
                body: loginData,
                credentials: "include"
            })
            if (response.ok) {
                const data = await response.json()
                if (data && data.ok) {
                    setUserAuth(data.userAuth)
                    navigate("/", { replace: true })
                } else {
                    showSwal(data.message || "Someting went wrong! Please try again a bit later")
                }
            } else {
            }
        } catch (error) {
            showSwal("Someting went wrong! Please try again a bit later")
        }
    }

    useEffect(() => {
        setIsBtnDisabled(password.length === 0 || email.length === 0)
    }, [password, email])

    return (
        <div className="flex-center-evenly flex-inverse gradient-2">
            <div className="main-container flex-column-center">
                <div className="brand-section flex-column-center">
                    <img src={ngLogo} alt="NoteRoom" className="brand__site-logo" />
                    <p className="brand__logo-title">NoteRoom</p>
                    <h2 className="brand__main-heading">Login to NoteRoom</h2>
                    <p className="txt-gray-light-bold">Welcome back! Pick up where you left off</p>
                </div>

                <div className="acquisition-container flex-column-center">
                    <GoogleLogin setUserAuth={setUserAuth} />

                    <div className="separator flex-center-evenly">
                        <span className="line"></span>
                        <span className="txt-gray-light-bold">Or</span>
                        <span className="line"></span>
                    </div>

                    <div className="custom-form flex-column-center">
                        <input type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (required)" className="custom__input-field" required />

                        <div className="password-container">
                            <input type={passwordVisible ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} name="password" placeholder="NoteRoom Password" className="custom__input-field custom__input-field--marginless" required />
                            <button type="button" onClick={() => setPasswordVisible(prev => !prev)} className="toggle-password">
                                {passwordVisible ? "hide" : "show"}
                            </button>
                        </div>
                        <p className="redirecting-msg"><a href="/support" className="redirect-link">Forgot Password?</a></p>
                        <button className="primary-btn flex-center-evenly" disabled={isBtnDisabled} onClick={() => !isBtnDisabled && login()}>Login</button>
                    </div>
                </div>
                <p className="redirecting-msg">Don't have an account? <a href="/signup" className="redirect-link">Create Today</a></p>
            </div>
            <img className="focus-img" src={LoginImage} alt="Two friends talking about NoteRoom" />
        </div>
    );
};
