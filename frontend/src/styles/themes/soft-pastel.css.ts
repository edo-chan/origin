import { createTheme } from '@vanilla-extract/css';
import { tokens } from '../tokens.css';

export const softPastelTheme = createTheme(tokens, {
  sizing: tokens.sizing,
  padding: tokens.padding,
  radius: {
    none: '0px',
    sm: '6px',
    md: '12px', 
    lg: '18px',
    full: '9999px',
  },
  shadow: {
    sm: '0 2px 8px 0 rgb(255 182 193 / 0.15)',
    md: '0 8px 32px -4px rgb(255 182 193 / 0.2), 0 4px 16px -4px rgb(221 160 221 / 0.15)',
    lg: '0 16px 64px -8px rgb(255 182 193 / 0.25), 0 8px 32px -8px rgb(221 160 221 / 0.2)',
  },
  font: {
    body: '"Nunito", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    heading: '"Nunito", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    mono: '"Fira Code", "SF Mono", monospace',
    scale: tokens.font.scale,
  },
  
  color: {
    // Soft pink primary
    primary: {
      '50': '#fef7f7',
      '100': '#feeaeb',
      '200': '#fdd8db',
      '300': '#fbb6c0',
      '400': '#f78a9b',
      '500': '#ef4f70',
      '600': '#dc2f55',
      '700': '#b91c47',
      '800': '#9b1c42',
      '900': '#84203f',
    },
    
    // Soft lavender secondary
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
    
    // Soft mint tertiary
    tertiary: {
      '50': '#f0fdf9',
      '100': '#dcfce7',
      '200': '#bbf7d0',
      '300': '#86efac',
      '400': '#4ade80',
      '500': '#22c55e',
      '600': '#16a34a',
      '700': '#15803d',
      '800': '#166534',
      '900': '#14532d',
    },
    
    // Soft neutral
    neutral: {
      '50': '#fdfcfc',
      '100': '#f9f7f7',
      '200': '#f2efef',
      '300': '#e8e3e3',
      '400': '#d4cbcb',
      '500': '#b8a8a8',
      '600': '#9c8888',
      '700': '#7d6a6a',
      '800': '#5f4e4e',
      '900': '#3d3232',
    },
    
    success: {
      '50': '#f0fdf9',
      '100': '#dcfce7',
      '200': '#bbf7d0',
      '300': '#86efac',
      '400': '#4ade80',
      '500': '#22c55e',
      '600': '#16a34a',
      '700': '#15803d',
      '800': '#166534',
      '900': '#14532d',
    },
    
    warning: {
      '50': '#fffbeb',
      '100': '#fef3c7',
      '200': '#fde68a',
      '300': '#fcd34d',
      '400': '#fbbf24',
      '500': '#f59e0b',
      '600': '#d97706',
      '700': '#b45309',
      '800': '#92400e',
      '900': '#78350f',
    },
    
    danger: {
      '50': '#fef2f2',
      '100': '#fee2e2',
      '200': '#fecaca',
      '300': '#fca5a5',
      '400': '#f87171',
      '500': '#ef4444',
      '600': '#dc2626',
      '700': '#b91c1c',
      '800': '#991b1b',
      '900': '#7f1d1d',
    },
  },
});