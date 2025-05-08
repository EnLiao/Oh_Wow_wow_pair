import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // 1. 先用 lazy initializer 從 localStorage 把值帶進來
  const [username, setUsername]     = useState(() => localStorage.getItem('username'));
  const [accessToken, setToken]     = useState(() => localStorage.getItem('access_token'));
  const [currentDollId, setDollId]  = useState(() => localStorage.getItem('current_doll_id'));

  // 2. 任何值變動時，同步寫回 localStorage
  useEffect(() => {
    username      ? localStorage.setItem('username',      username)     : localStorage.removeItem('username');
  }, [username]);

  useEffect(() => {
    accessToken   ? localStorage.setItem('access_token',  accessToken)  : localStorage.removeItem('access_token');
  }, [accessToken]);

  useEffect(() => {
    currentDollId ? localStorage.setItem('current_doll_id', currentDollId) : localStorage.removeItem('current_doll_id');
  }, [currentDollId]);

  // 3. 統一登出 helper（清空狀態 + localStorage）
  const logout = () => {
    setUsername(null);
    setToken(null);
    setDollId(null);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider
      value={{
        username,
        setUsername,
        accessToken,
        setToken,
        currentDollId,
        setDollId,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};