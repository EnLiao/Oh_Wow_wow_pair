import IntroImg from '../assets/intro_img.jpeg';
import IconImg from '../assets/icon.jpg';

export default function Intro() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#f5f5f5'
    }}>
      <img
        src={IntroImg}
        alt="Intro"
        style={{
          width: '50%',
          height: '50%'
        }}
      />
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', marginTop: '2rem'}}>Oh-Wow-wow-pair</h1>
      <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '2rem', textAlign: 'center' }}>
        歡迎來到 Oh-Wow-wow-pair！<br />
        這裡是專屬於娃娃的社群平台，<br />
        快來分享你心愛的娃娃的日常生活吧！
      </p>
      <img 
        src={IconImg}
        alt="icon" 
        style={{ width: 100, height: 100, marginBottom: '2rem', borderRadius: '50%' }}
      />
      <a 
        href="/login"
        style={{
          padding: '10px 30px',
          background: '#007bff',
          color: 'white',
          borderRadius: '25px',
          textDecoration: 'none',
          fontSize: '1rem',
          fontWeight: 'bold',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}
      >
        開始使用
      </a>
    </div>
  );
}