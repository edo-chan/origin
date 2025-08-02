import { createGlobalTheme } from '@vanilla-extract/css';
import { themeContract } from './theme.css';

// K-drama Theme - Inspired by romantic Korean dramas, soft aesthetics, and Seoul vibes
export const kdramaTheme = createGlobalTheme('[data-theme="kdrama"]', themeContract, {
  color: {
    // Primary: Soft rose pink like cherry blossoms and romantic scenes
    primary: '#f48fb1',
    primaryHover: '#f8bbd9',
    primaryActive: '#f06292',
    
    // Secondary: Warm peach like sunset over Han River
    secondary: '#ffab91',
    secondaryHover: '#ffccbc',
    secondaryActive: '#ff8a65',
    
    // Tertiary: Soft lavender like Korean cafe aesthetics
    tertiary: '#ce93d8',
    tertiaryHover: '#e1bee7',
    tertiaryActive: '#ba68c8',
    
    // Dreamy, soft backgrounds
    background: '#fefefe',        // Pure white like K-drama lighting
    surface: '#faf8ff',           // Soft lavender tint
    
    // Gentle, readable text
    text: '#424242',              // Soft dark gray
    textSecondary: '#757575',     // Medium gray
    
    // Delicate borders
    border: '#e0e0e0',            // Light gray
    borderLight: '#f5f5f5',       // Very light gray
    
    // Error colors
    error: '#dc2626',             // Standard red for errors
    errorHover: '#b91c1c',        // Darker red on hover
    errorActive: '#991b1b',       // Even darker red when active
  },
  
  font: {
    // Korean-inspired fonts with romantic feel
    family: '"Noto Sans KR", "Malgun Gothic", "Apple SD Gothic Neo", "Nanum Gothic", "Pretendard", sans-serif',
    headingFamily: '"Noto Serif KR", "Nanum Myeongjo", "Noto Sans KR", serif',
    monoFamily: '"D2Coding", "Nanum Gothic Coding", "Fira Code", monospace',
    size: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '20px',
      xl: '24px',
      '2xl': '30px',
    },
    weight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  
  space: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  
  radius: {
    none: '0px',
    sm: '8px',        // Soft, romantic curves
    md: '16px',       // Gentle rounding like Korean UI design
    lg: '20px',       // Very soft for that dreamy feel
    xl: '28px',       // Maximum softness
    full: '9999px',   // Perfect circles
  },
  
  border: {
    none: '0px',
    thin: '1px',
    base: '2px',
    thick: '3px',
  },
  
  shadow: {
    none: 'none',
    sm: '0 1px 2px rgba(233, 30, 99, 0.08), 0 1px 4px rgba(233, 30, 99, 0.04)', // Soft rose pink shadows
    md: '0 4px 6px rgba(233, 30, 99, 0.1), 0 2px 4px rgba(233, 30, 99, 0.06)',
    lg: '0 10px 15px rgba(233, 30, 99, 0.1), 0 4px 6px rgba(233, 30, 99, 0.05)',
    xl: '0 20px 25px rgba(233, 30, 99, 0.1), 0 10px 10px rgba(233, 30, 99, 0.04)',
    inner: 'inset 0 2px 4px rgba(233, 30, 99, 0.06)',
  },
});