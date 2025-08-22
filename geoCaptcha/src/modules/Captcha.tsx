import React, { useState } from "react";
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

  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setSuccess(null);

    try {
      // Use the location ID from the fetched targetLocation in state
      const targetLocation = await getLocation(60.1878705, 24.8239767);
      const locationID = targetLocation && (targetLocation.id || targetLocation.locationID || targetLocation._id || "");
      const result = await answerCaptcha(code, locationID);
      if (result && typeof result === 'string' && result !== 'error') {
        setSuccess(true);
        setCode("");
        if (onSolved) onSolved(result);
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
        <Map lat={60.1878705} lng={24.8239767} />
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