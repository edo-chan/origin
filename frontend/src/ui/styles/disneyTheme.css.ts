import { createGlobalTheme } from '@vanilla-extract/css';
import { themeContract } from './theme.css';

// Disney Theme - Inspired by magical kingdoms, fairy tales, and whimsical adventures
export const disneyTheme = createGlobalTheme('[data-theme="disney"]', themeContract, {
  color: {
    // Primary: Royal blue like Disney castle and magic
    primary: '#4a90e2',
    primaryHover: '#6ba3e8',
    primaryActive: '#357abd',
    
    // Secondary: Warm gold like Disney magic and fairy dust
    secondary: '#f5a623',
    secondaryHover: '#f7b84a',
    secondaryActive: '#e8941c',
    
    // Tertiary: Enchanted purple like fairy tale magic
    tertiary: '#9b59b6',
    tertiaryHover: '#b370c7',
    tertiaryActive: '#8e44ad',
    
    // Magical backgrounds
    background: '#fefefe',        // Pure white like fairy tale pages
    surface: '#f8f6ff',           // Soft lavender tint
    
    // Friendly, readable text
    text: '#1a202c',              // Darker blue-gray for better readability
    textSecondary: '#4a5568',     // Medium blue-gray with more contrast
    
    // Magical borders
    border: '#bdc3c7',            // Soft silver
    borderLight: '#d5dbdb',       // Light silver
    
    // Error colors
    error: '#dc2626',             // Standard red for errors
    errorHover: '#b91c1c',        // Darker red on hover
    errorActive: '#991b1b',       // Even darker red when active
  },
  
  font: {
    // Whimsical, friendly fonts
    family: '"Comic Neue", "Quicksand", "Nunito", "Comfortaa", cursive, sans-serif',
    headingFamily: '"Fredoka One", "Comic Neue", "Quicksand", cursive, sans-serif',
    monoFamily: '"Fira Code", "Consolas", monospace',
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
    sm: '8px',        // Friendly curves
    md: '16px',       // Very rounded like Disney style
    lg: '24px',       // Extra rounded for whimsy
    xl: '32px',       // Maximum Disney magic
    full: '9999px',   // Perfect circles
  },
  
  border: {
    none: '0px',
    thin: '1px',
    base: '2px',
    thick: '4px',     // Slightly thicker for that storybook feel
  },
  
  shadow: {
    none: 'none',
    sm: '0 1px 2px rgba(74, 144, 226, 0.08), 0 1px 4px rgba(74, 144, 226, 0.04)', // Magical blue shadows
    md: '0 4px 6px rgba(74, 144, 226, 0.1), 0 2px 4px rgba(74, 144, 226, 0.06)',
    lg: '0 10px 15px rgba(74, 144, 226, 0.1), 0 4px 6px rgba(74, 144, 226, 0.05)',
    xl: '0 20px 25px rgba(74, 144, 226, 0.1), 0 10px 10px rgba(74, 144, 226, 0.04)',
    inner: 'inset 0 2px 4px rgba(74, 144, 226, 0.06)',
  },
});