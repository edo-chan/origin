import { createGlobalTheme } from '@vanilla-extract/css';
import { themeContract } from './theme.css';

// Slate Monochrome Theme - Professional grayscale palette
export const slateMonochromeTheme = createGlobalTheme('[data-theme="slate-monochrome"]', themeContract, {
  color: {
    // Primary: Cool slate blue-gray
    primary: '#475569',
    primaryHover: '#334155',
    primaryActive: '#1e293b',
    
    // Secondary: Medium gray with slight warmth
    secondary: '#64748b',
    secondaryHover: '#475569',
    secondaryActive: '#334155',
    
    // Tertiary: Light slate for accents
    tertiary: '#94a3b8',
    tertiaryHover: '#64748b',
    tertiaryActive: '#475569',
    
    // Background colors - clean whites and light grays
    background: '#ffffff',
    surface: '#f8fafc',
    
    // Text colors - professional dark grays
    text: '#0f172a',
    textSecondary: '#334155',
    
    // Border colors - subtle grays
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    
    // Error colors
    error: '#dc2626',       // Red for errors
    errorHover: '#b91c1c',  // Darker red on hover
    errorActive: '#991b1b', // Even darker red when active
  },
  
  font: {
    family: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
    headingFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
    monoFamily: '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", "Courier New", monospace',
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
    sm: '2px',
    md: '4px',
    lg: '6px',
    xl: '8px',
    full: '9999px',
  },
  
  border: {
    none: '0px',
    thin: '1px',
    base: '1px',
    thick: '2px',
  },
  
  shadow: {
    none: 'none',
    sm: '0 1px 2px rgba(15, 23, 42, 0.08), 0 1px 4px rgba(15, 23, 42, 0.04)', // Cool gray shadows
    md: '0 4px 6px rgba(15, 23, 42, 0.1), 0 2px 4px rgba(15, 23, 42, 0.06)',
    lg: '0 10px 15px rgba(15, 23, 42, 0.1), 0 4px 6px rgba(15, 23, 42, 0.05)',
    xl: '0 20px 25px rgba(15, 23, 42, 0.1), 0 10px 10px rgba(15, 23, 42, 0.04)',
    inner: 'inset 0 2px 4px rgba(15, 23, 42, 0.06)',
  },
});