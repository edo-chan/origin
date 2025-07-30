import { style, styleVariants } from '@vanilla-extract/css';
import { tokens } from '../../styles/tokens.css';
import { sprinkles } from '../../styles/sprinkles.css';

// Base input styles
export const inputBase = style([
  sprinkles({
    display: 'block',
    fontFamily: 'body',
    borderWidth: '1px',
    borderStyle: 'solid',
    backgroundColor: 'neutral50',
    color: 'neutral900',
  }),
  {
    width: '100%',
    transition: 'all 0.2s ease-in-out',
    outline: 'none',
    
    ':focus': {
      borderColor: tokens.color.primary['500'],
      boxShadow: `0 0 0 1px ${tokens.color.primary['500']}`,
    },
    
    ':disabled': {
      backgroundColor: tokens.color.neutral['100'],
      color: tokens.color.neutral['400'],
      cursor: 'not-allowed',
    },
    
    '::placeholder': {
      color: tokens.color.neutral['400'],
    },
  },
]);

// Size variants
export const sizeVariants = styleVariants({
  xs: [
    sprinkles({
      px: 'xs',
      py: 'xs',
      fontSize: 'xs',
      borderRadius: 'sm',
    }),
  ],
  sm: [
    sprinkles({
      px: 'sm',
      py: 'xs',
      fontSize: 'sm',
      borderRadius: 'sm',
    }),
  ],
  md: [
    sprinkles({
      px: 'md',
      py: 'sm',
      fontSize: 'base',
      borderRadius: 'md',
    }),
  ],
  lg: [
    sprinkles({
      px: 'lg',
      py: 'sm',
      fontSize: 'lg',
      borderRadius: 'md',
    }),
  ],
  xl: [
    sprinkles({
      px: 'xl',
      py: 'md',
      fontSize: 'xl',
      borderRadius: 'lg',
    }),
  ],
});

export const sizeVariantsT = styleVariants({
  tshirtXS: [
    sprinkles({
      px: 'tshirtXS',
      py: 'tshirtXXS',
      fontSize: 'xs',
      borderRadius: 'sm',
    }),
  ],
  tshirtS: [
    sprinkles({
      px: 'tshirtS',
      py: 'tshirtXS',
      fontSize: 'sm',
      borderRadius: 'sm',
    }),
  ],
  tshirtM: [
    sprinkles({
      px: 'tshirtM',
      py: 'tshirtS',
      fontSize: 'base',
      borderRadius: 'md',
    }),
  ],
  tshirtL: [
    sprinkles({
      px: 'tshirtL',
      py: 'tshirtS',
      fontSize: 'lg',
      borderRadius: 'md',
    }),
  ],
  tshirtXL: [
    sprinkles({
      px: 'tshirtXL',
      py: 'tshirtM',
      fontSize: 'xl',
      borderRadius: 'lg',
    }),
  ],
});

// Variant styles
export const variantStyles = styleVariants({
  primary: [
    sprinkles({
      borderColor: 'primary300',
    }),
    {
      ':focus': {
        borderColor: tokens.color.primary['500'],
        boxShadow: `0 0 0 1px ${tokens.color.primary['500']}`,
      },
    },
  ],
  secondary: [
    sprinkles({
      borderColor: 'secondary300',
    }),
    {
      ':focus': {
        borderColor: tokens.color.secondary['500'],
        boxShadow: `0 0 0 1px ${tokens.color.secondary['500']}`,
      },
    },
  ],
  tertiary: [
    sprinkles({
      borderColor: 'neutral300',
    }),
    {
      ':focus': {
        borderColor: tokens.color.neutral['500'],
        boxShadow: `0 0 0 1px ${tokens.color.neutral['500']}`,
      },
    },
  ],
});