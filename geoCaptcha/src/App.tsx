import Captcha from './modules/Captcha'
import "./App.css";

import { useState } from 'react';

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loggedIn, showCaptcha] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  
    if (username && password) {

      showCaptcha(true);
    }
  };

  return (
    <div className="app-Container">
       <h1 className='Title'>Cool as hell App</h1>
    <div className="app">
     
      {!loggedIn ? (
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
      ) : (
        <div>
          <Captcha />
        </div>
      )}
    </div>
    </div>
  );
}

export default App
