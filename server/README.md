## 後端API說明（提供給前端）

本專案後端使用 Django + Django REST Framework + Simple JWT 建構，所有 API 都採用 JSON 格式傳輸資料。

---

### 使用者註冊 API

- **路徑**：`POST /core/register/`
- **說明**：建立新使用者帳號
- **請求格式範例（JSON）**：

```json
{
  "username": "momo",
  "password": "abc12345",
  "email": "momo@example.com",
  "nickname": "小桃",
  "bio": "我愛娃娃",
  "avatar_url": "https://example.com/momo.jpg"
}
```

- **回應格式範例（JSON）**：

```json
{
  "username": "momo",
  "email": "momo@example.com",
  "nickname": "小桃",
  "bio": "我愛娃娃",
  "avatar_url": "https://example.com/momo.jpg"
}
```

- **所有失敗的錯誤範例（JSON）**：

```json
已存在
{"username":["這個 username 在 user 已經存在。"],"email":["這個 email 在 user 已經存在。"]}
username沒填
{"username":["此為必需欄位。"]}
email格式不正確
{"email":["請輸入有效的電子郵件地址。"]}
avatar_url 格式不正確
{"avatar_url":["請輸入有效的URL。"]}
```

---

### 使用者登入 API

- **路徑**：`POST /core/login/`
- **說明**：使用者登入

> ⚠️ 如果前端未提供完整的 `username` 或 `password`，後端會回傳錯誤，請確保兩者都提供

- **成功請求格式範例（JSON）**：

```json
{
  "username": "momo",
  "password": "abc12345"
}
```

- **成功時回應格式範例（JSON）**：

```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ...",
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ..."
}
```

- **失敗請求範例（密碼錯誤）**：

```json
{
  "username": "momo",
  "password": "wrongpassword"
}
```

- **失敗時回應格式範例（JSON）**：

```json
{
  "detail": "No active account found with the given credentials"
}
```

- **缺少欄位時的錯誤回應（JSON）**：

```json
{
  "username": ["This field is required."]
}
```

| 欄位 | 說明 |
|------|------|
| access | 短效 token，前端每次發 API 都要帶這個 |
| refresh | 用來在 token 過期時重新取得新 token |

---

### 建立新娃娃

> 我自己的理解是使用這知道 tag_id 對應哪種 tag，比如說 1 -> 可愛

- **請求格式範例（JSON）**：

```json
{
  "id": "doll001",
  "name": "小白",
  "birthday": "2023-10-01",
  "description": "這是我最喜歡的娃娃",
  "avatar_url": "https://example.com/doll.jpg",
  "tag_ids": [1, 2]
}
```

- **成功建立娃娃時回應（JSON）**：

```json
{
  "id": "doll001",
  "username": "momo",
  "name": "小白",
  "birthday": "2023-10-01",
  "description": "這是我最喜歡的娃娃",
  "avatar_url": "https://example.com/doll.jpg",
  "created_at": "2025-05-05T00:00:00Z",
  "tags": [
    {
      "id": 1,
      "name": "可愛",
      "category": "風格"
    },
    {
      "id": 2,
      "name": "活潑",
      "category": "性格"
    }
  ]
}
```

- **失敗時回應（JSON）**：

```json
沒登入
{
  "detail": "Authentication credentials were not provided."
}
Tag不存在
{"tag_ids":["這個 tag id 2 不存在"]}
doll id重複
{"id":["這個 id 在 doll 已經存在。"]}
```

---

### 列出所有 Tag

- **成功建立列出所有 tag 的請求與回應範例（JSON）**：
```bash
curl -X GET http://127.0.0.1:8000/core/tags/ \
  -H "Accept: application/json"
```

- **成功時回應範例（JSON）**：
```json
{
    "id": 1,
    "name": "可愛"
  },
  {
    "id": 2,
    "name": "活潑"
  },
  {
    "id": 3,
    "name": "溫柔"
}
```
---

---
### 取得娃娃資訊
```bash
curl -X GET http://127.0.0.1:8000/core/dolls/<doll_id>/ \
  -H "Authorization: Bearer <access_token>"
```


- **成功時回應範例（JSON）**：
```json
{
  "id": "doll006",
  "username": "momo",
  "name": "小白",
  "birthday": "2023-10-01",
  "description": "這是我最喜歡的娃娃",
  "avatar_url": "https://example.com/doll.jpg",
  "created_at": "2025-05-05T00:30:42.075549+08:00",
  "tags": [
    {
      "id": 1,
      "name": "可愛",
      "category": "風格"
    }
  ]
}
```


