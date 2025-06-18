import React, { useState, useEffect, useContext } from 'react';
import { Button, UncontrolledPopover, PopoverBody, Collapse, Navbar, NavbarToggler } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../services/auth_context';
import default_doll_img from '../assets/windy.jpg';
import { doll_list_view, getDollInfo } from '../services/api';
import search_icon from '../assets/search.png';
import Search from './search';

export default function NavBar() {
  const navigate = useNavigate();
  const auth_context = useContext(AuthContext);
  
  const [open, setOpen] = useState(false);
  const [dollList, setDollList] = useState([]);
  const dollImage = auth_context.doll_img;
  const currentDollId = auth_context.currentDollId;
  const [showSearch, setShowSearch] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchKeyword(value);
    
    if (value.trim()) {
      setShowSearch(true);
    } else {
      setShowSearch(false);
    }
  };

  const clearSearch = () => {
    setShowSearch(false);
    setSearchKeyword('');
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    const fetchDolls = async () => {
      try {
        const res = await doll_list_view(auth_context.username);
        setDollList(res.data);
        localStorage.setItem('doll_list', JSON.stringify(res.data));
      } catch (err) {
        console.error(err);
        alert('Failed to fetch doll list');
      }
    };
    fetchDolls();
  }, [open, auth_context.username]);

  const handleSwitchUser = async (dollId) => {
    try {
      auth_context.updateDollId(dollId);
      const res = await getDollInfo(dollId);
      auth_context.updateDollImg(res.data.avatar_image);
      auth_context.updateDollName(res.data.name);
      setOpen(false);
      navigate('/main_page');
    } catch (err) {
      console.error('切換娃娃失敗:', err);
      alert('切換娃娃失敗，請重試');
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 渲染手機版導航欄
  const renderMobileVersion = () => {
    return (
      <>
        {/* 手機版頂部區域 */}
        <div style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          {/* 網站標題 */}
          <div style={{ flex: '1 1 auto', minWidth: '0' }}>
            <h3
              style={{
                cursor: 'pointer',
                userSelect: 'none',
                whiteSpace: 'nowrap',
                fontSize: 'clamp(16px, 5vw, 24px)',
                margin: 0,
              }}
              onMouseOver={(e) => { e.currentTarget.style.opacity = 0.5; }}
              onMouseOut={(e) => { e.currentTarget.style.opacity = 1; }}
              onClick={() => { navigate('/main_page'); }}
            >
              Oh-Wow-wow-pair
            </h3>
          </div>

          {/* 手機版按鈕區域 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {/* 創建貼文按鈕 */}
            <p
              onMouseOver={(e) => { e.currentTarget.style.opacity = 0.5; }}
              onMouseOut={(e) => { e.currentTarget.style.opacity = 1; }}
              onClick={() => { navigate('/create_post'); }}
              style={{
                fontSize: '24px',
                cursor: 'pointer',
                userSelect: 'none',
                margin: 0,
              }}
            >
              +
            </p>
            
            {/* 使用者頭像 */}
            <Button
              id="mobileDollPopover"
              color="link"
              style={{ padding: 0, background: 'transparent', border: 'none' }}
              onClick={() => setOpen(!open)}
            >
              <img
                src={
                  typeof dollImage === 'string'
                    ? dollImage
                    : dollImage instanceof File
                    ? URL.createObjectURL(dollImage)
                    : default_doll_img
                }
                onError={(e) => {
                  console.log('圖片載入失敗', e);
                  e.target.src = default_doll_img;
                }}
                style={{
                  width: 30,
                  height: 30,
                  cursor: 'pointer',
                  borderRadius: '50%',
                  objectFit: 'cover',
                }}
              />
            </Button>
            
            {/* 漢堡菜單按鈕 */}
            <div 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ cursor: 'pointer', padding: '5px' }}
            >
              <div style={{
                width: '25px',
                height: '3px',
                backgroundColor: '#333',
                margin: '4px 0',
                transition: 'all 0.3s',
                transform: mobileMenuOpen ? 'rotate(-45deg) translate(-5px, 6px)' : 'none'
              }}></div>
              <div style={{
                width: '25px',
                height: '3px',
                backgroundColor: '#333',
                margin: '4px 0',
                opacity: mobileMenuOpen ? 0 : 1,
                transition: 'all 0.3s'
              }}></div>
              <div style={{
                width: '25px',
                height: '3px',
                backgroundColor: '#333',
                margin: '4px 0',
                transition: 'all 0.3s',
                transform: mobileMenuOpen ? 'rotate(45deg) translate(-5px, -6px)' : 'none'
              }}></div>
            </div>
          </div>
        </div>
        
        {/* 手機版展開菜單 */}
        <Collapse isOpen={mobileMenuOpen} style={{ width: '100%' }}>
          <div style={{ 
            padding: '12px 0',
            borderTop: '1px solid #e4e4e4',
            marginTop: '8px'
          }}>
            <div style={{ position: 'relative', width: '100%', padding: '0 10px', marginBottom: '10px' }}>
              <input
                type="text"
                placeholder="Oh-Wow-wow-pair"
                value={searchKeyword}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  height: '30px',
                  border: 'none',
                  borderRadius: '5px',
                  backgroundColor: '#E4E4E4',
                  paddingLeft: 30,
                  fontSize: '14px',
                }}
              />
              <img
                src={search_icon}
                alt="search_icon"
                style={{
                  width: '18px',
                  height: '18px',
                  position: 'absolute',
                  top: '50%',
                  left: 15,
                  transform: 'translateY(-50%)',
                  userSelect: 'none',
                }}
              />
            </div>
            
            {/* 手機版搜尋結果 */}
            {showSearch && (
              <div style={{ padding: '10px' }}>
                <Search keyword={searchKeyword} onResultClick={() => {
                  clearSearch();
                  setMobileMenuOpen(false);
                }} />
              </div>
            )}
          </div>
        </Collapse>
      </>
    );
  };

  // 渲染桌面版導航欄
  const renderDesktopVersion = () => {
    return (
      <div style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 10,
      }}>
        {/* 網站標題 */}
        <div style={{ flex: '1 1 30%', minWidth: '100px' }}>
          <h3
            style={{
              cursor: 'pointer',
              userSelect: 'none',
              whiteSpace: 'nowrap',
              fontSize: 'clamp(16px, 5vw, 24px)',
              margin: 0,
            }}
            onMouseOver={(e) => { e.currentTarget.style.opacity = 0.5; }}
            onMouseOut={(e) => { e.currentTarget.style.opacity = 1; }}
            onClick={() => { navigate('/main_page'); }}
          >
            Oh-Wow-wow-pair
          </h3>
        </div>
        
        {/* 桌面版搜尋區域 */}
        <div
          style={{
            flex: '1 1 50%',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            justifyContent: 'center',
          }}
        >
          <div style={{ position: 'relative', width: '100%', maxWidth: '400px', height: 30 }}>
            <input
              type="text"
              placeholder="Oh-Wow-wow-pair"
              value={searchKeyword}
              onChange={handleInputChange}
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
            {/* 搜尋結果 */}
            {showSearch && (
              <div style={{ 
                padding: '20px',
                backgroundColor: '#fff',
                position: 'absolute',
                width: '100%',
                zIndex: 101,
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                borderRadius: '0 0 5px 5px'
              }}>
                <Search keyword={searchKeyword} onResultClick={clearSearch} />
              </div>
            )}
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
                userSelect: 'none',
              }}
            />
          </div>
          <p
            onMouseOver={(e) => { e.currentTarget.style.opacity = 0.5; }}
            onMouseOut={(e) => { e.currentTarget.style.opacity = 1; }}
            onClick={() => { navigate('/create_post'); }}
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
        
        {/* 桌面版使用者頭像 */}
        <div style={{ flex: '1 1 20%', display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            id="desktopDollPopover"
            color="link"
            style={{ padding: 0, background: 'transparent', border: 'none' }}
            onClick={() => setOpen(!open)}
          >
            <img
              src={
                typeof dollImage === 'string'
                  ? dollImage
                  : dollImage instanceof File
                  ? URL.createObjectURL(dollImage)
                  : default_doll_img
              }
              onError={(e) => {
                console.log('圖片載入失敗', e);
                e.target.src = default_doll_img;
              }}
              style={{
                width: 'clamp(15px,5vw,30px)',
                height: 'clamp(15px,5vw,30px)',
                cursor: 'pointer',
                borderRadius: '50%',
                objectFit: 'cover',
              }}
            />
          </Button>
        </div>
      </div>
    );
  };

  // 渲染使用者選單
  const renderUserPopover = () => {
    return (
      <UncontrolledPopover
        isOpen={open}
        target={isMobile ? "mobileDollPopover" : "desktopDollPopover"}
        toggle={() => setOpen(!open)}
        placement="bottom"
        modifiers={[
          { name: 'preventOverflow', options: { boundary: 'viewport', padding: 8 } },
        ]}
      >
        <PopoverBody className="d-grid gap-2" style={{ minWidth: 150, maxWidth: '90vw' }}>
          {dollList
            .filter((d) => d.id !== currentDollId)
            .map((d) => (
              <Button
                key={d.id}
                onClick={() => handleSwitchUser(d.id)}
              >
                {`${d.id}`}
              </Button>
            ))}

          {dollList.filter((d) => d.id !== currentDollId).length === 0 && (
            <div className="text-muted text-center">No other dolls</div>
          )}

          <Button color="primary" onClick={() => {
            navigate('/create_doll');
            setOpen(false);
          }}>
            Create&nbsp;new&nbsp;doll
          </Button>

          <Button color="danger" onClick={() => {
            auth_context.logout();
            navigate('/');
          }}>
            Log&nbsp;out
          </Button>
        </PopoverBody>
      </UncontrolledPopover>
    );
  };

  // 主渲染函數
  return (
    <div
      style={{
        height: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F5F5F5',
        borderBottom: '1px solid #E4E4E4',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: isMobile ? '8px 4%' : '0 5%',
      }}
    >
      {isMobile ? renderMobileVersion() : renderDesktopVersion()}
      {renderUserPopover()}
    </div>
  );
}