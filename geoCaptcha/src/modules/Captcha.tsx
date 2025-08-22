import React, { useState } from "react";
import Map from "./Map";
import { answerCaptcha } from "../functions/helperFunctions";
import "./Captcha.css";

interface GeoCaptchaProps {
  location?: string;
  onSolved?: (code: string) => void;
}

const Captcha: React.FC<GeoCaptchaProps> = ({ onSolved }) => {
  const [code, setCode] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [success, setSuccess] = useState<null | boolean>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    
    setSubmitted(true);
    setIsLoading(true);
    setSuccess(null);
    
    try {
      const result = await answerCaptcha(code, "locationID");
      if (result && typeof result === 'string') {
        setSuccess(true);
        setCode("");
        if (onSolved) onSolved(result);
      } else {
        setSuccess(false);
      }
    } catch {
      setSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="captcha-container">
      <div className="captcha-header">
        <div className="captcha-icon">🌍</div>
        <h2 className="captcha-title">GeoCaptcha Verification</h2>
      </div>
      
      <div className="captcha-challenge">
        <div className="challenge-text">
          <div className="challenge-instruction">
            Visit the location shown on the map and find the verification code
          </div>
          Look for a QR code or sign with your unique verification code at this location.
        </div>
        
        <div className="map-container">
          <Map lat={60.1878705} lng={24.8239767} />
        </div>
        
        <div className="input-section">
          <form onSubmit={handleSubmit}>
            <div className="code-input-group">
              <label className="code-input-label" htmlFor="verification-code">
                Enter verification code
              </label>
              <input
                id="verification-code"
                className={`code-input ${success === false ? 'error' : ''}`}
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="XXXX-XXXX"
                maxLength={9}
                required
                disabled={isLoading}
              />
            </div>
            
            <button 
              type="submit" 
              className="submit-button"
              disabled={isLoading || !code.trim()}
            >
              {isLoading ? "Verifying..." : "Verify"}
            </button>
          </form>
          
          {submitted && success === true && (
            <div className="status-message status-success">
              ✓ Verification successful! You may now proceed.
            </div>
          )}
          
          {submitted && success === false && (
            <div className="status-message status-error">
              ✗ Invalid verification code. Please check the code and try again.
            </div>
          )}
        </div>
      </div>
      
      <div className="captcha-footer">
        <div className="recaptcha-branding">
          <span>Protected by GeoCaptcha</span>
        </div>
      </div>
    </div>
  );
};

export default Captcha;