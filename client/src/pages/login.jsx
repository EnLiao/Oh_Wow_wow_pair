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
      }
  
      try {
        const res = await register({ username, password, email, nickname, bio, avatar_url })
  
        if (res.ok) {
          const result = await res.json()
          console.log('✅ 註冊成功！', result)
          alert('註冊成功，請重新登入')
          setIsSignUp(false)
        } else {
          const error = await res.json()
          console.error('❌ 註冊失敗', error)
          alert(`註冊失敗：${error.detail || '請檢查欄位'}`)
        }
      } catch (err) {
        console.error('❌ 網路錯誤', err)
        alert('無法連線到伺服器')
      }
  
    } else {
      const data = { username, password }
  
      try {
        const res = await login({ username, password })
  
        if (res.ok) {
          const result = await res.json()
          console.log('✅ 登入成功！', result)
          localStorage.setItem('access_token', result.access)
          localStorage.setItem('refresh_token', result.refresh)
          alert('登入成功')
        } else {
          const error = await res.json()
          console.error('❌ 登入失敗', error)
          alert(`登入失敗：${error.detail || '帳號或密碼錯誤'}`)
        }
      } catch (err) {
        console.error('❌ 網路錯誤', err)
        alert('無法連線到伺服器')
      }
    }
  }

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
