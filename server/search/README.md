## 🔍 搜尋娃娃 ID API

---

### 路徑

```
GET /search/doll-ids/?q=關鍵字
```

---

### 說明

* 根據關鍵字**模糊搜尋**現有的娃娃 ID。
* 最多回傳 10 筆結果（支援 auto-complete 或下拉選單）。
* 預設只會回傳娃娃的 `id` 欄位。

---

### 請求範例

```bash
curl -X GET "http://localhost:8000/search/doll-ids/?q=omuba" \
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
    "omuba",
    "oomuba",
    "123omuba"
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