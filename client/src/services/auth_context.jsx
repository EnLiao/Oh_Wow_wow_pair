import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // 初始狀態從 localStorage 拿
  const [username, setUsernameState] = useState(() => localStorage.getItem('username'));
  const [accessToken, setTokenState] = useState(() => localStorage.getItem('access_token'));
  const [currentDollId, setDollIdState] = useState(() => localStorage.getItem('current_doll_id'));
  const [doll_img, setDollImgState] = useState(() => localStorage.getItem('doll_img'));
  const [doll_name, setDollNameState] = useState(() => localStorage.getItem('doll_name'));

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

  const updateDollImg = (newDollImg) => {
    if (newDollImg) {
      localStorage.setItem('doll_img', newDollImg);
    } else {
      localStorage.removeItem('doll_img');
    }
    setDollImgState(newDollImg);
  }

  const updateDollName = (newDollName) => {
    if (newDollName) {
      localStorage.setItem('doll_name', newDollName);
    } else {
      localStorage.removeItem('doll_name');
    }
    setDollNameState(newDollName);
  }

  const logout = () => {
    updateUsername(null);
    updateToken(null);
    updateDollId(null);
    updateDollImg(null);
    updateDollName(null);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider
      value={{
        username,
        accessToken,
        currentDollId,
        doll_img,
        doll_name,
        updateUsername,
        updateToken,
        updateDollId,
        updateDollImg,
        updateDollName,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};