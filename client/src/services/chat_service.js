import ChatCrypto from './chat_crypto.js';
//import { config } from '../config/config.js';

class ChatService {
    constructor() {
        // 单例模式 - 确保只有一个 ChatService 实例
        if (ChatService.instance) {
            return ChatService.instance;
        }
        
        this.socket = null;
        this.crypto = new ChatCrypto();
        this.messageHandlers = new Set();
        this.reactionHandlers = new Set();
        this.typingHandlers = new Set();
        this.readReceiptHandlers = new Set();
        this.globalMessageHandlers = new Set(); // 全域訊息監聽器
        this.currentRoomId = null;
        this.isConnected = false;
        this.manualDisconnect = false;
        this.reconnectTimeout = null;
        this.reconnectAttempts = 0;
        this.currentToken = null;
        this.currentDollId = null;
        
        // 設置為全域服務
        if (typeof window !== 'undefined') {
            window.globalChatService = this;
        }
        
        ChatService.instance = this;
    }

    // 連接到聊天室
    connect(roomId, token, dollId) {
        // 如果已經連接到同一個房間，不重複連接
        if (this.isConnected && this.currentRoomId === roomId) {
            return;
        }
        
        if (this.socket) {
            this.disconnect();
        }

        this.currentRoomId = roomId;
        this.currentToken = token;
        this.currentDollId = dollId;
        this.manualDisconnect = false;
        this.reconnectAttempts = 0;
        
        // 清除之前的重連計時器
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
        
        // 根據當前環境設置 WebSocket URL
        const baseUrl = process.env.NODE_ENV === 'development' ? 'ws://localhost:8001' : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`;
        const wsUrl = `${baseUrl}/ws/chat/${roomId}/?token=${encodeURIComponent(token || localStorage.getItem('access_token'))}&doll_id=${encodeURIComponent(dollId)}`;
        
        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
            this.isConnected = true;
            this.reconnectAttempts = 0; // 重置重連次數
        };

        this.socket.onmessage = async (event) => {
            const data = JSON.parse(event.data);
            await this.handleMessage(data);
        };

        this.socket.onclose = (event) => {
            this.isConnected = false;
            
            // 只在異常關閉且未手動斷開時重連一次
            if (event.code !== 1000 && event.code !== 1001 && !this.manualDisconnect && this.reconnectAttempts === 0) {
                this.reconnectAttempts = 1;
                setTimeout(() => {
                    if (!this.isConnected && !this.manualDisconnect) {
                        this.connect(this.currentRoomId, this.currentToken, this.currentDollId);
                    }
                }, 3000);
            }
        };

        this.socket.onerror = (error) => {
            this.isConnected = false;
        };
    }

    // 斷開連接
    disconnect() {
        this.manualDisconnect = true;
        
        // 清除重連計時器
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
        
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.close(1000, 'Manual disconnect');
            this.socket = null;
        }
        this.isConnected = false;
        this.currentRoomId = null;
    }

    // 發送文字訊息
    async sendTextMessage(text, replyToId = null) {
        if (!this.isConnected || !text.trim()) return;

        // 暫時使用明文，待密鑰管理完善後再啟用加密
        // const encryptedContent = await this.crypto.encryptMessage(text, this.currentRoomId);
        
        const messageData = {
            type: 'chat_message',
            message_type: 'text',
            encrypted_content: text, // 暫時發送明文作為 encrypted_content
            reply_to_id: replyToId
        };
        
        this.socket.send(JSON.stringify(messageData));
    }

    // 發送富文本訊息（包含HTML標籤的文字）
    async sendRichTextMessage(richText, replyToId = null) {
        if (!this.isConnected || !richText.trim()) return;
        
        const messageData = {
            type: 'chat_message',
            message_type: 'rich_text',
            encrypted_content: richText,
            reply_to_id: replyToId
        };
        
        this.socket.send(JSON.stringify(messageData));
    }

    // 發送圖片訊息
    async sendImageMessage(imageFile, replyToId = null) {
        if (!this.isConnected) return;

        try {
            // 轉換圖片為 base64
            const base64Data = await this.fileToBase64(imageFile);
            
            const messageData = {
                type: 'chat_message',
                message_type: 'image',
                image_data: base64Data,
                reply_to_id: replyToId
            };
            
            this.socket.send(JSON.stringify(messageData));
            
        } catch (error) {
            console.error('發送圖片訊息失敗:', error);
        }
    }

    // 發送貼圖
    sendSticker(stickerId, replyToId = null) {
        if (!this.isConnected) {
            console.error('[ChatService] 無法發送貼圖：WebSocket 未連接');
            return;
        }

        const messageData = {
            type: 'chat_message',
            message_type: 'sticker',
            sticker_id: stickerId,
            reply_to_id: replyToId
        };
        
        console.log('[ChatService] 發送貼圖數據:', messageData);
        this.socket.send(JSON.stringify(messageData));
        console.log('[ChatService] 貼圖數據已發送');
    }

    // 發送自訂表情符號
    sendCustomEmoji(emojiId, replyToId = null) {
        if (!this.isConnected) return;

        this.socket.send(JSON.stringify({
            type: 'chat_message',
            message_type: 'emoji',
            custom_emoji_id: emojiId,
            reply_to_id: replyToId
        }));
    }

    // 對訊息加表情符號反應
    addReaction(messageId, emojiCode, emojiType = 'standard') {
        if (!this.isConnected) return;

        this.socket.send(JSON.stringify({
            type: 'reaction',
            message_id: messageId,
            emoji_code: emojiCode,
            emoji_type: emojiType,
            action: 'add'
        }));
    }

    // 移除表情符號反應
    removeReaction(messageId, emojiCode) {
        if (!this.isConnected) return;

        this.socket.send(JSON.stringify({
            type: 'reaction',
            message_id: messageId,
            emoji_code: emojiCode,
            action: 'remove'
        }));
    }

    // 發送輸入狀態
    sendTyping(isTyping) {
        if (!this.isConnected) return;

        this.socket.send(JSON.stringify({
            type: 'typing',
            is_typing: isTyping
        }));
    }

    // 標記訊息已讀
    markMessageRead(messageId) {
        if (!this.isConnected) return;

        this.socket.send(JSON.stringify({
            type: 'read_receipt',
            message_id: messageId
        }));
    }

    // 處理收到的訊息
    async handleMessage(data) {
        switch (data.type) {
            case 'chat_message':  // 聊天訊息
                // 1. 通知當前聊天室的訊息處理器
                this.messageHandlers.forEach((handler) => {
                    try {
                        handler(data.message);
                    } catch (error) {
                        console.error('訊息處理器錯誤:', error);
                    }
                });
                
                // 2. 立即更新聊天室列表
                if (window.updateChatList) {
                    try {
                        window.updateChatList(this.currentRoomId, data.message);
                    } catch (error) {
                        console.error('調用 window.updateChatList 失敗:', error);
                    }
                }
                
                // 2.5. 強制刷新聊天室列表
                if (window.forceRefreshChatList) {
                    try {
                        window.forceRefreshChatList();
                    } catch (error) {
                        console.error('調用 window.forceRefreshChatList 失敗:', error);
                    }
                }
                
                // 3. 觸發自定義事件
                const customEvent = new CustomEvent('chatMessageReceived', {
                    detail: {
                        roomId: this.currentRoomId,
                        message: data.message
                    }
                });
                window.dispatchEvent(customEvent);
                
                break;
                
            case 'reaction_update':  // 表情反應更新
                this.reactionHandlers.forEach(handler => handler(data));
                break;
                
            case 'typing_indicator':  // 輸入狀態
                this.typingHandlers.forEach(handler => handler(data));
                break;
                
            case 'read_receipt':  // 已讀回執
            case 'read_receipt_update':  // 已讀回執更新 (兼容性)
                this.readReceiptHandlers.forEach(handler => handler(data));
                
                // 同樣觸發已讀狀態更新事件
                const readEvent = new CustomEvent('messageReadReceived', {
                    detail: data
                });
                window.dispatchEvent(readEvent);
                break;
                
            default:
                console.log('未知的消息類型:', data.type);
        }
    }

    // 註冊事件處理器
    onMessage(handler) {
        this.messageHandlers.add(handler);
        return () => this.messageHandlers.delete(handler);
    }

    onReaction(handler) {
        this.reactionHandlers.add(handler);
        return () => this.reactionHandlers.delete(handler);
    }

    onTyping(handler) {
        this.typingHandlers.add(handler);
        return () => this.typingHandlers.delete(handler);
    }

    onReadReceipt(handler) {
        this.readReceiptHandlers.add(handler);
        return () => this.readReceiptHandlers.delete(handler);
    }

    // 工具方法：檔案轉 base64
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    // 清理
    cleanup() {
        this.disconnect();
        this.crypto.clearKeys();
        this.messageHandlers.clear();
        this.reactionHandlers.clear();
        this.typingHandlers.clear();
        this.readReceiptHandlers.clear();
        this.globalMessageHandlers.clear();
        
        // 清除重連計時器
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
    }

    // 全域訊息監聽器管理
    addGlobalMessageListener(handler) {
        this.globalMessageHandlers.add(handler);
    }

    removeGlobalMessageListener(handler) {
        this.globalMessageHandlers.delete(handler);
    }

    // 静态方法获取单例实例
    static getInstance() {
        if (!ChatService.instance) {
            ChatService.instance = new ChatService();
        }
        return ChatService.instance;
    }
}

export default ChatService;
