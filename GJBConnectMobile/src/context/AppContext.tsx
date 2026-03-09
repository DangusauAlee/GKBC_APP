import React, { createContext, useContext, useState } from 'react';

interface AppContextType {
  isCreatePostModalVisible: boolean;
  setCreatePostModalVisible: (visible: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCreatePostModalVisible, setCreatePostModalVisible] = useState(false);

  return (
    <AppContext.Provider value={{ isCreatePostModalVisible, setCreatePostModalVisible }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
