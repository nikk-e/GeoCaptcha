import React, { useState, useEffect } from "react";
import Map from "./Map";
import { answerCaptcha, getLocation } from "../functions/helperFunctions";
import "./Captcha.css";

interface GeoCaptchaProps {
  location?: string;
  onSolved?: (code: string) => void;
}

const Captcha: React.FC<GeoCaptchaProps> = ({ onSolved }) => {
  const [oldCode, setOldCode] = useState("");
  const [newCode, setNewCode] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [success, setSuccess] = useState<null | boolean>(null);
  const [targetLocation, setTargetLocation] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [flashError, setFlashError] = useState(false);

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
    if (!oldCode.trim() || !newCode.trim()) return;

    setSubmitted(true);
    setLoading(true);
    setSuccess(null);
    setFlashError(false);

    try {
      const locationID = targetLocation.id || targetLocation.locationID || targetLocation._id || "";
      const result = await answerCaptcha(oldCode, locationID, newCode);
      if (result) {
        setSuccess(true);
        setOldCode("");
        setNewCode("");
        if (onSolved) onSolved(String(result));
      } else {
        setSuccess(false);
        setFlashError(true);
      }
    } catch {
      setSuccess(false);
      setFlashError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setOldCode("");
    setNewCode("");
    setSubmitted(false);
    setSuccess(null);
  };

  const playClankerSound = () => {
    const audio = new Audio("clanker_alarm.mp3");
    audio.play();
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
              <label className="code-input-label" htmlFor="old-code">
                Enter current code and new code
              </label>
              <input
                id="old-code"
                className={`code-input ${success === false ? 'error' : ''}`}
                type="text"
                value={oldCode}
                onChange={(e) => setOldCode(e.target.value.toUpperCase())}
                placeholder="Current code"
                maxLength={20}
                required
              />
              <input
                id="new-code"
                className={`code-input ${success === false ? 'error' : ''}`}
                type="text"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                placeholder="New code"
                maxLength={20}
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="submit-button"
              disabled={!oldCode.trim() || !newCode.trim()}
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
            playClankerSound(),
            <div className={`status-message status-error${flashError ? " flash" : ""}`}>
              CLANKER DETECTED!
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