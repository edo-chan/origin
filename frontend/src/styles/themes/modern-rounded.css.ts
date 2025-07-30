import { createTheme } from '@vanilla-extract/css';
import { tokens } from '../tokens.css';

export const modernRoundedTheme = createTheme(tokens, {
  sizing: tokens.sizing,
  padding: tokens.padding,
  radius: {
    none: '0px',
    sm: '8px',
    md: '16px', 
    lg: '24px',
    full: '9999px',
  },
  shadow: {
    sm: '0 2px 8px 0 rgb(0 0 0 / 0.12)',
    md: '0 8px 24px -4px rgb(0 0 0 / 0.15), 0 4px 12px -4px rgb(0 0 0 / 0.15)',
    lg: '0 16px 48px -8px rgb(0 0 0 / 0.18), 0 8px 24px -8px rgb(0 0 0 / 0.18)',
  },
  font: {
    body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    heading: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: '"JetBrains Mono", "SF Mono", "Monaco", monospace',
    scale: tokens.font.scale,
  },
  
  color: {
    // Modern vibrant blue
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
    
    // Modern purple
    secondary: {
      '50': '#faf5ff',
      '100': '#f3e8ff',
      '200': '#e9d5ff',
      '300': '#d8b4fe',
      '400': '#c084fc',
      '500': '#a855f7',
      '600': '#9333ea',
      '700': '#7c3aed',
      '800': '#6b21a8',
      '900': '#581c87',
    },
    
    // Modern teal
    tertiary: {
      '50': '#f0fdfa',
      '100': '#ccfbf1',
      '200': '#99f6e4',
      '300': '#5eead4',
      '400': '#2dd4bf',
      '500': '#14b8a6',
      '600': '#0d9488',
      '700': '#0f766e',
      '800': '#115e59',
      '900': '#134e4a',
    },
    
    neutral: tokens.color.neutral,
    success: tokens.color.success,
    warning: tokens.color.warning,
    danger: tokens.color.danger,
  },
});