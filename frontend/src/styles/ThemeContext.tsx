import React, { createContext, useContext, useState, useEffect } from 'react';

type ThemeName = 'light' | 'dark' | 'cyberpunk' | 'japanese90s' | 'disney' | 'neobrutal' | 'kdrama' | 'almosthermes' | 'slate-monochrome';

interface ThemeContextType {
  currentTheme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  availableThemes: ThemeName[];
}

const ThemeContext = createContext<ThemeContextType>({
  currentTheme: 'light',
  setTheme: () => {},
  availableThemes: ['light', 'dark', 'cyberpunk', 'japanese90s', 'disney', 'neobrutal', 'kdrama', 'almosthermes', 'slate-monochrome'],
});

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeName;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  defaultTheme = 'light' 
}) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>(defaultTheme);
  
  // Apply theme via data attribute on document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);
  
  const setTheme = (theme: ThemeName) => {
    setCurrentTheme(theme);
  };
  
  const contextValue: ThemeContextType = {
    currentTheme,
    setTheme,
    availableThemes: ['light', 'dark', 'cyberpunk', 'japanese90s', 'disney', 'neobrutal', 'kdrama', 'almosthermes', 'slate-monochrome'],
  };
  
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};