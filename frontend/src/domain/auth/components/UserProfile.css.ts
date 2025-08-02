import { style, keyframes } from '@vanilla-extract/css';
import { theme } from '@/ui/styles/theme.css';

// Define keyframes animations
const spinAnimation = keyframes({
  '0%': { transform: 'rotate(0deg)' },
  '100%': { transform: 'rotate(360deg)' },
});

export const container = style({
  position: 'relative',
  display: 'inline-block'
});

export const trigger = style({
  display: 'flex',
  alignItems: 'center',
  gap: theme.space.sm,
  padding: theme.space.sm,
  backgroundColor: 'transparent',
  border: 'none',
  borderRadius: theme.radius.md,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  fontSize: theme.font.size.base,
  fontFamily: theme.font.family,
  color: theme.color.text,
  
  ':hover': {
    backgroundColor: theme.color.surface
  },
  
  ':focus': {
    outline: `2px solid ${theme.color.primary}`,
    outlineOffset: '2px'
  }
});

export const avatar = style({
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  objectFit: 'cover',
  border: `2px solid ${theme.color.border}`,
  backgroundColor: theme.color.surface
});

export const avatarFallback = style({
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  backgroundColor: theme.color.primary,
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: theme.font.size.sm,
  fontWeight: theme.font.weight.semibold,
  fontFamily: theme.font.family
});

export const userName = style({
  fontSize: theme.font.size.base,
  fontWeight: theme.font.weight.medium,
  color: theme.color.text,
  maxWidth: '150px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
});

export const chevronIcon = style({
  width: '16px',
  height: '16px',
  color: theme.color.textSecondary,
  transition: 'transform 0.2s ease',
  
  selectors: {
    '[data-state="open"] &': {
      transform: 'rotate(180deg)'
    }
  }
});

export const dropdown = style({
  position: 'absolute',
  top: '100%',
  right: '0',
  zIndex: 50,
  minWidth: '280px',
  marginTop: theme.space.xs,
  padding: theme.space.md,
  backgroundColor: theme.color.background,
  border: `${theme.border.thin} solid ${theme.color.border}`,
  borderRadius: theme.radius.lg,
  boxShadow: theme.shadow.lg,
  opacity: 0,
  transform: 'translateY(-10px)',
  transition: 'all 0.2s ease',
  pointerEvents: 'none',
  
  selectors: {
    '&[data-state="open"]': {
      opacity: 1,
      transform: 'translateY(0)',
      pointerEvents: 'auto'
    }
  }
});

export const profileHeader = style({
  display: 'flex',
  alignItems: 'center',
  gap: theme.space.md,
  marginBottom: theme.space.lg,
  paddingBottom: theme.space.md,
  borderBottom: `${theme.border.thin} solid ${theme.color.borderLight}`
});

export const profileAvatar = style({
  width: '48px',
  height: '48px',
  borderRadius: '50%',
  objectFit: 'cover',
  border: `2px solid ${theme.color.border}`
});

export const profileAvatarFallback = style({
  width: '48px',
  height: '48px',
  borderRadius: '50%',
  backgroundColor: theme.color.primary,
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: theme.font.size.lg,
  fontWeight: theme.font.weight.semibold,
  fontFamily: theme.font.family
});

export const profileInfo = style({
  flex: 1,
  minWidth: 0
});

export const profileName = style({
  fontSize: theme.font.size.lg,
  fontWeight: theme.font.weight.semibold,
  fontFamily: theme.font.headingFamily,
  color: theme.color.text,
  marginBottom: theme.space.xs,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
});

export const profileEmail = style({
  fontSize: theme.font.size.sm,
  color: theme.color.textSecondary,
  fontFamily: theme.font.family,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
});

export const menuSection = style({
  marginBottom: theme.space.lg,
  
  ':last-child': {
    marginBottom: 0
  }
});

export const menuItem = style({
  display: 'block',
  width: '100%',
  padding: `${theme.space.sm} ${theme.space.md}`,
  backgroundColor: 'transparent',
  border: 'none',
  borderRadius: theme.radius.md,
  textAlign: 'left',
  fontSize: theme.font.size.base,
  fontFamily: theme.font.family,
  color: theme.color.text,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  textDecoration: 'none',
  
  ':hover': {
    backgroundColor: theme.color.surface,
    color: theme.color.text
  },
  
  ':focus': {
    outline: `2px solid ${theme.color.primary}`,
    outlineOffset: '2px',
    backgroundColor: theme.color.surface
  }
});

export const menuItemDanger = style([menuItem, {
  color: theme.color.error,
  
  ':hover': {
    backgroundColor: '#fce8e6',
    color: theme.color.error
  }
}]);

export const tokenInfo = style({
  padding: theme.space.sm,
  backgroundColor: theme.color.surface,
  borderRadius: theme.radius.md,
  fontSize: theme.font.size.xs,
  fontFamily: theme.font.monoFamily,
  color: theme.color.textSecondary,
  marginBottom: theme.space.md
});

export const tokenLabel = style({
  display: 'block',
  fontWeight: theme.font.weight.medium,
  marginBottom: theme.space.xs
});

export const tokenValue = style({
  display: 'block',
  color: theme.color.text
});

export const divider = style({
  height: '1px',
  backgroundColor: theme.color.borderLight,
  margin: `${theme.space.md} 0`,
  border: 'none'
});

// Compact variant styles
export const compactTrigger = style([trigger, {
  padding: theme.space.xs
}]);

export const compactAvatar = style([avatar, {
  width: '24px',
  height: '24px'
}]);

export const compactAvatarFallback = style([avatarFallback, {
  width: '24px',
  height: '24px',
  fontSize: theme.font.size.xs
}]);

// Loading state
export const loadingSpinner = style({
  width: '16px',
  height: '16px',
  border: `2px solid ${theme.color.borderLight}`,
  borderTop: `2px solid ${theme.color.primary}`,
  borderRadius: '50%',
  animation: `${spinAnimation} 1s linear infinite`,
});