import { style } from '@vanilla-extract/css';
import { theme } from '@/ui/styles/theme.css';

export const button = style({
  minWidth: '200px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.color.primary,
  color: '#ffffff',
  border: 'none',
  borderRadius: theme.radius.md,
  padding: `${theme.space.md} ${theme.space.lg}`,
  fontSize: theme.font.size.base,
  fontWeight: theme.font.weight.medium,
  cursor: 'pointer',
  transition: 'all 0.2s ease',

  ':hover': {
    backgroundColor: theme.color.primaryHover,
    transform: 'translateY(-1px)',
    boxShadow: theme.shadow.md,
  },

  ':disabled': {
    backgroundColor: theme.color.textSecondary,
    cursor: 'not-allowed',
    transform: 'none',
    boxShadow: 'none',
  },
});