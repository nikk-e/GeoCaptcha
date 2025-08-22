import React, { useState, useEffect } from "react";
import Map from "./Map";
import { answerCaptcha, getLocation } from "../functions/helperFunctions";

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

  return (
    <div>
      <p>
        Go to the following location to get your code:
        <br />
        {loading && <span>Loading map...</span>}
        {!loading && targetLocation && (
          <Map lat={targetLocation.latitude} lng={targetLocation.longitude} />
        )}
      </p>
      <form onSubmit={handleSubmit}>
        <label>
          Enter code from location:
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
        </label>
        <button type="submit">Submit Code</button>
      </form>
      {submitted && success === true && <p style={{color: 'green'}}>Code accepted!</p>}
      {submitted && success === false && <p style={{color: 'red'}}>Invalid code. Please try again.</p>}
    </div>
  );
};

export default Captcha;