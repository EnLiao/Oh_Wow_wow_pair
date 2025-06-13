## 後端API說明（提供給前端）

本專案後端使用 Django + Django REST Framework + Simple JWT 建構，所有 API 都採用 JSON 格式傳輸資料。

---

---

### reCAPTCHA 驗證（防機器人）

1. 前端在註冊、登入等 API 請求時，需多帶一個 `recaptcha_token` 欄位，例如：
   ```json
   {
     "username": "momo",
     "password": "abc12345",
     "recaptcha_token": "前端取得的token"
   }
   ```
2. 後端會自動驗證 token，驗證失敗會回傳 400，訊息如「請通過人機驗證」。
3. 請在 `.env` 設定 `RECAPTCHA_SECRET_KEY=key`。
4. 若未帶 recaptcha_token 或驗證失敗，API 會拒絕請求。

---
### 使用者註冊 API

* **路徑**：`POST /core/register/`
* **說明**：建立新使用者帳號
* **請求格式範例**：

| 欄位名            | 型別     | 是否必填 | 說明                    |
| -------------- | ------ | ---- | --------------------- |
| `username`     | string |  是  | 最多 150 字元，唯一主鍵        |
| `password`     | string |  是  | 使用者密碼                 |
| `email`        | string |  是  | 使用者信箱，需符合格式           |
| `nickname`     | string |  否  | 最多 100 字元             |
| `bio`          | string |  否  | 使用者自我介紹               |
| `avatar_image` | file   |  否  | 使用者頭像圖，支援 jpg/png/gif |


* **回應格式範例（JSON）**：

```json
{
  "username": "momo",
  "email": "momo@example.com",
  "nickname": "小桃",
  "bio": "我愛娃娃",
  "avatar_image": "/media/avatars/momo.jpg"
}
```

* **所有失敗的錯誤範例（JSON）**：

```json
已存在
{"username":["這個 username 在 user 已經存在。"],"email":["這個 email 在 user 已經存在。"]}
username沒填
{"username":["此為必需欄位。"]}
email格式不正確
{"email":["請輸入有效的電子郵件地址。"]}
```

---

### 使用者登入 API

* **路徑**：`POST /core/login/`
* **說明**：使用者登入

> ⚠️ 如果前端未提供完整的 `username` 或 `password`，後端會回傳錯誤，請確保兩者都提供

* **成功請求格式範例（JSON）**：

```json
{
  "username": "momo",
  "password": "abc12345",
  "recaptcha_token": "前端取得的token"
}
```

* **說明**：自 2025/06/11 起，登入 API 需帶 recaptcha_token，否則會回傳 400。

* **成功時回應格式範例（JSON）**：

```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ...",
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ..."
}
```

* **失敗請求範例（密碼錯誤）**：

```json
{
  "username": "momo",
  "password": "wrongpassword"
}
```

* **失敗時回應格式範例（JSON）**：

```json
{
  "detail": "No active account found with the given credentials"
}
```

* **缺少欄位時的錯誤回應（JSON）**：

```json
{
  "username": ["This field is required."]
}
```

| 欄位      | 說明                       |
| ------- | ------------------------ |
| access  | 短效 token，前端每次發 API 都要帶這個 |
| refresh | 用來在 token 過期時重新取得新 token |

---

### 建立新娃娃

* **路徑**：`POST /core/dolls/`
* **說明**：建立屬於目前登入使用者的娃娃（需附帶 access token）。每位使用者最多只能創建 10 個娃娃。

> 我自己的理解是使用這知道 tag\_id 對應哪種 tag，比如說 1 -> 可愛

* **請求格式範例**：

| 欄位名            | 型別          | 是否必填 | 說明                   |
| -------------- | ----------- | ---- | -------------------- |
| `id`           | string      |  是  | 娃娃主鍵，最多 64 字元，需唯一    |
| `name`         | string      |  是  | 娃娃名稱，最多 100 字元       |
| `birthday`     | date        |  是  | 格式為 `YYYY-MM-DD`     |
| `description`  | string      |  否  | 娃娃介紹                 |
| `avatar_image` | file        |  否  | 娃娃頭像圖，支援 jpg/png/gif |
| `tag_ids`      | array\[int] |  否  | 傳入要標記的 tag ID（整數陣列）  |


