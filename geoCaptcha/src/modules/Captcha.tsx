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
  const [currentCodeVerified, setCurrentCodeVerified] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [success, setSuccess] = useState<null | boolean>(null);
  const [targetLocation, setTargetLocation] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [flashError, setFlashError] = useState(false);
  const [uploadedPhoto, setUploadedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedPhoto(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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
    
    if (!currentCodeVerified) {
      // First step: verify current code
      if (!oldCode.trim()) return;
      
      setSubmitted(true);
      setLoading(true);
      setSuccess(null);
      setFlashError(false);

      try {
        const locationID = targetLocation.id || targetLocation.locationID || targetLocation._id || "";
        // Just verify the old code first
        const result = await answerCaptcha(oldCode, locationID, "");
        if (result) {
          setCurrentCodeVerified(true);
          setSuccess(true);
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
    } else {
      // Second step: submit new code
      if (!newCode.trim()) return;
      
      setLoading(true);
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
    }
  };

const handleRefresh = async () => {
  setOldCode("");
  setNewCode("");
  setCurrentCodeVerified(false);
  setSubmitted(false);
  setSuccess(null);
  setFlashError(false);
  setLoading(true);
  const loc = await getLocation(60.1878705, 24.8239767);
  setTargetLocation(loc);
  setLoading(false);
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
        {!currentCodeVerified && (
          <>
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
                <Map lat={targetLocation.latitude} lng={targetLocation.longitude} hint={targetLocation.hint} />
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
            
            <div className="photo-section">
              <div className="photo-upload-container">
                <input
                  type="file"
                  id="photo-upload"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  style={{ display: 'none' }}
                />
                <label htmlFor="photo-upload" className="photo-upload-label">
                  {photoPreview ? 'Change Photo' : 'Upload Location Photo'}
                </label>
                {photoPreview && (
                  <div className="photo-preview">
                    <img src={photoPreview} alt="Location" className="preview-image" />
                  </div>
                )}
              </div>
            </div>
          </>
        )}
        
        <div className="input-section">
          <form onSubmit={handleSubmit}>
            <div className="code-input-group">
              {!currentCodeVerified ? (
                <>
                  <label className="code-input-label" htmlFor="old-code">
                    Enter the current code from the location
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
                </>
              ) : (
                <>
                  <label className="code-input-label" htmlFor="new-code">
                    Enter your new code to place at this location
                  </label>
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
                </>
              )}
            </div>
            
            <button 
              type="submit" 
              className="submit-button"
              disabled={!currentCodeVerified ? !oldCode.trim() : !newCode.trim()}
            >
              {!currentCodeVerified ? "Verify Current Code" : "Submit New Code"}
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