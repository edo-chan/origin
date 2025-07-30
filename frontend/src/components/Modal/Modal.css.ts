import { style, styleVariants, keyframes } from '@vanilla-extract/css';
import { tokens } from '../../styles/tokens.css';
import { sprinkles } from '../../styles/sprinkles.css';

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
export const overlay = style([
  sprinkles({
    position: 'fixed',
    backgroundColor: 'neutral900',
  }),
  {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.5,
    zIndex: 40,
    animation: `${fadeIn} 0.2s ease-out`,
  },
]);

// Modal base styles
export const modalBase = style([
  sprinkles({
    position: 'fixed',
    backgroundColor: 'neutral50',
    borderRadius: 'lg',
    boxShadow: 'lg',
  }),
  {
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 50,
    maxHeight: '90vh',
    overflow: 'auto',
    animation: `${slideIn} 0.2s ease-out`,
  },
]);

// Size variants
export const sizeVariants = styleVariants({
  xs: [
    sprinkles({
      p: 'xs',
    }),
    {
      width: '320px',
      maxWidth: '90vw',
    },
  ],
  sm: [
    sprinkles({
      p: 'sm',
    }),
    {
      width: '400px',
      maxWidth: '90vw',
    },
  ],
  md: [
    sprinkles({
      p: 'md',
    }),
    {
      width: '500px',
      maxWidth: '90vw',
    },
  ],
  lg: [
    sprinkles({
      p: 'lg',
    }),
    {
      width: '600px',
      maxWidth: '90vw',
    },
  ],
  xl: [
    sprinkles({
      p: 'xl',
    }),
    {
      width: '800px',
      maxWidth: '90vw',
    },
  ],
});

export const sizeVariantsT = styleVariants({
  tshirtXS: [
    sprinkles({
      p: 'tshirtXS',
    }),
    {
      width: '280px',
      maxWidth: '90vw',
    },
  ],
  tshirtS: [
    sprinkles({
      p: 'tshirtS',
    }),
    {
      width: '360px',
      maxWidth: '90vw',
    },
  ],
  tshirtM: [
    sprinkles({
      p: 'tshirtM',
    }),
    {
      width: '480px',
      maxWidth: '90vw',
    },
  ],
  tshirtL: [
    sprinkles({
      p: 'tshirtL',
    }),
    {
      width: '640px',
      maxWidth: '90vw',
    },
  ],
  tshirtXL: [
    sprinkles({
      p: 'tshirtXL',
    }),
    {
      width: '900px',
      maxWidth: '90vw',
    },
  ],
});

// Variant styles
export const variantStyles = styleVariants({
  primary: [
    sprinkles({
      borderColor: 'primary200',
      borderWidth: '1px',
      borderStyle: 'solid',
    }),
  ],
  secondary: [
    sprinkles({
      borderColor: 'secondary200',
      borderWidth: '1px',
      borderStyle: 'solid',
    }),
  ],
  tertiary: [
    sprinkles({
      borderColor: 'neutral200',
      borderWidth: '1px',
      borderStyle: 'solid',
    }),
  ],
});