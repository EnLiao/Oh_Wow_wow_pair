import log_out_icon from '../assets/log_out.png';
import search_icon from '../assets/search.png';
import { useNavigate } from 'react-router-dom';

export default function NavBar() {
  const navigate = useNavigate();

  const handleLogOut = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  return (
    <div
      style={{
        height: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F5F5F5',
        borderBottom: '1px solid #E4E4E4',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: '0 5%',                   // ✅ 取代你的 right: 5% 與 marginRight
      }}
    >
      {/* 左邊：logo/title */}
      <div style={{ flex: '1 1 30%', minWidth: '100px' }}>
        <h3
          style={{
            cursor: 'pointer',
            userSelect: 'none',
            whiteSpace: 'nowrap',
            fontSize: 'clamp(10px, 2vw, 30px)',
            margin: 0,                        // 清除預設 margin
          }}
          onMouseOver={(e) => { e.currentTarget.style.opacity = 0.5; }}
          onMouseOut={(e) => { e.currentTarget.style.opacity = 1; }}
          onClick={() => { navigate('/main_page'); }}
        >
          Oh-Wow-wow-pair
        </h3>
      </div>

      {/* 中間：搜尋欄 + + 號 */}
      <div
        style={{
          flex: '1 1 50%',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          justifyContent: 'center',
        }}
      >
        <div style={{ position: 'relative', width: '100%', maxWidth: '400px',height:30, fontSize: 'clamp(11px, 2vw, 15px)'}}>
          <input
            type="text"
            placeholder="Oh-Wow-wow-pair"
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              borderRadius: '5px',
              backgroundColor: '#E4E4E4',
              paddingLeft: 30,
              fontSize: 'inherit',
            }}
          />
          <img
            src={search_icon}
            alt="search_icon"
            style={{
              width: '1.5em',
              height: '1.5em',
              position: 'absolute',
              top: '50%',
              left: 5,
              transform: 'translateY(-50%)',
            }}
          />
        </div>
        <p
          onMouseOver={(e) => { e.currentTarget.style.opacity = 0.5; }}
          onMouseOut={(e) => { e.currentTarget.style.opacity = 1; }}
          style={{
            fontSize: 'clamp(20px, 2vw, 30px)',
            cursor: 'pointer',
            userSelect: 'none',
            margin: 0,
            marginBottom: 5,
          }}
        >
          +
        </p>
      </div>

      {/* 右邊：登出 icon */}
      <div style={{ flex: '1 1 20%', display: 'flex', justifyContent: 'flex-end' }}>
        <img
          src={log_out_icon}
          alt="log out icon"
          onClick={handleLogOut}
          onMouseOver={(e) => { e.currentTarget.style.opacity = 0.5; }}
          onMouseOut={(e) => { e.currentTarget.style.opacity = 1; }}
          style={{
            width: 'clamp(15px, 2vw, 25px)',    // ✅ 自動根據視窗調整大小
            height: 'clamp(15px, 2vw, 25px)',
            cursor: 'pointer',
          }}
        />
      </div>
    </div>
  );
}