* **成功建立娃娃時回應（JSON）**：

```json
{
  "id": "doll001",
  "username": "momo",
  "name": "小白",
  "birthday": "2023-10-01",
  "description": "這是我最喜歡的娃娃",
  "avatar_image": "/media/avatars/doll001.jpg",
  "created_at": "2024-05-09T14:30:00Z",
  "tags": [
    {"id": 1, "name": "可愛"},
    {"id": 2, "name": "白色"}
  ]
}
```

***失敗時回應（JSON）**：

```json
沒登入
{
  "detail": "Authentication credentials were not provided."
}
Tag不存在
{"tag_ids":["這個 tag id 2 不存在"]}
doll id重複
{"id":["這個 id 在 doll 已經存在。"]}
建立超過10個娃娃
{"non_field_errors": ["每位使用者最多只能創建 10 個娃娃"]}
```

---

### 列出所有 Tag

* **路徑**：`GET /core/tags/`

* **說明**：取得所有官方定義的 Tag（提供前端選項）

* **成功建立列出所有 tag 的請求與回應範例（JSON）**：

```bash
curl -X GET http://127.0.0.1:8000/core/tags/ \
  -H "Accept: application/json"
```

* **成功時回應範例（JSON）**：

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

### 取得娃娃資訊

* **路徑**：`GET /core/dolls/<doll_id>/`
* **說明**：查詢單隻娃娃的所有詳細資訊（需帶 token）

```bash
curl -X GET http://127.0.0.1:8000/core/dolls/<doll_id>/ \
  -H "Authorization: Bearer <access_token>"
```

* **成功時回應格式範例（JSON）**：

```json
{
  "id": "doll006",
  "username": "momo",
  "name": "小白",
  "birthday": "2023-10-01",
  "description": "這是我最喜歡的娃娃",
  "avatar_image": "https://example.com/doll.jpg",
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

* **路徑**：`GET /core/users/<username>/dolls/`
* **說明**：查詢指定使用者所擁有的所有娃娃 id（需帶 token）

```bash
curl -X GET http://127.0.0.1:8000/core/users/<username>/dolls/ \
  -H "Authorization: Bearer <access_token>"
```

***成功時回應範例（JSON）**：

```json
[{"id":"doll_1"},{"id":"doll_2"}]
```
## 娃娃追蹤與取消追蹤 API 說明


### 1. 建立追蹤關係

* 方法：POST
* 路徑：/core/follow/
* 說明：讓一個娃娃追蹤另一個娃娃 -> from_doll_id 追蹤 to_doll_id

#### 請求格式（JSON）：

```json
{
  "from_doll_id": "doll1",
  "to_doll_id": "doll2"
}
```

#### 成功回應（HTTP 201）：

```json
{
  "from_doll_id": "doll1",
  "to_doll_id": "doll2"
}
```

#### 測試指令（curl 範例）：

```bash
curl -X POST http://127.0.0.1:8000/core/follow/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"from_doll_id": "doll1", "to_doll_id": "doll2"}'
```

### 2. 取消追蹤關係

* 方法：DELETE
* 路徑：/core/follow/
* 說明：讓一個娃娃取消對另一個娃娃的追蹤 -> from_doll_id是追蹤者取消追蹤to_doll_id

#### 請求格式（JSON）：

```json
{
  "from_doll_id": "doll1",
  "to_doll_id": "doll2"
}
```

#### 成功回應（HTTP 204）：

無內容

#### 測試指令（curl 範例）：

```bash
curl -X DELETE http://127.0.0.1:8000/core/follow/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"from_doll_id": "doll1", "to_doll_id": "doll2"}'
```

---

### 查詢追蹤狀態 API（check_following）

* **路徑**：`GET /core/check_following/`
* **說明**：查詢「自己擁有的某隻娃娃」是否有追蹤另一隻娃娃。
* **權限**：必須登入，且只能查詢自己擁有的娃娃（from_doll_id 必須是自己的娃娃）。

#### 請求格式（Query String）：

| 參數           | 型別   | 是否必填 | 說明                 |
| -------------- | ------ | ------ | -------------------- |
| from_doll_id   | string | ✅ 是   | 查詢的發起娃娃 id（必須是自己擁有的） |
| to_doll_id     | string | ✅ 是   | 查詢的目標娃娃 id         |

#### 成功回應（JSON）：
```json
{
  "is_following": true
}
```
或
```json
{
  "is_following": false
}
```

#### 權限/錯誤回應（JSON）：
- 查詢不是自己娃娃：
```json
{"detail": "你只能查詢自己擁有的娃娃"}
```
- 缺少參數：
```json
{"detail": "缺少 from_doll_id 或 to_doll_id", "is_following": false}
```
- from_doll_id 不存在：
```json
{"detail": "娃娃不存在", "is_following": false}
```

#### 測試 curl 指令：

```bash
# 查詢 doll1 是否有追蹤 doll2（doll1 必須是你自己的娃娃）
curl -X GET "http://127.0.0.1:8000/core/check_following/?from_doll_id=doll1&to_doll_id=doll2" \
  -H "Authorization: Bearer <你的 access_token>"
