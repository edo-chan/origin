import { createTheme } from '@vanilla-extract/css';
import { tokens } from '../tokens.css';

export const lavenderTheme = createTheme(tokens, {
  sizing: tokens.sizing,
  radius: tokens.radius,
  shadow: tokens.shadow,  
  font: tokens.font,
  
  color: {
    // Soft lavender primary
    primary: {
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
    
    // Soft pink secondary
    secondary: {
      '50': '#fdf2f8',
      '100': '#fce7f3',
      '200': '#fbcfe8',
      '300': '#f9a8d4',
      '400': '#f472b6',
      '500': '#ec4899',
      '600': '#db2777',
      '700': '#be185d',
      '800': '#9d174d',
      '900': '#831843',
    },
    
    // Periwinkle tertiary
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
    
    neutral: tokens.color.neutral,
    success: tokens.color.success,
    warning: tokens.color.warning,
    danger: tokens.color.danger,
  },
});