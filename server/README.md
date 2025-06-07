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
  -H "Authorization: Bearer <你的 token>" \
  -F "doll_id=doll001" \
  -F "content=這是我的第一篇文" \
  -F "image=@momo.jpg"
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

### 取消按讚貼文

---

* **路徑**：`DELETE /post/posts/<uuid:post_id>/like/`
* **說明**：取消按讚指定貼文

- **請求格式範例（Curl 指令）**：

```bash
curl -X DELETE \
  -H "Authorization: Bearer <your_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"doll_id": "cheesetaro"}' \
  http://localhost:8000/post/posts/e6666593-3d06-4563-8b38-67a411476c3c/like/
```

- **成功回應格式範例（JSON）**：

```json
[
  {
    "message": "Unliked",
    "post": {
      "id": "e6666593-3d06-4563-8b38-67a411476c3c",
      "doll_id": "omuba",
      "content": "我是一條笨狗 汪汪汪 我叫歐姆嘎抓",
      "image_url": "https://github.com/",
      "created_at": "2025-05-08T15:12:00.939363+08:00",
      "like_count": 0,
      "liked_by_me": false
    }
  }
]
```

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

- **成功回應格式範例（JSON）**：

```json
[
  {
    "local_id": 1,
    "post_id": "5cd5473d-5eb4-417d-9ac9-361bc4f22acb",
    "doll_id": "tomorin",
    "content": "這是一則留言",
    "created_at": "2025-05-08T22:36:51.879810+08:00"
  },
  {
    "local_id": 2,
    "post_id": "5cd5473d-5eb4-417d-9ac9-361bc4f22acb",
    "doll_id": "tomorin",
    "content": "這是一則留言",
    "created_at": "2025-05-08T22:38:21.862059+08:00"
  }
]
```

## 用curl測試指令紀錄（終端機）

```bash
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
        "avatar_image": "https://example.com/doll.jpg",
        "tag_ids":[1, 2]
      }'
# → {"id":"doll001","username":"momo","name":"小白","birthday":"2023-10-01","description":"這是我最喜歡的娃娃","avatar_image":"https://example.com/doll.jpg","created_at":"2025-05-05T11:24:22.180047+08:00","tags":[]}

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
curl -X GET "http://localhost:8000/post/feed/?doll_id=omuba"\
-H "Authorization: Bearer eyJ0eX4hI"
# → [{"id":"6f227e7d-538a-41e4-8af9-504ed6ac5ff5","doll_id":"tomorin","content":"1","image_url":"https://github.com/","created_at":"2025-05-16T19:55:46.062910+08:00","like_count":0,"liked_by_me":false,"comment_count":0},{"id":"c24f464d-2edc-4685-8f2b-a5605178673a","doll_id":"tomorin","content":"1","image_url":"https://github.com/","created_at":"2025-05-16T19:55:37.751486+08:00","like_count":0,"liked_by_me":false,"comment_count":0},{"id":"d0ebd4ea-b14b-4c89-b27b-dc0ad79a39c3","doll_id":"tomorin","content":"f","image_url":"https://github.com/","created_at":"2025-05-16T19:55:30.679483+08:00","like_count":0,"liked_by_me":false,"comment_count":0},{"id":"6b367624-ec72-4789-a0de-715274998580","doll_id":"tomorin","content":"f","image_url":"https://github.com/","created_at":"2025-05-16T19:55:23.294855+08:00","like_count":0,"liked_by_me":false,"comment_count":0},{"id":"a0133140-274c-46ec-847c-23eeb8857ea6","doll_id":"tomorin","content":"8","image_url":"https://github.com/","created_at":"2025-05-16T19:55:17.096527+08:00","like_count":0,"liked_by_me":false,"comment_count":0}]

# 取得某隻 doll 的貼文
curl "http://localhost:8000/post/profile_feed/?doll_id=tomorin&viewer_doll_id=cheesetaro" \
  -H "Authorization: Bearer ey...gI"
# → {"count":23,"next":"http://localhost:8000/post/profile_feed/?doll_id=tomorin&limit=5&offset=15&viewer_doll_id=cheesetaro","previous":"http://localhost:8000/post/profile_feed/?doll_id=tomorin&limit=5&offset=5&viewer_doll_id=cheesetaro","results":[{"id":"42f94958-9abc-4df6-9ffe-cdb8d26a35ce","doll_id":"tomorin","content":"3","image_url":"https://github.com/","created_at":"2025-05-18T10:56:39.209232+08:00","like_count":0,"liked_by_me":false,"comment_count":0},{"id":"e3892b72-5a13-43d1-b502-64a70bd2d3fa","doll_id":"tomorin","content":"2","image_url":"https://github.com/","created_at":"2025-05-18T10:56:33.080855+08:00","like_count":0,"liked_by_me":false,"comment_count":0},{"id":"4cbc2639-bc3a-4c67-b279-05c8fedc46f9","doll_id":"tomorin","content":"1","image_url":"https://github.com/","created_at":"2025-05-18T10:56:26.329936+08:00","like_count":0,"liked_by_me":false,"comment_count":0},{"id":"00ea093d-4c36-4ff8-845c-06490c555ea6","doll_id":"tomorin","content":"456","image_url":"https://github.com/","created_at":"2025-05-18T10:53:09.317580+08:00","like_count":0,"liked_by_me":false,"comment_count":0},{"id":"151bb640-df92-48a5-8827-1d8ecaceb3f6","doll_id":"tomorin","content":"123","image_url":"https://github.com/","created_at":"2025-05-18T10:53:00.028697+08:00","like_count":0,"liked_by_me":false,"comment_count":0}]}
再下五篇文：
curl "http://localhost:8000/post/profile_feed/?doll_id=tomorin&viewer_doll_id=cheesetaro&offset=5" \
  -H "Authorization: Bearer eyJ...EgI"
  以此類推

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

