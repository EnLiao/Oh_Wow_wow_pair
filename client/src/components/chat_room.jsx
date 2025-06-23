import React, { useState, useEffect, useRef, useCallback } from 'react';
import ChatService from '../services/chat_service.js';
import chatNotificationService from '../services/chat_notification_service.js';
import { chatAPI } from '../services/api.js';
import './chat_room.css';

const ChatRoom = ({ roomId, currentUser, currentDoll, otherDoll, onNewMessage, onMarkRoomAsRead }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [stickers, setStickers] = useState([]);
  const [customEmojis, setCustomEmojis] = useState([]);
  const [showStickerPanel, setShowStickerPanel] = useState(false);
  const [showEmojiPanel, setShowEmojiPanel] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  
  const chatService = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // 添加載入狀態防止重複調用
  const [isInitialized, setIsInitialized] = useState(false);

  // 使用 useCallback 確保事件處理器的穩定性
  const handleNewMessage = useCallback((message) => {
    console.log('[ChatRoom] 收到新訊息:', message);  // 調試日誌
    console.log('[ChatRoom] 訊息類型:', message.message_type);  // 調試日誌
    console.log('[ChatRoom] 圖片URL:', message.image_url);  // 調試日誌
    
    setMessages(prev => {
      // 检查消息是否已存在，避免重复添加
      const messageExists = prev.some(existingMsg => existingMsg.id === message.id);
      if (messageExists) {
        console.log('[ChatRoom] 訊息已存在，跳過:', message.id);  // 調試日誌
        return prev;
      }
      
      console.log('[ChatRoom] 添加新訊息到列表');  // 調試日誌
      return [...prev, message];
    });
    
    // 如果不是自己發送的訊息，自動標記為已讀
    if (message.sender_id !== currentDoll.id && chatService.current) {
      setTimeout(() => {
        chatService.current.markMessageRead(message.id);
      }, 1000);
    }
    
    // 通知父組件有新訊息（用於更新聊天室列表）
    if (onNewMessage) {
      onNewMessage(message);
    }
  }, [currentDoll.id, onNewMessage]);

  const handleReaction = useCallback((reactionData) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === reactionData.message_id) {
        const existingReactions = msg.reactions || [];
        
        if (reactionData.action === 'add') {
          // 检查是否已存在相同的反应
          const existingReaction = existingReactions.find(r => 
            r.emoji_code === reactionData.emoji_code && 
            r.doll_id === reactionData.doll_id
          );
          
          if (!existingReaction) {
            // 只有不存在时才添加
            return {
              ...msg,
              reactions: [...existingReactions, {
                emoji_code: reactionData.emoji_code,
                doll_id: reactionData.doll_id,
                user: reactionData.user || currentDoll.name
              }]
            };
          }
        } else if (reactionData.action === 'remove') {
          // 移除反应
          return {
            ...msg,
            reactions: existingReactions.filter(r => 
              !(r.emoji_code === reactionData.emoji_code && 
                r.doll_id === reactionData.doll_id)
            )
          };
        }
      }
      return msg;
    }));
  }, [currentDoll.name]);

  const handleTyping = useCallback((typingData) => {
    if (typingData.doll_id !== currentDoll.id) {
      setOtherUserTyping(typingData.is_typing);
    }
  }, [currentDoll.id]);

  const handleReadReceipt = useCallback((readData) => {
    // 更新對應訊息的已讀狀態
    setMessages(prev => prev.map(msg => 
      msg.id === readData.message_id 
        ? { ...msg, is_read: true }
        : msg
    ));
  }, []);

  useEffect(() => {
    let isMounted = true;
    let unsubscribeMessage, unsubscribeReaction, unsubscribeTyping, unsubscribeReadReceipt;
    
    // 防止重複初始化
    if (isInitialized) {
      return;
    }
    
    // 初始化聊天服務
    chatService.current = ChatService.getInstance();
    
    // 連接 WebSocket（傳遞 token 和 doll_id）
    const token = localStorage.getItem('access_token');
    
    if (!token || !currentDoll.id) {
      console.error('缺少認證信息');
      return;
    }
    
    if (isMounted) {
      // 先註冊事件處理器
      unsubscribeMessage = chatService.current.onMessage(handleNewMessage);
      unsubscribeReaction = chatService.current.onReaction(handleReaction);
      unsubscribeTyping = chatService.current.onTyping(handleTyping);
      unsubscribeReadReceipt = chatService.current.onReadReceipt(handleReadReceipt);
      
      // 然後連接 WebSocket
      chatService.current.connect(roomId, token, currentDoll.id);
      
      // 註冊到全域通知服務
      chatNotificationService.registerChatRoom(roomId, chatService.current);
      
      // 載入貼圖和自訂表情符號 - 只載入一次
      if (stickers.length === 0) {
        loadStickers();
      }
      if (customEmojis.length === 0) {
        loadCustomEmojis();
      }
      
      // 等待 chatService 初始化完成後再載入訊息歷史
      setTimeout(() => {
        if (isMounted) {
          loadMessages();
          setIsInitialized(true);
        }
      }, 100);
    }
    
    // 清理
    return () => {
      isMounted = false;
      
      // 清理事件處理器
      if (unsubscribeMessage) unsubscribeMessage();
      if (unsubscribeReaction) unsubscribeReaction();
      if (unsubscribeTyping) unsubscribeTyping();
      if (unsubscribeReadReceipt) unsubscribeReadReceipt();
      
      // 從全域通知服務取消註冊
      chatNotificationService.unregisterChatRoom(roomId);
      
      if (chatService.current) {
        chatService.current.cleanup();
      }
      
      // 重置初始化狀態
      setIsInitialized(false);
    };
  }, [roomId]); // 只依賴 roomId，避免重複初始化

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const response = await chatAPI.getChatRoomMessages(roomId, currentDoll.id);
      const loadedMessages = response.data.results || [];
      
      // 不進行解密處理，直接使用後端返回的 decrypted_content
      // 因為後端的 MessageSerializer 已經提供了 decrypted_content 字段
      setMessages(loadedMessages);
      
      // 標記聊天室為已讀
      await markRoomAsRead();
      
      // 自動標記最新的未讀訊息為已讀
      const unreadMessages = loadedMessages.filter(msg => 
        !msg.is_read && msg.sender_id !== currentDoll.id
      );
      
      if (unreadMessages.length > 0 && chatService.current) {
        // 發送已讀回執給所有未讀訊息
        unreadMessages.forEach(message => {
          setTimeout(() => {
            chatService.current.markMessageRead(message.id);
          }, 500); // 延遲 0.5 秒後標記已讀
        });
      }
      
    } catch (error) {
      console.error('載入訊息失敗:', error);
    }
  };

  const markRoomAsRead = async () => {
    try {
      await chatAPI.markRoomRead(roomId, currentDoll.id);
      
      // 通知父組件聊天室已讀（用於清除未讀計數）
      if (onMarkRoomAsRead) {
        onMarkRoomAsRead();
      }
    } catch (error) {
      console.error('標記已讀失敗:', error);
    }
  };

  const loadStickers = async () => {
    try {
      const response = await chatAPI.getStickers();
      setStickers(response.data);
    } catch (error) {
      console.error('載入貼圖失敗:', error);
    }
  };

  const loadCustomEmojis = async () => {
    try {
      const response = await chatAPI.getCustomEmojis();
      setCustomEmojis(response.data);
    } catch (error) {
      console.error('載入自訂表情符號失敗:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() && !selectedImageFile) return;

    try {
      if (selectedImageFile) {
        await chatService.current.sendImageMessage(selectedImageFile, replyingTo?.id);
        setSelectedImageFile(null);
      } else {
        await chatService.current.sendTextMessage(newMessage, replyingTo?.id);
      }
      
      setNewMessage('');
      setReplyingTo(null);
    } catch (error) {
      console.error('發送訊息失敗:', error);
    }
  };

  const sendSticker = async (stickerId) => {
    try {
      await chatService.current.sendSticker(stickerId, replyingTo?.id);
      setShowStickerPanel(false);
      setReplyingTo(null);
    } catch (error) {
      console.error('發送貼圖失敗:', error);
    }
  };

  const sendCustomEmoji = async (emojiId) => {
    try {
      await chatService.current.sendCustomEmoji(emojiId, replyingTo?.id);
      setShowEmojiPanel(false);
      setReplyingTo(null);
    } catch (error) {
      console.error('發送自訂表情符號失敗:', error);
    }
  };

  const addReaction = (messageId, emojiCode) => {
    // 查找目标消息
    const targetMessage = messages.find(msg => msg.id === messageId);
    if (!targetMessage) return;
    
    // 检查当前用户是否已经对这条消息添加了相同的反应
    const existingReaction = (targetMessage.reactions || []).find(r => 
      r.emoji_code === emojiCode && r.doll_id === currentDoll.id
    );
    
    if (existingReaction) {
      // 如果已存在，则移除反应
      chatService.current.removeReaction(messageId, emojiCode);
    } else {
      // 如果不存在，则添加反应
      chatService.current.addReaction(messageId, emojiCode);
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    
    // 發送輸入狀態
    if (!isTyping) {
      setIsTyping(true);
      chatService.current.sendTyping(true);
    }
    
    // 重設輸入狀態計時器
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      chatService.current.sendTyping(false);
    }, 1000);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImageFile(file);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="chat-room">
      <div className="chat-header">
        <h3>與 {otherDoll.name} 的對話</h3>
      </div>

      <div className="messages-container">
        {messages.map((message, index) => (
            <div 
              key={message.id} 
              className={`message ${message.sender_id === currentDoll.id ? 'own' : 'other'}`}
            >
              {message.reply_to && (
                <div className="reply-preview">
                  回覆: {message.reply_to.preview || message.reply_to.decrypted_content || message.reply_to.encrypted_content}
                </div>
              )}
              
              <div className="message-content">
              {message.message_type === 'text' && (
                <span>{message.decrypted_content || message.encrypted_content || '[無內容]'}</span>
              )}
              {message.message_type === 'image' && (
                <>
                  {console.log('[ChatRoom] 渲染圖片訊息:', { 
                    id: message.id, 
                    image_url: message.image_url,
                    message_type: message.message_type,
                    hasImageUrl: !!message.image_url
                  })}
                  {message.image_url ? (
                    <img src={message.image_url} alt="分享圖片" className="message-image" />
                  ) : (
                    <span style={{color: 'red'}}>[圖片載入失敗: {message.image_url}]</span>
                  )}
                </>
              )}
              {message.message_type === 'sticker' && (
                <div className="message-sticker">
                  貼圖: {message.sticker?.name}
                </div>
              )}
              {message.message_type === 'emoji' && (
                <div className="message-emoji">
                  自訂表情: {message.custom_emoji?.name}
                </div>
              )}
            </div>
            
            <div className="message-meta">
              <span className="timestamp">{formatTimestamp(message.timestamp)}</span>
              {/* 只顯示自己發送且對方已讀的訊息 */}
              {message.sender_id === currentDoll.id && message.is_read && (
                <span className="read-indicator">已讀</span>
              )}
            </div>
            
            <div className="message-actions">
              <button onClick={() => setReplyingTo(message)}>回覆</button>
              <button 
                onClick={() => addReaction(message.id, '👍')}
                className={message.reactions?.some(r => r.emoji_code === '👍' && r.doll_id === currentDoll.id) ? 'reaction-active' : ''}
              >
                👍
              </button>
              <button 
                onClick={() => addReaction(message.id, '❤️')}
                className={message.reactions?.some(r => r.emoji_code === '❤️' && r.doll_id === currentDoll.id) ? 'reaction-active' : ''}
              >
                ❤️
              </button>
            </div>
            
            {message.reactions && message.reactions.length > 0 && (
              <div className="reactions">
                {/* 按表情符号分组显示反应 */}
                {Object.entries(
                  message.reactions.reduce((groups, reaction) => {
                    const emoji = reaction.emoji_code;
                    if (!groups[emoji]) groups[emoji] = [];
                    groups[emoji].push(reaction);
                    return groups;
                  }, {})
                ).map(([emoji, reactions]) => (
                  <span 
                    key={emoji} 
                    className={`reaction-group ${reactions.some(r => r.doll_id === currentDoll.id) ? 'my-reaction' : ''}`}
                    onClick={() => addReaction(message.id, emoji)}
                  >
                    {emoji} {reactions.length}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
        
        {otherUserTyping && (
          <div className="typing-indicator">
            {otherDoll.name} 正在輸入...
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {replyingTo && (
        <div className="reply-bar">
          <span>回覆: {replyingTo.decrypted_content || replyingTo.encrypted_content}</span>
          <button onClick={() => setReplyingTo(null)}>取消</button>
        </div>
      )}

      {selectedImageFile && (
        <div className="image-preview">
          <img 
            src={URL.createObjectURL(selectedImageFile)} 
            alt="預覽" 
            className="preview-image" 
          />
          <button onClick={() => setSelectedImageFile(null)}>移除</button>
        </div>
      )}

      <div className="input-area">
        <div className="input-controls">
          <button onClick={() => setShowStickerPanel(!showStickerPanel)}>
            貼圖
          </button>
          <button onClick={() => setShowEmojiPanel(!showEmojiPanel)}>
            表情
          </button>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageSelect}
            style={{ display: 'none' }}
            id="image-input"
          />
          <button onClick={() => document.getElementById('image-input').click()}>
            圖片
          </button>
        </div>
        
        <div className="message-input">
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="輸入訊息..."
            disabled={!!selectedImageFile}
          />
          <button onClick={sendMessage}>發送</button>
        </div>
      </div>

      {showStickerPanel && (
        <div className="sticker-panel">
          <h4>選擇貼圖</h4>
          <div className="sticker-grid">
            {stickers.map(sticker => (
              <div 
                key={sticker.id} 
                className="sticker-item"
                onClick={() => sendSticker(sticker.id)}
              >
                {sticker.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {showEmojiPanel && (
        <div className="emoji-panel">
          <h4>選擇自訂表情符號</h4>
          <div className="emoji-grid">
            {customEmojis.map(emoji => (
              <div 
                key={emoji.id} 
                className="emoji-item"
                onClick={() => sendCustomEmoji(emoji.id)}
              >
                <img src={emoji.image} alt={emoji.name} />
                <span>{emoji.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatRoom;
