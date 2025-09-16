import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

type NoteFound = {
  title: string;
  message: string;
  btnText?: string;
  btnRedirect?: string;
};

export default function NotFound() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [content, setContent] = useState<NoteFound | undefined>();

  useEffect(() => {
    if (!state?.type) {
      navigate("/", { replace: true });
    } else {
      switch (state?.type) {
        case "page":
          setContent({
            title: "Page Not Found",
            message: `It seems you're lost. The page "${state?.route}" doesn't exist!`,
          });
          break;
        case "user":
          setContent({
            title: "User Not Found",
            message: `No one in NoteRoom goes by "${state?.username}".`,
            btnText: "Go Home",
            btnRedirect: "/",
          });
          break;
        case "post":
          setContent({
            title: "Post Not Found",
            message: `Post "${state?.postID}" cannot be found. It might have been deleted.`,
          });
          break;
      }
    }
  }, [navigate, state]);

  const handleButtonClick = () => {
    navigate(content?.btnRedirect || "/");
  };

  const styles = {
    notFoundContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#f8f8f8',
      fontFamily: '"Inter", "Hind Siliguri", sans-serif',
      padding: '20px',
    },
    notFoundContent: {
      textAlign: 'center' as const,
      background: '#fff',
      borderRadius: '12px',
      padding: '40px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
      maxWidth: '500px',
      width: '100%',
      border: '1px solid rgba(0, 0, 0, 0.15)',
    },
    notFoundTitle: {
      fontSize: '48px',
      fontWeight: 700,
      color: '#06192d', /* --squid-ink */
      marginBottom: '16px',
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    notFoundMessage: {
      fontSize: '18px',
      color: '#444',
      lineHeight: 1.5,
      marginBottom: '24px',
    },
    notFoundButton: {
      background: '#04dbf6', /* --neon-blue */
      border: 'none',
      borderRadius: '20px',
      padding: '12px 24px',
      fontSize: '16px',
      fontWeight: 600,
      color: '#fff',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease, transform 0.2s ease',
    }
  };

  return (
    <div style={styles.notFoundContainer}>
      <div style={styles.notFoundContent}>
        <h1 style={styles.notFoundTitle}>{content?.title || "Oops!"}</h1>
        <p style={styles.notFoundMessage}>{content?.message || "Something went wrong."}</p>
        <button 
          style={styles.notFoundButton}
          onClick={handleButtonClick}
          onMouseOver={e => {
            e.currentTarget.style.background = '#03bfd5';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseOut={e => {
            e.currentTarget.style.background = '#04dbf6';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          onMouseDown={e => {
            e.currentTarget.style.background = '#029fb3';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          onMouseUp={e => {
            e.currentTarget.style.background = '#03bfd5';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
        >
          {content?.btnText || "Go Home"}
        </button>
      </div>
    </div>
  );
}