import React, { useState } from 'react';
import "../../public/css/checkout.css";
import PhoneInput from './components/PhoneInput';

interface CardFormProps {
    onSubmit: () => void;
}

const Card: React.FC<CardFormProps> = ({ onSubmit }) => {
    const [saveDetails, setSaveDetails] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        cardHolderName: '',
        cardNumber: '',
        expiryDate: '',
        cvv: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
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
        <div className="card-form-container">
            <div className="basic-information">
                <h3>Basic Information</h3>
                <div className="basic-information-container">
                    <div className="form-group">
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

                    <div className="form-group">
                        <label htmlFor="contactNo">Contact No</label>
                        <PhoneInput 
                            value={formData.phone} 
                            onChange={handlePhoneChange} 
                        />
                    </div>

                    <div className="form-group">
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

            <div className="card-information">
                <h3>Card Information</h3>
                <div className="form-group">
                    <label htmlFor="cardHolderName">Name On Card</label>
                    <input
                        type="text"
                        id="cardHolderName"
                        name="cardHolderName"
                        placeholder="Type your name"
                        value={formData.cardHolderName}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="card-details-grid">
                    <div className="form-group card-number-group">
                        <label htmlFor="cardNumber">Card No</label>
                        <input
                            type="text"
                            id="cardNumber"
                            name="cardNumber"
                            placeholder="0000 0000 00000 00000"
                            value={formData.cardNumber}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="form-group expiry-group">
                        <label htmlFor="expiryDate">Expiry Date</label>
                        <input
                            type="text"
                            id="expiryDate"
                            name="expiryDate"
                            placeholder="MM / YY"
                            value={formData.expiryDate}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="form-group cvv-group">
                        <label htmlFor="cvv">CVC</label>
                        <input
                            type="text"
                            id="cvv"
                            name="cvv"
                            placeholder="3- digit code"
                            value={formData.cvv}
                            onChange={handleInputChange}
                            maxLength={3}
                        />
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

export default Card;
