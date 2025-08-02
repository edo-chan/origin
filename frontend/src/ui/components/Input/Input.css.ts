import { style, styleVariants } from '@vanilla-extract/css';
import { theme } from '@/ui/styles/theme.css';

// Container for input, label, and error message
export const inputContainer = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
});

// Label styling
export const inputLabel = style({
  display: 'block',
  marginBottom: theme.space.xs,
  fontSize: 'inherit',
  fontFamily: theme.font.family,
  fontWeight: theme.font.weight.medium,
  color: theme.color.text,
});

export const inputLabelError = style({
  color: theme.color.error,
});

// Error message styling
export const inputErrorMessage = style({
  marginTop: theme.space.xs,
  fontSize: theme.font.size.sm,
  fontFamily: theme.font.family,
  color: theme.color.error,
  fontWeight: theme.font.weight.medium,
});

export const inputBase = style({
  fontFamily: theme.font.family,
  borderWidth: theme.border.thin,
  borderStyle: 'solid',
  borderColor: theme.color.border,
  backgroundColor: theme.color.background,
  color: theme.color.text,
  outline: 'none',
  transition: 'all 0.2s ease-in-out',
  
  ':focus': {
    borderColor: theme.color.primary,
    borderWidth: theme.border.base,
    boxShadow: `0 0 0 ${theme.border.thin} ${theme.color.primary}33`, // 33 = 20% opacity
  },
  
  ':disabled': {
    backgroundColor: theme.color.surface,
    cursor: 'not-allowed',
    opacity: '0.5',
  },
});

export const sizeVariants = styleVariants({
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
});

export const variantStyles = styleVariants({
  primary: {
    borderColor: theme.color.primary,
  },
  secondary: {
    borderColor: theme.color.secondary,
  },
  tertiary: {
    borderColor: theme.color.border,
  },
});

// Error styles
export const errorStyles = style({
  borderColor: theme.color.error,
  borderWidth: theme.border.base,
  boxShadow: `0 0 0 ${theme.border.thin} ${theme.color.error}33`, // 33 = 20% opacity
  
  ':focus': {
    borderColor: theme.color.error,
    borderWidth: theme.border.base,
    boxShadow: `0 0 0 ${theme.border.base} ${theme.color.error}33`,
  },
  
  ':hover': {
    borderColor: theme.color.errorHover,
  },
});