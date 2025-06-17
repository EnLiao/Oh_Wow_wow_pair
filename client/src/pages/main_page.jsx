import PostList from '../components/load_post';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../services/auth_context';
import React, { useContext, useEffect, useState } from 'react';
import { getFollowing } from '../services/api';

export default function MainPage() {
  const navigate = useNavigate();
  const auth_context = useContext(AuthContext);
  const [following, setFollowing] = useState([]);
  const [greeting, setGreeting] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // 監聽視窗大小變化
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // 獲取關注列表
  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        const res = await getFollowing(auth_context.currentDollId);
        setFollowing(res.data);
      } catch (err) {
        console.error('詳細錯誤:', err.response ? err.response.data : err.message);
      }
    };
    
    fetchFollowing();
  }, [auth_context.currentDollId]);

  // 生成問候語
  useEffect(() => {
    const greetings = [
      `Hello, ${auth_context.doll_name}!`,
      `Hi there, ${auth_context.doll_name}!`,
      `Welcome back, ${auth_context.doll_name}!`,
      `Nice to see you, ${auth_context.doll_name}!`,
      `What's new, ${auth_context.doll_name}?`,
      `How's it going, ${auth_context.doll_name}?`,
      `Have a great day, ${auth_context.doll_name}!`,
      `Let's explore, ${auth_context.doll_name}!`,
      `Ready for fun, ${auth_context.doll_name}?`
    ];
    
    const randomIndex = Math.floor(Math.random() * greetings.length);
    setGreeting(greetings[randomIndex]);
  }, [auth_context.doll_name]);

  const handleNewFollow = async () => {
    try {
      const res = await getFollowing(auth_context.currentDollId);
      setFollowing(res.data);
    } catch (err) {
      console.error('刷新追蹤列表失敗:', err);
    }
  };

  // 手機版界面 - 只顯示貼文
  const renderMobileVersion = () => {
    return (
      <div style={{ 
        width: '100%',
        padding: '0 10px',
        marginTop: 10,
        marginBottom: 70 // 為底部導航欄預留空間
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: 15,
          padding: '0 5px'
        }}>
          <img
            src={auth_context.doll_img}
            alt={auth_context.doll_name}
            onClick={() => {navigate(`/doll_page/${auth_context.currentDollId}`)}}
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              objectFit: 'cover',
              cursor: 'pointer',
            }}
          />
          <p style={{ 
            margin: 0,
            marginLeft: 10,
            fontSize: 14
          }}>
            {greeting}
          </p>
        </div>

        {/* 手機版只顯示貼文列表 */}
        <PostList 
          mode="feed" 
          onFollowSuccess={handleNewFollow} 
        />
      </div>
    );
  };

  // 桌面版界面 - 完整三欄式布局
  const renderDesktopVersion = () => {
    return (
      <div style={{ 
        paddingLeft: '3%', 
        display: 'flex', 
        flexDirection: 'row'
      }}>
        {/* 左側關注列表 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            marginTop: 10,
            paddingLeft: '1%',
            width: '20%',
            position: 'sticky', 
            top: 80,  
            height: 'calc(100vh - 80px)',
            overflowY: 'auto'
          }}
        >
          <h6 style={{ marginBottom:'0rem' }}>Following</h6>
          {following.map(following_doll => (
            <div
              key={following_doll.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                paddingLeft: '7%',
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                <img
                  src={following_doll.avatar_image}
                  alt={following_doll.name}
                  onClick={() => {navigate(`/doll_page/${following_doll.id}`)}}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    cursor: 'pointer',
                  }}
                />
              </div>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer'
              }} onClick={() => {navigate(`/doll_page/${following_doll.id}`)}}>
                <p style={{
                  margin: 0,
                  padding: 0,
                  whiteSpace: 'nowrap',
                  fontSize: 14,
                  fontWeight: 'bold',
                }}>
                  {following_doll.id}
                </p>
                <p style={{
                  margin: 0,
                  padding: 0,
                  whiteSpace: 'nowrap',
                  fontSize: 14,
                  color: '#6c757d'
                }}>
                  {following_doll.name}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* 中間貼文列表 */}
        <div style={{ 
          width: '60%',
          alignItems: 'center',
          paddingTop: 40,
        }}>
          <PostList 
            mode="feed" 
            onFollowSuccess={handleNewFollow} 
          />
        </div>
        
        {/* 右側個人資訊 */}
        <div style={{ 
          width: '20%', 
          textAlign:'center', 
          marginTop: 20, 
          marginRight:5, 
          marginLeft: 5,
          position: 'sticky', 
          top: 80,  
          height: 'calc(100vh - 80px)',
          overflowY: 'auto'
        }}>
          <img
            src={auth_context.doll_img}
            alt={auth_context.doll_name}
            onClick={() => {navigate(`/doll_page/${auth_context.currentDollId}`)}}
            style={{
              width: 70,
              height: 70,
              borderRadius: '50%',
              objectFit: 'cover',
              cursor: 'pointer',
            }}
          />
          <p style={{ textAlign: 'center', fontSize: 13, marginTop: 10 }}>
            {greeting}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div style={{ 
      paddingTop: 50, // 為頂部導航欄預留空間
    }}>
      {isMobile ? renderMobileVersion() : renderDesktopVersion()}
    </div>
  );
}
