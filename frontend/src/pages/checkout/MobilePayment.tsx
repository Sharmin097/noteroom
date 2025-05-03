import React, { useState } from 'react';
import "../../public/css/checkout.css";

interface MobilePaymentProps {
  paymentType: 'bkash' | 'nagad' | 'rocket';
  onSubmit: () => void;
}

interface PaymentConfig {
  title: string;
  appName: string;
  dialCode: string;
  merchantNumber: string;
  logo?: string;
}

const MobilePayment: React.FC<MobilePaymentProps> = ({ paymentType, onSubmit }) => {
  const [txID, setTxID] = useState('');
  const [showQR, setShowQR] = useState(false);

  // Configuration for different payment methods
  const paymentConfigs: Record<string, PaymentConfig> = {
    bkash: {
      title: "Bkash Payment",
      appName: "*bKash app",
      dialCode: "*247#",
      merchantNumber: "01XX - XXX - XXXXX"
    },
    nagad: {
      title: "Nagad Payment",
      appName: "*Nagad app",
      dialCode: "*167#",
      merchantNumber: "01XX - XXX - XXXXX"
    },
    rocket: {
      title: "Rocket Payment",
      appName: "",
      dialCode: "*321#",
      merchantNumber: "01XX - XXX - XXXXX"
    }
  };

  const config = paymentConfigs[paymentType];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (txID.trim()) {
      onSubmit();
    } else {
      alert("Please enter transaction ID");
    }
  };

  const toggleQR = () => {
    setShowQR(!showQR);
  };

  return (
    <div className="mobile-payment-container">
      <h2 className="payment-title">{config.title}</h2>

      <div className="qr-section">
        <p className="step-number">1. Scan the QR <span className="qr-code-image">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.3333 28V25.3333H20V28H17.3333ZM14.6667 25.3333V18.6667H17.3333V25.3333H14.6667ZM25.3333 21.3333V16H28V21.3333H25.3333ZM22.6667 16V13.3333H25.3333V16H22.6667ZM6.66667 18.6667V16H9.33333V18.6667H6.66667ZM4 16V13.3333H6.66667V16H4ZM16 6.66667V4H18.6667V6.66667H16ZM6 10H10V6H6V10ZM4 12V4H12V12H4ZM6 26H10V22H6V26ZM4 28V20H12V28H4ZM22 10H26V6H22V10ZM20 12V4H28V12H20ZM22.6667 28V24H20V21.3333H25.3333V25.3333H28V28H22.6667ZM17.3333 18.6667V16H22.6667V18.6667H17.3333ZM12 18.6667V16H9.33333V13.3333H17.3333V16H14.6667V18.6667H12ZM13.3333 12V6.66667H16V9.33333H18.6667V12H13.3333ZM7 9V7H9V9H7ZM7 25V23H9V25H7ZM23 9V7H25V9H23Z" fill="black" />
          </svg>
        </span> code <span className="expand-link" onClick={toggleQR}>( click to {showQR ? 'hide' : 'expand'} )</span></p>
      </div>

      <p className="separator">or</p>

      <h3 className="instruction-title">Follow the instruction</h3>

      <div className="payment-steps">
        <div className="step">
          <p className="step-number">Step 1:</p>
          <p className="step-instruction">
            {paymentType === 'rocket'
              ? `Dial ${config.dialCode}`
              : `Open your ${config.appName}" or dial ${config.dialCode}`
            }
          </p>
        </div>

        <div className="step">
          <p className="step-number">Step 2:</p>
          <p className="step-instruction">Go to Send Money{paymentType === 'bkash' ? ' or Payment' : ''}</p>
        </div>

        <div className="step">
          <p className="step-number">Step 3:</p>
          <p className="step-instruction">Enter {paymentType === 'rocket' ? 'our' : 'our merchant'} {paymentType} number : <strong>{config.merchantNumber}</strong></p>
        </div>

        <div className="step">
          <p className="step-number">Step 4:</p>
          <p className="step-instruction">Enter the amount ( 999 TK )</p>
        </div>

        <div className="step">
          <p className="step-number">Step 5:</p>
          <p className="step-instruction">Use reference ( Type you mobile number / User ID )</p>
        </div>

        <div className="step">
          <p className="step-number">Step 6:</p>
          <p className="step-instruction">Complete payment. You will receive an transaction ID on your mobile.</p>
        </div>

        <div className="step">
          <p className="step-number">Step 7:</p>
          <p className="step-instruction">Paste the TxID below and click "Submit"</p>
        </div>
      </div>

      <div className="txid-input-wrapper">
        <div className="txid-input-container">
          <input
            type="text"
            placeholder="XX-XXX-XXXX"
            className="txid-input"
            value={txID}
            onChange={(e) => setTxID(e.target.value)}
          />
          <button className="submit-btn" onClick={handleSubmit}>
            Submit
          </button>
        </div>
      </div>

      <div className="payment-status">
        <p className="finished-text">Finished. <span className="enjoy-text">Now Enjoy your "<strong>Premium Subscription</strong>"</span></p>
      </div>

      <div className="help-text">
        <span className="help-icon">?</span> Need any help? <a href="#" className="contact-support">Don't hesitate to contact support</a>
      </div>
    </div>
  );
};

export default MobilePayment;
