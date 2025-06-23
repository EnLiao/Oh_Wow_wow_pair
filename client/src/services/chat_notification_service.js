/**
 * 全域聊天通知服務
 * 處理跨聊天室的訊息通知和未讀計數更新
 */
class ChatNotificationService {
    constructor() {
        this.listeners = new Map(); // roomId -> Set of listeners
        this.globalListeners = new Set(); // 全域監聽器
        this.activeChatRooms = new Map(); // roomId -> ChatService instance
        this.unreadCounts = new Map(); // roomId -> unread count
    }

    // 註冊聊天室的 ChatService 實例
    registerChatRoom(roomId, chatService) {
        this.activeChatRooms.set(roomId, chatService);
        
        // 監聽該聊天室的新訊息
        chatService.onMessage((message) => {
            this.handleNewMessage(roomId, message);
        });
    }

    // 取消註冊聊天室
    unregisterChatRoom(roomId) {
        this.activeChatRooms.delete(roomId);
        this.listeners.delete(roomId);
    }

    // 處理新訊息（來自任何聊天室）
    handleNewMessage(roomId, message) {
        // 通知該聊天室的監聽器
        const roomListeners = this.listeners.get(roomId);
        if (roomListeners) {
            roomListeners.forEach(listener => listener(message));
        }

        // 通知全域監聽器（用於聊天室列表更新）
        this.globalListeners.forEach(listener => listener(roomId, message));
    }

    // 為特定聊天室添加監聽器
    addRoomListener(roomId, listener) {
        if (!this.listeners.has(roomId)) {
            this.listeners.set(roomId, new Set());
        }
        this.listeners.get(roomId).add(listener);

        // 返回清理函數
        return () => {
            const roomListeners = this.listeners.get(roomId);
            if (roomListeners) {
                roomListeners.delete(listener);
                if (roomListeners.size === 0) {
                    this.listeners.delete(roomId);
                }
            }
        };
    }

    // 添加全域監聽器（用於聊天室列表）
    addGlobalListener(listener) {
        this.globalListeners.add(listener);
        
        // 返回清理函數
        return () => {
            this.globalListeners.delete(listener);
        };
    }

    // 更新未讀計數
    updateUnreadCount(roomId, count) {
        this.unreadCounts.set(roomId, count);
    }

    // 獲取未讀計數
    getUnreadCount(roomId) {
        return this.unreadCounts.get(roomId) || 0;
    }

    // 清除未讀計數
    clearUnreadCount(roomId) {
        this.unreadCounts.set(roomId, 0);
    }

    // 檢查是否有活躍的聊天室連接
    isRoomActive(roomId) {
        return this.activeChatRooms.has(roomId);
    }

    // 向特定聊天室發送訊息（如果已連接）
    sendToRoom(roomId, messageData) {
        const chatService = this.activeChatRooms.get(roomId);
        if (chatService && chatService.isConnected) {
            switch (messageData.type) {
                case 'text':
                    return chatService.sendTextMessage(messageData.content, messageData.replyToId);
                case 'image':
                    return chatService.sendImageMessage(messageData.file, messageData.replyToId);
                case 'sticker':
                    return chatService.sendSticker(messageData.stickerId, messageData.replyToId);
                case 'emoji':
                    return chatService.sendCustomEmoji(messageData.emojiId, messageData.replyToId);
                default:
                    console.warn('未知的訊息類型:', messageData.type);
            }
        }
        return false;
    }

    // 清理所有資源
    cleanup() {
        this.activeChatRooms.forEach(chatService => {
            chatService.cleanup();
        });
        this.activeChatRooms.clear();
        this.listeners.clear();
        this.globalListeners.clear();
        this.unreadCounts.clear();
    }
}

// 創建全域單例實例
const chatNotificationService = new ChatNotificationService();

// 在 window 上設置全域訪問
if (typeof window !== 'undefined') {
    window.chatNotificationService = chatNotificationService;
}

export default chatNotificationService;
