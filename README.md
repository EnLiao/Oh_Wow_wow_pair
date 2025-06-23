# Oh-Wow-wow-pair
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/EnLiao/Oh_Wow_wow_pair)

"Oh! Wow wow pair~ is a social communication platform designed for doll lovers.

Oh-Wow-wow-pair allows each user (doll owner) to create a personalized profile for their beloved dolls, take photos and post on each doll's personal page, and record and share the dolls' daily life and moments. The platform's homepage integrates the latest news and photos from each doll. Users can browse the posts of other dolls as dolls, and interact with each other through the functions of “Like” and “Leave a Message”, thus facilitating social connection and emotional resonance among doll lovers.


## How to deploy?

### Backend
#### Step 1  
Enter virtual environment

#### Step 2
```
pip install -r requirements.txt
```
#### Step 3
```
cd server
python manage.py runserver
daphne -p 8001 wowpair.asgi:application
```

## Contributors

| Name                                                   | Role                        | Responsibility            |
|--------------------------------------------------------|-----------------------------|---------------------------|
| [happylittle7](https://github.com/happylittle7)        | Project Manager & Deployment| Overall planning, deployment, schedule management               |
| [cyucccx](https://github.com/cyucccx)                  | Frontend                    | UI/UX design, frontend development                              |
| [noyapoyo](https://github.com/noyapoyo)                | Backend (core)              | Core APIs, related backend features, model design               |
| [Rokusenn](https://github.com/EnLiao)                  | Backend (post & search)     | Post and search APIs, related backend features, model design    |

### Special Thanks

- [mrfish233](https://github.com/mrfish233) d(･o･)(･o･)(･o･)(･o･)b
- [Omuba](https://www.instagram.com/good_doll_0925/)
- Copid
- Donut Music Classroom
- Our dear dolls
### Setting .env
- SECRET_KEY=YOUR_DATA
- RECAPTCHA_SECRET_KEY=YOUR_DATA
- VITE_RECAPTCHA_SITE_KEY=YOUR_DATA

## 即時通訊/聊天功能相關環境變數

在 `.env` 或系統環境變數中建議設置：

- `SECRET_KEY`  # Django 專案密鑰
- `RECAPTCHA_SECRET_KEY`  # Google reCAPTCHA 驗證（如有開啟註冊/登入驗證）
- `VITE_RECAPTCHA_SITE_KEY`  # 前端用於 reCAPTCHA（如有）
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD_WOW`, `EMAIL_USE_TLS`, `DEFAULT_FROM_EMAIL`  # 郵件驗證
- `MEDIA_ROOT`  # 媒體檔案存放路徑（如有圖片/貼圖上傳）
- `MEDIA_URL`   # 媒體檔案 URL 前綴

### Channels/ASGI 啟動建議

若用 Daphne 啟動，建議設置：
- `DJANGO_SETTINGS_MODULE=wowpair.settings`
- `PYTHONPATH=.`  # (在 server 目錄下)

### Redis (如需生產環境高併發)
- `CHANNEL_LAYERS` 設定可用 Redis，需設置 Redis 連線資訊

---