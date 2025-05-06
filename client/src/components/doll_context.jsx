import React, { createContext, useState, useEffect } from 'react';

export const DollContext = createContext();

export const DollProvider = ({ children }) => {
  const [dollInfo, setDollInfo] = useState(null);

  useEffect(() => {
    const storedInfo = localStorage.getItem('doll_info');
    if (storedInfo) {
      setDollInfo(JSON.parse(storedInfo));
    }
  }, []);

  return (
    <DollContext.Provider value={{ dollInfo, setDollInfo }}>
      {children}
    </DollContext.Provider>
  );
};