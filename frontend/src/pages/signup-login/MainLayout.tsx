import React, { ReactNode } from 'react';
import "../../public/css/signup-login.css";
import ngLogo from "../../assets/ng_logo.png";

interface MainLayoutProps {
  children: ReactNode;
  imagePath: string;
  tagline?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  imagePath,
  tagline = "For The Curious" 
}) => {
  return (
    <div className="auth-form-container">
      <div className="auth-form-left-panel">
        <h1 className="auth-form-tagline">{tagline}</h1>
        <img className="auth-form-img" src={imagePath} alt="Featured image" />
      </div>
      
      <div className="auth-form-right-panel">
        <div className="auth-form-logo-section">
          <img src={ngLogo} alt="NoteRoom" className="auth-form-logo" />
          <p className="auth-form-noteroom-text">noteroom</p>
        </div>
        
        {children}
      </div>
    </div>
  );
};

export default MainLayout;
