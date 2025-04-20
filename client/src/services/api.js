import axios from 'axios';
import { data } from 'react-router-dom';

const api = axios.create({
  baseURL: 'http://localhost:8000',
});

export const login = (data) => api.post('/core/login/', data);
export const register = (data) => api.post('/core/register/', data);

export default api;