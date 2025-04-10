import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

let API_SERVER_URL = import.meta.env.VITE_API_SERVER_URL
const ReactSwal = withReactContent(Swal)
export default function GoogleLogin({ setUserAuth }) {
    const navigate = useNavigate()
    const GOOGLE_CLIENT_ID = "325870811550-0c3n1c09gb0mncb0h4s5ocvuacdd935k.apps.googleusercontent.com"

    useEffect(() => {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
  
      script.onload = () => {
        if (window["google"]) {
          window["google"].accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
          });
  
          window["google"].accounts.id.renderButton(
            document.getElementById("google-signin-btn"),
            {
              theme: "outline",
              size: "large",
            }
          );
  
          window["google"].accounts.id.prompt();
        }
      };
    }, []);
  
    const handleCredentialResponse = async (gresponse: any) => {
        try {
            const response = await fetch(`${API_SERVER_URL}/api/auth/google`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ credential: gresponse.credential }),
            });
            if (response.ok) {
                const data = await response.json();
                if (data && data.ok) {
                    setUserAuth(data.userAuth)
                    navigate("/", { replace: true })
                } else {
                    ReactSwal.fire({
                        icon: "error",
                        title: "Uh oh!",
                        text: data.message || "Something went wrong! Please try again a bit later"
                    })
                }
            } else [
                ReactSwal.fire({
                    icon: "error",
                    title: "Uh oh!",
                    text: "Something went wrong! Please try again a bit later"
                })
            ]

        } catch (err) {
            ReactSwal.fire({
                icon: "error",
                title: "Uh oh!",
                text: "Something went wrong! Please try again a bit later"
            })
        }
    };
  
    return <div id="google-signin-btn"></div>;
};