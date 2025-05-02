import React, { useState } from 'react';
import "../../public/css/checkout.css";
import PhoneInput from './components/PhoneInput';

interface BankFormProps {
  onSubmit: () => void;
}

const Bank: React.FC<BankFormProps> = ({ onSubmit }) => {
  const [saveDetails, setSaveDetails] = useState(false);
  const [countryCode, setCountryCode] = useState("+88");
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    accountType: ''
  });

  // Define country flags mapping
  const countryFlags = {
    "+88": "https://cdn.countryflags.com/thumbs/bangladesh/flag-400.png",
    "+1": "https://cdn.countryflags.com/thumbs/united-states-of-america/flag-400.png",
    "+44": "https://cdn.countryflags.com/thumbs/united-kingdom/flag-400.png"
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCountryCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCountryCode(e.target.value);
  };

  const handlePhoneChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      phone: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="bank-form-container">
      <div className="basic-information">
        <h3>Basic Information</h3>
        <div className="basic-information-container">
          <div className="checkout-form-group">
            <label htmlFor="fullName">Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              placeholder="Type your name"
              value={formData.fullName}
              onChange={handleInputChange}
            />
          </div>

          <div className="checkout-form-group">
            <label htmlFor="contactNo">Contact No</label>
            <PhoneInput 
              value={formData.phone} 
              onChange={handlePhoneChange} 
            />
          </div>
          <div className="checkout-form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Type your Email"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>
        </div>

      </div>

      <div className="bank-information">
        <h3>Bank Information</h3>
        <div className="basic-information-container">
          <div className="checkout-form-group">
            <label htmlFor="bankName">Bank Name</label>
            <div className="bank-select-wrapper">
              <input
                type="text"
                id="bankName"
                name="bankName"
                placeholder="Find your bank"
                
                value={formData.bankName}
                onChange={handleInputChange}
              />
              <span className="dropdown-arrow">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M4.29279 7.79259C4.48031 7.60512 4.73462 7.49981 4.99979 7.49981C5.26495 7.49981 5.51926 7.60512 5.70679 7.79259L11.9998 14.0856L18.2928 7.79259C18.385 7.69708 18.4954 7.6209 18.6174 7.56849C18.7394 7.51608 18.8706 7.4885 19.0034 7.48734C19.1362 7.48619 19.2678 7.51149 19.3907 7.56177C19.5136 7.61205 19.6253 7.68631 19.7192 7.7802C19.8131 7.87409 19.8873 7.98574 19.9376 8.10864C19.9879 8.23154 20.0132 8.36321 20.012 8.49599C20.0109 8.62877 19.9833 8.75999 19.9309 8.882C19.8785 9.004 19.8023 9.11435 19.7068 9.20659L13.4138 15.4996C13.0387 15.8745 12.5301 16.0852 11.9998 16.0852C11.4695 16.0852 10.9608 15.8745 10.5858 15.4996L4.29279 9.20659C4.10532 9.01907 4 8.76476 4 8.49959C4 8.23443 4.10532 7.98012 4.29279 7.79259Z"
                    fill="black"
                  />
                </svg>

              </span>
            </div>
          </div>

          <div className="checkout-form-group">
            <label htmlFor="accountNumber">Account Number</label>
            <input
              type="text"
              id="accountNumber"
              name="accountNumber"
              placeholder="0000 0000 0000 0000"
              value={formData.accountNumber}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="basic-information-container">
          <div className="checkout-form-group">
            <label htmlFor="accountHolder">Account Holder</label>
            <input
              type="text"
              id="accountHolder"
              name="accountHolder"
              placeholder="Type account holder name"
              value={formData.accountHolder}
              onChange={handleInputChange}
            />
          </div>

          <div className="checkout-form-group">
            <label htmlFor="accountType">Account Type</label>
            <div className="bank-select-wrapper">
              <select
                id="accountType"
                name="accountType"
                value={formData.accountType}
                onChange={handleInputChange}
              >
                <option value="" disabled>Select account type</option>
                <option value="savings">Savings Account</option>
                <option value="checking">Checking Account</option>
                <option value="current">Current Account</option>
              </select>
              <span className="dropdown-arrow">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M4.29279 7.79259C4.48031 7.60512 4.73462 7.49981 4.99979 7.49981C5.26495 7.49981 5.51926 7.60512 5.70679 7.79259L11.9998 14.0856L18.2928 7.79259C18.385 7.69708 18.4954 7.6209 18.6174 7.56849C18.7394 7.51608 18.8706 7.4885 19.0034 7.48734C19.1362 7.48619 19.2678 7.51149 19.3907 7.56177C19.5136 7.61205 19.6253 7.68631 19.7192 7.7802C19.8131 7.87409 19.8873 7.98574 19.9376 8.10864C19.9879 8.23154 20.0132 8.36321 20.012 8.49599C20.0109 8.62877 19.9833 8.75999 19.9309 8.882C19.8785 9.004 19.8023 9.11435 19.7068 9.20659L13.4138 15.4996C13.0387 15.8745 12.5301 16.0852 11.9998 16.0852C11.4695 16.0852 10.9608 15.8745 10.5858 15.4996L4.29279 9.20659C4.10532 9.01907 4 8.76476 4 8.49959C4 8.23443 4.10532 7.98012 4.29279 7.79259Z"
                    fill="black"
                  />
                </svg>

              </span>
            </div>
          </div>
        </div>

        <div className="save-billing">
          <input
            type="checkbox"
            id="saveBilling"
            checked={saveDetails}
            onChange={() => setSaveDetails(!saveDetails)}
          />
          <label htmlFor="saveBilling">Save Billing info</label>
        </div>
      </div>

      <button className="confirm-subscription" onClick={handleSubmit}>
        Confirm Subscription
      </button>

      <div className="help-text">
        <span className="help-icon">?</span> Need any help? <a href="#" className="contact-support">Don't hesitate to contact support</a>
      </div>
    </div>
  );
};

export default Bank;
