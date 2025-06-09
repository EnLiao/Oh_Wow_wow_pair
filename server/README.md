## 後端API說明（提供給前端）

本專案後端使用 Django + Django REST Framework + Simple JWT 建構，所有 API 都採用 JSON 格式傳輸資料。

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
  "password": "abc12345"
}
```

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

* **成功時回應範例（JSON）**：

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
### 瀏覽貼文

---

- **路徑**：`POST /post/feed/?doll_id=cheesetaro/`
- **說明**：瀏覽貼文

- **成功回應格式範例（總之就是回傳可以看到的貼文資料，一次五篇，從有追蹤的優先顯示）**：

```json
[{"id":"7f65e081-1724-4650-ab1d-0df3a93bc633","doll_id":"tomorin","content":"ffffe","image_url":"https://github.com/","created_at":"2025-05-08T01:51:13.196400+08:00"},{"id":"e2a6177d-5296-44fc-a08d-9c074d446ea5","doll_id":"omuba","content":"fff","image_url":"https://github.com/","created_at":"2025-05-08T01:51:03.587402+08:00"}]
```
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
      "image_url": "https://github.com/",
      "created_at": "2025-05-18T10:56:39.209232+08:00",
      "like_count": 0,
      "liked_by_me": false,
      "comment_count": 0
    },
    ...
  ]
}
```
| 欄位名             | 類型       | 說明                             |
| --------------- | -------- | ------------------------------ |
| `id`            | UUID     | 貼文的唯一識別碼                       |
| `doll_id`       | string   | 發文的娃娃 ID                       |
| `content`       | string   | 文字內容                           |
| `image_url`     | string   | 圖片網址                           |
| `created_at`    | datetime | 發文時間（含時區）                      |
| `like_count`    | int      | 按讚數                            |
| `liked_by_me`   | bool     | 目前的 `viewer_doll_id` 是否有按讚這篇貼文 |
| `comment_count` | int      | 留言數量                           |

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
