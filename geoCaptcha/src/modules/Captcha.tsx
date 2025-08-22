import React, { useState, useEffect } from "react";
import Map from "./Map";
import { answerCaptcha, getLocation } from "../functions/helperFunctions";
import "./Captcha.css";

interface GeoCaptchaProps {
  location?: string;
  onSolved?: (code: string) => void;
}

const Captcha: React.FC<GeoCaptchaProps> = ({ onSolved }) => {
  const [code, setCode] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [success, setSuccess] = useState<null | boolean>(null);
  const [targetLocation, setTargetLocation] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount, fetch a random location
  useEffect(() => {
    async function fetchLocation() {
      setLoading(true);
      const loc = await getLocation(60.1878705, 24.8239767);
      setTargetLocation(loc);
      setLoading(false);
    }
    fetchLocation();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setSuccess(null);

    try {
      if (!targetLocation) {
        setSuccess(false);
        return;
      }
      const locationID = targetLocation.id || targetLocation.locationID || targetLocation._id || "";
      const result = await answerCaptcha(code, locationID);
      console.log("Captcha check result:", result);
      if (result === true) {
        setSuccess(true);
        setCode("");
        if (onSolved) onSolved(String(result));
      } else {
        setSuccess(false);
      }
    } catch {
      setSuccess(false);
    }
  };

  const handleRefresh = () => {
    setCode("");
    setSubmitted(false);
    setSuccess(null);
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
          {loading ? (
            <div style={{ 
              height: "200px", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              background: "#f5f5f5",
              borderRadius: "4px"
            }}>
              Loading map...
            </div>
          ) : targetLocation ? (
            <Map lat={targetLocation.latitude} lng={targetLocation.longitude} />
          ) : (
            <div style={{ 
              height: "200px", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              background: "#f5f5f5",
              borderRadius: "4px"
            }}>
              Map unavailable
            </div>
          )}
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
                maxLength={20}
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="submit-button"
              disabled={!code.trim()}
            >
              Verify
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
        <button 
          className="refresh-button"
          onClick={handleRefresh}
          title="Get new challenge"
        >
          🔄
        </button>
      </div>
    </div>
  );
};

export default Captcha;