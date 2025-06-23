import React from 'react';
import { useAuth } from '../services/auth_context.jsx';
import ChatList from '../components/chat_list.jsx';

const ChatPage = () => {
  const { username, currentDollId, doll_name } = useAuth();

  if (!username || !currentDollId) {
    return <div>請先登入並選擇娃娃</div>;
  }

  // 構建 user 和 doll 對象
  const user = { username };
  const currentDoll = { id: currentDollId, name: doll_name };

  return (
    <div className="chat-page">
      <ChatList currentUser={user} currentDoll={currentDoll} />
    </div>
  );
};

export default ChatPage;