```

# 查詢不是自己娃娃會失敗
curl -X GET "http://127.0.0.1:8000/core/check_following/?from_doll_id=not_my_doll&to_doll_id=doll2" \
  -H "Authorization: Bearer <你的 access_token>"

# 缺少參數會失敗
curl -X GET "http://127.0.0.1:8000/core/check_following/?from_doll_id=doll1" \
  -H "Authorization: Bearer <你的 access_token>"
```
### 3. 錯誤處理情況

| 錯誤情境      | HTTP 狀態碼 | 回應訊息                             |
| --------- | -------- | -------------------------------- |
| 自己追蹤自己    | 400      | 不能追蹤自己                           |
| 已經追蹤過     | 400      | 已經追蹤過了                           |
| 要取消的關係不存在 | 400      | 尚未追蹤，無法取消                        |
| 缺少必要欄位    | 400      | 缺少 from\_doll\_id 或 to\_doll\_id |
#### 編輯娃娃（新版路徑 /core/dolls/<doll_id>/edit/）

* **路徑**：`PATCH /core/dolls/<doll_id>/edit/`
* **說明**：編輯指定娃娃的資訊（需帶 access token，僅娃娃擁有者可修改，username 欄位不可更動）

* **請求格式範例（JSON）**：

```json
{
  "name": "新名字",
  "birthday": "2025-06-08",
  "description": "新的介紹",
  "avatar_image": "https://example.com/new_avatar.jpg",
  "tag_ids": [1, 3]
}
```

* **curl 測試指令範例**：

```bash
curl -X PATCH http://127.0.0.1:8000/core/dolls/good_doll_0925/edit/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
        "name": "新名字",
        "birthday": "2025-06-08",
        "description": "新的介紹",
        "avatar_image": "https://example.com/new_avatar.jpg",
        "tag_ids": [1, 3]
      }'
```

* **成功回應範例（JSON）**：

```json
{
  "id": "good_doll_0925",
  "username": "abc",
  "name": "新名字",
  "birthday": "2025-06-08",
  "description": "新的介紹",
  "avatar_image": "/media/avatars/new_avatar.jpg",
  "created_at": "2025-06-08T12:00:00Z",
  "tags": [
    {"id": 1, "name": "可愛"},
    {"id": 3, "name": "溫柔"}
  ]
}
```

* **失敗時回應範例**：
- 未登入：
```json
{"detail": "Authentication credentials were not provided."}
```
- 權限不足（非擁有者）：
```json
{"detail": "只能編輯自己的娃娃"}
```
- 嘗試更動 username 欄位：
> username 欄位會被自動忽略，仍維持原本擁有者

### 建立新貼文

---

