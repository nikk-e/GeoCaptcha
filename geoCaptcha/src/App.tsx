import Captcha from './modules/Captcha'
import "./App.css";

import { useState } from 'react';
import { login } from './functions/helperFunctions';


function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loggedIn, showCaptcha] = useState(false);
  const [loginResult, setLoginResult] = useState<null | 'success' | 'fail'>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  
    if (username && password) {

      showCaptcha(true);
    }
  };

  const handleLogin = (code: string) => {
    showCaptcha(false);
    setLoading(true);
    login({ username, password, captchaResponse: code })
      .then((success) => {
        if (success) {
          setLoginResult('success');
        } else {
          setLoginResult('fail');
        }
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="app-Container">
       {!loggedIn && <h1 className='Title'>Cool as hell App</h1>}
    <div className="app">
     
      {!loggedIn && loginResult !== 'success' ? (
        <>
          {loading ? (
            <div className="spinner" style={{margin: '2rem auto', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <div style={{
                border: '6px solid #f3f3f3',
                borderTop: '6px solid #6cf',
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                animation: 'spin 1s linear infinite'
              }} />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="login-form">
              <div>
                <label>
                  Username: 
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                  />
                </label>
              </div>
              <div>
                <label>
                  Password: 
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                </label>
              </div>
              <button type="submit">Login</button>
            </form>
          )}
          {loginResult === 'fail' && <div style={{color: 'red', marginTop: '1rem'}}>Login failed. Please try again.</div>}
        </>
      ) : loginResult === 'success' ? (
        <div style={{color: 'lightgreen', fontWeight: 'bold', fontSize: '5rem', marginTop: '2rem'}}>Login successful!</div>
      ) : (
        <div>
          <Captcha onSolved={(code) => {
            handleLogin(code);
          }} />
        </div>
  )}
</div>
    </div>
  );
}

export default App
