# 聊天室前端開發指南

## 快速開始

### 必須了解的核心檔案
1. **`client/src/components/chat_room.jsx`** - 聊天室主組件（最重要！）
2. **`client/src/services/chat_service.js`** - WebSocket 服務管理
3. **`client/src/services/api.js`** - HTTP API 調用
4. **`client/src/components/chat_room.css`** - 聊天室樣式

## 重要概念

### messageType 變數
在 `chat_room.jsx` 的 `renderReplyPreview()` 函數中（約第580行）：

```javascript
// messageType 是局部變數，用於判斷訊息類型
let messageType = replyMessage.message_type;
if (!messageType) {
  // 如果後端沒有提供 message_type，前端自動推斷
  const content = replyMessage.decrypted_content || replyMessage.encrypted_content || replyMessage.preview || '';
  if (content.includes('<img')) {
    messageType = 'rich_text';  // 包含圖片標籤 = 富文本
  } else {
    messageType = 'text';       // 純文字
  }
}
```

**支援的訊息類型**:
- `text` - 純文字
- `rich_text` - 富文本（包含 HTML，如自定義表情符號）
- `image` - 圖片
- `sticker` - 貼圖  
- `emoji` - 自定義表情符號

## 前端架構詳解

### 1. 狀態管理結構

```javascript
// chat_room.jsx 中的主要狀態
const [messages, setMessages] = useState([]);          // 訊息列表
const [newMessage, setNewMessage] = useState('');      // 輸入框內容
const [customEmojis, setCustomEmojis] = useState([]);  // 自定義表情符號
const [replyingTo, setReplyingTo] = useState(null);    // 正在回覆的訊息
const [stickers, setStickers] = useState([]);          // 貼圖列表
const [isTyping, setIsTyping] = useState(false);       // 正在輸入狀態
```

### 2. 核心函數流程

#### 訊息發送流程
```
用戶輸入 → handleInputChange() → 檢查表情符號 → processAndSendMessage() → WebSocket發送
```

#### 訊息接收流程  
```
WebSocket接收 → handleNewMessage() → 更新messages狀態 → 重新渲染
```

#### 回覆功能流程
```
點擊回覆按鈕 → setReplyingTo(message) → 發送時附帶reply_to → renderReplyPreview()顯示
```

### 3. 自定義表情符號處理

#### 輸入處理
```javascript
// 用戶輸入 :smile: 
// ↓
// processAndSendMessage() 將其轉換為:
"<img src='/media/custom_emojis/smile.png' alt='smile' class='custom-emoji-inline' style='width: 24px; height: 24px;'>"
// ↓  
// 作為 rich_text 類型發送
```

#### 顯示處理
```javascript
// renderReplyPreview() 和主訊息渲染都使用:
<div dangerouslySetInnerHTML={{ __html: content }} />
```

## WebSocket 事件處理

### 事件註冊（useEffect 中）
```javascript
unsubscribeMessage = chatService.current.onMessage(handleNewMessage);
unsubscribeReaction = chatService.current.onReaction(handleReaction);  
unsubscribeTyping = chatService.current.onTyping(handleTyping);
unsubscribeReadReceipt = chatService.current.onReadReceipt(handleReadReceipt);
```

### 重要事件處理器

#### handleNewMessage()
- 檢查訊息是否重複
- 更新訊息列表
- 標記未讀訊息為已讀
- 通知父組件更新

#### handleReaction() 
- 新增或移除訊息反應
- 更新對應訊息的 reactions 陣列

## 樣式系統

### CSS 類別結構
```css
.chat-room                    /* 主容器 */
├── .chat-header             /* 頂部標題列 */
├── .messages-container      /* 訊息列表區域 */
│   ├── .message            /* 單一訊息 */
│   │   ├── .message.own    /* 自己的訊息 */
│   │   └── .message.other  /* 對方的訊息 */
│   ├── .reply-preview      /* 回覆預覽 */
│   └── .reactions          /* 訊息反應 */
├── .reply-bar              /* 回覆輸入提示 */
└── .input-area            /* 底部輸入區域 */
    ├── .input-controls    /* 功能按鈕 */
    └── .message-input     /* 文字輸入框 */
```

