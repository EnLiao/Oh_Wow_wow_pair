import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from './auth_context';

export default function RequireAuth() {
  const { accessToken } = useContext(AuthContext);
  console.log('accessToken', accessToken)
  return accessToken ? <Outlet /> : <Navigate to="/" replace />;
}