---
### 使用者列出所有娃娃
---
```bash
curl -X GET http://127.0.0.1:8000/core/users/<username>/dolls/ \
  -H "Authorization: Bearer <access_token>"
```
- **成功時回應範例（JSON）**：
```json
{"id":"doll_1"},{"id":"doll_2"}
```
### 建立新貼文
---
- **路徑**：`POST /post/posts/`
- **說明**：建立新貼文
- **請求格式範例（JSON）**：

```json
{
  "doll_id": "doll001",
  "content": "這是我的第一篇文",
  "image_url": "https://example.com/momo.jpg"
}
```
- **成功回應格式範例（JSON）**：

```json
{
  "id":"54005c5b-4d47-4b77-b6e5-d5448ec98f7d",
  "doll_id":"doll001",
  "content":"這是測試用的貼文內容",
  "image_url":"https://example.com/test-image.jpg",
  "created_at":"2025-05-05T13:59:54.4212"
}
```
- **失敗時回應（JSON）**：

```json
缺少content
{"content":["此欄位不可為空白。"]}
缺少image
{"image_url":["此欄位不可為空白。"]}
```
### 瀏覽貼文（尚未全部完成）

---

- **路徑**：`POST /post/feed/?doll_id=cheesetaro/`
- **說明**：瀏覽貼文

- **成功回應格式範例（總之就是回傳可以看到的貼文資料）（若是再使用一次則是回傳[]）**：

```json
[{"id":"7f65e081-1724-4650-ab1d-0df3a93bc633","doll_id":"tomorin","content":"ffffe","image_url":"https://github.com/","created_at":"2025-05-08T01:51:13.196400+08:00"},{"id":"e2a6177d-5296-44fc-a08d-9c074d446ea5","doll_id":"omuba","content":"fff","image_url":"https://github.com/","created_at":"2025-05-08T01:51:03.587402+08:00"}]
```
### 按讚貼文

---

- **路徑**：`POST /post/posts/<uuid:post_id>/like/`
- **說明**：按讚貼文
- **請求格式範例（JSON）（post id 在 api 裡了）**：

```json
{
  "doll_id": "doll001",
}
```
- **成功回應格式範例（JSON）**：

```json
{"message":"Liked"}
{"message":"Already liked"}
```
## 用curl測試指令紀錄（終端機）

