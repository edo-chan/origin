import { style } from '@vanilla-extract/css';
import { theme } from '@/ui/styles/theme.css';

export const container = style({
  width: '100%',
  maxWidth: '600px',
});

export const emptyState = style({
  textAlign: 'center',
  padding: theme.space.lg,
  backgroundColor: theme.color.background,
  border: `1px solid ${theme.color.border}`,
});

export const accountCard = style({
  padding: theme.space.md,
  backgroundColor: theme.color.surface,
  border: `1px solid ${theme.color.border}`,
  borderRadius: theme.radius.md,
  transition: 'all 0.2s ease',

  ':hover': {
    boxShadow: theme.shadow.sm,
    borderColor: theme.color.primary,
  },
});

export const accountHeader = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
});

export const balanceSection = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
  gap: theme.space.sm,
  marginTop: theme.space.sm,
  paddingTop: theme.space.sm,
  borderTop: `1px solid ${theme.color.border}`,
});

export const balanceItem = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
});