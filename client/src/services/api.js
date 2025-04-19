import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5173/api/',
});

// services/api.js
export async function login({ username, password }) {
  return await fetch('/core/login/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
}

export async function register(userInfo) {
  return await fetch('/core/register/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userInfo)
  })
}

export const fetchPosts = () => api.get('posts/');
export const fetchPost = (id) => api.get(`posts/${id}/`);
export const createComment = (data) => api.post('comments/', data);

export default api;