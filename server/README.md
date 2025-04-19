## 後端API說明（提供給前端）
本專案後端使用 Django + Django REST Framework + Simple JWT 建構，所有 API 都採用 JSON 格式傳輸資料。
---
### 使用者註冊 API
- 路徑：`POST /core/register/`
- 說明：建立新使用者帳號
- 請求格式範例（JSON）：
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
- 回應格式範例（JSON）：
```json
{
  "username": "momo",
  "email": "momo@example.com",
  "nickname": "小桃",
  "bio": "我愛娃娃",
  "avatar_url": "https://example.com/momo.jpg"
}
```
### 使用者登入 API (這裡假設前端有確實讓使用者輸入完整的username跟password，不會只填一個)
- 路徑：`POST /core/login/`
- 說明：使用者登入
- 成功請求格式範例（JSON）：
```json
{
  "username": "momo",
  "password": "abc12345"
}
```
- 成功時回應格式範例（JSON）：
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ...",
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ..."
}
```
- 失敗請求格式範例（JSON）：
```json
{
  "username": "momo",
  "password": "wrongpassword"
}
```
- 失敗時回應格式範例（JSON）：
```json
{
  "detail": "No active account found with the given credentials"
}
```
欄位 | 說明
access | 短效 token，前端每次發 API 都要帶這個
refresh | 用來在 token 過期時重新取得新 token