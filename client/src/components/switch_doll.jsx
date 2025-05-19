import React, { useState } from 'react';
import { Button, UncontrolledPopover, PopoverBody } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../services/auth_context';
import default_doll_img from '../assets/windy.jpg'; // 預設圖片，可以作為載入中的替代
import { doll_list_view } from '../services/api';

export default function SwitchDoll({ onSwitchUser }) {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen(!open);
  const navigate = useNavigate();
  const auth_context = React.useContext(AuthContext);
  const doll_image = auth_context.doll_img;
  console.log(auth_context);

  const handleSubmit = async () => {
    try {
      const res = await doll_list_view(auth_context.username);
      const doll_list = res.data;
      localStorage.setItem('doll_list', JSON.stringify(doll_list));
    }
    catch (err) {
      console.error(err);
      alert('Failed to fetch doll list');
    }
  }
  return (
    <>
      <Button
        id="dollPopover"
        color="link"
        style={{ padding: 0, background: 'transparent', border: 'none' }}
      >
        <img
          src={typeof doll_image === 'string' 
                ? doll_image
                : doll_image instanceof File 
                ? URL.createObjectURL(doll_image)
                : default_doll_img}
          onError={(e) => {
            console.log('圖片載入失敗', e);
            e.target.src = default_doll_img; // 設置為預設圖片
          }}
          style={{
            width: 'clamp(15px,2vw,25px)',
            height: 'clamp(15px,2vw,25px)',
            cursor: 'pointer',
          }}
        />
      </Button>

      <UncontrolledPopover
        trigger="legacy"
        target="dollPopover"
        placement="bottom"
        modifiers={[
          {
            name: 'preventOverflow',
            options: { boundary: 'viewport', padding: 8 },
          },
        ]}
      >
        <PopoverBody className="d-grid gap-2" style={{ minWidth: 150, maxWidth: '90vw' }}>
          <Button onClick={() => onSwitchUser('user1')}>doll_id = 1</Button>
          <Button onClick={() => onSwitchUser('user2')}>doll_id = 2</Button>
          <Button onClick={auth_context.logout}>Log out</Button>
        </PopoverBody>
      </UncontrolledPopover>
    </>
  );
}