* **路徑**：`POST /post/posts/`
* **說明**：

  * 建立新貼文
  * **只能使用自己擁有的娃娃（doll）發文，否則會被拒絕**
  * 圖片需用「檔案格式」上傳（`multipart/form-data`），欄位名稱為 `image`

---

#### **請求格式範例（multipart/form-data）：**

```
doll_id=doll001
content=這是我的第一篇文
image=@momo.jpg    ← 這裡的 @ 表示本地檔案
```

**curl 範例：**

```bash
curl -X POST http://localhost:8000/post/posts/ \
  -H "Authorization: Bearer eyJ..f4" \
  -F "doll_id=tomorin" \
  -F "content=第一篇文OuOb" \
  -F "image=@media/avatars/螢幕擷取畫面_2025-05-21_160025_H7YZH9c.png"
```

---

#### **成功回應格式範例（JSON）：**

```json
{
  "id": "54005c5b-4d47-4b77-b6e5-d5448ec98f7d",
  "doll_id": "doll001",
  "content": "這是測試用的貼文內容",
  "image": "/media/avatars/momo.jpg",
  "created_at": "2025-05-05T13:59:54.4212",
  "like_count": 0,
  "liked_by_me": false,
  "comment_count": 0
}
```

> 注意：`image` 會是上傳後的檔案路徑（通常是 `/media/avatars/檔案名`）

---

#### **失敗時回應（JSON）：**

**缺少 content：**

```json
{"content": ["此欄位不可為空白。"]}
```

**缺少 image：**

```json
{"image": ["此欄位不可為空白。"]}
```

**doll 不是自己的（權限錯誤）：**

```json
{"detail": "你不能用不屬於你的娃娃發文！"}
```

**圖片欄位不是檔案格式：**

```json
{"image": ["提交的資料並不是檔案格式，請確認表單的編碼類型。"]}
```

---

#### **補充說明**

* `doll_id` 必須是登入者本人所擁有的娃娃 id
* `image` 欄位必須上傳檔案（支援 jpg、jpeg、png、gif），**不能用網址或文字**
* 請用 `multipart/form-data` 傳送

### 瀏覽貼文

---

* **路徑**：`GET /post/feed/?doll_id=cheesetaro`
* **說明**：

  * 瀏覽 feed 貼文（只能查詢自己擁有的娃娃）
  * 回傳一次最多 5 篇，優先顯示有追蹤的娃娃的貼文
  * 必須帶上登入 token

---

#### **請求範例：**

```bash
curl -X GET "http://localhost:8000/post/feed/?doll_id=cheesetaro" \
  -H "Authorization: Bearer <你的 token>"
```

---

#### **成功回應格式範例（JSON）：**

```json
[
  {
    "id": "64ef2849-7f8c-43aa-b088-5c1b5e831448",
    "doll_id": "tomorin",
    "content": "第一篇文OuOb",
    "image": "/media/avatars/%E8%9E%A2%E5%B9%95%E6%93%B7%E5%8F%96%E7%95%AB%E9%9D%A2_2025-05-21_160025_H7YZH9c_BVV00yW.png",
    "created_at": "2025-06-07T21:12:09.575028+08:00",
    "like_count": 0,
    "liked_by_me": false,
    "comment_count": 0
  }
]
```

---

#### **失敗時回應（JSON）：**

**未帶登入憑證（token）：**

```json
{"detail": "Authentication credentials were not provided."}
```

**doll\_id 不是自己的娃娃：**

```json
{"detail": "你不能查詢不是你的娃娃的貼文 feed"}
```

---

#### **補充說明**

* 這個 API 只允許查詢登入者本人的娃娃
* 每個請求最多回傳 5 篇貼文，依據有追蹤的娃娃優先顯示
* 若想看更多貼文，可以用 offset/分頁查詢

### 取得某隻娃娃的貼文（個人頁）

---
- **HTTP 方法**：GET
- **路徑**：`/post/profile_feed/`
- **說明**：取得某隻娃娃的貼文（個人頁）
- **請求格式**：URL 查詢參數 (query parameters)

