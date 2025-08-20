# API 文件 - 聊天室系統

## 基本配置

**Base URL**: `http://localhost:8000/api`  
**認證方式**: JWT Token (Bearer)  
**Content-Type**: `application/json`

## HTTP API 端點

### 1. 聊天室相關

#### 獲取聊天室列表
```http
GET /chat/rooms/
Authorization: Bearer {jwt_token}
```

**回應格式**:
```json
{
  "results": [
    {
      "id": 1,
      "participants": [
        {
          "id": 1,
          "name": "User1",
          "avatar": "/media/avatars/user1.jpg"
        }
      ],
      "last_message": {
        "content": "最後一則訊息",
        "timestamp": "2025-01-01T12:00:00Z"
      },
      "unread_count": 3
    }
  ]
}
```

#### 獲取聊天室訊息
```http
GET /chat/rooms/{room_id}/messages/?doll_id={doll_id}&page={page}
Authorization: Bearer {jwt_token}
```

**參數**:
- `room_id`: 聊天室ID
- `doll_id`: 當前娃娃ID  
- `page`: 頁碼（可選，預設1）

**回應格式**:
```json
{
  "results": [
    {
      "id": 123,
      "sender_id": 1,
      "message_type": "text|rich_text|image|sticker|emoji",
      "encrypted_content": "訊息內容",
      "decrypted_content": "解密後內容",
      "timestamp": "2025-01-01T12:00:00Z",
      "is_read": false,
      "reply_to": {
        "id": 122,
        "preview": "被回覆的訊息預覽",
        "message_type": "text"
      },
      "image_url": "http://example.com/image.jpg",
      "sticker": {
        "id": 1,
        "name": "開心貼圖",
        "image": "/media/stickers/happy.png"
      },
      "custom_emoji": {
        "id": 1,
        "name": "custom_smile",
        "image": "/media/custom_emojis/smile.png"
      },
      "reactions": [
        {
          "emoji_code": "👍",
          "doll_id": 2,
          "user": "User2"
        }
      ]
    }
  ],
  "has_more": true,
  "current_page": 1
}
```

#### 標記聊天室已讀
```http
POST /chat/rooms/{room_id}/mark_read/
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "doll_id": 1
}
```

### 2. 自定義表情符號

#### 獲取聊天室的自定義表情符號
```http
GET /chat/rooms/{room_id}/custom-emojis/
Authorization: Bearer {jwt_token}
```

**回應格式**:
```json
[
  {
    "id": 1,
    "name": "custom_smile",
    "image": "/media/custom_emojis/room_1/smile.png",
    "created_at": "2025-01-01T12:00:00Z"
  }
]
```

#### 上傳自定義表情符號
```http
POST /chat/rooms/{room_id}/custom-emojis/
Authorization: Bearer {jwt_token}
Content-Type: multipart/form-data

name=emoji_name
image=@emoji_file.png
```

#### 刪除自定義表情符號
```http
DELETE /chat/custom-emojis/{emoji_id}/
Authorization: Bearer {jwt_token}
```

### 3. 貼圖系統

#### 獲取所有貼圖
```http
GET /chat/stickers/
Authorization: Bearer {jwt_token}
```

**回應格式**:
```json
[
  {
    "id": 1,
    "name": "開心",
    "image": "/media/stickers/happy.png",
    "category": "表情"
  }
]
```

## WebSocket API

### 連接格式
```
ws://localhost:8000/ws/chat/{room_id}/?token={jwt_token}&doll_id={doll_id}
```

### 訊息格式

#### 1. 發送文字訊息
```json
{
  "type": "message",
  "message_type": "text",
  "content": "Hello World!",
  "reply_to": null
}
```

#### 2. 發送富文本訊息（包含自定義表情符號）
```json
{
  "type": "message", 
  "message_type": "rich_text",
  "content": "Hello <img src='/media/custom_emojis/smile.png' alt='smile' class='custom-emoji-inline' style='width: 24px; height: 24px;'>",
  "reply_to": null
}
```

#### 3. 發送圖片訊息
```json
{
  "type": "image_message",
  "image_data": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
  "reply_to": 123
}
```

#### 4. 發送貼圖
```json
{
  "type": "sticker",
  "sticker_id": 1,
  "reply_to": null
}
```

#### 5. 發送自定義表情符號
```json
{
  "type": "custom_emoji",
  "emoji_id": 1,
  "reply_to": null
}
```

