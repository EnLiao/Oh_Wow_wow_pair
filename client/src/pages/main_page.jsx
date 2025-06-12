import PostList from '../components/load_post';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../services/auth_context';
import React, { useContext, useEffect } from 'react';
import { getFollowing } from '../services/api';

export default function MainPage() {
  const navigate = useNavigate();
  const auth_context = useContext(AuthContext);
  console.log('auth_context', auth_context);
  const [following, setFollowing] = React.useState([]);
  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        const res = await getFollowing(auth_context.currentDollId);
        setFollowing(res.data);
        console.log('設置 following 為:', res.data); // 新增：檢查設置的資料
      } catch (err) {
        console.error('詳細錯誤:', err.response ? err.response.data : err.message);
      }
    };
    
    fetchFollowing();
  }, [auth_context.currentDollId]); // 添加空陣列作為依賴，確保只執行一次

  const handleNewFollow = async () => {
    // 直接調用 fetchFollowing 重新獲取最新追蹤列表
    try {
      const res = await getFollowing(auth_context.currentDollId);
      setFollowing(res.data);
      console.log('追蹤成功後刷新列表:', res.data); 
    } catch (err) {
      console.error('刷新追蹤列表失敗:', err);
    }
  };

  return (
    <div style={{ paddingLeft: '3%', paddingTop: 50, display: 'flex', flexDirection: 'flex-start'}}>
      {/* left following list */}
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
        <p style={{ fontSize: 15, marginBottom:'0rem' }}>Following</p>
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
            {/* 外層固定正方形＋裁圓 */}
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

            {/* 新增: 包裝文字的容器，設置為垂直排列 */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer'
            }} onClick={() => {navigate(`/doll_page/${following_doll.id}`)}}>
              <p style={{
                margin: 0, // 移除預設邊距
                padding: 0,
                whiteSpace: 'nowrap',
                fontSize: 14,
                fontWeight: 'bold',
              }}>
                {following_doll.id}
              </p>
              <p style={{
                margin: 0, // 移除預設邊距
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

      {/* middle post */}
      <div style={{ 
        width: '60%',
        alignItems: 'center',
        paddingTop: 40,
        }}
      >
        <PostList 
          mode="feed" 
          onFollowSuccess={handleNewFollow} 
        />
      </div>
      {/* right my area */}
      <div style={{ 
        width: '20%', 
        textAlign:'center', 
        marginTop: 20, 
        marginRight:5, 
        marginLeft: 5,
        position: 'sticky', 
        top: 80,  
        height: 'calc(100vh - 60px)',
        overflowY: 'auto'
        }}
      >
        <img
          src={auth_context.doll_img}
          alt={auth_context.doll_name}
          onClick={() => {navigate(`/doll_page/${auth_context.currentDollId}`)}} // 點擊圖片跳轉到 doll profile
          style={{
            width: 70,
            height: 70,
            borderRadius: '50%',
            objectFit: 'cover',
            cursor: 'pointer',
          }}
        />
        <p style={{ textAlign: 'center', fontSize: 12, marginTop:10 }}>Good Morning, {auth_context.doll_name}!</p>
      </div>
    </div>
  );
}
