import { createGlobalTheme } from '@vanilla-extract/css';
import { themeContract } from './theme.css';

// Neo-Brutal Theme - Inspired by brutalist architecture and bold, uncompromising design
export const neoBrutalTheme = createGlobalTheme('[data-theme="neobrutal"]', themeContract, {
  color: {
    // Primary: Bold electric blue like raw concrete under neon
    primary: '#0066ff',
    primaryHover: '#0052cc',
    primaryActive: '#004499',
    
    // Secondary: Warning orange like construction zones
    secondary: '#ff6600',
    secondaryHover: '#e55a00',
    secondaryActive: '#cc4f00',
    
    // Tertiary: Aggressive red like danger signals
    tertiary: '#ff0033',
    tertiaryHover: '#e60029',
    tertiaryActive: '#cc0024',
    
    // Stark, uncompromising backgrounds
    background: '#ffffff',        // Pure white like concrete
    surface: '#f5f5f5',           // Light gray like concrete texture
    
    // High contrast text
    text: '#000000',              // Pure black for maximum impact
    textSecondary: '#333333',     // Dark gray
    
    // Bold, harsh borders
    border: '#000000',            // Pure black borders
    borderLight: '#666666',       // Medium gray
    
    // Error colors - harsh and direct
    error: '#ff0033',             // Aggressive red
    errorHover: '#e60029',        // Slightly darker red
    errorActive: '#cc0024',       // Dark aggressive red
  },
  
  font: {
    // Bold, industrial fonts
    family: '"Space Grotesk", "Inter", "Helvetica Neue", "Arial Black", sans-serif',
    headingFamily: '"Space Grotesk", "Bebas Neue", "Impact", "Arial Black", sans-serif',
    monoFamily: '"Space Mono", "Fira Code", "Consolas", monospace',
    size: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '20px',
      xl: '24px',
      '2xl': '30px',
    },
    weight: {
      normal: '500',      // Heavier than usual
      medium: '600',
      semibold: '700',
      bold: '900',        // Extra bold for brutalist impact
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
    none: '0px',        // No curves - pure brutalism
    sm: '0px',          // Sharp edges only
    md: '0px',          // Uncompromising geometry
    lg: '0px',          // Raw, industrial feel
    xl: '0px',          // Maximum brutality
    full: '0px',        // Even "full" is square
  },
  
  border: {
    none: '0px',
    thin: '2px',        // Thicker than usual
    base: '4px',        // Bold statements
    thick: '8px',       // Maximum impact
  },
  
  shadow: {
    none: 'none',
    sm: '2px 2px 0px rgba(0, 0, 0, 0.8)', // Harsh, offset shadows
    md: '4px 4px 0px rgba(0, 0, 0, 0.8)', // Bold geometric shadows
    lg: '6px 6px 0px rgba(0, 0, 0, 0.8)', // Maximum brutalist impact
    xl: '8px 8px 0px rgba(0, 0, 0, 0.8)', // Uncompromising shadow
    inner: 'inset 2px 2px 0px rgba(0, 0, 0, 0.8)', // Inner brutalism
  },
});