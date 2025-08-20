import React, { useState, useEffect, useRef, useCallback } from 'react';
import ChatService from '../services/chat_service.js';
import chatNotificationService from '../services/chat_notification_service.js';
import { chatAPI } from '../services/api.js';
import { config } from '../config/config.js';
import EmojiPicker from './emoji_picker.jsx';
import CustomEmojiManager from './custom_emoji_manager.jsx';
import './chat_room.css';

const ChatRoom = ({ roomId, currentUser, currentDoll, otherDoll, onNewMessage, onMarkRoomAsRead, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [stickers, setStickers] = useState([]);
  const [customEmojis, setCustomEmojis] = useState([]);
  const [showStickerPanel, setShowStickerPanel] = useState(false);
  const [showEmojiPanel, setShowEmojiPanel] = useState(false);
  const [showEmojiManager, setShowEmojiManager] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [previewSticker, setPreviewSticker] = useState(null); // 預覽貼圖
  
  // 分頁相關狀態
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  
  const chatService = useRef(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const previousScrollHeight = useRef(0);

  // 添加載入狀態防止重複調用
  const [isInitialized, setIsInitialized] = useState(false);
  
  // 追蹤是否應該自動滾動到底部
  const shouldAutoScroll = useRef(true);

  // 使用 useCallback 確保事件處理器的穩定性
  const handleNewMessage = useCallback((message) => {
    console.log('[ChatRoom] 收到新訊息:', message);  
    console.log('[ChatRoom] 訊息類型:', message.message_type);  
    console.log('[ChatRoom] 圖片URL:', message.image_url);  
    console.log('[ChatRoom] 貼圖信息:', message.sticker);  
    console.log('[ChatRoom] 自定義表情符號信息:', message.custom_emoji);
    
    // 特別針對貼圖消息的詳細調試
    if (message.message_type === 'sticker') {
      console.log('[ChatRoom] 貼圖詳細信息:');
      console.log('  - sticker.id:', message.sticker?.id);
      console.log('  - sticker.name:', message.sticker?.name);
      console.log('  - sticker.image:', message.sticker?.image);
      console.log('  - 最終圖片URL:', message.sticker?.image?.startsWith('http') 
        ? message.sticker.image 
        : `${config.API_BASE_URL}${message.sticker.image}`);
    }
    
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
    
    // 新訊息到達時，確保自動滾動並滾動到底部
    shouldAutoScroll.current = true;
    // 使用 requestAnimationFrame 確保新訊息渲染後再滾動
    requestAnimationFrame(() => {
      setTimeout(scrollToBottom, 50);
    });
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

  const handleEmojiUpdate = useCallback((emojiData) => {
    console.log('[ChatRoom] 收到表情符號更新:', emojiData);
    console.log('[ChatRoom] 當前房間ID:', roomId);
    console.log('[ChatRoom] 事件房間ID:', emojiData.room_id);
    console.log('[ChatRoom] 更新前自定義表情符號數量:', customEmojis.length);
    
    if (emojiData.room_id === roomId) {
      console.log('[ChatRoom] 房間ID匹配，開始重新載入表情符號...');
      // 重新載入自定義表情符號
      loadCustomEmojis();
    } else {
      console.log('[ChatRoom] 房間ID不匹配，忽略此更新');
    }
  }, [roomId, customEmojis.length]);

  useEffect(() => {
    let isMounted = true;
    let unsubscribeMessage, unsubscribeReaction, unsubscribeTyping, unsubscribeReadReceipt, unsubscribeEmojiUpdate;
    
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
      unsubscribeEmojiUpdate = chatService.current.onEmojiUpdate(handleEmojiUpdate);
      
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
          
          // 額外確保滾動到底部
          setTimeout(() => {
            if (messagesContainerRef.current) {
              requestAnimationFrame(() => {
                scrollToBottom();
              });
            }
          }, 200);
        }
      }, 150);
    }
    
    // 清理
    return () => {
      isMounted = false;
      
      // 清理事件處理器
      if (unsubscribeMessage) unsubscribeMessage();
      if (unsubscribeReaction) unsubscribeReaction();
      if (unsubscribeTyping) unsubscribeTyping();
      if (unsubscribeReadReceipt) unsubscribeReadReceipt();
      if (unsubscribeEmojiUpdate) unsubscribeEmojiUpdate();
      
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
    // 只在應該自動滾動時才滾動到底部
    if (shouldAutoScroll.current) {
      // 使用 requestAnimationFrame 確保 DOM 更新後再滾動
      requestAnimationFrame(() => {
        scrollToBottom();
      });
    }
  }, [messages]);

  // 處理滾動事件，檢測是否需要載入更多訊息
  useEffect(() => {
    const messagesContainer = messagesContainerRef.current;
    if (!messagesContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight } = messagesContainer;
      
      // 當滾動到接近頂部時載入更多訊息
      if (scrollTop < 100 && hasMoreMessages && !loadingMessages) {
        // 記錄當前滾動高度
        previousScrollHeight.current = scrollHeight;
        loadMoreMessages();
      }
    };

    messagesContainer.addEventListener('scroll', handleScroll);
    return () => messagesContainer.removeEventListener('scroll', handleScroll);
  }, [hasMoreMessages, loadingMessages]);

  // 載入更多訊息後維持滾動位置
  useEffect(() => {
    const messagesContainer = messagesContainerRef.current;
    if (!messagesContainer) return;

    if (previousScrollHeight.current > 0) {
      // 使用 requestAnimationFrame 確保 DOM 更新後再調整滾動位置
      requestAnimationFrame(() => {
        const newScrollHeight = messagesContainer.scrollHeight;
        const scrollDiff = newScrollHeight - previousScrollHeight.current;
        messagesContainer.scrollTop = scrollDiff;
        previousScrollHeight.current = 0;
      });
    }
  }, [messages]);

  const loadMessages = async (page = 1, append = false) => {
    if (loadingMessages) return;
    
    try {
      setLoadingMessages(true);
      
      // 載入歷史訊息時不自動滾動
      if (append) {
        shouldAutoScroll.current = false;
      }
      
      const response = await chatAPI.getChatRoomMessages(roomId, currentDoll.id, page);
      const loadedMessages = response.data.results || [];
      
      if (append) {
        // 載入更多訊息時，將新訊息添加到現有訊息的前面
        setMessages(prev => [...loadedMessages, ...prev]);
      } else {
        // 初始載入或重新載入時，直接設置訊息
        shouldAutoScroll.current = true; // 初始載入時允許自動滾動
        setMessages(loadedMessages);
        
        // 確保訊息渲染後滾動到底部
        setTimeout(() => {
          requestAnimationFrame(() => {
            scrollToBottom();
          });
        }, 100);
        
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
      }
      
      // 更新分頁狀態
      setHasMoreMessages(response.data.has_more || false);
      setCurrentPage(page);
      
    } catch (error) {
      console.error('載入訊息失敗:', error);
    } finally {
      setLoadingMessages(false);
      
      // 載入歷史訊息完成後，重置自動滾動標誌
      if (append) {
        setTimeout(() => {
          shouldAutoScroll.current = true;
        }, 100);
      }
    }
  };

  // 載入更多歷史訊息
  const loadMoreMessages = async () => {
    if (!hasMoreMessages || loadingMessages) return;
    
    const nextPage = currentPage + 1;
    await loadMessages(nextPage, true);
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
      console.log('[ChatRoom] 載入的貼圖數據:', response.data);
      setStickers(response.data);
    } catch (error) {
      console.error('載入貼圖失敗:', error);
    }
  };

  const loadCustomEmojis = async () => {
    try {
      console.log(`[ChatRoom] 開始載入聊天室 ${roomId} 的自定義表情符號...`);
      console.log('[ChatRoom] 載入前自定義表情符號數量:', customEmojis.length);
      const response = await chatAPI.getCustomEmojis(roomId);
      console.log('[ChatRoom] 自定義表情符號載入成功:', response.data);
      console.log('[ChatRoom] 載入後自定義表情符號數量:', response.data.length);
      setCustomEmojis(response.data);
    } catch (error) {
      console.error('載入自訂表情符號失敗:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() && !selectedImageFile && !previewSticker) return;

    try {
      if (selectedImageFile) {
        await chatService.current.sendImageMessage(selectedImageFile, replyingTo?.id);
        setSelectedImageFile(null);
      } else if (previewSticker) {
        // 先發送貼圖
        await chatService.current.sendSticker(previewSticker.id, replyingTo?.id);
        
        // 如果有文字，再發送文字訊息
        if (newMessage.trim()) {
          await processAndSendMessage(newMessage);
        }
        
        setPreviewSticker(null);
      } else {
        await processAndSendMessage(newMessage);
      }
      
      setNewMessage('');
      setReplyingTo(null);
    } catch (error) {
      console.error('發送訊息失敗:', error);
    }
  };

  const sendSticker = async (stickerId) => {
    try {
      console.log('[ChatRoom] 準備發送貼圖, ID:', stickerId);
      console.log('[ChatRoom] chatService 狀態:', {
        isConnected: chatService.current?.isConnected,
        socket: !!chatService.current?.socket
      });
      
      await chatService.current.sendSticker(stickerId, replyingTo?.id);
      console.log('[ChatRoom] 貼圖發送完成');
      
      setShowStickerPanel(false);
      setReplyingTo(null);
    } catch (error) {
      console.error('發送貼圖失敗:', error);
    }
  };

  // 新增：貼圖預覽功能
  const selectStickerForPreview = (sticker) => {
    console.log('[ChatRoom] 選擇貼圖預覽:', sticker);
    setPreviewSticker(sticker);
    setShowStickerPanel(false);
  };

  // 新增：取消貼圖預覽
  const cancelStickerPreview = () => {
    setPreviewSticker(null);
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

  // 處理表情符號選擇
  const handleEmojiSelect = async (emoji, type = 'standard', customEmojiData = null) => {
    try {
      if (type === 'custom') {
        // 自定義表情符號，插入到文字輸入框中
        const customEmojiText = emoji; // 格式：:emoji_name:
        setNewMessage(prev => prev + customEmojiText);
        setShowEmojiPanel(false);
      } else {
        // 標準 Unicode 表情符號，直接插入到文字輸入框
        setNewMessage(prev => prev + emoji);
        setShowEmojiPanel(false);
      }
    } catch (error) {
      console.error('處理表情符號失敗:', error);
    }
  };

  // 發送標準表情符號作為文字
  const sendEmojiAsText = async (emoji) => {
    try {
      await chatService.current.sendTextMessage(emoji, replyingTo?.id);
      setReplyingTo(null);
    } catch (error) {
      console.error('發送表情符號失敗:', error);
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
    const messagesContainer = messagesContainerRef.current;
    const messagesEnd = messagesEndRef.current;
    
    if (messagesContainer && messagesEnd) {
      // 先嘗試滾動到底部
      messagesEnd.scrollIntoView({ behavior: 'smooth' });
      
      // 如果 smooth 滾動沒有正確工作，強制滾動到底部
      setTimeout(() => {
        if (messagesContainer.scrollHeight > messagesContainer.clientHeight) {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      }, 100);
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 將 HTML 實體還原為可渲染的標籤（處理 &lt;img ...&gt; → <img ...>）
  const decodeHtmlEntities = (str) => {
    if (typeof str !== 'string') return '';
    const textarea = document.createElement('textarea');
    textarea.innerHTML = str;
    return textarea.value;
  };

  // 渲染回覆訊息預覽的函數
  const renderReplyPreview = (replyMessage) => {
    if (!replyMessage) return '';

    // 對於富文本，優先使用完整內容以保留 <img> 等 HTML，而不是使用可能被截斷/純文字的 preview
    const content = replyMessage.message_type === 'rich_text'
      ? (replyMessage.decrypted_content || replyMessage.encrypted_content || replyMessage.preview || '')
      : (replyMessage.preview || replyMessage.decrypted_content || replyMessage.encrypted_content || '');

    // 判斷內容是否包含（或被轉義的）HTML 片段
    const looksLikeHTML =
      replyMessage.message_type === 'rich_text' ||
      /<img|<span|<div|<p/i.test(content) ||
      /&lt;(img|span|div|p)[^&]*&gt;/i.test(content) ||
      /<\w+[^>]*>/i.test(content);

    if (looksLikeHTML) {
      // 若是轉義的 HTML，先解碼；否則直接使用
      const hasEntities = /&lt;|&gt;|&amp;|&quot;|&#39;/.test(content);
      const html = hasEntities ? decodeHtmlEntities(content) : content;
      return (
        <span
          className="reply-html"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }

    // 自訂表情符號訊息：直接顯示小圖
    if (replyMessage.message_type === 'emoji') {
      const src = replyMessage.custom_emoji?.image
        ? (replyMessage.custom_emoji.image.startsWith('http')
            ? replyMessage.custom_emoji.image
            : `${config.API_BASE_URL}${replyMessage.custom_emoji.image}`)
        : '';
      return src ? (
        <img src={src} alt={replyMessage.custom_emoji?.name || 'emoji'} className="custom-emoji-inline" />
      ) : (
        <span>[表情: {replyMessage.custom_emoji?.name || '未知'}]</span>
      );
    }

    // 貼圖訊息：維持文字提示（或可改顯示縮圖）
    if (replyMessage.message_type === 'sticker') {
      return <span>[貼圖: {replyMessage.sticker?.name || '未知'}]</span>;
    }

    if (replyMessage.message_type === 'image') {
      return <span>[圖片]</span>;
    }

    const truncated = content.length > 50 ? content.slice(0, 50) + '…' : content;
    return <span>{truncated}</span>;
  };

  // 處理並發送包含自定義表情符號的訊息
  const processAndSendMessage = async (message) => {
    // 檢查訊息中是否包含自定義表情符號標記（格式：:emoji_name:）
    const customEmojiRegex = /:([^:]+):/g;
    const matches = [...message.matchAll(customEmojiRegex)];
    
    if (matches.length > 0) {
      // 創建處理後的消息內容，將自定義表情符號替換為HTML標籤
      let processedMessage = message;
      const replacements = [];
      
      // 收集所有需要替換的表情符號
      for (const match of matches) {
        const [fullMatch, emojiName] = match;
        const customEmoji = customEmojis.find(emoji => emoji.name === emojiName);
        if (customEmoji) {
          replacements.push({
            original: fullMatch,
            replacement: `<img src="${customEmoji.image}" alt="${emojiName}" class="custom-emoji-inline" data-emoji-id="${customEmoji.id}" style="width: 24px; height: 24px; vertical-align: middle;">`
          });
        }
      }
      
      // 從後往前進行替換，避免位置偏移
      for (let i = matches.length - 1; i >= 0; i--) {
        const match = matches[i];
        const [fullMatch, emojiName] = match;
        const replacement = replacements.find(r => r.original === fullMatch);
        if (replacement) {
          const start = match.index;
          const end = match.index + fullMatch.length;
          processedMessage = processedMessage.substring(0, start) + replacement.replacement + processedMessage.substring(end);
        }
      }
      
      // 發送包含HTML標籤的消息作為富文本消息
      await chatService.current.sendRichTextMessage(processedMessage, replyingTo?.id);
    } else {
      // 沒有自定義表情符號，直接發送文字
      await chatService.current.sendTextMessage(message, replyingTo?.id);
    }
  };

  return (
    <div className="chat-room">
      <div className="chat-header">
        <button className="back-button-ig" onClick={onBack}>
          &lt;
        </button>
        <h3>與 {otherDoll.name} 的對話</h3>
        <div className="header-actions">
          <button 
            className="emoji-manager-btn"
            onClick={() => setShowEmojiManager(true)}
            title="管理此聊天室的共享表情符號"
          >
            😀+
          </button>
        </div>
      </div>

      <div className="messages-container" ref={messagesContainerRef}>
        {/* 載入更多訊息的指示器 */}
        {hasMoreMessages && (
          <div className="load-more-indicator">
            {loadingMessages ? (
              <div className="loading-spinner">載入中...</div>
            ) : (
              <button 
                className="load-more-btn"
                onClick={loadMoreMessages}
              >
                載入更多訊息
              </button>
            )}
          </div>
        )}
        
        {messages.map((message, index) => (
            <div 
              key={message.id} 
              className={`message ${message.sender_id === currentDoll.id ? 'own' : 'other'}`}
            >
              {message.reply_to && (
                <div className="reply-preview">
                  <span className="reply-label">回覆: </span>
                  <span className="reply-content">{renderReplyPreview(message.reply_to)}</span>
                </div>
              )}
              
              <div className="message-content">
              {message.message_type === 'text' && (
                <span>{message.decrypted_content || message.encrypted_content || '[無內容]'}</span>
              )}
              {message.message_type === 'rich_text' && (
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: message.decrypted_content || message.encrypted_content || '[無內容]' 
                  }}
                />
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
                  {message.sticker?.image ? (
                    <img 
                      src={message.sticker.image.startsWith('http') 
                        ? message.sticker.image 
                        : `${config.API_BASE_URL}${message.sticker.image}`}
                      alt={message.sticker.name} 
                      className="sticker-image"
                      title={message.sticker.name}
                    />
                  ) : (
                    <span>貼圖: {message.sticker?.name}</span>
                  )}
                </div>
              )}
              {message.message_type === 'emoji' && (
                <div className="message-emoji">
                  {message.custom_emoji?.image ? (
                    <img 
                      src={message.custom_emoji.image.startsWith('http') 
                        ? message.custom_emoji.image 
                        : `${config.API_BASE_URL}${message.custom_emoji.image}`}
                      alt={message.custom_emoji.name} 
                      className="custom-emoji-image"
                      title={message.custom_emoji.name}
                    />
                  ) : (
                    <span>自訂表情: {message.custom_emoji?.name}</span>
                  )}
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

      <CustomEmojiManager
        isOpen={showEmojiManager}
        toggle={() => setShowEmojiManager(false)}
        roomId={roomId}
        onUploadSuccess={loadCustomEmojis}
      />

      <EmojiPicker 
        isOpen={showEmojiPanel}
        onEmojiSelect={handleEmojiSelect}
        customEmojis={customEmojis}
        onClose={() => setShowEmojiPanel(false)}
        position="bottom"
      />

      {replyingTo && (
        <div className="reply-bar">
          <span className="reply-label">回覆: </span>
          <span className="reply-content">{renderReplyPreview(replyingTo)}</span>
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
          <button onClick={() => {
            setShowEmojiPanel(true);
            // 每次打開表情符號面板時重新載入表情符號
            loadCustomEmojis();
          }}>
            表情
          </button>
          <button onClick={() => document.getElementById('image-input').click()}>
            圖片
          </button>
        </div>
        
        <div className="message-input">
          {/* 貼圖預覽區域 */}
          {previewSticker && (
            <div className="sticker-preview-container">
              <div className="sticker-preview-overlay">
                <img 
                  src={previewSticker.image.startsWith('http') 
                    ? previewSticker.image 
                    : `${config.API_BASE_URL}${previewSticker.image}`}
                  alt={previewSticker.name}
                  className="sticker-preview-image"
                />
                <button 
                  className="cancel-preview-btn" 
                  onClick={cancelStickerPreview}
                  title="取消貼圖"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
          
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={previewSticker ? "輸入文字與貼圖一起發送..." : "輸入訊息..."}
            disabled={!!selectedImageFile}
            className={previewSticker ? 'with-sticker-preview' : ''}
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            style={{ display: 'none' }}
            id="image-input"
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
                onClick={() => selectStickerForPreview(sticker)}
                title={sticker.name}
              >
                {sticker.image ? (
                  <img 
                    src={sticker.image.startsWith('http') 
                      ? sticker.image 
                      : `${config.API_BASE_URL}${sticker.image}`}
                    alt={sticker.name}
                    className="sticker-preview"
                  />
                ) : (
                  <span>{sticker.name}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatRoom;
