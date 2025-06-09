## 🔍 搜尋娃娃 ID API

---

### 路徑

```
GET /search/doll/?q=關鍵字
```

---

### 說明

* 根據關鍵字**模糊搜尋**現有的娃娃 ID 或名字。
* 最多回傳 10 筆結果（支援 auto-complete 或下拉選單）。
* 每筆結果回傳娃娃的 `id`、`name` 以及 `avatar`（頭貼網址）。

---

### 請求範例

```bash
curl -X GET "http://localhost:8000/search/doll/?q=omuba" \
  -H "Authorization: Bearer <你的token>"
```

---

### 參數

| 參數 | 說明        | 必填 | 範例值   |
| -- | --------- | -- | ----- |
| q  | 搜尋關鍵字（模糊） | 是  | omuba |

---

### 成功回應範例（JSON）

```json
{
  "results": [
    {
      "id": "omuba",
      "name": "小白",
      "avatar": "http://localhost:8000/media/avatars/xxx.png"
    },
    {
      "id": "oomuba",
      "name": "大黑",
      "avatar": null
    }
  ]
}
```

---

### 失敗回應範例

* **若沒有帶參數 `q`：**

```json
{
  "results": []
}
```

---

### 備註

* 若 `avatar` 欄位為 null，表示此娃娃尚未設定頭貼。
* 此 API 支援 id/name 任何一項符合關鍵字皆可回傳。

---

## 🔍 搜尋貼文內容 API

---

### 路徑

```
GET /search/posts/?q=關鍵字
```

---

### 說明

* 根據關鍵字**模糊搜尋**現有的貼文內容。
* 最多回傳 10 筆結果，依據貼文創建時間排序（最新優先）。
* 回傳貼文的完整資訊，包含 ID、內容、圖片、發文娃娃、創建時間等。

---

### 請求範例

```bash
curl -X GET "http://localhost:8000/search/posts/?q=第一篇" \
  -H "Authorization: Bearer <你的token>"
```

---

### 參數

| 參數 | 說明        | 必填 | 範例值   |
| -- | --------- | -- | ----- |
| q  | 搜尋關鍵字（模糊） | 是  | 第一篇 |

---

### 成功回應範例（JSON）

```json
{
  "results": [
    {
      "id": "6b5319e6-76f8-4fd0-91c7-f834ef7785c1",
      "content": "第一篇文OuOb",
      "image": "http://localhost:8000/media/avatars/example.jpg",
      "doll_id": "tomorin",
      "created_at": "2025-06-08T16:58:02.367721+08:00"
    },
    {
      "id": "7c6420f7-87f9-4ed1-92d8-f845fe8876e2",
      "content": "這是我的第一篇貼文測試",
      "image": null,
      "doll_id": "cheesetaro",
      "created_at": "2025-06-08T15:30:15.123456+08:00"
    }
  ]
}
```

---

### 失敗回應範例

* **若沒有帶參數 `q`：**

```json
{
  "results": []
}
```

* **找不到符合的貼文：**

```json
{
  "results": []
}
```

---

### 回應欄位說明

| 欄位名         | 型別     | 說明                           |
| ----------- | ------ | ---------------------------- |
| `id`        | string | 貼文的唯一識別碼（UUID）               |
| `content`   | string | 貼文內容                         |
| `image`     | string | 貼文圖片 URL，若無圖片則為 `null`       |
| `doll_id`   | string | 發文娃娃的 ID                     |
| `created_at`| string | 貼文創建時間（ISO 8601 格式）          |

---

### 補充說明

* 此 API 會搜尋所有公開的貼文內容
* 搜尋結果按貼文創建時間降序排列（最新的在前）
* 圖片欄位會回傳完整的 URL 路徑，方便前端直接使用
* 搜尋採用不區分大小寫的模糊比對

---