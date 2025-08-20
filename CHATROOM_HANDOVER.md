# 聊天室系統接手文件

## 概覽
這是一個基於 React + Django + WebSocket 的即時聊天系統，支援文字、圖片、貼圖、自定義表情符號等多種訊息類型。

## 前端架構

### 核心檔案結構
```
client/src/
├── components/
│   ├── chat_room.jsx          # 聊天室主組件（最重要）
│   ├── emoji_picker.jsx       # 表情符號選擇器
│   ├── custom_emoji_manager.jsx # 自定義表情符號管理
│   └── chat_room.css         # 聊天室樣式
├── services/
│   ├── chat_service.js        # WebSocket 聊天服務（核心）
│   ├── chat_notification_service.js # 聊天通知服務
│   └── api.js                # HTTP API 服務
├── config/
│   └── config.js             # 配置文件
└── pages/
    └── chat/                 # 聊天相關頁面組件
```

### 重要組件詳解

#### 1. chat_room.jsx - 聊天室主組件
**位置**: `client/src/components/chat_room.jsx`
**功能**: 聊天室的核心組件，處理所有聊天功能

**主要狀態管理**:
```javascript
const [messages, setMessages] = useState([]);          // 訊息列表
const [newMessage, setNewMessage] = useState('');      // 新訊息輸入
const [customEmojis, setCustomEmojis] = useState([]);  // 自定義表情符號
const [replyingTo, setReplyingTo] = useState(null);    // 回覆訊息
const [stickers, setStickers] = useState([]);          // 貼圖列表
```

**核心函數**:
- `renderReplyPreview()`: 渲染回覆預覽（處理 HTML、表情符號）
- `processAndSendMessage()`: 處理並發送訊息（處理自定義表情符號）
- `handleNewMessage()`: 處理接收到的新訊息
- `loadCustomEmojis()`: 載入自定義表情符號
- `sendMessage()`: 發送訊息統一入口

#### 2. chat_service.js - WebSocket 服務
**位置**: `client/src/services/chat_service.js`
**功能**: 管理 WebSocket 連接和訊息傳輸

**關鍵方法**:
```javascript
connect(roomId, token, dollId)     // 連接 WebSocket
sendTextMessage(message, replyTo)  // 發送文字訊息
sendRichTextMessage(html, replyTo) // 發送富文本訊息
sendImageMessage(file, replyTo)    // 發送圖片訊息
sendSticker(stickerId, replyTo)    // 發送貼圖
sendCustomEmoji(emojiId, replyTo)  // 發送自定義表情符號
```

## 後端架構

### Django 應用結構
```
server/
├── chat/                     # 聊天應用
│   ├── models.py            # 資料模型
│   ├── views.py             # API 視圖
│   ├── serializers.py       # 序列化器
│   ├── consumers.py         # WebSocket 消費者
│   └── routing.py           # WebSocket 路由
├── core/                    # 核心設定
└── wowpair/                 # 主項目設定
```

### 重要後端檔案

#### 1. chat/models.py - 資料模型
**主要模型**:
```python
class ChatRoom             # 聊天室
class Message             # 訊息（支援多種類型）
class CustomEmoji         # 自定義表情符號
class Sticker            # 貼圖
class MessageReaction    # 訊息反應
```

#### 2. chat/consumers.py - WebSocket 消費者
**功能**: 處理 WebSocket 連接和即時訊息

#### 3. chat/views.py - HTTP API
**主要 API**:
- `/api/chat/rooms/` - 聊天室列表
- `/api/chat/messages/` - 訊息歷史
- `/api/chat/custom-emojis/` - 自定義表情符號
- `/api/chat/stickers/` - 貼圖

## 前後端通訊協議

### HTTP API 通訊
所有 HTTP 請求都在 `client/src/services/api.js` 中定義：

```javascript
// 獲取聊天室訊息
getChatRoomMessages(roomId, dollId, page = 1)

// 獲取自定義表情符號
getCustomEmojis(roomId)

// 上傳自定義表情符號
uploadCustomEmoji(roomId, formData)

// 獲取貼圖
getStickers()
```

### WebSocket 通訊協議

#### 連接格式
```
ws://localhost:8000/ws/chat/{room_id}/?token={jwt_token}&doll_id={doll_id}
```

