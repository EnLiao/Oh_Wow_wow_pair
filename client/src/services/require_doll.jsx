import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from './auth_context';

export default function RequireDoll() {
  const { currentDollId } = useContext(AuthContext);
  console.log('currentDollId', currentDollId)
  return currentDollId ? <Outlet /> : <Navigate to="/create_doll" replace />;
}