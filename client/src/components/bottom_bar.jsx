import { useState, useEffect, useContext, useRef, use } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from '../services/auth_context';
import Search from './search';
import search_icon from '../assets/search.png';
import { getFollowing } from '../services/api';
import { IoMdHome } from "react-icons/io";
import { IoSearch } from "react-icons/io5";
import { IoMdAdd } from "react-icons/io";
import { FaUserFriends } from "react-icons/fa";
import { IoPerson } from "react-icons/io5";

export default function BottomBar() {
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showSearch, setShowSearch] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showFollowing, setShowFollowing] = useState(false);
  const [following, setFollowing] = useState([]);
  
  // 添加ref來引用覆蓋層元素
  const followingOverlayRef = useRef(null);
  const searchOverlayRef = useRef(null);

  const fetchFollowing = async () => {
    try {
      const res = await getFollowing(authContext.currentDollId);
      setFollowing(res.data);
    } catch (err) {
      console.error('獲取關注列表失敗:', err);
    }
  };

  // 監聽點擊外部事件
  useEffect(() => {
    const handleClickOutside = (event) => {
      // 如果followingOverlay顯示中，且點擊事件不在覆蓋層內
      if (
        showFollowing &&
        followingOverlayRef.current && 
        !followingOverlayRef.current.contains(event.target) &&
        // 確保不是點擊底部導航列的按鈕
        !event.target.closest('.following-button')
      ) {
        setShowFollowing(false);
      }
    };

    // 添加全局點擊事件監聽器
    document.addEventListener('mousedown', handleClickOutside);
    
    // 清理函數
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFollowing]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // 如果followingOverlay顯示中，且點擊事件不在覆蓋層內
      if (
        showSearch &&
        searchOverlayRef.current && 
        !searchOverlayRef.current.contains(event.target) &&
        // 確保不是點擊底部導航列的按鈕
        !event.target.closest('.search-button')
      ) {
        setShowSearch(false);
      }
    };

    // 添加全局點擊事件監聽器
    document.addEventListener('mousedown', handleClickOutside);
    
    // 清理函數
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSearch]);

  useEffect(() => {
    // 監聽視窗大小變化
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (showFollowing) {
        fetchFollowing();
    }
    }, [showFollowing]);

  // 處理搜尋輸入變化
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchKeyword(value);
    
    // 只有當輸入非空時才顯示結果
    if (value.trim()) {
      setShowSearch(true);
    } else {
      setShowSearch(false);
    }
  };
  
  // 搜尋覆蓋層
  const SearchOverlay = () => {
    return (
      <div 
        ref={searchOverlayRef}
        style={{
            position: 'fixed',
            top: 40,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'white',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            padding: '15px',
      }}>
        {/* 搜尋頂部欄 */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          marginBottom: '15px',
          gap: '10px'
        }}>
          {/* 搜尋輸入框 */}
          <div style={{ 
            position: 'relative',
            flex: 1,
          }}>
            <input
              type="text"
              placeholder="搜尋 Oh-Wow-wow-pair"
              value={searchKeyword}
              onChange={handleInputChange}
              autoFocus
              style={{
                width: '100%',
                height: '40px',
                border: 'none',
                borderRadius: '20px',
                backgroundColor: '#f0f0f0',
                paddingLeft: '35px',
                fontSize: '16px',
                outline: 'none',
              }}
            />
            <img
              src={search_icon || '🔍'}
              alt="search"
              style={{
                width: '18px',
                height: '18px',
                position: 'absolute',
                top: '50%',
                left: '10px',
                transform: 'translateY(-50%)',
                opacity: '0.6',
              }}
            />
          </div>
        </div>
        
        {/* 搜尋結果區域 */}
        <div style={{ 
          flex: 1,
          overflowY: 'auto'
        }}>
          {searchKeyword ? (
            <Search 
              keyword={searchKeyword} 
              onResultClick={() => {
                setSearchKeyword('');
                setShowSearch(false);
              }} 
            />
          ) : (
            <div style={{ 
              textAlign: 'center',
              color: '#666',
              marginTop: '30px'
            }}>
              <p>輸入關鍵詞開始搜尋</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const FollowingOverlay = () => {
    return (
      <div 
        ref={followingOverlayRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'white',
          zIndex: 99, 
          display: 'flex',
          flexDirection: 'column',
          padding: '15px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            marginTop: 10,
            paddingLeft: '1%',
            width: '100%',
            position: 'sticky', 
            top: 80,  
            height: 'calc(100vh - 80px)',
            overflowY: 'auto'
          }}
        >
          <h5 style={{ marginBottom:'0rem' }}>追蹤列表</h5>
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
                  width: 50,
                  height: 50,
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
                  fontSize: 17,
                  fontWeight: 'bold',
                }}>
                  {following_doll.id}
                </p>
                <p style={{
                  margin: 0,
                  padding: 0,
                  whiteSpace: 'nowrap',
                  fontSize: 15,
                  color: '#6c757d'
                }}>
                  {following_doll.name}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 移動版底部導航欄 - 固定在底部
  const renderMobileBar = () => {
    return (
      <>
        {showSearch && <SearchOverlay />}
        {showFollowing && <FollowingOverlay />}
        
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
          paddingTop: '10px',
          paddingBottom: '10px',
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
              <IoMdHome size={25}/>
            </div>
            <div 
              className="search-button"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                padding: '5px 0',
              }}
              onClick={() => setShowSearch(true)}
            >
              <IoSearch size={25}/>
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
              <IoMdAdd size={25}/>
            </div>
            <div 
              className="following-button" // 添加className以識別此按鈕
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                padding: '5px 0',
              }}
              onClick={(e) => {
                e.stopPropagation(); // 防止事件冒泡
                setShowFollowing(true);
                setShowSearch(false); // 確保關閉其他覆蓋層
              }}
            >
              <FaUserFriends size={25}/>
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
              <IoPerson size={25}/>
            </div>
          </div>
        </div>
      </>
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
              <li style={{ cursor: 'pointer' }} onClick={() => navigate(`/doll_page/${authContext.currentDollId}`)}>個人資料</li>
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