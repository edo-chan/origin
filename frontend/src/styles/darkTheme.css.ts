import { createGlobalTheme } from '@vanilla-extract/css';
import { themeContract } from './theme.css';

// Studio Ghibli Dark Theme - Inspired by moonlit forest scenes and night skies
export const darkTheme = createGlobalTheme('[data-theme="dark"]', themeContract, {
  color: {
    // Primary: Soft moonlight blue like night sky in Princess Mononoke
    primary: '#7dd3fc',
    primaryHover: '#38bdf8',
    primaryActive: '#0ea5e9',
    
    // Secondary: Warm firefly yellow like magical lights
    secondary: '#fde047',
    secondaryHover: '#facc15',
    secondaryActive: '#eab308',
    
    // Tertiary: Forest green like mystical woods at night
    tertiary: '#4ade80',
    tertiaryHover: '#22c55e',
    tertiaryActive: '#16a34a',
    
    // Dark, warm backgrounds like cozy Ghibli interiors
    background: '#0f1419',        // Deep warm black
    surface: '#1a1f2e',           // Slightly lighter warm surface
    
    // Light, warm text colors for readability
    text: '#f1f5f9',              // Soft white
    textSecondary: '#cbd5e1',     // Muted light gray
    
    // Subtle borders with warm undertones
    border: '#334155',            // Medium gray with blue undertone
    borderLight: '#475569',       // Lighter border
    
    // Error colors
    error: '#f87171',             // Lighter red for dark theme
    errorHover: '#ef4444',        // Brighter red on hover
    errorActive: '#dc2626',       // Standard red when active
  },
  
  font: {
    // Keep the same Studio Ghibli fonts for consistency
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
    sm: '0 1px 2px rgba(0, 0, 0, 0.3), 0 1px 4px rgba(0, 0, 0, 0.15)', // Deep dark shadows
    md: '0 4px 6px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.25)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.4), 0 4px 6px rgba(0, 0, 0, 0.3)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.5), 0 10px 10px rgba(0, 0, 0, 0.35)',
    inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.25)',
  },
});