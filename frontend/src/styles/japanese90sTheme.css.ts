import { createGlobalTheme } from '@vanilla-extract/css';
import { themeContract } from './theme.css';

// 90s Japanese Theme - Inspired by vintage Japanese design, anime, and nostalgic aesthetics
export const japanese90sTheme = createGlobalTheme('[data-theme="japanese90s"]', themeContract, {
  color: {
    // Primary: Soft coral pink like cherry blossoms and sunset skies
    primary: '#ff9999',
    primaryHover: '#ffb3b3',
    primaryActive: '#ff8080',
    
    // Secondary: Warm golden yellow like traditional lanterns
    secondary: '#ffd966',
    secondaryHover: '#ffe680',
    secondaryActive: '#ffcc4d',
    
    // Tertiary: Soft mint green like traditional tea ceremonies
    tertiary: '#99d6a3',
    tertiaryHover: '#b3e0b8',
    tertiaryActive: '#80cc8f',
    
    // Warm, nostalgic backgrounds
    background: '#faf6f2',        // Warm off-white like aged paper
    surface: '#f0ebe6',           // Slightly darker warm surface
    
    // Soft, readable text
    text: '#5a4a42',              // Dark warm brown
    textSecondary: '#7a6a62',     // Medium warm brown
    
    // Gentle borders
    border: '#d9c7b8',            // Light warm brown
    borderLight: '#e6d4c7',       // Very light warm brown
    
    // Error colors
    error: '#dc2626',             // Standard red for errors
    errorHover: '#b91c1c',        // Darker red on hover
    errorActive: '#991b1b',       // Even darker red when active
  },
  
  font: {
    // Japanese-inspired fonts with retro feel
    family: '"Noto Sans JP", "Hiragino Sans", "M PLUS Rounded 1c", "Quicksand", "Nunito", sans-serif',
    headingFamily: '"M PLUS Rounded 1c", "Noto Sans JP", "Comfortaa", "Quicksand", sans-serif',
    monoFamily: '"Fira Code", "Consolas", "M PLUS 1 Code", monospace',
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
    sm: '6px',        // Soft, gentle curves
    md: '12px',       // Rounded like vintage Japanese design
    lg: '18px',       // Very rounded for that cute aesthetic
    xl: '24px',       // Maximum softness
    full: '9999px',   // Perfect circles
  },
  
  border: {
    none: '0px',
    thin: '1px',
    base: '2px',
    thick: '3px',
  },
  
  shadow: {
    none: 'none',
    sm: '0 1px 2px rgba(255, 128, 128, 0.08), 0 1px 4px rgba(255, 128, 128, 0.04)', // Soft coral pink shadows
    md: '0 4px 6px rgba(255, 128, 128, 0.1), 0 2px 4px rgba(255, 128, 128, 0.06)',
    lg: '0 10px 15px rgba(255, 128, 128, 0.1), 0 4px 6px rgba(255, 128, 128, 0.05)',
    xl: '0 20px 25px rgba(255, 128, 128, 0.1), 0 10px 10px rgba(255, 128, 128, 0.04)',
    inner: 'inset 0 2px 4px rgba(255, 128, 128, 0.06)',
  },
});