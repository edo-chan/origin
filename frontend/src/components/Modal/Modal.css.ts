import { style, styleVariants, keyframes } from '@vanilla-extract/css';
import { tokens } from '../../styles/tokens.css';

// Animations
const fadeIn = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

const slideIn = keyframes({
  from: { 
    opacity: 0,
    transform: 'scale(0.95) translateY(-10px)',
  },
  to: { 
    opacity: 1,
    transform: 'scale(1) translateY(0)',
  },
});

// Overlay styles
export const overlay = style({
  position: 'fixed',
  backgroundColor: tokens.color.neutral['900'],
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  opacity: 0.5,
  zIndex: 40,
  animation: `${fadeIn} 0.2s ease-out`,
});

// Modal base styles
export const modalBase = style({
  position: 'fixed',
  backgroundColor: tokens.color.neutral['50'],
  borderRadius: tokens.radius.lg,
  boxShadow: tokens.shadow.lg,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: 50,
  maxHeight: '90vh',
  overflow: 'auto',
  animation: `${slideIn} 0.2s ease-out`,
});

// Size variants
export const sizeVariants = styleVariants({
  xs: {
    padding: tokens.padding.xs,
    width: '320px',
    maxWidth: '90vw',
  },
  sm: {
    padding: tokens.padding.sm,
    width: '400px',
    maxWidth: '90vw',
  },
  md: {
    padding: tokens.padding.md,
    width: '500px',
    maxWidth: '90vw',
  },
  lg: {
    padding: tokens.padding.lg,
    width: '600px',
    maxWidth: '90vw',
  },
  xl: {
    padding: tokens.padding.xl,
    width: '800px',
    maxWidth: '90vw',
  },
});

export const sizeVariantsT = styleVariants({
  tshirtXS: {
    padding: tokens.padding.tshirtXS,
    width: '280px',
    maxWidth: '90vw',
  },
  tshirtS: {
    padding: tokens.padding.tshirtS,
    width: '360px',
    maxWidth: '90vw',
  },
  tshirtM: {
    padding: tokens.padding.tshirtM,
    width: '480px',
    maxWidth: '90vw',
  },
  tshirtL: {
    padding: tokens.padding.tshirtL,
    width: '640px',
    maxWidth: '90vw',
  },
  tshirtXL: {
    padding: tokens.padding.tshirtXL,
    width: '900px',
    maxWidth: '90vw',
  },
});

// Variant styles
export const variantStyles = styleVariants({
  primary: {
    borderColor: tokens.color.primary['200'],
    borderWidth: '1px',
    borderStyle: 'solid',
  },
  secondary: {
    borderColor: tokens.color.secondary['200'],
    borderWidth: '1px',
    borderStyle: 'solid',
  },
  tertiary: {
    borderColor: tokens.color.neutral['200'],
    borderWidth: '1px',
    borderStyle: 'solid',
  },
});