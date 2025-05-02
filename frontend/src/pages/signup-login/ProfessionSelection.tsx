import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../../public/css/signup-login.css";
import ngLogo from "../../assets/ng_logo.png";
import catImage from "../../assets/cat_image.png";

const ProfessionSelection: React.FC = () => {
    const navigate = useNavigate();
    const [selectedOption, setSelectedOption] = useState<string>('student');
    const options = ['student', 'teacher', 'organization', 'institution', 'other'];

    const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedOption(e.target.value);
    };

    const handleContinue = () => {
        if (selectedOption === 'teacher') {
            navigate('/checkout');
        } else {
            navigate('/'); 
        }
    };

    const handleGoBack = () => {
        navigate('/signup'); 
    };

    return (
        <div className="profession-container">
            <div className="profession-left-panel">
                <div className="profession-form-container">
                    <div className="profession-logo-container">
                        <img src={ngLogo} alt="NoteRoom" className="profession-logo" />
                    </div>

                    <div className="profession-content">
                        <h1 className="profession-heading">What defines you the best?</h1>

                        <div className="profession-options">
                            {options.map((option,index) => {
                                return (
                                    <label className="profession-option" key={index}>
                                        <input
                                            type="radio"
                                            name="profession"
                                            value={option}
                                            checked={selectedOption === option}
                                            onChange={handleOptionChange}
                                        />
                                        <span className="profession-radio"></span>
                                        <span className="profession-label">{option.charAt(0).toUpperCase() + option.slice(1)}</span>
                                    </label>
                                )
                            })}
                        </div>

                        <div className="profession-actions">
                            <button className="profession-btn go-back-btn " onClick={handleGoBack}>
                                <span>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    Go back
                                </span>
                            </button>

                            <button className="profession-btn continue-btn " onClick={handleContinue}>
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="profession-right-panel">
                <img src={catImage} alt="Cat under night sky" className="cat-image" />
            </div>
        </div>
    );
};

export default ProfessionSelection;
