import img1 from '../assets/windy.jpg';
import img2 from '../assets/carrot.jpg';
import img3 from '../assets/omuba.jpg';
import Post from '../components/load_post';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../services/auth_context';
import React, { useContext } from 'react';
// I can use <Post> unlimited!

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
        {following_list.map(following_doll => (
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
                src={following_doll.img}
                alt={following_doll.name}
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
              {following_doll.name}
            </p>
          </div>
        ))}
      </div>

      {/* middle post */}
      <div style={{ 
        width: '60%',
        alignItems: 'center',
        paddingTop: 20,
        }}
      >
        <Post
          user={auth_context.doll_name}
          content="Hello, this is my first post!"
          image={auth_context.doll_img}
        />
        <Post
          user="Windy"
          content="Just chilling with my friends!"
          image={img1}
        />
        <Post
          user="魔魔胡胡胡蘿蔔"
          content="Loving the new game update!"
          image={img2}
        />
        <Post
          user="歐姆吧"
          content="Can't wait for the next event!"
          image={img3}
        />
      </div>
      {/* right my area */}
      <div style={{ width: '20%', textAlign:'center', marginTop: 20, marginRight:5, marginLeft: 5 }}>
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
