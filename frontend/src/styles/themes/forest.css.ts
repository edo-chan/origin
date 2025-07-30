import { createTheme } from '@vanilla-extract/css';
import { tokens } from '../tokens.css';

export const forestTheme = createTheme(tokens, {
  sizing: tokens.sizing,
  radius: tokens.radius,
  shadow: tokens.shadow,
  font: tokens.font,
  
  color: {
    // Deep forest green primary
    primary: {
      '50': '#f0fdf4',
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
    
    // Earth brown secondary
    secondary: {
      '50': '#fefaf5',
      '100': '#fdf4e6',
      '200': '#fbe6c0',
      '300': '#f7d494',
      '400': '#f1bc66',
      '500': '#eca643',
      '600': '#dd8f37',
      '700': '#b8722f',
      '800': '#935b2d',
      '900': '#784b28',
    },
    
    // Moss green tertiary  
    tertiary: {
      '50': '#f7fee7',
      '100': '#ecfccb',
      '200': '#d9f99d',
      '300': '#bef264',
      '400': '#a3e635',
      '500': '#84cc16',
      '600': '#65a30d',
      '700': '#4d7c0f',
      '800': '#3f6212',
      '900': '#365314',
    },
    
    neutral: tokens.color.neutral,
    success: tokens.color.success,
    warning: tokens.color.warning,
    danger: tokens.color.danger,
  },
});