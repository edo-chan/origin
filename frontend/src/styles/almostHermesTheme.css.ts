import { createGlobalTheme } from '@vanilla-extract/css';
import { themeContract } from './theme.css';

// Almost-Hermes Theme - Inspired by luxury fashion, high-end design, and sophisticated elegance
export const almostHermesTheme = createGlobalTheme('[data-theme="almosthermes"]', themeContract, {
  color: {
    // Primary: Rich burgundy like luxury leather goods
    primary: '#8b1538',
    primaryHover: '#a0174a',
    primaryActive: '#701229',
    
    // Secondary: Warm cognac like fine leather and luxury accessories
    secondary: '#d2691e',
    secondaryHover: '#daa520',
    secondaryActive: '#b8860b',
    
    // Tertiary: Deep forest green like high-end branding
    tertiary: '#2d5016',
    tertiaryHover: '#365f1d',
    tertiaryActive: '#1e3a0f',
    
    // Luxurious backgrounds
    background: '#fffef9',        // Warm ivory like premium paper
    surface: '#faf8f3',           // Subtle cream tone
    
    // Sophisticated text
    text: '#1a1a1a',              // Rich black
    textSecondary: '#4a4a4a',     // Charcoal gray
    
    // Elegant borders
    border: '#d4af37',            // Subtle gold accent
    borderLight: '#f5f5dc',       // Warm beige
    
    // Error colors
    error: '#8b1538',             // Burgundy error to match theme
    errorHover: '#a0174a',        // Slightly lighter burgundy
    errorActive: '#701229',       // Darker burgundy when active
  },
  
  font: {
    // Luxury fashion fonts with high-end feel
    family: '"Playfair Display", "Cormorant Garamond", "Crimson Text", "Times New Roman", serif',
    headingFamily: '"Playfair Display", "Cormorant Garamond", "Didot", serif',
    monoFamily: '"JetBrains Mono", "Monaco", "Consolas", monospace',
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
    sm: '2px',        // Minimal rounding for sophisticated look
    md: '4px',        // Subtle curves like luxury packaging
    lg: '6px',        // Refined elegance
    xl: '8px',        // Maximum luxury refinement
    full: '9999px',   // Perfect circles when needed
  },
  
  border: {
    none: '0px',
    thin: '1px',
    base: '1px',      // Elegant, thin borders
    thick: '2px',     // Refined thickness
  },
  
  shadow: {
    none: 'none',
    sm: '0 1px 2px rgba(139, 21, 56, 0.08), 0 1px 4px rgba(139, 21, 56, 0.04)', // Luxury burgundy shadows
    md: '0 4px 6px rgba(139, 21, 56, 0.1), 0 2px 4px rgba(139, 21, 56, 0.06)',
    lg: '0 10px 15px rgba(139, 21, 56, 0.1), 0 4px 6px rgba(139, 21, 56, 0.05)',
    xl: '0 20px 25px rgba(139, 21, 56, 0.1), 0 10px 10px rgba(139, 21, 56, 0.04)',
    inner: 'inset 0 2px 4px rgba(139, 21, 56, 0.06)',
  },
});