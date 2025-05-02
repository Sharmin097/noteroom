import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckmarkIcon } from '../checkout/SelectPlan';
import "../../public/css/checkout.css";
import nrLogo from "../../assets/ng_logo.png";
import BkashLogo from "../../assets/bkash.png";
import NagadLogo from "../../assets/nagad.png";
import Card from './Card';
import Bank from './Bank';
import MobilePayment from './MobilePayment';

const Payment: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("credit");

  const formComponent = [
    {
      id: "credit",
      component: <Card onSubmit={() => {}} />
    },
    {
      id: "bank",
      component: <Bank onSubmit={() => {}} />
    },
    {
      id: "bkash",
      component: <MobilePayment paymentType="bkash" onSubmit={() => {}} />
    },
    {
      id: "nagad",
      component: <MobilePayment paymentType="nagad" onSubmit={() => {}} />
    },
    {
      id: "rocket",
      component: <MobilePayment paymentType="rocket" onSubmit={() => {}} />
    }
  ];

  const handleSwitchPlan = () => {
    navigate('/checkout');
  };

  const handlePaymentMethodChange = (method: string) => {
    setSelectedPaymentMethod(method);
  };

   // Find the selected payment method's component
  const activeComponent = formComponent.find(item => item.id === selectedPaymentMethod)?.component;

  return (
    <div className="payment-container">
      <div className="payment-content-panel">
        <div className="payment-header">
          <h2 className="payment-method-title">Payment Method</h2>

          <div className="payment-methods">
            <button 
              className={`payment-method-btn ${selectedPaymentMethod === "credit" ? "active" : ""}`}
              onClick={() => handlePaymentMethodChange("credit")}
            >
              <span className="method-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 9H22M2 11L4.807 7.843C5.18228 7.42068 5.64276 7.08266 6.15812 6.85117C6.67348 6.61969 7.23204 6.50001 7.797 6.5H8M2 19.5H7.5L11.5 16.5C11.5 16.5 12.31 15.953 13.5 15C16 13 13.5 9.834 11 11.5C8.964 12.857 7 14 7 14" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 13.5V7C8 6.46957 8.21071 5.96086 8.58579 5.58579C8.96086 5.21071 9.46957 5 10 5H20C20.5304 5 21.0391 5.21071 21.4142 5.58579C21.7893 5.96086 22 6.46957 22 7V13C22 13.5304 21.7893 14.0391 21.4142 14.4142C21.0391 14.7893 20.5304 15 20 15H13.5" stroke="black" strokeWidth="1.5" />
                </svg>
              </span>
              Credit / Debit card
            </button>
            <button 
              className={`payment-method-btn ${selectedPaymentMethod === "bank" ? "active" : ""}`}
              onClick={() => handlePaymentMethodChange("bank")}
            >
              <span className="method-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 8.94044V18.0004M17 8.94044V18.0004M7 8.94044V18.0004M12.447 3.10644L20.211 7.01444C21.155 7.48944 20.819 8.92144 19.764 8.92144H4.236C3.181 8.92144 2.845 7.48944 3.789 7.01444L11.553 3.10644C11.6918 3.03708 11.8448 3.00098 12 3.00098C12.1552 3.00098 12.3082 3.03708 12.447 3.10644ZM19.5 21.0004H4.5C4.10218 21.0004 3.72064 20.8424 3.43934 20.5611C3.15804 20.2798 3 19.8983 3 19.5004C3 19.1026 3.15804 18.7211 3.43934 18.4398C3.72064 18.1585 4.10218 18.0004 4.5 18.0004H19.5C19.8978 18.0004 20.2794 18.1585 20.5607 18.4398C20.842 18.7211 21 19.1026 21 19.5004C21 19.8983 20.842 20.2798 20.5607 20.5611C20.2794 20.8424 19.8978 21.0004 19.5 21.0004Z"
                    stroke="black"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              Bank Account
            </button>
            <button 
              className={`payment-method-btn ${selectedPaymentMethod === "bkash" ? "active" : ""}`}
              onClick={() => handlePaymentMethodChange("bkash")}
            >
              <span className="method-icon">
                <img src={BkashLogo} alt="bkash" />
              </span>
              bkash
            </button>
            <button 
              className={`payment-method-btn ${selectedPaymentMethod === "nagad" ? "active" : ""}`}
              onClick={() => handlePaymentMethodChange("nagad")}
            >
              <span className="method-icon">
                <img src={NagadLogo} alt="nagad" />
              </span>
              Nagad
            </button>
            <button 
              className={`payment-method-btn ${selectedPaymentMethod === "rocket" ? "active" : ""}`}
              onClick={() => handlePaymentMethodChange("rocket")}
            >
              <span className="method-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M2.6014 13.0831L6.0534 14.5941L16.0014 9.16715L10.0014 16.1671L18.6014 20.0831C18.7485 20.1476 18.9089 20.1756 19.0691 20.1649C19.2293 20.1543 19.3846 20.1051 19.5218 20.0218C19.6591 19.9384 19.7742 19.8232 19.8575 19.6859C19.9408 19.5487 19.9898 19.3934 20.0004 19.2331L21.0004 4.23315C21.0115 4.05953 20.9773 3.88601 20.901 3.72965C20.8247 3.57329 20.709 3.43949 20.5654 3.34141C20.4217 3.24333 20.2549 3.18435 20.0815 3.17028C19.9081 3.1562 19.734 3.18752 19.5764 3.26115L2.5764 11.2611C2.40299 11.3434 2.25686 11.4738 2.15538 11.6367C2.05391 11.7996 2.00137 11.9883 2.004 12.1802C2.00663 12.3721 2.06433 12.5592 2.17024 12.7193C2.27614 12.8794 2.4258 13.0057 2.6014 13.0831ZM8.0014 22.1671L12.7774 19.8511L8.0014 17.6231V22.1671Z"
                    fill="black"
                  />
                </svg>
              </span>
              Rocket
            </button>
          </div>
        </div>

        {activeComponent}
      </div>

      <div className="payment-right-panel">
        <div className="noteroom-logo">
          <div className="logo-box">
            <img src={nrLogo} alt="noteroom logo" />
          </div>
          <span className="logo-text">noteroom</span>
        </div>

        <h2 className="payment-plan-heading">Premium plan</h2>
        <p className="payment-plan-description">
          Achieve you goals faster with our premium plan
        </p>

        <div className="payment-price-container">
          <div className="price-wrapper">
            <span className="plan-price-value">999</span>
            <span className="currency">BDT</span>
          </div>
          <span className="plan-period">/ per month</span>
        </div>

        <div className="premium-features">
          <div className="payment-feature-item">
            <div className="payment-feature-icon">
              <CheckmarkIcon />
            </div>
            <span className="payment-feature-text">Verified Badge</span>
          </div>

          <div className="payment-feature-item">
            <div className="payment-feature-icon">
              <CheckmarkIcon />
            </div>
            <span className="payment-feature-text">Customizable template</span>
          </div>

          <div className="payment-feature-item">
            <div className="payment-feature-icon">
              <CheckmarkIcon />
            </div>
            <span className="payment-feature-text">Multiuser access</span>
          </div>

          <div className="payment-feature-item">
            <div className="payment-feature-icon">
              <CheckmarkIcon />
            </div>
            <span className="payment-feature-text">Third party intrigation</span>
          </div>

          <div className="payment-feature-item">
            <div className="payment-feature-icon">
              <CheckmarkIcon />
            </div>
            <span className="payment-feature-text">24/7 Priority Support</span>
          </div>
        </div>

        <button className="switch-plan-btn" onClick={handleSwitchPlan}>
          Switch to Standard plan
        </button>
      </div>
    </div>
  );
};

export default Payment;
