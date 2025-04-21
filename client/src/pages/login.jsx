import { useState } from 'react'
import { login, register } from '../services/api'

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [nickname, setNickname] = useState('')
  const [avatar_url, setAvatar_url] = useState('')
  const [bio, setBio] = useState('')

  const handleSubmit = async () => {
    if (isSignUp) {
      const data = {
        username,
        password,
        email,
        nickname,
        avatar_url,
        bio
      };
  
      try {
        const res = await register(data); // axios 呼叫 register
        console.log('sign up success', res.data);
        alert('sign up success');
        setIsSignUp(false);
      } catch (err) {
        if (err.response){
          alert(`sign up failed：${err.response.data?.detail || 'Account or password is incorrect'}`);
        }
        else if (err.request){
          alert('sign up failed：No response from server');
        }
        else{
          alert(`sign up failed：${err.message}`);
        }
      }
  
    } else {
      try {
        const res = await login({ username, password }); // axios 呼叫 login
        const { access, refresh } = res.data;
  
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        console.log('log in success', res.data);
        alert('log in success');
      } catch (err) {
        if (err.response){
          alert(`log in failed：${err.response.data?.detail || 'Account or password is incorrect'}`);
        }
        else if (err.request){
          alert('log in failed：No response from server');
        }
        else{
          alert(`log in failed：${err.message}`);
        }
      }
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh'
    }}>
      <h1>{isSignUp ? 'Sign Up' : 'Login'}</h1>

      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ marginBottom: '10px' }}
      />

      {isSignUp && (
        <>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ marginBottom: '10px' }}
          />
          <input
            type="text"
            placeholder="Nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            style={{ marginBottom: '10px' }}
          />
          <input
            type="text"
            placeholder="Avatar URL"
            value={avatar_url}
            onChange={(e) => setAvatar_url(e.target.value)}
            style={{ marginBottom: '10px' }}
          />
          <input
            type="text"
            placeholder="Bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            style={{ marginBottom: '10px' }}
          />
        </>
      )}

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ marginBottom: '20px' }}
      />

      <button style={{ padding: '10px 20px' }} onClick={handleSubmit}>
        {isSignUp ? 'Sign Up' : 'Login'}
      </button>

      <button
        style={{ padding: '10px 20px', marginTop: '10px' }}
        onClick={() => setIsSignUp(prev => !prev)}
      >
        {isSignUp ? 'Back to Login' : 'Sign Up'}
      </button>
    </div>
  )
}
