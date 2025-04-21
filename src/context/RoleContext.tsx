import React, { createContext, useContext, useState } from 'react';

type RoleContextType = {
  rol: string | null;
  setRol: (role: string) => void;
};

const RoleContext = createContext<RoleContextType>({
  rol: null,
  setRol: () => {},
});

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rol, setRol] = useState<string | null>(null);

  return (
    <RoleContext.Provider value={{ rol, setRol }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRol = () => useContext(RoleContext);
