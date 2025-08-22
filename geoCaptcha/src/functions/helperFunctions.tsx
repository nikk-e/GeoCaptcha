const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function answerCaptcha(oldCode: string, locationID: string, newCode: string): Promise<boolean> {
  // Send the old and new code to your server for verification and update
  try {
    const response = await fetch('http://localhost:5000/check_captcha', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: locationID,
        old_code: oldCode,
        new_code: newCode
      }),
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data.result === true;
  } catch (err) {
    console.error('Error checking captcha:', err);
    return false;
  }
}


export async function login(user: { username: string; password: string; captchaResponse: string }): Promise<boolean> {
  await sleep(1000); // Simulate network delay
  console.log("Logging in user:", user);
  return true;
}

export async function getLocation(lon: number, lat: number): Promise<any | null> {
  // Calls backend to get 1 random coordinate within 5km of the given lat/lon
  try {
    const response = await fetch(`http://localhost:5000/get_random_coordinates?lat=${lat}&lon=${lon}`);
    if (!response.ok) {
      console.error("Network error or no coordinate found");
      return null;
    }
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Fetch error:", err);
    return null;
  }
}


