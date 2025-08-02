import { style, styleVariants } from '@vanilla-extract/css';
import { theme } from '@/ui/styles/theme.css';

// Base button styles
export const buttonBase = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  fontFamily: theme.font.family,
  fontWeight: theme.font.weight.medium,
  borderWidth: theme.border.thin,
  borderStyle: 'solid',
  transition: 'all 0.2s ease-in-out',
  textDecoration: 'none',
  outline: 'none',
  
  ':focus': {
    outline: `${theme.border.base} solid ${theme.color.primary}`,
    outlineOffset: theme.border.base,
  },
  
  ':disabled': {
    cursor: 'not-allowed',
    opacity: '0.5',
  },
});

// Size variants (includes both standard and T-shirt sizes)
export const sizeVariants = styleVariants({
  // Standard sizes
  xs: {
    paddingLeft: theme.space.xs,
    paddingRight: theme.space.xs,
    paddingTop: theme.space.xs,
    paddingBottom: theme.space.xs,
    fontSize: theme.font.size.xs,
    borderRadius: theme.radius.sm,
  },
  sm: {
    paddingLeft: theme.space.sm,
    paddingRight: theme.space.sm,
    paddingTop: theme.space.xs,
    paddingBottom: theme.space.xs,
    fontSize: theme.font.size.sm,
    borderRadius: theme.radius.sm,
  },
  md: {
    paddingLeft: theme.space.md,
    paddingRight: theme.space.md,
    paddingTop: theme.space.sm,
    paddingBottom: theme.space.sm,
    fontSize: theme.font.size.base,
    borderRadius: theme.radius.md,
  },
  lg: {
    paddingLeft: theme.space.lg,
    paddingRight: theme.space.lg,
    paddingTop: theme.space.sm,
    paddingBottom: theme.space.sm,
    fontSize: theme.font.size.lg,
    borderRadius: theme.radius.md,
  },
  xl: {
    paddingLeft: theme.space.xl,
    paddingRight: theme.space.xl,
    paddingTop: theme.space.md,
    paddingBottom: theme.space.md,
    fontSize: theme.font.size.xl,
    borderRadius: theme.radius.lg,
  },
  
  // T-shirt sizes
  tshirtXS: {
    paddingLeft: '8px',
    paddingRight: '8px',
    paddingTop: '4px',
    paddingBottom: '4px',
    fontSize: theme.font.size.xs,
    borderRadius: theme.radius.sm,
  },
  tshirtS: {
    paddingLeft: '16px',
    paddingRight: '16px',
    paddingTop: '8px',
    paddingBottom: '8px',
    fontSize: theme.font.size.sm,
    borderRadius: theme.radius.sm,
  },
  tshirtM: {
    paddingLeft: '24px',
    paddingRight: '24px',
    paddingTop: '12px',
    paddingBottom: '12px',
    fontSize: theme.font.size.base,
    borderRadius: theme.radius.md,
  },
  tshirtL: {
    paddingLeft: '32px',
    paddingRight: '32px',
    paddingTop: '16px',
    paddingBottom: '16px',
    fontSize: theme.font.size.lg,
    borderRadius: theme.radius.md,
  },
  tshirtXL: {
    paddingLeft: '48px',
    paddingRight: '48px',
    paddingTop: '20px',
    paddingBottom: '20px',
    fontSize: theme.font.size.xl,
    borderRadius: theme.radius.lg,
  },
});

// Variant styles
export const variantStyles = styleVariants({
  primary: {
    backgroundColor: theme.color.primary,
    borderColor: theme.color.primary,
    color: theme.color.background,
    
    ':hover': {
      backgroundColor: theme.color.primaryHover,
      borderColor: theme.color.primaryHover,
    },
    ':active': {
      backgroundColor: theme.color.primaryActive,
      borderColor: theme.color.primaryActive,
    },
  },
  secondary: {
    backgroundColor: theme.color.secondary,
    borderColor: theme.color.secondary,
    color: theme.color.background,
    
    ':hover': {
      backgroundColor: theme.color.secondaryHover,
      borderColor: theme.color.secondaryHover,
    },
    ':active': {
      backgroundColor: theme.color.secondaryActive,
      borderColor: theme.color.secondaryActive,
    },
  },
  tertiary: {
    backgroundColor: 'transparent',
    borderColor: theme.color.border,
    color: theme.color.text,
    
    ':hover': {
      backgroundColor: theme.color.surface,
      borderColor: theme.color.borderLight,
    },
    ':active': {
      backgroundColor: theme.color.borderLight,
      borderColor: theme.color.border,
    },
  },
});