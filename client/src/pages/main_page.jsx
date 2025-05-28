import img1 from '../assets/windy.jpg';
import img2 from '../assets/carrot.jpg';
import img3 from '../assets/omuba.jpg';
import Post from '../components/load_post';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../services/auth_context';
import React, { useContext } from 'react';
// I can use <Post> unlimited!
// 新增切換帳號、新增帳號UI

const following_list = [
  { id: 1, img: img1, name: 'Windy' },
  { id: 2, img: img2, name: '魔魔胡胡胡蘿蔔' },
  { id: 3, img: img3, name: '歐姆吧' },
];

export default function MainPage() {
  const navigate = useNavigate();
  const auth_context = useContext(AuthContext);
  console.log('auth_context', auth_context);
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
        }}
      >
        <p style={{ fontSize: 15 }}>Following</p>
        {following_list.map(user => (
          <div
            key={user.id}
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
                src={user.img}
                alt={user.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  cursor: 'pointer',
                }}
              />
            </div>
            <p
              style={{
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontSize: 14,
              }}
            >
              {user.name}
            </p>
          </div>
        ))}
      </div>

      {/* middle post */}
      <div style={{ width: '60%'}}>
      </div>
      {/* right my area */}
      <div style={{ width: '20%', textAlign:'center', marginTop: 20, marginRight:'5%' }}>
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
        <p style={{ textAlign: 'center', fontSize: 12 }}>Good Morning, {auth_context.doll_name}!</p>
      </div>
    </div>
  );
}
