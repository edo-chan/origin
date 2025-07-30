import React, { createContext, useContext, useState, useEffect } from 'react';
import { themes, type ThemeName } from './themes';

interface ThemeContextType {
  currentTheme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  availableThemes: ThemeName[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeName;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  defaultTheme = 'light' 
}) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>(defaultTheme);
  
  // Apply theme class to body
  useEffect(() => {
    // Remove all theme classes
    Object.values(themes).forEach(theme => {
      document.body.classList.remove(theme);
    });
    
    // Add current theme class
    document.body.classList.add(themes[currentTheme]);
  }, [currentTheme]);
  
  const setTheme = (theme: ThemeName) => {
    setCurrentTheme(theme);
  };
  
  const availableThemes: ThemeName[] = Object.keys(themes) as ThemeName[];
  
  return (
    <ThemeContext.Provider value={{
      currentTheme,
      setTheme,
      availableThemes,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};