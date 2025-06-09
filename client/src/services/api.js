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
export const create_post = (data) => api.post('/post/posts/', data);
export const getDollInfo = (dollId) => api.get(`/core/dolls/${dollId}/`);
export const get_tags = () => api.get('/core/tags/');
export const follow = (data) => api.post('/core/follow/', data);
export const unfollow = (data) => api.delete('/core/follow/', {data});
export const postComments = (postId, data) => api.post(`/post/posts/${postId}/comments/`, data);
export const getComments = (postId) => api.get(`/post/posts/${postId}/comments/`);
export const searchDolls = (keyword) => api.get(`/search/doll-ids/?q=${keyword}`);
export const searchPosts = (keyword) => api.get(`/search/posts/?q=${keyword}`);
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

  return raw.map((p) => {
    // 處理圖片路徑
    if (p.image_url && !p.image) {
      p.image = p.image_url;
    }
    if (p.image) {
      p.image = addBaseUrl(p.image);
    }
    if (p.doll_avatar) {
      p.doll_avatar = addBaseUrl(p.doll_avatar);
    }
    
    return p;
  });
}

function addBaseUrl(path) {
  // 如果已經是完整URL則直接返回
  if (path.startsWith('http')) return path;
  // 否則加上API基礎URL
  return `http://localhost:8000${path}`;
}

export const getFollowing = (dollId) => api.get(`/core/dolls/${dollId}/follower_to/`);
export const likePost = (postId, dollId) =>
  api.post(`/post/posts/${postId}/like/`, { doll_id: dollId });

export const unlikePost = (postId, dollId) =>
  api.delete(`/post/posts/${postId}/like/`, { data: { doll_id: dollId } });

export const refreshToken = async () => {
  const refresh = localStorage.getItem('refresh_token');
  
  if (!refresh) {
    throw new Error('No refresh token available');
  }
  
  const response = await axios.post('/core/token/refresh/', { refresh });
  return response.data;
};

// 在 api.js 中添加響應攔截器
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // 檢查是否是 401 錯誤且不是重試過的請求
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/core/token/refresh/')
    ) {
      originalRequest._retry = true;
      
      try {
        // 嘗試刷新 token
        const { access } = await refreshToken();
        localStorage.setItem('access_token', access);
        
        // 更新當前請求的 Authorization header
        originalRequest.headers.Authorization = `Bearer ${access}`;
        // 重新發送原始請求
        return api(originalRequest);
      } catch (refreshError) {
        // 刷新 token 也失敗，可能 refresh token 也過期了
        // 清除登入狀態，重新導向到登入頁
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/'; // 重定向到登入頁
        return Promise.reject(refreshError);
      }
    }
    
    // 其他錯誤情況
    return Promise.reject(error);
  }
);

export default api;