| 參數名              | 類型     | 是否必填 | 說明                          |
| ---------------- | ------ | ---- | --------------------------- |
| `doll_id`        | string | ✅ 是  | 要查詢哪隻娃娃的貼文                  |
| `viewer_doll_id` | string | ✅ 是  | 目前正在看這些貼文的是哪隻娃娃（用於 like 狀態） |
| `limit`          | int    | ❌ 否  | 每頁幾篇貼文（預設值看後端設定）            |
| `offset`         | int    | ❌ 否  | 分頁用的位移量                     |

- **後端回傳格式**：
```json
{
  "count": 23,
  "next": "http://localhost:8000/post/profile_feed/?doll_id=tomorin&limit=5&offset=15&viewer_doll_id=cheesetaro",
  "previous": "http://localhost:8000/post/profile_feed/?doll_id=tomorin&limit=5&offset=5&viewer_doll_id=cheesetaro",
  "results": [
    {
      "id": "42f94958-9abc-4df6-9ffe-cdb8d26a35ce",
      "doll_id": "tomorin",
      "content": "3",
      "image": "/media/avatars/momo.jpg",
      "created_at": "2025-05-18T10:56:39.209232+08:00",
      "like_count": 0,
      "liked_by_me": false,
      "comment_count": 0
    },
    ...
  ]
}
```                         
---

### 列出所有粉絲娃娃（追蹤我的人）

- **路徑**：`GET /core/dolls/<doll_id>/followers/`
- **說明**：查詢某隻娃娃的所有粉絲（追蹤這隻娃娃的所有娃娃）。
- **範例回應（JSON）**：
```json
[
  {"id": "doll002", "name": "小熊", "avatar_image": "/media/avatars/bear.jpg"},
  {"id": "doll003", "name": "小兔", "avatar_image": "/media/avatars/rabbit.jpg"}
]
```

### 列出所有追蹤娃娃（我追蹤的人）

- **路徑**：`GET /core/dolls/<doll_id>/follower_to/`
- **說明**：查詢某隻娃娃追蹤的所有娃娃（這隻娃娃正在追蹤誰）。
- **範例回應（JSON）**：
```json
[
  {"id": "doll005", "name": "小貓", "avatar_image": "/media/avatars/cat.jpg"},
  {"id": "doll006", "name": "小狗", "avatar_image": "/media/avatars/dog.jpg"}
]
```

### 按讚貼文

---

* **路徑**：`POST /post/posts/<uuid:post_id>/like/`

* **說明**：

  * 替貼文按讚
  * 只有登入者本人擁有的娃娃（doll）可以進行按讚，**無法冒用他人娃娃按讚**（已實作權限驗證）

* **請求格式範例（JSON）**：

```json
{
  "doll_id": "tomorin"
}
```

**Curl 範例：**

```bash
curl -X POST \
  -H "Authorization: Bearer <你的 token>" \
  -H "Content-Type: application/json" \
  -d '{"doll_id": "tomorin"}' \
  http://localhost:8000/post/posts/6b5319e6-76f8-4fd0-91c7-f834ef7785c1/like/
```

* **成功回應格式範例（JSON）**：

```json
{
  "message": "Liked",
  "post": {
    "id": "6b5319e6-76f8-4fd0-91c7-f834ef7785c1",
    "doll_id": "tomorin",
    "content": "第一篇文OuOb",
    "image": "http://localhost:8000/media/avatars/%E8%9E%A2%E5%B9%95%E6%93%B7%E5%8F%96%E7%95%AB%E9%9D%A2_2025-05-21_160025_H7YZH9c_sr0PBMR.png",
    "created_at": "2025-06-08T16:58:02.367721+08:00",
    "like_count": 1,
    "liked_by_me": true,
    "comment_count": 0
  }
}
```

```json
{
  "message": "Already liked",
  "post": {
    ... // 同上
  }
}
```

---

### 取消按讚貼文

---

* **路徑**：`DELETE /post/posts/<uuid:post_id>/like/`

