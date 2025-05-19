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

export default api;