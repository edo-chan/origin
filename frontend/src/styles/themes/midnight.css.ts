import { createTheme } from '@vanilla-extract/css';
import { tokens } from '../tokens.css';

export const midnightTheme = createTheme(tokens, {
  sizing: tokens.sizing,
  radius: tokens.radius,
  shadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.4)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.4)',
  },
  font: tokens.font,
  
  color: {
    // Electric blue primary
    primary: {
      '50': '#eff6ff',
      '100': '#dbeafe',
      '200': '#bfdbfe',
      '300': '#93c5fd',
      '400': '#60a5fa',
      '500': '#3b82f6',
      '600': '#2563eb',
      '700': '#1d4ed8',
      '800': '#1e40af',
      '900': '#1e3a8a',
    },
    
    // Cyan secondary
    secondary: {
      '50': '#ecfeff',
      '100': '#cffafe',
      '200': '#a5f3fc',
      '300': '#67e8f9',
      '400': '#22d3ee',
      '500': '#06b6d4',
      '600': '#0891b2',
      '700': '#0e7490',
      '800': '#155e75',
      '900': '#164e63',
    },
    
    // Dark slate tertiary
    tertiary: {
      '50': '#f8fafc',
      '100': '#f1f5f9',
      '200': '#e2e8f0',
      '300': '#cbd5e1',
      '400': '#94a3b8',
      '500': '#64748b',
      '600': '#475569',
      '700': '#334155',
      '800': '#1e293b',
      '900': '#0f172a',
    },
    
    // Dark neutral (inverted for dark theme effect)
    neutral: {
      '50': '#0f172a',
      '100': '#1e293b',
      '200': '#334155',
      '300': '#475569',
      '400': '#64748b',
      '500': '#94a3b8',
      '600': '#cbd5e1',
      '700': '#e2e8f0',
      '800': '#f1f5f9',
      '900': '#f8fafc',
    },
    
    success: tokens.color.success,
    warning: tokens.color.warning,
    danger: tokens.color.danger,
  },
});