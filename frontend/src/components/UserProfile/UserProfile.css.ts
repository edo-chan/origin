import { style, styleVariants } from '@vanilla-extract/css';
import { theme } from '../../styles/theme.css';

// Base user profile container
export const userProfileContainer = style({
  display: 'flex',
  alignItems: 'center',
  gap: theme.space.md,
  padding: theme.space.md,
  backgroundColor: theme.color.surface,
  borderRadius: theme.radius.md,
  border: `${theme.border.thin} solid ${theme.color.border}`,
  boxShadow: theme.shadow.sm,
  transition: 'all 0.2s ease-in-out',
  fontFamily: theme.font.family,
  
  ':hover': {
    boxShadow: theme.shadow.md,
    borderColor: theme.color.borderLight,
  },
});

// Size variants for user profile
export const sizeVariants = styleVariants({
  sm: {
    padding: theme.space.sm,
    gap: theme.space.sm,
  },
  md: {
    padding: theme.space.md,
    gap: theme.space.md,
  },
  lg: {
    padding: theme.space.lg,
    gap: theme.space.md,
  },
});

// Avatar container styles
export const avatarContainer = style({
  position: 'relative',
  flexShrink: 0,
  borderRadius: theme.radius.full,
  overflow: 'hidden',
  border: `${theme.border.base} solid ${theme.color.primary}`,
  boxShadow: theme.shadow.sm,
});

// Avatar size variants
export const avatarSizeVariants = styleVariants({
  sm: {
    width: '32px',
    height: '32px',
  },
  md: {
    width: '48px',
    height: '48px',
  },
  lg: {
    width: '64px',
    height: '64px',
  },
});

// Avatar image styles
export const avatarImage = style({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
});

// Avatar fallback (when no image is available)
export const avatarFallback = style({
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.color.primary,
  color: theme.color.background,
  fontWeight: theme.font.weight.bold,
  fontSize: theme.font.size.sm,
  textTransform: 'uppercase',
});

// User info container
export const userInfoContainer = style({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.space.xs,
  flex: 1,
  minWidth: 0, // Allows text to truncate properly
});

// User name styles
export const userName = style({
  fontFamily: theme.font.headingFamily,
  fontWeight: theme.font.weight.semibold,
  color: theme.color.text,
  margin: 0,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

// User name size variants
export const userNameSizeVariants = styleVariants({
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

// User email styles
export const userEmail = style({
  fontFamily: theme.font.family,
  fontWeight: theme.font.weight.normal,
  color: theme.color.textSecondary,
  margin: 0,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

// User email size variants
export const userEmailSizeVariants = styleVariants({
  sm: {
    fontSize: theme.font.size.xs,
  },
  md: {
    fontSize: theme.font.size.sm,
  },
  lg: {
    fontSize: theme.font.size.base,
  },
});

// Status indicator styles
export const statusIndicator = style({
  position: 'absolute',
  bottom: '2px',
  right: '2px',
  width: '12px',
  height: '12px',
  borderRadius: theme.radius.full,
  backgroundColor: theme.color.tertiary,
  border: `${theme.border.base} solid ${theme.color.background}`,
  boxShadow: theme.shadow.sm,
});

// Offline status indicator
export const statusOffline = style([statusIndicator, {
  backgroundColor: theme.color.textSecondary,
}]);

// Online status indicator
export const statusOnline = style([statusIndicator, {
  backgroundColor: theme.color.tertiary,
}]);