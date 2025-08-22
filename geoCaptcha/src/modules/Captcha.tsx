import React, { useState } from "react";
import Map from "./Map";

interface GeoCaptchaProps {
  location?: string;
}

const Captcha: React.FC<GeoCaptchaProps> = () => {
  const [code, setCode] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // TODO: Validate code with backend
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
      {submitted && <p>Code submitted! (Validation not implemented)</p>}
    </div>
  );
};

export default Captcha;