#### 訊息格式
**發送訊息**:
```json
{
  "type": "message",
  "message_type": "text|rich_text|image|sticker|emoji",
  "content": "訊息內容",
  "reply_to": "回覆的訊息ID（可選）"
}
```

**接收訊息**:
```json
{
  "type": "message",
  "message": {
    "id": 123,
    "message_type": "text",
    "sender_id": 1,
    "content": "訊息內容",
    "timestamp": "2025-01-01T12:00:00Z",
    "reply_to": { ... },
    "sticker": { ... },
    "custom_emoji": { ... }
  }
}
```

#### WebSocket 事件類型
1. **message** - 新訊息
2. **reaction** - 訊息反應
3. **typing** - 輸入狀態
4. **read_receipt** - 已讀回執
5. **emoji_update** - 表情符號更新

## 訊息類型系統

### 支援的訊息類型
1. **text** - 純文字訊息
2. **rich_text** - 包含 HTML 的富文本（用於自定義表情符號）
3. **image** - 圖片訊息
4. **sticker** - 貼圖訊息
5. **emoji** - 自定義表情符號訊息

### 自定義表情符號處理流程
1. 用戶輸入 `:emoji_name:` 格式
2. 前端 `processAndSendMessage()` 函數將其轉換為 HTML `<img>` 標籤
3. 作為 `rich_text` 類型發送到後端
4. 渲染時使用 `dangerouslySetInnerHTML` 顯示

## 關鍵功能實現

### 1. 回覆功能
- 點擊「回覆」按鈕設定 `replyingTo` 狀態
- 發送訊息時附帶 `reply_to` 參數
- `renderReplyPreview()` 函數處理回覆預覽顯示

### 2. 表情符號系統
- 標準 Unicode 表情符號：直接插入文字
- 自定義表情符號：`:name:` → HTML `<img>` 標籤

### 3. 即時功能
- 訊息傳送/接收：WebSocket
- 輸入狀態提示：WebSocket typing 事件
- 已讀回執：WebSocket read_receipt 事件

### 4. 分頁載入
- 滾動到頂部時自動載入歷史訊息
- 維持滾動位置不跳躍

## 常見問題與解決方案

### 1. 表情符號不顯示
**原因**: `message_type` 為 `undefined` 或 HTML 被截斷
**解決**: `renderReplyPreview()` 中的類型推斷邏輯

### 2. WebSocket 連接問題
**檢查**:
- JWT token 是否有效
- WebSocket URL 格式是否正確
- 後端 CORS 設定

### 3. 訊息重複顯示
**原因**: WebSocket 和 HTTP 請求重複接收
**解決**: `handleNewMessage()` 中的重複檢查邏輯

## 開發環境設定

### 前端啟動
```bash
cd client
npm install
npm run dev
```

### 後端啟動
```bash
cd server
pip install -r requirements.txt
python manage.py runserver
```

### WebSocket 測試
可使用瀏覽器開發者工具或 WebSocket 測試工具連接：
```
ws://localhost:8000/ws/chat/1/?token=your_jwt_token&doll_id=1
```

## 調試技巧

### 1. 前端調試
- 開啟瀏覽器 Console 查看詳細日誌
- 檢查 Network 標籤的 WebSocket 連接
- 使用 React Developer Tools

### 2. 後端調試
- 檢查 Django 運行日誌
- 使用 Django Debug Toolbar
- 檢查資料庫訊息記錄

## 部署注意事項

### 1. WebSocket 支援
- 確保 Web 服務器支援 WebSocket（如 Nginx 需要特殊配置）
- 使用 wss:// 而非 ws:// 在 HTTPS 環境

### 2. 媒體檔案
- 設定正確的 MEDIA_URL 和 MEDIA_ROOT
- 確保圖片/貼圖/表情符號可以正確載入

### 3. 安全性
- 驗證 JWT token
- 檔案上傳限制
- XSS 防護（已使用 dangerouslySetInnerHTML 時特別注意）

## 擴展建議

### 1. 功能擴展
- 訊息編輯/刪除
- 語音訊息
- 檔案傳送
- 群組聊天

### 2. 效能優化
- 虛擬滾動（大量訊息時）
- 圖片懶載入
- 訊息快取

### 3. 使用者體驗
- 訊息狀態指示器（發送中、已發送、已讀）
- 離線訊息同步
- 通知系統整合

---

**聯絡資訊**: 如有問題請聯繫原開發者
**最後更新**: 2025年8月20日
