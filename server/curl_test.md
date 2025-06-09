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
curl -X GET "http://localhost:8000/post/feed/?doll_id=tomorin"\
 -H "Authorization: Bearer eyJ..ux98"
# → [{"id":"5ecc3bd9-0ecd-4b86-bd2f-bba081d327f8","doll_id":"abc","content":"蛤","image":"/media/avatars/%E8%9_145045.png","created_at":"2025-06-09T12:51:14.217824+08:00","like_count":0,"liked_by_me":false,"comment_count":0,"is_followed":false},{"id":"0501366d-f333-4122-9070-be6269f5d262","doll_id":"tomorin","content":"1234","image":"/media/avatars/%E8%%9D%A2_2025-05-27_201640.png","created_at":"2025-06-09T12:50:59.994595+08:00","like_count":0,"liked_by_me":false,"comment_count":0,"is_followed":true}]

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
`````

