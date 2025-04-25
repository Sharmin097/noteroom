import React from 'react';
import { useNavigate } from 'react-router-dom';
import "../../public/css/checkout.css";

export const CheckmarkIcon: React.FC = () => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path 
        d="M22.75 12C22.75 14.1261 22.1195 16.2046 20.9383 17.9724C19.7571 19.7402 18.0782 21.1181 16.1139 21.9317C14.1495 22.7453 11.9881 22.9582 9.90278 22.5434C7.81749 22.1287 5.90202 21.1048 4.39861 19.6014C2.89519 18.098 1.87135 16.1825 1.45656 14.0972C1.04177 12.0119 1.25466 9.85046 2.0683 7.88615C2.88194 5.92185 4.2598 4.24293 6.02762 3.0617C7.79545 1.88048 9.87386 1.25 12 1.25M19.757 4.243L11.3445 15.694L5.916 11.1495" 
        stroke="#21C400" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
};

const FreePlan: React.FC<{onContinue: () => void}> = ({ onContinue }) => {
  return (
    <div className="free-plan">
      <h2 className="plan-title">Standard</h2>
      <p className="plan-subtitle">Ideal for single user</p>
      
      <div className="plan-price">
        <h3 className="price-text">FREE</h3>
      </div>
      
      <button className="continue-button" onClick={onContinue}>
        Continue
      </button>
      
      <div className="features-group">
        <h4 className="features-heading">What you will get</h4>
        
        <div className="plan-selection-feature-item">
          <div className="plan-selection-feature-icon">
            <CheckmarkIcon />
          </div>
          <span className="plan-selection-feature-text">7 days premium trial</span>
        </div>
        
        <div className="plan-selection-feature-item">
          <div className="plan-selection-feature-icon">
            <CheckmarkIcon />
          </div>
          <span className="plan-selection-feature-text">Access to core features</span>
        </div>
      </div>
    </div>
  );
};

const PremiumPlan: React.FC<{onContinue: () => void}> = ({ onContinue }) => {
  return (
    <div className="premium-plan">
      <div className="popular-tag">
        <span className="popular-text">Most popular</span>
      </div>
      
      <h2 className="plan-title">Premium</h2>
      <p className="plan-subtitle">Recommended for serious user</p>
      
      <div className="plan-price">
        <div className="price-combo">
          <span className="original-price">1599</span>
          <span className="current-price">999</span>
          <span className="currency-code">BDT</span>
        </div>
        <span className="price-period">/ per month</span>
      </div>
      
      <button className="continue-button" onClick={onContinue}>
        Continue
      </button>
      
      <div className="features-group">
        <h4 className="features-heading">What you will get</h4>
        
        <div className="plan-selection-feature-item">
          <div className="plan-selection-feature-icon">
            <CheckmarkIcon />
          </div>
          <span className="plan-selection-feature-text">Verified Badge</span>
        </div>
        
        <div className="plan-selection-feature-item">
          <div className="plan-selection-feature-icon">
            <CheckmarkIcon />
          </div>
          <span className="plan-selection-feature-text">Customizable template</span>
        </div>
        
        <div className="plan-selection-feature-item">
          <div className="plan-selection-feature-icon">
            <CheckmarkIcon />
          </div>
          <span className="plan-selection-feature-text">Multiuser access</span>
        </div>
        
        <div className="plan-selection-feature-item">
          <div className="plan-selection-feature-icon">
            <CheckmarkIcon />
          </div>
          <span className="plan-selection-feature-text">Third party intrigation</span>
        </div>
        
        <div className="plan-selection-feature-item">
          <div className="plan-selection-feature-icon">
            <CheckmarkIcon />
          </div>
          <span className="plan-selection-feature-text">24/7 Priority Support</span>
        </div>
      </div>
    </div>
  );
};

const SelectPlan: React.FC = () => {
  const navigate = useNavigate();

  const handleStandardContinue = () => {
    navigate('/');
  };

  const handlePremiumContinue = () => {
    navigate('/payment');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="plan-selection-container">
      <div className="go-back-btn" onClick={handleGoBack}>
        <svg width="31" height="32" viewBox="0 0 31 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6.65 18L16.7079 28.0579C17.337 28.687 17.3325 29.7084 16.6979 30.3319C15.7577 31.2556 14.2489 31.2489 13.317 30.317L0.900701 17.9007C-0.149029 16.851 -0.149026 15.149 0.900703 14.0993L13.5999 1.40005C14.3752 0.624828 15.6303 0.619276 16.4124 1.38761C17.2043 2.16562 17.2099 3.44007 16.4249 4.22506L6.65 14H29C30.1046 14 31 14.8954 31 16C31 17.1046 30.1046 18 29 18H6.65Z" fill="#1D1B20" />
        </svg>
      </div>
      <span className="header-tag">Pricing</span>
      <h1 className='plan-selection-title'>Choose the Best Plan for You</h1>
      <div className="plans-container">
        <FreePlan onContinue={handleStandardContinue} />
        <PremiumPlan onContinue={handlePremiumContinue} />
      </div>
    </div>
  );
};

export default SelectPlan;
