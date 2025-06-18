import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from '../services/auth_context';

export default function BottomBar() {
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    // 監聽視窗大小變化
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 移動版底部導航欄 - 固定在底部
  const renderMobileBar = () => {
    return (
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#F5F5F5',
        borderTop: '1px solid #E4E4E4',
        zIndex: 100,
        width: '100%',
        boxShadow: '0 -2px 5px rgba(0,0,0,0.1)',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
        }}>
          <div 
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              padding: '5px 0',
            }}
            onClick={() => navigate('/main_page')}
          >
            <span style={{ fontSize: '25px' }}>🏠</span>
          </div>
          <div 
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              padding: '5px 0',
            }}
            // onClick={() => navigate('/search')}
          >
            <span style={{ fontSize: '25px' }}>🔍</span>
          </div>
          <div 
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              padding: '5px 0',
            }}
            onClick={() => navigate('/create_post')}
          >
            <span style={{ fontSize: '25px' }}>➕</span>
          </div>
          <div 
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              padding: '5px 0',
            }}
            // onClick={() => navigate('/following list')}
          >
            <span style={{ fontSize: '25px' }}>👥</span>
          </div>
          <div 
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              padding: '5px 0',
            }}
            onClick={() => navigate(`/doll_page/${authContext.currentDollId}`)}
          >
            <span style={{ fontSize: '25px' }}>👤</span>
          </div>
        </div>
      </div>
    );
  };

  // 桌面版底部導航欄 - 正常流佈局
  const renderDesktopBar = () => {
    return (
      <div style={{
        backgroundColor: '#F5F5F5', 
        borderTop: '1px solid #E4E4E4',
        padding: '20px 0',
        marginTop: '30px',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          padding: '0 20px',
        }}>
          {/* 左側區域 - 網站資訊 */}
          <div style={{ flex: '0 0 30%' }}>
            <h3 style={{ marginBottom: '10px' }}>Oh-Wow-wow-pair</h3>
            <p style={{ color: '#666', fontSize: '14px' }}>
              連結玩具娃娃愛好者的社交平台
            </p>
          </div>
          
          {/* 中間區域 - 導航連結 */}
          <div style={{ flex: '0 0 30%', display: 'flex', justifyContent: 'center' }}>
            <ul style={{ 
              listStyle: 'none', 
              padding: 0, 
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '10px' 
            }}>
              <li style={{ cursor: 'pointer' }} onClick={() => navigate('/main_page')}>首頁</li>
              <li style={{ cursor: 'pointer' }} onClick={() => navigate('/create_post')}>發表貼文</li>
              <li style={{ cursor: 'pointer' }} onClick={() => navigate(`/doll_page/${localStorage.getItem('currentDollId')}`)}>個人資料</li>
            </ul>
          </div>
          
          {/* 右側區域 - 聯絡資訊 */}
          <div style={{ flex: '0 0 30%', textAlign: 'right' }}>
            <p style={{ color: '#666', fontSize: '14px', margin: '5px 0' }}>
              聯絡我們: contact@ohwowwowpair.com
            </p>
            <p style={{ color: '#666', fontSize: '14px', margin: '5px 0' }}>
              © 2025 Oh-Wow-wow-pair. 保留所有權利。
            </p>
          </div>
        </div>
      </div>
    );
  };

  // 根據裝置類型渲染對應的底部導航欄
  return isMobile ? renderMobileBar() : renderDesktopBar();
}