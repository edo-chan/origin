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
    // Primary palette (blue-ish)
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
    
    // Secondary palette (purple-ish)
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
    
    // Tertiary palette (emerald-ish)
    tertiary: {
      '50': '#ecfdf5',
      '100': '#d1fae5',
      '200': '#a7f3d0',
      '300': '#6ee7b7',
      '400': '#34d399',
      '500': '#10b981',
      '600': '#059669',
      '700': '#047857',
      '800': '#065f46',
      '900': '#064e3b',
    },
    
    // Neutral palette (gray)
    neutral: {
      '50': '#f9fafb',
      '100': '#f3f4f6',
      '200': '#e5e7eb',
      '300': '#d1d5db',
      '400': '#9ca3af',
      '500': '#6b7280',
      '600': '#4b5563',
      '700': '#374151',
      '800': '#1f2937',
      '900': '#111827',
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
    body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    heading: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", "Source Code Pro", monospace',
    
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
  
  // Inverted color semantics for dark mode
  color: {
    primary: tokens.color.primary, // Keep primary as-is
    secondary: tokens.color.secondary, // Keep secondary as-is  
    tertiary: tokens.color.tertiary, // Keep tertiary as-is
    
    // Invert neutral scale
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