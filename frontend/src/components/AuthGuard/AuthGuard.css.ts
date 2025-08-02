import { style } from '@vanilla-extract/css';
import { theme } from '../../styles/theme.css';

// Auth guard container styles
export const authGuardContainer = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  padding: theme.space.lg,
  backgroundColor: theme.color.background,
});

// Loading state container
export const loadingContainer = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.space.md,
  padding: theme.space.xl,
  backgroundColor: theme.color.surface,
  borderRadius: theme.radius.lg,
  boxShadow: theme.shadow.md,
  maxWidth: '400px',
  width: '100%',
});

// Fallback content container
export const fallbackContainer = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.space.lg,
  padding: theme.space.xl,
  backgroundColor: theme.color.surface,
  borderRadius: theme.radius.lg,
  boxShadow: theme.shadow.md,
  maxWidth: '500px',
  width: '100%',
  textAlign: 'center',
});

// Loading text styles
export const loadingText = style({
  fontFamily: theme.font.family,
  fontSize: theme.font.size.base,
  fontWeight: theme.font.weight.medium,
  color: theme.color.text,
  margin: 0,
});

// Fallback title styles
export const fallbackTitle = style({
  fontFamily: theme.font.headingFamily,
  fontSize: theme.font.size.xl,
  fontWeight: theme.font.weight.bold,
  color: theme.color.text,
  margin: 0,
  marginBottom: theme.space.sm,
});

// Fallback description styles
export const fallbackDescription = style({
  fontFamily: theme.font.family,
  fontSize: theme.font.size.base,
  fontWeight: theme.font.weight.normal,
  color: theme.color.textSecondary,
  margin: 0,
  lineHeight: 1.5,
});