### 重要樣式類別
- `.custom-emoji-inline` - 行內自定義表情符號
- `.sticker-image` - 貼圖圖片  
- `.message-image` - 聊天圖片
- `.typing-indicator` - 輸入狀態提示

## 常見開發任務

### 1. 新增訊息類型

#### 步驟：
1. 在後端 `Message` 模型新增類型
2. 更新 `chat_room.jsx` 的訊息渲染邏輯：
   ```javascript
   {message.message_type === 'your_new_type' && (
     <div>您的新訊息類型渲染</div>
   )}
   ```
3. 更新 `renderReplyPreview()` 函數處理回覆預覽
4. 在 `chat_service.js` 新增發送方法

### 2. 修改訊息樣式

#### 位置：`chat_room.css`
```css
/* 修改自己的訊息樣式 */
.message.own {
  justify-content: flex-end;
}

.message.own .message-content {
  background-color: #007bff;
  color: white;
}
```

### 3. 新增功能按鈕

#### 在 `.input-controls` 中新增：
```javascript
<button onClick={() => yourNewFunction()}>
  新功能
</button>
```

### 4. 處理新的 WebSocket 事件

#### 步驟：
1. 在 `chat_service.js` 新增事件監聽
2. 在 `chat_room.jsx` 新增事件處理函數
3. 在 useEffect 中註冊事件處理器

## 調試技巧

### 1. 訊息流程調試
```javascript
// 在關鍵函數中加入 console.log
console.log('[DEBUG] 訊息狀態:', {
  messages: messages.length,
  newMessage,
  replyingTo
});
```

### 2. WebSocket 狀態檢查
```javascript
// 檢查 WebSocket 連接狀態
console.log('WebSocket狀態:', {
  isConnected: chatService.current?.isConnected,
  socket: !!chatService.current?.socket
});
```

### 3. 表情符號載入檢查  
```javascript
// 在 loadCustomEmojis() 中
console.log('載入的表情符號:', customEmojis);
```

## 效能優化建議

### 1. 避免不必要的重新渲染
```javascript
// 使用 useCallback 包裝事件處理器
const handleNewMessage = useCallback((message) => {
  // 處理邏輯
}, [dependencies]);
```

### 2. 訊息列表虛擬化
對於大量訊息，考慮使用 `react-window` 或類似庫。

### 3. 圖片懶載入
```javascript
<img 
  src={imageUrl} 
  loading="lazy"  // 原生懶載入
  alt="圖片"
/>
```

## 錯誤處理

### 1. WebSocket 連接失敗
```javascript
// 在 chat_service.js 中
this.socket.onerror = (error) => {
  console.error('WebSocket錯誤:', error);
  // 實作重連機制
};
```

### 2. API 請求失敗
```javascript  
// 在 api.js 中使用 try-catch
try {
  const response = await fetch(url);
  if (!response.ok) throw new Error('請求失敗');
  return response.json();
} catch (error) {
  console.error('API錯誤:', error);
  throw error;
}
```

### 3. 圖片載入失敗
```javascript
<img 
  src={imageUrl}
  onError={(e) => {
    e.target.src = '/path/to/fallback/image.png';
  }}
  alt="圖片"
/>
```

## 測試建議

### 1. 單元測試
- 測試 `renderReplyPreview()` 函數的各種輸入
- 測試訊息類型判斷邏輯
- 測試表情符號轉換邏輯

### 2. 整合測試  
- 測試 WebSocket 連接和訊息收發
- 測試回覆功能完整流程
- 測試表情符號上傳和使用

### 3. 使用者測試
- 多個使用者同時聊天
- 長時間連接穩定性
- 各種訊息類型混合使用

## 部署檢查清單

- [ ] 確認 WebSocket URL 指向正確的後端
- [ ] 檢查 CORS 設定
- [ ] 確認媒體檔案路徑正確
- [ ] 測試 HTTPS 環境下的 WSS 連接
- [ ] 檢查 JWT token 過期處理
- [ ] 確認錯誤邊界組件正常運作

---

**開發愉快！** 🚀

如有問題請參考：
- `CHATROOM_HANDOVER.md` - 完整系統文件  
- `API_DOCUMENTATION.md` - API 詳細文件
- 或聯絡原開發者
