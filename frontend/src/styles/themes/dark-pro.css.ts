import { createTheme } from '@vanilla-extract/css';
import { tokens } from '../tokens.css';

export const darkProTheme = createTheme(tokens, {
  sizing: tokens.sizing,
  padding: tokens.padding,
  radius: {
    none: '0px',
    sm: '4px',
    md: '8px', 
    lg: '12px',
    full: '9999px',
  },
  shadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.8)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.6), 0 2px 4px -2px rgb(0 0 0 / 0.6)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.4)',
  },
  font: {
    body: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    heading: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: '"SF Mono", "Monaco", "Inconsolata", monospace',
    scale: tokens.font.scale,
  },
  
  color: {
    // Dark pro blue
    primary: {
      '50': '#0a0e1a',
      '100': '#151b2e',
      '200': '#1e2a47',
      '300': '#2a3b61',
      '400': '#375080',
      '500': '#4a68a3',
      '600': '#5f82c7',
      '700': '#7aa0eb',
      '800': '#9bc2ff',
      '900': '#c0dcff',
    },
    
    // Dark pro purple
    secondary: {
      '50': '#1a0a1a',
      '100': '#2e152e',
      '200': '#471e47',
      '300': '#612a61',
      '400': '#803780',
      '500': '#a34aa3',
      '600': '#c75fc7',
      '700': '#eb7aeb',
      '800': '#ff9bff',
      '900': '#ffbcff',
    },
    
    // Dark pro emerald
    tertiary: {
      '50': '#0a1a0f',
      '100': '#152e1d',
      '200': '#1e472b',
      '300': '#2a613a',
      '400': '#37804a',
      '500': '#4aa35d',
      '600': '#5fc773',
      '700': '#7aeb8c',
      '800': '#9bffaa',
      '900': '#bcffc8',
    },
    
    // Dark neutral (inverted)
    neutral: {
      '50': '#111827',
      '100': '#1f2937',
      '200': '#374151',
      '300': '#4b5563',
      '400': '#6b7280',
      '500': '#9ca3af',
      '600': '#d1d5db',
      '700': '#e5e7eb',
      '800': '#f3f4f6',
      '900': '#f9fafb',
    },
    
    success: {
      '50': '#0a1a0f',
      '100': '#152e1d',
      '200': '#1e472b',
      '300': '#2a613a',
      '400': '#37804a',
      '500': '#4aa35d',
      '600': '#5fc773',
      '700': '#7aeb8c',
      '800': '#9bffaa',
      '900': '#bcffc8',
    },
    
    warning: {
      '50': '#1a1a0a',
      '100': '#2e2e15',
      '200': '#47471e',
      '300': '#61612a',
      '400': '#808037',
      '500': '#a3a34a',
      '600': '#c7c75f',
      '700': '#ebeb7a',
      '800': '#ffff9b',
      '900': '#ffffbc',
    },
    
    danger: {
      '50': '#1a0a0a',
      '100': '#2e1515',
      '200': '#471e1e',
      '300': '#612a2a',
      '400': '#803737',
      '500': '#a34a4a',
      '600': '#c75f5f',
      '700': '#eb7a7a',
      '800': '#ff9b9b',
      '900': '#ffbcbc',
    },
  },
});