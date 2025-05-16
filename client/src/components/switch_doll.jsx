import React, { useState } from 'react';
import { Button, UncontrolledPopover, PopoverBody } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../services/auth_context';
// import currentAvatar from '../assets/current_doll_avatar.png';

export default function SwitchDoll({ onSwitchUser }) {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen(!open);
  const navigate = useNavigate();
  const auth_context = React.useContext(AuthContext);

  return (
    <>
      <Button
        id="dollPopover"
        color="link"
        style={{ padding: 0, background: 'transparent', border: 'none' }}
      >
        <img
          // src={currentAvatar}
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