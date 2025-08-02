import { createGlobalTheme, createThemeContract } from '@vanilla-extract/css';

// Define the theme contract (structure)
export const themeContract = createThemeContract({
  // Colors
  color: {
    primary: null,
    primaryHover: null,
    primaryActive: null,
    secondary: null,
    secondaryHover: null,
    secondaryActive: null,
    tertiary: null,
    tertiaryHover: null,
    tertiaryActive: null,
    background: null,
    surface: null,
    text: null,
    textSecondary: null,
    border: null,
    borderLight: null,
    error: null,
    errorHover: null,
    errorActive: null,
  },
  
  // Typography
  font: {
    family: null,
    headingFamily: null,
    monoFamily: null,
    size: {
      xs: null,
      sm: null,
      base: null,
      lg: null,
      xl: null,
      '2xl': null,
    },
    weight: {
      normal: null,
      medium: null,
      semibold: null,
      bold: null,
    },
  },
  
  // Spacing
  space: {
    xs: null,
    sm: null,
    md: null,
    lg: null,
    xl: null,
  },
  
  // Border radius
  radius: {
    none: null,
    sm: null,
    md: null,
    lg: null,
    xl: null,
    full: null,
  },
  
  // Border widths
  border: {
    none: null,
    thin: null,
    base: null,
    thick: null,
  },
  
  // Box shadows
  shadow: {
    none: null,
    sm: null,
    md: null,
    lg: null,
    xl: null,
    inner: null,
  },
});

// Studio Ghibli Light Theme
export const lightTheme = createGlobalTheme(':root', themeContract, {
  color: {
    // Primary: Sky blue like Castle in the Sky
    primary: '#0ea5e9',
    primaryHover: '#0284c7',
    primaryActive: '#0369a1',
    
    // Secondary: Warm golden yellow like Totoro's belly
    secondary: '#eab308',
    secondaryHover: '#ca8a04',
    secondaryActive: '#a16207',
    
    // Tertiary: Forest green like Totoro and nature
    tertiary: '#22c55e',
    tertiaryHover: '#16a34a',
    tertiaryActive: '#15803d',
    
    // Background colors with warm earth tones
    background: '#faf5f0', // Warm cream background
    surface: '#f5ebe0',    // Slightly darker warm surface
    
    // Text colors using warm neutrals
    text: '#5a4938',       // Dark warm brown
    textSecondary: '#725c47', // Medium warm brown
    
    // Border colors
    border: '#d1b5a1',     // Light warm brown
    borderLight: '#e7d2c1', // Very light warm brown
    
    // Error colors
    error: '#dc2626',       // Red for errors
    errorHover: '#b91c1c',  // Darker red on hover
    errorActive: '#991b1b', // Even darker red when active
  },
  
  font: {
    family: '"Quicksand", "Nunito", "Comfortaa", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    headingFamily: '"Kalam", "Patrick Hand", "Quicksand", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    monoFamily: '"Fira Code", "JetBrains Mono", "SF Mono", "Monaco", monospace',
    size: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '20px',
      xl: '24px',
      '2xl': '30px',
    },
    weight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  
  space: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  
  radius: {
    none: '0px',
    sm: '4px',
    md: '8px', 
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
  
  border: {
    none: '0px',
    thin: '1px',
    base: '2px',
    thick: '4px',
  },
  
  shadow: {
    none: 'none',
    sm: '0 1px 2px rgba(139, 69, 19, 0.08), 0 1px 4px rgba(139, 69, 19, 0.04)', // Warm brown shadows
    md: '0 4px 6px rgba(139, 69, 19, 0.1), 0 2px 4px rgba(139, 69, 19, 0.06)',
    lg: '0 10px 15px rgba(139, 69, 19, 0.1), 0 4px 6px rgba(139, 69, 19, 0.05)',
    xl: '0 20px 25px rgba(139, 69, 19, 0.1), 0 10px 10px rgba(139, 69, 19, 0.04)',
    inner: 'inset 0 2px 4px rgba(139, 69, 19, 0.06)',
  },
});

// Export the theme for use in components
export { themeContract as theme };