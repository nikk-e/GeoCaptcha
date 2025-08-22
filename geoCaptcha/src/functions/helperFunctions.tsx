
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function answerCaptcha(captchaResponse: string, locationID: string): Promise<boolean> {
  // Here you would typically send the captchaResponse to your server for verification
  console.log("Captcha answered:", captchaResponse, locationID);
  await sleep(1000); // Simulate network delay
  return true;
}


export async function login(user: { username: string; password: string; captchaResponse: string }): Promise<boolean> {
  await sleep(1000); // Simulate network delay
  console.log("Logging in user:", user);
  return true;
}