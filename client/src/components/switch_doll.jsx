import React, { useState, useRef, useEffect } from 'react';
// import current_doll_avatar from '../assets/current_doll_avatar.png';

const SwitchDoll = ({ onSwitchUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);

  const togglePopover = () => {
    if (isOpen) {
      setIsOpen(false);
    } else {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY, // 加上滾動距離
        left: rect.left + window.scrollX
      });
      setIsOpen(true);
    }
  };

  const handleClickOutside = (e) => {
    if (buttonRef.current && !buttonRef.current.contains(e.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <>
      <img ref={buttonRef} onClick={togglePopover}
          // src={current_doll_avatar}
          alt="current doll avatar"
          onMouseOver={(e) => { e.currentTarget.style.opacity = 0.5; }}
          onMouseOut={(e) => { e.currentTarget.style.opacity = 1; }}
          style={{
            width: 'clamp(15px, 2vw, 25px)',
            height: 'clamp(15px, 2vw, 25px)',
            cursor: 'pointer',
          }}
        />
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: position.top + 'px',
          left: position.left + 'px',
          backgroundColor: 'white',
          border: '1px solid #ccc',
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          padding: '10px',
          borderRadius: '5px',
          zIndex: 1000
        }}>
          <button onClick={() => { onSwitchUser('user1'); setIsOpen(false); }}>doll_id = 1</button>
          <button onClick={() => { onSwitchUser('user2'); setIsOpen(false); }}>doll_id = 2</button>
          <button onClick={() => handleLogOut}>Log out</button>
        </div>
      )}
    </>
  );
};

export default SwitchDoll;
