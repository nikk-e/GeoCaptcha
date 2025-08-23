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
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
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


  // User location step
  const [userLocation, setUserLocation] = useState<{lat: number, lon: number} | null>(null);
  const [locationStep, setLocationStep] = useState(true);
  const [manualLat, setManualLat] = useState<string>("");
  const [manualLon, setManualLon] = useState<string>("");

  useEffect(() => {
    if (userLocation) {
      setLoading(true);
      getLocation(userLocation.lon, userLocation.lat).then((loc) => {
        if (!loc || loc.error) {
          setLocationError('There are no currently available geoCaptchas for your location. Fuck you');
          setTargetLocation(null);
          setLoading(false);
          // Do NOT setLocationStep(false); keep user on location step
          return;
        }
        setTargetLocation(loc);
        setLoading(false);
        setLocationStep(false);
      });
    }
  }, [userLocation]);

  const handleGetLocation = () => {
    setLoading(true);
    setLocationError(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
          setLoading(false);
        },
        (error) => {
          setLocationError('Failed to get location. Please allow location access and try again.');
          setLoading(false);
        }
      );
    } else {
      setLocationError('Geolocation is not supported by this browser.');
      setLoading(false);
    }
  };


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

      {locationStep ? (
        <div className="captcha-challenge">
          <div className="challenge-text">
            <div className="challenge-instruction">
              Please provide your location to start verification.
            </div>
          </div>
          <div style={{ margin: '20px 0' }}>
            <button onClick={handleGetLocation} className="submit-button" disabled={loading}>
              {loading ? 'Getting location...' : 'Use my current location'}
            </button>
            {loading && (
              <div style={{ marginTop: 10, color: '#888' }}>Loading...</div>
            )}
            {locationError && (
              <div style={{ marginTop: 10, color: 'red' }}>{locationError}</div>
            )}
          </div>
          <div style={{ margin: '20px 0' }}>
            <div style={{ marginBottom: 8, color: '#666' }}>Or enter your coordinates manually:</div>
            <input
              type="number"
              step="any"
              placeholder="Latitude"
              value={manualLat}
              onChange={e => setManualLat(e.target.value)}
              style={{ marginRight: 8, width: 120 }}
            />
            <input
              type="number"
              step="any"
              placeholder="Longitude"
              value={manualLon}
              onChange={e => setManualLon(e.target.value)}
              style={{ marginRight: 8, width: 120 }}
            />
            <button
              className="submit-button"
              style={{ marginLeft: 8 }}
              disabled={loading || !manualLat || !manualLon}
              onClick={() => {
                if (manualLat && manualLon) {
                  setUserLocation({ lat: parseFloat(manualLat), lon: parseFloat(manualLon) });
                }
              }}
            >
              Use entered coordinates
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="captcha-challenge">
            {!currentCodeVerified && (
              <>
                <div className="challenge-text">
                  <div className="challenge-instruction">
                    Visit the location shown on the map to find a verification code.
                  </div>
                    Once you arrive at the location, look at the hint below.
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
                  
                <div>
                  {targetLocation && targetLocation.hint != null && targetLocation.hint !== ""
                    ? targetLocation.hint
                    : "No hint available"}
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
                        Enter verification code
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
                        <p>To keep GeoCaptcha secure, we need you to write down a new verification code in this location for other users.</p>
                        <p>Please write down a new code at the location and then enter it here.</p>
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
        </>
      )}
      <div className="captcha-footer">
        <div className="recaptcha-branding">
          <span>Protected by GeoCaptcha</span>
        </div>
        {targetLocation && (
          <button 
            className="refresh-button"
            onClick={handleRefresh}
            title="Get new challenge"
          >
            🔄
          </button>
        )}
      </div>
    </div>
  );
};

export default Captcha;