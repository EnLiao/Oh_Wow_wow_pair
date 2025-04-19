# Oh-Wow-Wow-Pair 前端 API 串接說明文件

本專案為使用 React 製作的前端網頁介面，配合後端 Django + DRF + Simple JWT 提供的 API，進行使用者登入、註冊與基本資料操作。

---

## ✅ API 串接總覽

| 功能     | 方法 | 路徑               | 備註             |
|----------|------|--------------------|------------------|
| 使用者註冊 | POST | `/core/register/` | 傳送 JSON 資料註冊帳號 |
| 使用者登入 | POST | `/core/login/`    | 成功回傳 JWT Token |
| 後續 API 認證 | -    | 需附帶 `Authorization: Bearer <access>` | 前端會存取 token 並附上 |

---

## 🔐 使用者註冊 API

- **前端傳送內容**（`application/json`）：

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

- **後端期望回傳內容**：

```json
{
  "username": "momo",
  "email": "momo@example.com",
  "nickname": "小桃",
  "bio": "我愛娃娃",
  "avatar_url": "https://example.com/momo.jpg"
}
```

---

## 🔓 使用者登入 API

- **前端傳送內容**：

```json
{
  "username": "momo",
  "password": "abc12345"
}
```

- **成功時後端回傳**：

```json
{
  "refresh": "<refresh_token>",
  "access": "<access_token>"
}
```

- **登入成功後前端行為**：
  - 將 `access_token` 和 `refresh_token` 儲存在 `localStorage`
  - 後續 API 會加上：

```http
Authorization: Bearer <access_token>
```

- **登入失敗時後端回傳例：**

```json
{
  "detail": "No active account found with the given credentials"
}
```

---

## 📦 前端需求補充

- 後端須開啟 **CORS 支援**
  - 開發階段預設為 `http://localhost:5173`（Vite dev server）
  - 建議設定：

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
]
```

---

## 🔀 未來擴充預期

前端預計使用 access token 呼叫：
- `/posts/` 貼文列表
- `/posts/create/` 發文
- `/user/me/` 取得當前登入者資料

將供後端驗證 JWT，並透過 `request.user` 提供資訊。

---

## 📌 目前錯誤處理邏輯

- 前端對於 `res.ok === false` 會解析回傳 JSON 並顯示 `error.detail`
- 若發生網路錯誤（例如服務器未開），會輸出 alert

---

## 😝 備註

如需調整註冊欄位名稱、登入驗證邏輯，請通知前端同步修改欄位映射與回應處理程式。

感謝後端大大支援 ❤️