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
- EMAIL_HOST=smtp.gmail.com
- EMAIL_PORT=587
- EMAIL_HOST_USER=你的Gmail帳號@gmail.com
- EMAIL_HOST_PASSWORD_WOW=你的Gmail應用程式密碼（App Password）
- EMAIL_USE_TLS=True
- DEFAULT_FROM_EMAIL=你的Gmail帳號@gmail.com
# 可選：前端與後端共用的 base URL（例如用來生成信箱驗證連結）
- BASE_URL=http://localhost:8000