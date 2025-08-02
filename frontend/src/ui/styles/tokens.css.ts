import { createGlobalTheme, createTheme } from '@vanilla-extract/css';

// Root theme tokens
export const tokens = createGlobalTheme(':root', {
  sizing: {
    // Standard sizes
    xs: '4px',
    sm: '8px',  
    md: '16px',
    lg: '24px',
    xl: '32px',
    
    // T-shirt sizes (4px → 64px on 8pt scale)
    tshirtXXS: '4px',   // 4px
    tshirtXS: '8px',    // 8px
    tshirtS: '16px',    // 16px
    tshirtM: '24px',    // 24px
    tshirtL: '32px',    // 32px
    tshirtXL: '48px',   // 48px
    tshirtXXL: '64px',  // 64px
  },
  
  padding: {
    // Standard padding (same as sizing)
    xs: '4px',
    sm: '8px',  
    md: '16px',
    lg: '24px',
    xl: '32px',
    
    // T-shirt padding (same as sizing)
    tshirtXXS: '4px',
    tshirtXS: '8px',
    tshirtS: '16px',
    tshirtM: '24px',
    tshirtL: '32px',
    tshirtXL: '48px',
    tshirtXXL: '64px',
  },
  
  color: {
    // Primary palette - Studio Ghibli sky blues
    primary: {
      '50': '#f0f9ff',
      '100': '#e0f2fe', 
      '200': '#bae6fd',
      '300': '#7dd3fc',
      '400': '#38bdf8',
      '500': '#0ea5e9',  // Sky blue like Castle in the Sky
      '600': '#0284c7',
      '700': '#0369a1',
      '800': '#075985',
      '900': '#0c4a6e',
    },
    
    // Secondary palette - Studio Ghibli warm golden yellows
    secondary: {
      '50': '#fefce8',
      '100': '#fef9c3',
      '200': '#fef08a', 
      '300': '#fde047',
      '400': '#facc15',
      '500': '#eab308',  // Warm golden yellow like Totoro's belly
      '600': '#ca8a04',
      '700': '#a16207',
      '800': '#854d0e',
      '900': '#713f12',
    },
    
    // Tertiary palette - Studio Ghibli forest greens
    tertiary: {
      '50': '#f0fdf4',
      '100': '#dcfce7',
      '200': '#bbf7d0',
      '300': '#86efac',
      '400': '#4ade80',
      '500': '#22c55e',  // Forest green like Totoro and nature
      '600': '#16a34a',
      '700': '#15803d',
      '800': '#166534',
      '900': '#14532d',
    },
    
    // Neutral palette - Studio Ghibli warm earth tones
    neutral: {
      '50': '#faf5f0',
      '100': '#f5ebe0',
      '200': '#e7d2c1',
      '300': '#d1b5a1',
      '400': '#b89882',
      '500': '#a08066',  // Warm earth tones like Ghibli backgrounds
      '600': '#8b6f56',
      '700': '#725c47',
      '800': '#5a4938',
      '900': '#45382c',
    },
    
    // Semantic colors
    success: {
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
  
  radius: {
    none: '0px',
    sm: '4px',
    md: '8px', 
    lg: '12px',
    full: '9999px',
  },
  
  shadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  },
  
  font: {
    body: '"Inter", "Nunito", "Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    heading: '"Fredoka One", "Comfortaa", "Nunito", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    mono: '"JetBrains Mono", "Fira Code", "SF Mono", "Monaco", monospace',
    
    // Font scale (12–48px, 1.25 ratio)
    scale: {
      xs: '12px',      // 12px
      sm: '14px',      // 14px  
      base: '16px',    // 16px
      lg: '20px',      // 20px (16 * 1.25)
      xl: '24px',      // 24px (20 * 1.2) 
      '2xl': '30px',   // 30px (24 * 1.25)
      '3xl': '36px',   // 36px (30 * 1.2)
      '4xl': '48px',   // 48px (36 * 1.33)
    },
  },
});

// Dark theme variant
export const darkTheme = createTheme(tokens, {
  sizing: tokens.sizing, // Same sizing
  padding: tokens.padding, // Same padding
  radius: tokens.radius, // Same radius
  shadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3)',
  },
  font: tokens.font, // Same fonts
  
  // Dark mode with Studio Ghibli colors
  color: {
    primary: tokens.color.primary, // Keep Ghibli sky blues
    secondary: tokens.color.secondary, // Keep Ghibli golden yellows  
    tertiary: tokens.color.tertiary, // Keep Ghibli forest greens
    
    // Invert neutral scale for dark mode
    neutral: {
      '50': tokens.color.neutral['900'],
      '100': tokens.color.neutral['800'],
      '200': tokens.color.neutral['700'],
      '300': tokens.color.neutral['600'],
      '400': tokens.color.neutral['500'],
      '500': tokens.color.neutral['400'],
      '600': tokens.color.neutral['300'],
      '700': tokens.color.neutral['200'],
      '800': tokens.color.neutral['100'],
      '900': tokens.color.neutral['50'],
    },
    
    success: tokens.color.success,
    warning: tokens.color.warning,
    danger: tokens.color.danger,
  },
});

// Export theme class names for easy switching
export const themes = {
  light: 'light-theme',
  dark: darkTheme,
} as const;

// Type exports for TypeScript
export type ThemeTokens = typeof tokens;
export type ThemeNames = keyof typeof themes;