* **說明**：

  * 取消按讚指定貼文
  * 只有登入者本人擁有的娃娃（doll）可以進行取消按讚，**無法冒用他人娃娃操作**（已實作權限驗證）

* **請求格式範例（Curl 指令）**：

```bash
curl -X DELETE \
  -H "Authorization: Bearer <你的 token>" \
  -H "Content-Type: application/json" \
  -d '{"doll_id": "tomorin"}' \
  http://localhost:8000/post/posts/6b5319e6-76f8-4fd0-91c7-f834ef7785c1/like/
```

* **成功回應格式範例（JSON）**：

```json
{
  "message": "Unliked",
  "post": {
    "id": "6b5319e6-76f8-4fd0-91c7-f834ef7785c1",
    "doll_id": "tomorin",
    "content": "第一篇文OuOb",
    "image": "http://localhost:8000/media/avatars/%E8%9E%A2%E5%B9%95%E6%93%B7%E5%8F%96%E7%95%AB%E9%9D%A2_2025-05-21_160025_H7YZH9c_sr0PBMR.png",
    "created_at": "2025-06-08T16:58:02.367721+08:00",
    "like_count": 0,
    "liked_by_me": false,
    "comment_count": 0
  }
}
```

---

#### **失敗時回應（JSON）**

**權限錯誤（doll 不是自己的）：**

```json
{"detail": "你不能用不屬於你的娃娃按讚！"}
```

**已經沒按過讚：**

```json
{"message": "Not previously liked", "post": { ... }}
```

**未帶登入憑證（token）：**

```json
{"detail": "Authentication credentials were not provided."}
```

---

#### **補充說明**

* 只有自己擁有的娃娃 id 可以操作（權限驗證已上線）
* 回傳內容會附帶該貼文的所有狀態欄位
* 一律須帶 JWT token 驗證

---

### 留言貼文

---

* **路徑**：`POST /post/posts/<uuid:post_id>/comments/`
* **說明**：對指定貼文留言

- **請求格式範例（Curl 指令）**：

```bash
curl -X POST \
  -H "Authorization: Bearer <your_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
        "doll_id": "tomorin",
        "content": "這是一則留言",
        "post_id": "5cd5473d-5eb4-417d-9ac9-361bc4f22acb"
      }' \
  http://localhost:8000/post/posts/5cd5473d-5eb4-417d-9ac9-361bc4f22acb/comments/
```

- **成功回應格式範例（JSON）**：

```json
{
  "local_id": 2,
  "post_id": "5cd5473d-5eb4-417d-9ac9-361bc4f22acb",
  "doll_id": "tomorin",
  "content": "這是一則留言",
  "created_at": "2025-05-08T22:38:21.862059+08:00"
}
```

---
#### **失敗時回應（JSON）**

**權限錯誤（doll 不是自己的）：**

```json
{"detail": "你不能用不屬於你的娃娃留言！"}
```

### 取得貼文留言

---

* **路徑**：`GET /post/posts/<uuid:post_id>/comments/`
* **說明**：取得指定貼文下所有留言

- **請求格式範例（Curl 指令）**：

```bash
curl -X GET \
  -H "Authorization: Bearer <your_jwt_token>" \
  http://localhost:8000/post/posts/5cd5473d-5eb4-417d-9ac9-361bc4f22acb/comments/
```
### 取得新 access token（refresh token 機制）

* **路徑**：`POST /core/token/refresh/`
* **說明**：當 access token 過期時，前端可用 refresh token 取得新的 access token。

* **請求格式範例（JSON）**：

```json
{
  "refresh": "<你的 refresh token>"
}
```

* **curl 測試指令範例**：

```bash
curl -X POST http://127.0.0.1:8000/core/token/refresh/ \
  -H "Content-Type: application/json" \
  -d '{
        "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ..."
      }'
```

* **成功回應範例（JSON）**：

```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ..."
}
```

* **失敗時回應範例**：
- refresh token 無效或過期：
```json
{"detail": "Token is invalid or expired", "code": "token_not_valid"}
```

> 前端請在 access token 過期時自動呼叫本 API，並將新的 access token 存回本地。