#### 6. 訊息反應
```json
{
  "type": "reaction",
  "message_id": 123,
  "emoji_code": "👍",
  "action": "add"  // 或 "remove"
}
```

#### 7. 輸入狀態
```json
{
  "type": "typing",
  "is_typing": true
}
```

#### 8. 已讀回執
```json
{
  "type": "read_receipt",
  "message_id": 123
}
```

### WebSocket 接收事件

#### 1. 新訊息
```json
{
  "type": "message",
  "message": {
    "id": 123,
    "sender_id": 1,
    "message_type": "text",
    "decrypted_content": "Hello!",
    "timestamp": "2025-01-01T12:00:00Z",
    "reply_to": null
  }
}
```

#### 2. 訊息反應
```json
{
  "type": "reaction",
  "message_id": 123,
  "emoji_code": "👍",
  "doll_id": 2,
  "user": "User2",
  "action": "add"
}
```

#### 3. 輸入狀態
```json
{
  "type": "typing",
  "doll_id": 2,
  "is_typing": true
}
```

#### 4. 已讀回執
```json
{
  "type": "read_receipt",
  "message_id": 123,
  "reader_id": 2
}
```

#### 5. 表情符號更新
```json
{
  "type": "emoji_update",
  "room_id": 1,
  "action": "added"  // 或 "deleted"
}
```

## 錯誤處理

### HTTP 錯誤碼
- `400 Bad Request`: 請求格式錯誤
- `401 Unauthorized`: 認證失敗
- `403 Forbidden`: 權限不足
- `404 Not Found`: 資源不存在
- `500 Internal Server Error`: 服務器錯誤

### WebSocket 錯誤
```json
{
  "type": "error",
  "error": "Invalid message format",
  "code": 4000
}
```

## 前端實作範例

### JavaScript/React 使用範例

#### 1. HTTP API 調用
```javascript
// 在 api.js 中
const chatAPI = {
  // 獲取訊息
  getChatRoomMessages: async (roomId, dollId, page = 1) => {
    const response = await fetch(`/api/chat/rooms/${roomId}/messages/?doll_id=${dollId}&page=${page}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    });
    return response.json();
  },

  // 獲取自定義表情符號
  getCustomEmojis: async (roomId) => {
    const response = await fetch(`/api/chat/rooms/${roomId}/custom-emojis/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    });
    return response.json();
  }
};
```

#### 2. WebSocket 連接
```javascript
// 在 chat_service.js 中
class ChatService {
  connect(roomId, token, dollId) {
    this.socket = new WebSocket(
      `ws://localhost:8000/ws/chat/${roomId}/?token=${token}&doll_id=${dollId}`
    );
    
    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleMessage(data);
    };
  }

  sendTextMessage(content, replyTo = null) {
    this.socket.send(JSON.stringify({
      type: 'message',
      message_type: 'text', 
      content: content,
      reply_to: replyTo
    }));
  }
}
```

## 資料庫結構

### Message 模型欄位
```python
class Message(models.Model):
    id = models.AutoField(primary_key=True)
    room = models.ForeignKey(ChatRoom)
    sender = models.ForeignKey(Doll)
    message_type = models.CharField(max_length=20)  # text, rich_text, image, sticker, emoji
    encrypted_content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    reply_to = models.ForeignKey('self', null=True)
    image = models.ImageField(upload_to='chat_images/', null=True)
    sticker = models.ForeignKey(Sticker, null=True)
    custom_emoji = models.ForeignKey(CustomEmoji, null=True)
    is_read = models.BooleanField(default=False)
```

### CustomEmoji 模型欄位
```python
class CustomEmoji(models.Model):
    id = models.AutoField(primary_key=True)
    room = models.ForeignKey(ChatRoom)
    name = models.CharField(max_length=50)
    image = models.ImageField(upload_to='custom_emojis/')
    created_at = models.DateTimeField(auto_now_add=True)
    uploader = models.ForeignKey(Doll)
```

## 部署配置

### Nginx WebSocket 代理配置
```nginx
location /ws/ {
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

### Django Settings 配置
```python
# settings.py
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [('127.0.0.1', 6379)],
        },
    },
}

# CORS 設定
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# WebSocket
ASGI_APPLICATION = 'wowpair.asgi.application'
```

---

**最後更新**: 2025年8月20日  
**版本**: v1.0
