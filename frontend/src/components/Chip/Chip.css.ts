import { style, styleVariants } from '@vanilla-extract/css';
import { themeContract } from '@/styles/theme.css';

export const chipBase = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: themeContract.space.xs,
  fontFamily: themeContract.font.family,
  fontWeight: themeContract.font.weight.medium,
  border: 'none',
  borderRadius: themeContract.radius.full,
  cursor: 'pointer',
  userSelect: 'none',
  transition: 'all 0.2s ease',
  
  ':hover': {
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
  
  ':active': {
    transform: 'translateY(0)',
  },
  
  ':disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
    transform: 'none',
    boxShadow: 'none',
  },
});

export const chipVariants = styleVariants({
  primary: {
    backgroundColor: themeContract.color.primary,
    color: themeContract.color.background,
    
    ':hover': {
      backgroundColor: themeContract.color.primaryHover,
    },
    
    ':active': {
      backgroundColor: themeContract.color.primaryActive,
    },
  },
  secondary: {
    backgroundColor: themeContract.color.secondary,
    color: themeContract.color.background,
    
    ':hover': {
      backgroundColor: themeContract.color.secondaryHover,
    },
    
    ':active': {
      backgroundColor: themeContract.color.secondaryActive,
    },
  },
  tertiary: {
    backgroundColor: themeContract.color.tertiary,
    color: themeContract.color.background,
    
    ':hover': {
      backgroundColor: themeContract.color.tertiaryHover,
    },
    
    ':active': {
      backgroundColor: themeContract.color.tertiaryActive,
    },
  },
  success: {
    backgroundColor: themeContract.color.tertiary,
    color: themeContract.color.background,
    
    ':hover': {
      backgroundColor: themeContract.color.tertiaryHover,
    },
    
    ':active': {
      backgroundColor: themeContract.color.tertiaryActive,
    },
  },
  warning: {
    backgroundColor: themeContract.color.secondary,
    color: themeContract.color.background,
    
    ':hover': {
      backgroundColor: themeContract.color.secondaryHover,
    },
    
    ':active': {
      backgroundColor: themeContract.color.secondaryActive,
    },
  },
  danger: {
    backgroundColor: themeContract.color.primary,
    color: themeContract.color.background,
    
    ':hover': {
      backgroundColor: themeContract.color.primaryHover,
    },
    
    ':active': {
      backgroundColor: themeContract.color.primaryActive,
    },
  },
  neutral: {
    backgroundColor: themeContract.color.surface,
    color: themeContract.color.text,
    border: themeContract.border.thin,
    borderStyle: 'solid',
    borderColor: themeContract.color.border,
    
    ':hover': {
      backgroundColor: themeContract.color.borderLight,
    },
    
    ':active': {
      backgroundColor: themeContract.color.border,
    },
  },
});

export const chipSizes = styleVariants({
  xs: {
    padding: `${themeContract.space.xs} ${themeContract.space.sm}`,
    fontSize: themeContract.font.size.xs,
    minHeight: '20px',
  },
  sm: {
    padding: `${themeContract.space.sm} ${themeContract.space.md}`,
    fontSize: themeContract.font.size.sm,
    minHeight: '24px',
  },
  md: {
    padding: `${themeContract.space.sm} ${themeContract.space.lg}`,
    fontSize: themeContract.font.size.base,
    minHeight: '32px',
  },
  lg: {
    padding: `${themeContract.space.md} ${themeContract.space.xl}`,
    fontSize: themeContract.font.size.lg,
    minHeight: '40px',
  },
});