```bash
# 註冊（若已存在使用者）預設中文
curl -X POST http://127.0.0.1:8000/core/register/ \
  -H "Content-Type: application/json" \
  -d '{
        "username": "momo",
        "password": "abc12345",
        "email": "momo@example.com",
        "nickname": "小桃",
        "bio": "我愛娃娃",
        "avatar_url": "https://example.com/momo.jpg"
      }'
# → {"username":["一個相同名稱的使用者已經存在。"]}
# 註冊（若已存在使用者）指定語言為英文 -> 要在header加上Accept-Language
curl -X POST http://127.0.0.1:8000/core/register/ \
  -H "Content-Type: application/json" \
  -H "Accept-Language: en" \
  -d '{
        "username": "momo",
        "password": "abc12345",
        "email": "momo@example.com",
        "nickname": "小桃",
        "bio": "我愛娃娃",
        "avatar_url": "https://example.com/momo.jpg"
      }'
# → {"username":["A user with that username already exists."]}
# 登入，取得 token
curl -X POST http://127.0.0.1:8000/core/login/ \
  -H "Content-Type: application/json" \
  -d '{
        "username": "momo",
        "password": "abc12345"
      }'
# → 回傳 refresh 與 access token

# 列出所有官方自訂的 tag
curl -X GET http://127.0.0.1:8000/core/tags/ \
  -H "Accept: application/json"
# → {"id":2,"name":"可愛"}

# 建立娃娃
curl -X POST http://127.0.0.1:8000/core/dolls/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ...WN3_byQUEaejDFIopEpsQy0" \
  -d '{
        "id": "doll001",
        "name": "小白",
        "birthday": "2023-10-01",
        "description": "這是我最喜歡的娃娃",
        "avatar_url": "https://example.com/doll.jpg",
        "tag_ids":[1, 2],
      }'
# → {"id":"doll001","username":"momo","name":"小白","birthday":"2023-10-01","description":"這是我最喜歡的娃娃","avatar_url":"https://example.com/doll.jpg","created_at":"2025-05-05T11:24:22.180047+08:00","tags":[]}

# 建立貼文
curl -X POST http://localhost:8000/post/posts/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJ....Z7w" \
  -d '{
          "doll_id": "doll001",
          "content": "第一篇文OuOb",
          "image_url": "https://example.com/test-image.jpg"
      }'
# → {"id":"54005c5b-4d47-4b77-b6e5-d5448ec98f7d","doll_id":"doll001","content":"這是測試用的貼文內容","image_url":"https://example.com/test-image.jpg","created_at":"2025-05-05T13:59:54.4212}

# 確認可瀏覽的貼文
curl -X GET "http://localhost:8000/post/feed/?doll_id=cheesetaro"\   
  -H "Authorization: Bearer eyJ0eX...ldos" 
# → [{"id":"050ad8cb-1c21-4edc-a38d-988f8a658bbe","doll_id":"omuba","content":"我是笨狗汪汪汪","image_url":"https://github.com/","created_at":"2025-05-09T01:59:56.196575+08:00","like_count":0,"liked_by_me":false,"comment_count":0},{"id":"5cd5473d-5eb4-417d-9ac9-361bc4f22acb","doll_id":"omuba","content":"第一篇文嘻嘻嘻","image_url":"https://github.com/","created_at":"2025-05-08T21:33:53.106715+08:00","like_count":0,"liked_by_me":false,"comment_count":2}]

# 按讚貼文
curl -X POST \
 -H "Authorization: Bearer eyJ0..B6zu2UMQ4" \
 -H "Content-Type: application/json" \
 -d '{"doll_id": "cheesetaro"}' \
 http://localhost:8000/post/posts/e6666593-3d06-4563-8b38-67a411476c3c/like/
# → [{"message":"Already liked","post":{"id":"e6666593-3d06-4563-8b38-67a411476c3c","doll_id":"omuba","content":"我是一條笨狗 汪汪汪 我叫歐姆嘎抓","image_url":"https://github.com/","created_at":"2025-05-08T15:12:00.939363+08:00","like_count":1,"liked_by_me":true}}]

# 取消按讚貼文
curl -X DELETE \
  -H "Authorization: Bearer eyJ0...dB6zu2UMQ4" \
  -H "Content-Type: application/json" \
  -d '{"doll_id": "cheesetaro"}' \
  http://localhost:8000/post/posts/e6666593-3d06-4563-8b38-67a411476c3c/like/
# → [{"message":"Unliked","post":{"id":"e6666593-3d06-4563-8b38-67a411476c3c","doll_id":"omuba","content":"我是一條笨狗 汪汪汪 我叫歐姆嘎抓","image_url":"https://github.com/","created_at":"2025-05-08T15:12:00.939363+08:00","like_count":0,"liked_by_me":false}}]

# 留言貼文
curl -X POST \
  -H "Authorization: Bearer eyJ...zrJx8" \
  -H "Content-Type: application/json" \
  -d '{
        "doll_id": "tomorin",
        "content": "這是一則留言",
        "post_id": "5cd5473d-5eb4-417d-9ac9-361bc4f22acb"
      }' \
  http://localhost:8000/post/posts/5cd5473d-5eb4-417d-9ac9-361bc4f22acb/comments/
# → {"local_id":2,"post_id":"5cd5473d-5eb4-417d-9ac9-361bc4f22acb","doll_id":"tomorin","content":"這是一則留言","created_at":"2025-05-08T22:38:21.862059+08:00"}

# 取得貼文留言
curl -X GET \
  -H "Authorization: Bearer eyJ..pqPCyA" \
  http://localhost:8000/post/posts/5cd5473d-5eb4-417d-9ac9-361bc4f22acb/comments/
# → [{"local_id":1,"post_id":"5cd5473d-5eb4-417d-9ac9-361bc4f22acb","doll_id":"tomorin","content":"這是一則留言","created_at":"2025-05-08T22:36:51.879810+08:00"},{"local_id":2,"post_id":"5cd5473d-5eb4-417d-9ac9-361bc4f22acb","doll_id":"tomorin","content":"這是一則留言","created_at":"2025-05-08T22:38:21.862059+08:00"}]
```

