import { style } from '@vanilla-extract/css';
import { theme } from '@/ui/styles/theme.css';

// Dropdown trigger button styles
export const dropdownTrigger = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  cursor: 'pointer',
  fontFamily: theme.font.family,
  fontWeight: theme.font.weight.medium,
  borderWidth: theme.border.thin,
  borderStyle: 'solid',
  borderRadius: theme.radius.md,
  backgroundColor: theme.color.background,
  borderColor: theme.color.border,
  color: theme.color.text,
  transition: 'all 0.2s ease-in-out',
  outline: 'none',
  gap: theme.space.sm,
  padding: `${theme.space.sm} ${theme.space.md}`,
  fontSize: theme.font.size.base,
  minHeight: '40px',
  
  ':focus': {
    outline: `${theme.border.base} solid ${theme.color.primary}`,
    outlineOffset: theme.border.base,
  },
  
  ':hover': {
    backgroundColor: theme.color.surface,
    borderColor: theme.color.borderLight,
  },
  
  ':disabled': {
    cursor: 'not-allowed',
    opacity: '0.5',
  },
});

// Dropdown content styles
export const dropdownContent = style({
  backgroundColor: theme.color.background,
  borderRadius: theme.radius.md,
  borderWidth: theme.border.thin,
  borderStyle: 'solid',
  borderColor: theme.color.border,
  padding: theme.space.xs,
  minWidth: '180px',
  maxHeight: '300px',
  overflowY: 'auto',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  zIndex: 1000,
  fontSize: theme.font.size.base,
});

// Dropdown item styles
export const dropdownItem = style({
  display: 'flex',
  alignItems: 'center',
  padding: `${theme.space.xs} ${theme.space.sm}`,
  borderRadius: theme.radius.sm,
  cursor: 'pointer',
  userSelect: 'none',
  outline: 'none',
  color: theme.color.text,
  transition: 'background-color 0.2s ease-in-out',
  fontSize: theme.font.size.base,
  
  ':focus': {
    backgroundColor: theme.color.surface,
  },
  
  ':hover': {
    backgroundColor: theme.color.surface,
  },
});

// Dropdown separator styles
export const dropdownSeparator = style({
  height: '1px',
  backgroundColor: theme.color.border,
  margin: `${theme.space.xs} 0`,
});

// Dropdown arrow styles
export const dropdownArrow = style({
  fill: theme.color.background,
  stroke: theme.color.border,
  strokeWidth: '1px',
});