import axios from 'axios';
import { data } from 'react-router-dom';

const api = axios.create({
  baseURL: 'http://localhost:8000',
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token && !config.url.includes('/core/login/') && !config.url.includes('/core/register/')) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const login = (data) => api.post('/core/login/', data);
export const register = (data) => api.post('/core/register/', data);
export const doll_list_view = (username) => api.get(`/core/users/${username}/dolls/`)
export const create_doll = (data) => api.post('/core/dolls/', data);
export const create_post = (data) => api.post('/post/posts', data);
export const getDollInfo = (dollId) => api.get(`/core/dolls/${dollId}/`);
export const get_tags = () => api.get('/core/tags/');
export async function getPosts({
  mode,
  targetDollId,
  viewerDollId,
  limit = 5,
  offset = 0,
}) {
  let raw;

  if (mode === 'profile') {
    const { data } = await api.get('/post/profile_feed/', {
      params: {
        doll_id: targetDollId,
        viewer_doll_id: viewerDollId,
        limit,
        offset,
      },
    });
    raw = data.results; // 只要 results
  } else {
    const { data } = await api.get(`/post/feed/?doll_id=${targetDollId}`);
    raw = data; // 直接就是陣列
  }

  // ➜ 統一轉成前端好用的格式
  return raw.map((p) => ({
    id: p.id,
    dollId: p.doll_id,
    dollName: p.doll_name ?? p.doll_id,
    dollAvatar: p.doll_avatar ?? null,
    content: p.content,
    image: p.image_url ?? p.image ?? null,
    createdAt: p.created_at,
    likeCount: p.like_count ?? 0,
    likedByMe: p.liked_by_me ?? false,
    commentCount: p.comment_count ?? 0,
  }));
}
export const getFollowing = (dollId) => api.get(`/core/dolls/${dollId}/follower_to/`);

export default api;