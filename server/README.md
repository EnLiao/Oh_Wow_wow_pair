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

- **未填寫必要欄位時的錯誤範例（JSON）**：

```json
{
  "username": ["This field is required."],
  "password": ["This field is required."]
}
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
  "name": "小桃",
  "birthday": "2023-03-14",
  "description": "這是我的最愛",
  "avatar_url": "https://example.com/momo.jpg",
  "tag_ids": [1, 2]
}
```

- **成功建立娃娃時回應（JSON）**：

```json
{
  "doll_id": 5,
  "user": 1,
  "name": "小桃",
  "birthday": "2023-03-14",
  "description": "這是我的最愛",
  "avatar_url": "https://example.com/momo.jpg",
  "created_at": "2024-04-19T13:00:00Z",
  "tags": [
    {
      "tag_id": 1,
      "name": "可愛",
      "category": "風格"
    },
    {
      "tag_id": 2,
      "name": "活潑",
      "category": "性格"
    }
  ]
}
```

- **未登入（缺少或錯誤的 JWT token）時回應（JSON）**：

```json
{
  "detail": "Authentication credentials were not provided."
}
```

- **傳入不存在的 tag_id 時回應（JSON）**：

```json
{
  "non_field_errors": ["Invalid pk \"99\" - object does not exist."]
}
```

- **缺少欄位時回應（JSON）**：

```json
{
  "name": ["This field is required."],
  "birthday": ["This field is required."]
}
```

---

### 建立新 Tag

- **成功建立 tag 的請求與回應範例（JSON）**：

```json
{
  "tag_id": 3,
  "name": "可愛",
  "category": "風格"
}
```

- **後端失敗回傳（JSON）**：

```json
{
  "name": ["tag with this name already exists."]
}
```

📌 備註：需在 Header 中附上 JWT Token，例如：
```
Authorization: Bearer <access_token>
```

---

## 用curl測試指令紀錄（終端機）

```bash
# 註冊（若已存在使用者）
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
# → {"username":["A user with that username already exists."]}

# 登入，取得 token
curl -X POST http://127.0.0.1:8000/core/login/ \
  -H "Content-Type: application/json" \
  -d '{
        "username": "momo",
        "password": "abc12345"
      }'
# → 回傳 refresh 與 access token

# 使用 refresh token 錯誤測試建立 tag
curl -X POST http://127.0.0.1:8000/core/tags/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <refresh_token>" \
  -d '{
        "name": "可愛",
        "category": "風格"
      }'

# 正確使用 access token 建立 tag
curl -X POST http://127.0.0.1:8000/core/tags/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ...WN3_byQUEaejDFIopEpsQy0" \
  -d '{
        "name": "可愛",
        "category": "風格"
      }'
# → {"tag_id":2,"name":"可愛","category":"風格"}

# 建立娃娃
curl -X POST http://127.0.0.1:8000/core/dolls/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ...WN3_byQUEaejDFIopEpsQy0" \
  -d '{
        "name": "小白",
        "birthday": "2023-10-01",
        "description": "超可愛娃娃",
        "avatar_url": "https://example.com/doll.jpg",
        "tag_ids": [1]
      }'
# → {"doll_id":1,"user":1,"name":"小白","birthday":"2023-10-01","description":"超可愛娃娃","avatar_url":"https://example.com/doll.jpg","created_at":"2025-04-20T01:36:59.484864Z","tags":[{"tag_id":1,"name":"可愛","category":"風格"}]}
```

