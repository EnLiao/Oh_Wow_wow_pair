## 後端API說明（提供給前端）
本專案後端使用 Django + Django REST Framework + Simple JWT 建構，所有 API 都採用 JSON 格式傳輸資料。
---
### 使用者註冊 API
- 路徑：`POST /core/register/`
- 說明：建立新使用者帳號
- 請求格式（JSON）：
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
- 回應格式（JSON）：
```json
{
  "username": "momo",
  "email": "momo@example.com",
  "nickname": "小桃",
  "bio": "我愛娃娃",
  "avatar_url": "https://example.com/momo.jpg"
}
```