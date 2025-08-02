import { style, styleVariants, globalStyle } from '@vanilla-extract/css';
import { theme } from '@/ui/styles/theme.css';

// Base button group styles
export const buttonGroupBase = style({
  display: 'inline-flex',
  position: 'relative',
  borderRadius: theme.radius.md,
  boxShadow: theme.shadow.sm,
  fontFamily: theme.font.family,
});

// Global styles for button group children
globalStyle(`${buttonGroupBase} > button`, {
  position: 'relative',
  border: `${theme.border.thin} solid ${theme.color.border}`,
  borderRadius: '0',
  margin: '0',
  zIndex: 1,
});

globalStyle(`${buttonGroupBase} > button:hover`, {
  zIndex: 2,
});

globalStyle(`${buttonGroupBase} > button:focus`, {
  zIndex: 3,
});

globalStyle(`${buttonGroupBase} > button:first-child`, {
  borderTopLeftRadius: theme.radius.md,
  borderBottomLeftRadius: theme.radius.md,
});

globalStyle(`${buttonGroupBase} > button:last-child`, {
  borderTopRightRadius: theme.radius.md,
  borderBottomRightRadius: theme.radius.md,
});

globalStyle(`${buttonGroupBase} > button:not(:first-child)`, {
  marginLeft: '-1px',
});

// Size variants
export const sizeVariants = styleVariants({
  sm: {
    fontSize: theme.font.size.sm,
  },
  md: {
    fontSize: theme.font.size.base,
  },
  lg: {
    fontSize: theme.font.size.lg,
  },
});

// Orientation styles
export const orientationStyles = styleVariants({
  horizontal: {
    flexDirection: 'row',
  },
  vertical: {
    flexDirection: 'column',
  },
});

// Create classes for vertical orientation
export const verticalButtonGroup = style({
  flexDirection: 'column',
});

// Global styles for vertical button group
globalStyle(`${verticalButtonGroup} > button:first-child`, {
  borderTopLeftRadius: theme.radius.md,
  borderTopRightRadius: theme.radius.md,
  borderBottomLeftRadius: '0',
  borderBottomRightRadius: '0',
});

globalStyle(`${verticalButtonGroup} > button:last-child`, {
  borderBottomLeftRadius: theme.radius.md,
  borderBottomRightRadius: theme.radius.md,
  borderTopLeftRadius: '0',
  borderTopRightRadius: '0',
});

globalStyle(`${verticalButtonGroup} > button:not(:first-child):not(:last-child)`, {
  borderRadius: '0',
});

globalStyle(`${verticalButtonGroup} > button:not(:first-child)`, {
  marginTop: '-1px',
  marginLeft: '0',
});