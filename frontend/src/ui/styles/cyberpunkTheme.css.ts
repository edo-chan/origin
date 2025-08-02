import { createGlobalTheme } from '@vanilla-extract/css';
import { themeContract } from './theme.css';

// Cyberpunk Theme - Inspired by neon-lit cityscapes and futuristic interfaces
export const cyberpunkTheme = createGlobalTheme('[data-theme="cyberpunk"]', themeContract, {
  color: {
    // Primary: Bright neon cyan like digital displays
    primary: '#00d4ff',
    primaryHover: '#1ae0ff',
    primaryActive: '#0099cc',
    
    // Secondary: Vibrant neon pink like synthwave
    secondary: '#ff0099',
    secondaryHover: '#ff1aad',
    secondaryActive: '#cc0077',
    
    // Tertiary: Electric neon green like matrix code
    tertiary: '#00ff88',
    tertiaryHover: '#1aff99',
    tertiaryActive: '#00cc6a',
    
    // Dark backgrounds for neon contrast
    background: '#0a0a0f',        // Very dark for neon pop
    surface: '#141419',           // Slightly lighter surface
    
    // Bright text for neon aesthetic
    text: '#ffffff',              // Crisp white for contrast
    textSecondary: '#b3ccff',     // Light blue tint
    
    // Glowing borders
    border: '#4d4d80',            // Medium purple-blue
    borderLight: '#6666a0',       // Lighter purple-blue with glow
    
    // Error colors - neon red
    error: '#ff3366',             // Neon red for errors
    errorHover: '#ff0055',        // Brighter neon red on hover
    errorActive: '#cc0044',       // Darker neon red when active
  },
  
  font: {
    // Futuristic, tech-inspired fonts
    family: '"Orbitron", "Exo 2", "Rajdhani", "Share Tech Mono", monospace',
    headingFamily: '"Orbitron", "Exo 2", "Audiowide", "Share Tech Mono", monospace',
    monoFamily: '"Share Tech Mono", "Orbitron", "Fira Code", "JetBrains Mono", monospace',
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
    sm: '2px',        // Sharper, more angular
    md: '4px',        // Less rounded than organic themes
    lg: '6px',        // Subtle rounding
    xl: '8px',        // Maximum rounding for cyberpunk
    full: '9999px',   // Keep full for special cases
  },
  
  border: {
    none: '0px',
    thin: '1px',
    base: '2px',
    thick: '3px',     // Slightly thicker for that tech feel
  },
  
  shadow: {
    none: 'none',
    sm: '0 1px 2px rgba(0, 212, 255, 0.15), 0 1px 4px rgba(255, 0, 153, 0.1)', // Neon glow shadows
    md: '0 4px 6px rgba(0, 212, 255, 0.2), 0 2px 4px rgba(255, 0, 153, 0.15)',
    lg: '0 10px 15px rgba(0, 212, 255, 0.25), 0 4px 6px rgba(255, 0, 153, 0.2)',
    xl: '0 20px 25px rgba(0, 212, 255, 0.3), 0 10px 10px rgba(255, 0, 153, 0.25)',
    inner: 'inset 0 2px 4px rgba(0, 212, 255, 0.2)',
  },
});