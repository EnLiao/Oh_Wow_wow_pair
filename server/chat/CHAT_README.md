# 🚀 即時通訊系統 API 文檔

## 📋 目錄
- [概述](#概述)
- [認證方式](#認證方式)
- [REST API 端點](#rest-api-端點)
- [WebSocket 協議](#websocket-協議)
- [資料模型](#資料模型)
- [錯誤處理](#錯誤處理)
- [使用範例](#使用範例)
- [技術架構](#技術架構)

---

## 概述

本系統提供完整的即時通訊功能，支援端到端加密的文字訊息、圖片分享、貼圖系統、自訂表情符號、訊息回覆與表情反應等功能。

### ✅ 核心功能
- **端到端加密訊息**：前端 AES-GCM 加密，後端只存密文
- **多媒體支援**：圖片、貼圖、自訂表情符號
- **即時互動**：輸入狀態、已讀回條、表情反應
- **訊息回覆**：支援引用回覆功能
- **現代化 UI**：類似 Instagram 的聊天介面

### 🔐 安全特性
- 前端加密，後端無法解密查看內容
- JWT Token 認證
- 娃娃身份驗證機制
- 聊天室權限控制

---

## 認證方式

### HTTP API 認證
```http
Authorization: Bearer <JWT_TOKEN>
```

### WebSocket 認證
```
ws://localhost:8000/ws/chat/{room_id}/?token={JWT_TOKEN}&doll_id={DOLL_ID}
```

---

## REST API 端點

### 🏠 聊天室管理

#### 1. 取得聊天室列表
```http
GET /api/chat/rooms/?doll_id={doll_id}
```

**參數：**
- `doll_id` (必填): 娃娃ID

**回應：**
```json
{
  "count": 2,
  "results": [
    {
      "id": 1,
      "doll1": {
        "id": 1,
        "name": "小美",
        "avatar": "/media/dolls/avatar1.jpg"
      },
      "doll2": {
        "id": 2,
        "name": "小明",
        "avatar": "/media/dolls/avatar2.jpg"
      },
      "created_at": "2024-01-01T12:00:00Z",
      "last_message": {
        "id": 100,
        "sender_name": "小明",
        "message_type": "text",
        "timestamp": "2024-01-01T15:30:00Z",
        "is_read": true
      },
      "unread_count": 0
    }
  ]
}
```

#### 2. 建立新聊天室
```http
POST /api/chat/rooms/
```

**請求體：**
```json
{
  "doll1_id": 1,
  "doll2_username": "target_user"
}
```

**回應：**
```json
{
  "id": 3,
  "doll1": {...},
  "doll2": {...},
  "created_at": "2024-01-01T16:00:00Z"
}
```

#### 3. 取得聊天室訊息
```http
GET /api/chat/rooms/{room_id}/messages/?doll_id={doll_id}
```

**回應：**
```json
{
  "count": 50,
  "results": [
    {
      "id": 101,
      "sender": {
        "id": 1,
        "name": "小美",
        "avatar": "/media/dolls/avatar1.jpg"
      },
      "message_type": "text",
      "encrypted_content": "U2FsdGVkX1...",
      "timestamp": "2024-01-01T15:35:00Z",
      "is_read": true,
      "reply_to": null,
      "reactions": [
        {
          "id": 1,
          "doll": {"id": 2, "name": "小明"},
          "emoji_code": "👍",
          "emoji_type": "standard"
        }
      ]
    }
  ]
}
```

#### 4. 標記訊息已讀
```http
POST /api/chat/rooms/{room_id}/mark_read/
```

**請求體：**
```json
{
  "doll_id": 1
}
```

### 😀 自訂表情符號

#### 1. 取得表情符號列表
```http
GET /api/chat/emojis/
```

**回應：**
```json
{
  "count": 10,
  "results": [
    {
      "id": 1,
      "name": "mycat",
      "owner": {
        "id": 1,
        "username": "user123"
      },
      "image": "/media/custom_emojis/mycat.png",
      "is_public": false,
      "created_at": "2024-01-01T10:00:00Z"
    }
  ]
}
```

#### 2. 上傳自訂表情符號
```http
POST /api/chat/emojis/
Content-Type: multipart/form-data
```

**請求體：**
```
name: myemoji
image: [圖片檔案]
is_public: false
```

#### 3. 刪除表情符號
```http
DELETE /api/chat/emojis/{emoji_id}/
```

### 🎭 貼圖系統

#### 1. 取得貼圖列表
```http
GET /api/chat/stickers/
GET /api/chat/stickers/?category=cute
```

**回應：**
```json
{
  "count": 20,
  "results": [
    {
      "id": 1,
      "name": "開心貓咪",
      "category": "cute",
      "image": "/media/stickers/happy_cat.png",
      "is_official": true,
      "created_at": "2024-01-01T08:00:00Z"
    }
  ]
}
```

---

## WebSocket 協議

### 連接 URL
```
ws://localhost:8001/ws/chat/{room_id}/?token={JWT_TOKEN}&doll_id={DOLL_ID}
```

### 訊息類型

#### 1. 發送文字訊息
```json
{
  "type": "chat_message",
  "message_type": "text",
  "encrypted_content": "U2FsdGVkX1+加密內容...",
  "reply_to_id": 123
}
```

#### 2. 發送圖片
```json
{
  "type": "chat_message",
  "message_type": "image",
  "image_data": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

#### 3. 發送貼圖
```json
{
  "type": "chat_message",
  "message_type": "sticker",
  "sticker_id": 5
}
```

#### 4. 發送自訂表情符號
```json
{
  "type": "chat_message",
  "message_type": "emoji",
  "custom_emoji_id": 3
}
```

#### 5. 表情符號反應
```json
{
  "type": "reaction",
  "message_id": 123,
  "emoji_code": "👍",
  "emoji_type": "standard",
  "action": "add"
}
```

#### 6. 輸入狀態
```json
{
  "type": "typing",
  "is_typing": true
}
```

#### 7. 已讀回條
```json
{
  "type": "read_receipt",
  "message_id": 123
}
```

### 接收訊息格式

#### 新訊息通知
```json
{
  "type": "chat_message",
  "message": {
    "id": 124,
    "sender": {
      "id": 2,
      "name": "小明",
      "avatar": "/media/dolls/avatar2.jpg"
    },
    "message_type": "text",
    "encrypted_content": "U2FsdGVkX1...",
    "timestamp": "2024-01-01T16:00:00Z",
    "reply_to": {
      "id": 123,
      "sender_name": "小美",
      "preview": "原訊息預覽..."
    }
  }
}
```

#### 表情反應更新
```json
{
  "type": "reaction_update",
  "message_id": 123,
  "reactions": [
    {
      "doll": {"id": 2, "name": "小明"},
      "emoji_code": "👍",
      "emoji_type": "standard"
    }
  ]
}
```

#### 輸入狀態通知
```json
{
  "type": "typing_status",
  "doll": {
    "id": 2,
    "name": "小明"
  },
  "is_typing": true
}
```

---

## 資料模型

### ChatRoom（聊天室）
```python
{
  "id": "整數，主鍵",
  "doll1": "外鍵，參與者1",
  "doll2": "外鍵，參與者2", 
  "created_at": "日期時間，建立時間",
  "encryption_params": "JSON，加密參數"
}
```

### Message（訊息）
```python
{
  "id": "整數，主鍵",
  "room": "外鍵，所屬聊天室",
  "sender": "外鍵，發送者娃娃",
  "message_type": "字串，訊息類型（text/image/sticker/emoji）",
  "encrypted_content": "文字，加密內容",
  "image": "圖片檔案",
  "sticker": "外鍵，貼圖",
  "custom_emoji": "外鍵，自訂表情符號",
  "reply_to": "外鍵，回覆的訊息",
  "timestamp": "日期時間，發送時間",
  "is_read": "布林值，是否已讀"
}
```

### CustomEmoji（自訂表情符號）
```python
{
  "id": "整數，主鍵",
  "name": "字串，表情符號名稱",
  "owner": "外鍵，擁有者",
  "image": "圖片檔案",
  "is_public": "布林值，是否公開",
  "created_at": "日期時間，建立時間"
}
```

### Sticker（貼圖）
```python
{
  "id": "整數，主鍵",
  "name": "字串，貼圖名稱",
  "category": "字串，分類",
  "image": "圖片檔案",
  "is_official": "布林值，是否官方貼圖",
  "created_at": "日期時間，建立時間"
}
```

### Reaction（表情反應）
```python
{
  "id": "整數，主鍵",
  "message": "外鍵，目標訊息",
  "doll": "外鍵，反應者娃娃",
  "emoji_type": "字串，表情類型（standard/custom）",
  "emoji_code": "字串，表情符號代碼",
  "custom_emoji": "外鍵，自訂表情符號",
  "created_at": "日期時間，建立時間"
}
```

---

## 錯誤處理

### HTTP 狀態碼
- `200 OK` - 成功
- `201 Created` - 建立成功
- `400 Bad Request` - 請求參數錯誤
- `401 Unauthorized` - 未認證
- `403 Forbidden` - 權限不足
- `404 Not Found` - 資源不存在
- `500 Internal Server Error` - 伺服器錯誤

### 錯誤回應格式
```json
{
  "error": "錯誤訊息描述",
  "code": "ERROR_CODE",
  "details": {
    "field": ["具體錯誤說明"]
  }
}
```

### 常見錯誤
- `INVALID_DOLL_ID` - 娃娃ID無效或無權限
- `ROOM_NOT_FOUND` - 聊天室不存在
- `TOKEN_EXPIRED` - Token已過期
- `WEBSOCKET_AUTH_FAILED` - WebSocket認證失敗

---

## 使用範例

### 前端 JavaScript 範例

#### 1. 建立聊天室
```javascript
const createChatRoom = async (doll1Id, targetUsername) => {
  const response = await fetch('/api/chat/rooms/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      doll1_id: doll1Id,
      doll2_username: targetUsername
    })
  });
  return response.json();
};
```

#### 2. WebSocket 連接
```javascript
const connectWebSocket = (roomId, token, dollId) => {
  const ws = new WebSocket(
    `ws://localhost:8001/ws/chat/${roomId}/?token=${token}&doll_id=${dollId}`
  );
  
  ws.onopen = () => {
    console.log('WebSocket 連接成功');
  };
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    handleIncomingMessage(data);
  };
  
  return ws;
};
```

#### 3. 發送加密訊息
```javascript
const sendEncryptedMessage = async (ws, content, encryptionKey) => {
  const encryptedContent = await encryptMessage(content, encryptionKey);
  
  ws.send(JSON.stringify({
    type: 'chat_message',
    message_type: 'text',
    encrypted_content: encryptedContent
  }));
};
```

#### 4. 加密/解密工具
```javascript
// AES-GCM 加密
const encryptMessage = async (content, key) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    data
  );
  
  return btoa(String.fromCharCode(...new Uint8Array([...iv, ...new Uint8Array(encrypted)])));
};

// AES-GCM 解密
const decryptMessage = async (encryptedContent, key) => {
  const data = new Uint8Array(atob(encryptedContent).split('').map(c => c.charCodeAt(0)));
  const iv = data.slice(0, 12);
  const encrypted = data.slice(12);
  
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    encrypted
  );
  
  return new TextDecoder().decode(decrypted);
};
```

---

## 技術架構

### 後端技術棧
- **Django** - Web 框架
- **Django Channels** - WebSocket 支援
- **Redis** - Channel Layer 快取
- **PostgreSQL** - 主要資料庫
- **Django REST Framework** - API 框架

### 前端技術棧
- **React** - UI 框架
- **WebSocket API** - 即時通訊
- **Web Crypto API** - 加密功能
- **CSS3** - 現代化樣式（漸層、毛玻璃效果）

### 安全架構
```
前端加密 → WebSocket 傳輸 → 後端存儲密文
     ↓
Web Crypto API (AES-GCM)
     ↓
後端無法解密查看內容
```

### 部署考量
- 需要 HTTPS 支援 Web Crypto API
- WebSocket 需要 WSS 加密傳輸
- Redis 用於 WebSocket 集群部署
- 圖片檔案建議使用 CDN

---

## 🚀 開發命令

### 後端開發
```bash
# 安裝依賴
pip install -r requirements.txt

# 資料庫遷移
python manage.py migrate

# 建立測試貼圖
python manage.py create_sample_stickers

# 啟動開發伺服器
python manage.py runserver
```

### 前端開發
```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm start

# 建置生產版本
npm run build
```

---

**📞 技術支援**  
如有問題請參考專案 README 或聯繫開發團隊。

**⚡ 效能建議**  
- 使用 Redis 快取聊天室列表
- 圖片壓縮後再上傳
- WebSocket 連接使用心跳檢測
- 長訊息列表使用虛擬滾動
