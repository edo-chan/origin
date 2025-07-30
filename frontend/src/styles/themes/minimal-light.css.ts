import { createTheme } from '@vanilla-extract/css';
import { tokens } from '../tokens.css';

export const minimalLightTheme = createTheme(tokens, {
  sizing: tokens.sizing,
  padding: tokens.padding,
  radius: {
    none: '0px',
    sm: '2px',
    md: '4px', 
    lg: '6px',
    full: '9999px',
  },
  shadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.03)',
    md: '0 2px 4px -1px rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
    lg: '0 4px 8px -2px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.08)',
  },
  font: tokens.font,
  
  color: {
    // Minimal monochrome primary
    primary: {
      '50': '#fafafa',
      '100': '#f5f5f5',
      '200': '#eeeeee',
      '300': '#e0e0e0',
      '400': '#bdbdbd',
      '500': '#9e9e9e',
      '600': '#757575',
      '700': '#616161',
      '800': '#424242',
      '900': '#212121',
    },
    
    // Subtle blue secondary
    secondary: {
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
    
    // Minimal green tertiary
    tertiary: {
      '50': '#f7f7f7',
      '100': '#ededed',
      '200': '#dfdfdf',
      '300': '#c4c4c4',
      '400': '#a0a0a0',
      '500': '#717171',
      '600': '#525252',
      '700': '#404040',
      '800': '#262626',
      '900': '#171717',
    },
    
    neutral: tokens.color.neutral,
    success: tokens.color.success,
    warning: tokens.color.warning,
    danger: tokens.color.danger,
  },
});