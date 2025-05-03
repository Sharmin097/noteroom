import React, { useState } from 'react';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
}

const PhoneInput: React.FC<PhoneInputProps> = ({ value, onChange }) => {
  const [countryCode, setCountryCode] = useState("+88");

  // Define country flags mapping
  const countryFlags = {
    "+88": "https://cdn.countryflags.com/thumbs/bangladesh/flag-400.png",
    "+1": "https://cdn.countryflags.com/thumbs/united-states-of-america/flag-400.png",
    "+44": "https://cdn.countryflags.com/thumbs/united-kingdom/flag-400.png"
  };

  const handleCountryCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCountryCode(e.target.value);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="phone-input-container">
      <div className="country-selector">
        <div className="country-dropdown">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="dropdown-caret">
            <path fillRule="evenodd" clipRule="evenodd" d="M2.86316 5.19571C2.98818 5.07073 3.15772 5.00052 3.33449 5.00052C3.51127 5.00052 3.68081 5.07073 3.80583 5.19571L8.00116 9.39105L12.1965 5.19571C12.258 5.13204 12.3316 5.08125 12.4129 5.04631C12.4942 5.01137 12.5817 4.99298 12.6702 4.99221C12.7587 4.99144 12.8465 5.00831 12.9285 5.04183C13.0104 5.07535 13.0848 5.12485 13.1474 5.18745C13.21 5.25004 13.2595 5.32448 13.293 5.40641C13.3266 5.48834 13.3434 5.57613 13.3427 5.66465C13.3419 5.75317 13.3235 5.84065 13.2886 5.92198C13.2536 6.00332 13.2028 6.07688 13.1392 6.13838L8.94383 10.3337C8.69379 10.5837 8.35471 10.7241 8.00116 10.7241C7.64761 10.7241 7.30853 10.5837 7.05849 10.3337L2.86316 6.13838C2.73818 6.01336 2.66797 5.84382 2.66797 5.66705C2.66797 5.49027 2.73818 5.32073 2.86316 5.19571Z" fill="black" />
          </svg>
          <select 
            className="country-code"
            value={countryCode}
            onChange={handleCountryCodeChange}
          >
            <option value="+88">+88</option>
            <option value="+1">+1</option>
            <option value="+44">+44</option>
          </select>
          <div className="flag-icon">
            <img 
              src={countryFlags[countryCode as keyof typeof countryFlags]} 
              alt="Country Flag" 
            />
          </div>
        </div>
      </div>
      <input
        type="tel"
        placeholder="01XXXX"
        value={value}
        onChange={handlePhoneChange}
        className="phone-number-input"
      />
    </div>
  );
};

export default PhoneInput; 