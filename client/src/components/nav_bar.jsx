import React, { useState, useEffect, useContext } from 'react';
import { Button, UncontrolledPopover, PopoverBody } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../services/auth_context';
import default_doll_img from '../assets/windy.jpg';
import { doll_list_view, getDollInfo } from '../services/api';
import search_icon from '../assets/search.png';

export default function NavBar() {
  const navigate = useNavigate();
  const auth_context = useContext(AuthContext);
  
  const [open, setOpen] = useState(false);
  const [dollList, setDollList] = useState([]);
  const dollImage = auth_context.doll_img;
  const currentDollId = auth_context.currentDollId;

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
        padding: '0 5%',
      }}
    >
      <div style={{ flex: '1 1 30%', minWidth: '100px' }}>
        <h3
          style={{
            cursor: 'pointer',
            userSelect: 'none',
            whiteSpace: 'nowrap',
            fontSize: 'clamp(10px, 2vw, 30px)',
            margin: 0,
          }}
          onMouseOver={(e) => { e.currentTarget.style.opacity = 0.5; }}
          onMouseOut={(e) => { e.currentTarget.style.opacity = 1; }}
          onClick={() => { navigate('/main_page'); }}
        >
          Oh-Wow-wow-pair
        </h3>
      </div>

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

      <div style={{ flex: '1 1 20%', display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          id="dollPopover"
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
              width: 'clamp(15px,2vw,25px)',
              height: 'clamp(15px,2vw,25px)',
              cursor: 'pointer',
            }}
          />
        </Button>

        <UncontrolledPopover
          isOpen={open}
          target="dollPopover"
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
              navigate('/login');
            }}>
              Log&nbsp;out
            </Button>
          </PopoverBody>
        </UncontrolledPopover>
      </div>
    </div>
  );
}