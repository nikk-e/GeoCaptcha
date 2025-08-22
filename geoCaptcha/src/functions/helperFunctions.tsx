const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function answerCaptcha(captchaResponse: string, locationID: string): Promise<string> {
  // Here you would typically send the captchaResponse to your server for verification
  console.log("Captcha answered:", captchaResponse, locationID);
  fetch('http://localhost:5000/get_captcha')
  .then(res => res.json())
  .then(data => console.log(data));
  return "success";
}


export async function login(user: { username: string; password: string; captchaResponse: string }): Promise<boolean> {
  await sleep(1000); // Simulate network delay
  console.log("Logging in user:", user);
  return true;
}

// Get captcha
fetch('http://localhost:5000/get_captcha')
  .then(res => res.json())
  .then(data => console.log(data));

// Check captcha
fetch('http://localhost:5000/check_captcha', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ id: 'some_id', answer: 'user_answer' })
})
  .then(res => res.json())
  .then(data => console.log(data.result));