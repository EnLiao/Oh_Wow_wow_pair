import React, { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../services/api.js';
import ChatRoom from './chat_room.jsx';
import chatNotificationService from '../services/chat_notification_service.js';
import './chat_list.css';

const ChatList = ({ currentUser, currentDoll }) => {
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const chatRoomsRef = useRef([]);

  // 監聽全域聊天室更新
  useEffect(() => {
    if (currentDoll) {
      loadChatRooms();
      
      // 設置全域函數讓 ChatService 可以直接調用
      window.updateChatList = (roomId, message) => {
        updateChatRoomLastMessage(roomId, message);
      };
      
      // 添加强制刷新功能
      window.forceRefreshChatList = () => {
        loadChatRooms();
      };
      
      // 監聽自定義事件
      const handleChatMessage = (event) => {
        updateChatRoomLastMessage(event.detail.roomId, event.detail.message);
      };
      
      const handleReadReceipt = (event) => {
        // 這裡可以處理已讀狀態的更新，比如移除未讀計數等
      };
      
      window.addEventListener('chatMessageReceived', handleChatMessage);
      window.addEventListener('messageReadReceived', handleReadReceipt);

      return () => {
        // 清理監聽器
        window.removeEventListener('chatMessageReceived', handleChatMessage);
        window.removeEventListener('messageReadReceived', handleReadReceipt);
        delete window.updateChatList;
        delete window.forceRefreshChatList;
      };
    }
  }, [currentDoll]);

  const loadChatRooms = async () => {
    if (!currentDoll) return;
    
    try {
      setLoading(true);
      const response = await chatAPI.getChatRooms(currentDoll.id);
      const rooms = response.data.results || response.data || [];
      setChatRooms(rooms);
      chatRoomsRef.current = rooms;
    } catch (error) {
      console.error('載入聊天室失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  // 更新特定聊天室的最後訊息
  const updateChatRoomLastMessage = (roomId, message) => {
    setChatRooms(prevRooms => {
      const updatedRooms = prevRooms.map(room => {
        if (room.id === parseInt(roomId)) {
          const updatedRoom = {
            ...room,
            latest_message: {
              content: message.encrypted_content,
              decrypted_content: message.decrypted_content || message.encrypted_content,
              message_type: message.message_type,
              timestamp: message.timestamp,
              sender_name: message.sender_name
            },
            // 如果不是當前用戶發送的訊息，增加未讀計數
            unread_count: message.sender_id !== currentDoll?.id ? 
              (room.unread_count || 0) + 1 : (room.unread_count || 0)
          };
          return updatedRoom;
        }
        return room;
      });
      
      // 按最後訊息時間排序
      updatedRooms.sort((a, b) => {
        const timeA = a.latest_message?.timestamp || a.created_at;
        const timeB = b.latest_message?.timestamp || b.created_at;
        return new Date(timeB) - new Date(timeA);
      });
      
      chatRoomsRef.current = updatedRooms;
      return updatedRooms;
    });
  };

  // 清除特定聊天室的未讀計數
  const clearUnreadCount = (roomId) => {
    setChatRooms(prevRooms => 
      prevRooms.map(room => 
        room.id === roomId ? { ...room, unread_count: 0 } : room
      )
    );
  };

  const getOtherDoll = (room) => {
    return room.doll1_id === currentDoll.id ? 
      { id: room.doll2_id, name: room.doll2_name } : 
      { id: room.doll1_id, name: room.doll1_name };
  };

  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '剛剛';
    if (diffMins < 60) return `${diffMins}分鐘前`;
    if (diffHours < 24) return `${diffHours}小時前`;
    if (diffDays < 7) return `${diffDays}天前`;
    
    return date.toLocaleDateString('zh-TW');
  };

  const getLastMessagePreview = (message) => {
    if (!message) return '尚無訊息';
    
    switch (message.message_type) {
      case 'text':
        // 優先使用 decrypted_content，如果沒有則使用 content 或顯示加密訊息提示
        return message.decrypted_content || message.content || '[加密訊息]';
      case 'image':
        return '📷 圖片';
      case 'sticker':
        return '😀 貼圖';
      case 'emoji':
        return '😊 自訂表情符號';
      default:
        return '訊息';
    }
  };

  if (selectedRoom) {
    return (
      <div className="chat-container">
        <div className="chat-sidebar">
          <button 
            className="back-button"
            onClick={() => {
              setSelectedRoom(null);
              // 重新載入聊天室列表以更新未讀計數
              loadChatRooms();
            }}
          >
            ← 返回聊天列表
          </button>
        </div>
        <ChatRoom 
          roomId={selectedRoom.id}
          currentUser={currentUser}
          currentDoll={currentDoll}
          otherDoll={getOtherDoll(selectedRoom)}
          onNewMessage={(message) => {
            updateChatRoomLastMessage(selectedRoom.id, message);
          }}
          onMarkRoomAsRead={() => clearUnreadCount(selectedRoom.id)}
        />
      </div>
    );
  }

  return (
    <div className="chat-list-container">
      <div className="chat-list-header">
        <h2>聊天室</h2>
      </div>

      <div className="chat-list">
        {loading ? (
          <div className="loading">載入中...</div>
        ) : chatRooms.length === 0 ? (
          <div className="empty-state">
            <p>尚無聊天室</p>
          </div>
        ) : (
          chatRooms.map(room => {
            const otherDoll = getOtherDoll(room);
            return (
              <div 
                key={room.id}
                className="chat-item"
                onClick={() => setSelectedRoom(room)}
              >
                <div className="chat-avatar">
                  {otherDoll.name?.[0]}
                </div>
                <div className="chat-info">
                  <div className="chat-name">
                    {otherDoll.name}
                  </div>
                  <div className="chat-preview">
                    {getLastMessagePreview(room.latest_message)}
                  </div>
                </div>
                <div className="chat-meta">
                  <div className="chat-time">
                    {formatLastMessageTime(room.latest_message?.timestamp)}
                  </div>
                  {room.unread_count > 0 && (
                    <div className="unread-badge">
                      {room.unread_count}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatList;
