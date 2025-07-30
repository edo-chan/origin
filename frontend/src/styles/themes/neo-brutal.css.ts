import { createTheme } from '@vanilla-extract/css';
import { tokens } from '../tokens.css';

export const neoBrutalTheme = createTheme(tokens, {
  sizing: tokens.sizing,
  padding: tokens.padding,
  radius: {
    none: '0px',
    sm: '0px',
    md: '0px', 
    lg: '0px',
    full: '0px',
  },
  shadow: {
    sm: '3px 3px 0px rgb(0 0 0 / 1)',
    md: '6px 6px 0px rgb(0 0 0 / 1)',
    lg: '12px 12px 0px rgb(0 0 0 / 1)',
  },
  font: {
    body: '"Space Mono", "Courier New", monospace',
    heading: '"Space Mono", "Courier New", monospace',
    mono: '"Space Mono", "Courier New", monospace',
    scale: tokens.font.scale,
  },
  
  color: {
    // Neo-brutal high contrast colors
    primary: {
      '50': '#ffffff',
      '100': '#fefefe',
      '200': '#fdfdfd',
      '300': '#fcfcfc',
      '400': '#fafafa',
      '500': '#000000',
      '600': '#000000',
      '700': '#000000',
      '800': '#000000',
      '900': '#000000',
    },
    
    // Brutalist bright yellow
    secondary: {
      '50': '#fffef0',
      '100': '#fffccc',
      '200': '#fff999',
      '300': '#fff666',
      '400': '#fff333',
      '500': '#ffff00',
      '600': '#cccc00',
      '700': '#999900',
      '800': '#666600',
      '900': '#333300',
    },
    
    // Brutalist hot pink
    tertiary: {
      '50': '#fff0f8',
      '100': '#ffccee',
      '200': '#ff99dd',
      '300': '#ff66cc',
      '400': '#ff33bb',
      '500': '#ff00aa',
      '600': '#cc0088',
      '700': '#990066',
      '800': '#660044',
      '900': '#330022',
    },
    
    neutral: {
      '50': '#ffffff',
      '100': '#f0f0f0',
      '200': '#e0e0e0',
      '300': '#c0c0c0',
      '400': '#a0a0a0',
      '500': '#808080',
      '600': '#606060',
      '700': '#404040',
      '800': '#202020',
      '900': '#000000',
    },
    
    success: {
      '50': '#f0fff0',
      '100': '#ccffcc',
      '200': '#99ff99',
      '300': '#66ff66',
      '400': '#33ff33',
      '500': '#00ff00',
      '600': '#00cc00',
      '700': '#009900',
      '800': '#006600',
      '900': '#003300',
    },
    
    warning: {
      '50': '#fff8f0',
      '100': '#ffeacc',
      '200': '#ffd599',
      '300': '#ffbf66',
      '400': '#ffaa33',
      '500': '#ff9500',
      '600': '#cc7700',
      '700': '#995900',
      '800': '#663c00',
      '900': '#331e00',
    },
    
    danger: {
      '50': '#fff0f0',
      '100': '#ffcccc',
      '200': '#ff9999',
      '300': '#ff6666',
      '400': '#ff3333',
      '500': '#ff0000',
      '600': '#cc0000',
      '700': '#990000',
      '800': '#660000',
      '900': '#330000',
    },
  },
});