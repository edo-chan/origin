import { createTheme } from '@vanilla-extract/css';
import { tokens } from '../tokens.css';

export const sunsetTheme = createTheme(tokens, {
  sizing: tokens.sizing,
  radius: tokens.radius,
  shadow: tokens.shadow,
  font: tokens.font,
  
  color: {
    // Warm orange primary
    primary: {
      '50': '#fff7ed',
      '100': '#ffedd5',
      '200': '#fed7aa',
      '300': '#fdba74',
      '400': '#fb923c',
      '500': '#f97316',
      '600': '#ea580c',
      '700': '#c2410c',
      '800': '#9a3412',
      '900': '#7c2d12',
    },
    
    // Deep red secondary
    secondary: {
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
    
    // Golden yellow tertiary
    tertiary: {
      '50': '#fefce8',
      '100': '#fef9c3',
      '200': '#fef08a',
      '300': '#fde047',
      '400': '#facc15',
      '500': '#eab308',
      '600': '#ca8a04',
      '700': '#a16207',
      '800': '#854d0e',
      '900': '#713f12',
    },
    
    neutral: tokens.color.neutral,
    success: tokens.color.success,
    warning: tokens.color.warning,
    danger: tokens.color.danger,
  },
});