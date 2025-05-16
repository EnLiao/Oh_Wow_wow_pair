import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // 初始狀態從 localStorage 拿
  const [username, setUsernameState] = useState(() => localStorage.getItem('username'));
  const [accessToken, setTokenState] = useState(() => localStorage.getItem('access_token'));
  const [currentDollId, setDollIdState] = useState(() => localStorage.getItem('current_doll_id'));

  const updateUsername = (newUsername) => {
    if (newUsername) {
      localStorage.setItem('username', newUsername);
    } else {
      localStorage.removeItem('username');
    }
    setUsernameState(newUsername);
  };

  const updateToken = (newToken) => {
    if (newToken) {
      localStorage.setItem('access_token', newToken);
    } else {
      localStorage.removeItem('access_token');
    }
    setTokenState(newToken);
  };

  const updateDollId = (newDollId) => {
    if (newDollId) {
      localStorage.setItem('current_doll_id', newDollId);
    } else {
      localStorage.removeItem('current_doll_id');
    }
    setDollIdState(newDollId);
  };

  const logout = () => {
    updateUsername(null);
    updateToken(null);
    updateDollId(null);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider
      value={{
        username,
        accessToken,
        currentDollId,
        updateUsername,
        updateToken,
        updateDollId,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};