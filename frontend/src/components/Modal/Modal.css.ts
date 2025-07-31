import { style, keyframes } from '@vanilla-extract/css';
import { theme } from '../../styles/theme.css';

// Animations
const overlayShow = keyframes({
  '0%': { opacity: 0 },
  '100%': { opacity: 1 },
});

const contentShow = keyframes({
  '0%': { opacity: 0, transform: 'translate(-50%, -48%) scale(0.96)' },
  '100%': { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
});

// Overlay styles
export const dialogOverlay = style({
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  position: 'fixed',
  inset: 0,
  zIndex: 50,
  animation: `${overlayShow} 150ms cubic-bezier(0.16, 1, 0.3, 1)`,
});

// Content styles
export const dialogContent = style({
  backgroundColor: theme.color.background,
  borderRadius: theme.radius.lg,
  boxShadow: theme.shadow.lg,
  border: `1px solid ${theme.color.border}`,
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90vw',
  maxWidth: '500px',
  maxHeight: '85vh',
  padding: theme.space.lg,
  zIndex: 51,
  overflow: 'auto',
  fontFamily: theme.font.family,
  
  animation: `${contentShow} 150ms cubic-bezier(0.16, 1, 0.3, 1)`,
  
  selectors: {
    '&:focus': {
      outline: 'none',
    },
    
    // Size variants
    '&[data-size="xs"]': {
      maxWidth: '320px',
      padding: theme.space.sm,
    },
    '&[data-size="sm"]': {
      maxWidth: '400px',
      padding: theme.space.md,
    },
    '&[data-size="md"]': {
      maxWidth: '500px',
      padding: theme.space.lg,
    },
    '&[data-size="lg"]': {
      maxWidth: '600px',
      padding: theme.space.xl,
    },
    '&[data-size="xl"]': {
      maxWidth: '800px',
      padding: theme.space.xl,
    },
    
    // T-shirt sizes
    '&[data-size="tshirtXS"]': {
      maxWidth: '280px',
      padding: theme.space.sm,
    },
    '&[data-size="tshirtS"]': {
      maxWidth: '360px',
      padding: theme.space.md,
    },
    '&[data-size="tshirtM"]': {
      maxWidth: '480px',
      padding: theme.space.lg,
    },
    '&[data-size="tshirtL"]': {
      maxWidth: '640px',
      padding: theme.space.xl,
    },
    '&[data-size="tshirtXL"]': {
      maxWidth: '900px',
      padding: theme.space.xl,
    },
    
    // Variant styles
    '&[data-variant="primary"]': {
      borderColor: theme.color.primary,
      borderWidth: '2px',
    },
    '&[data-variant="secondary"]': {
      borderColor: theme.color.secondary,
      borderWidth: '2px',
    },
    '&[data-variant="tertiary"]': {
      borderColor: theme.color.tertiary,
      borderWidth: '2px',
    },
  },
});

// Close button styles
export const dialogClose = style({
  fontFamily: 'inherit',
  borderRadius: '100%',
  height: '25px',
  width: '25px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.color.textSecondary,
  position: 'absolute',
  top: '10px',
  right: '10px',
  fontSize: '18px',
  fontWeight: 'bold',
  backgroundColor: 'transparent',
  border: 'none',
  cursor: 'pointer',
  
  selectors: {
    '&:hover': {
      backgroundColor: theme.color.borderLight,
      color: theme.color.text,
    },
    '&:focus': {
      boxShadow: `0 0 0 2px ${theme.color.primary}`,
      outline: 'none',
    },
  },
});