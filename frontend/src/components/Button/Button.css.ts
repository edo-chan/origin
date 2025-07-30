import { style, styleVariants } from '@vanilla-extract/css';
import { tokens } from '../../styles/tokens.css';
import { sprinkles } from '../../styles/sprinkles.css';

// Base button styles
export const buttonBase = style([
  sprinkles({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontFamily: 'body',
    fontWeight: '500',
    borderWidth: '1px',
    borderStyle: 'solid',
  }),
  {
    transition: 'all 0.2s ease-in-out',
    textDecoration: 'none',
    outline: 'none',
    
    ':focus': {
      outline: `2px solid ${tokens.color.primary['500']}`,
      outlineOffset: '2px',
    },
    
    ':disabled': {
      cursor: 'not-allowed',
      opacity: '0.5',
    },
  },
]);

// Size variants (both standard and t-shirt sizes)
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
      backgroundColor: 'primary500',
      borderColor: 'primary500',
      color: 'neutral50',
    }),
    {
      ':hover': {
        backgroundColor: tokens.color.primary['600'],
        borderColor: tokens.color.primary['600'],
      },
      ':active': {
        backgroundColor: tokens.color.primary['700'],
        borderColor: tokens.color.primary['700'],
      },
    },
  ],
  secondary: [
    sprinkles({
      backgroundColor: 'secondary500',
      borderColor: 'secondary500',
      color: 'neutral50',
    }),
    {
      ':hover': {
        backgroundColor: tokens.color.secondary['600'],
        borderColor: tokens.color.secondary['600'],
      },
      ':active': {
        backgroundColor: tokens.color.secondary['700'],
        borderColor: tokens.color.secondary['700'],
      },
    },
  ],
  tertiary: [
    sprinkles({
      backgroundColor: 'transparent',
      borderColor: 'neutral300',
      color: 'neutral700',
    }),
    {
      ':hover': {
        backgroundColor: tokens.color.neutral['50'],
        borderColor: tokens.color.neutral['400'],
      },
      ':active': {
        backgroundColor: tokens.color.neutral['100'],
        borderColor: tokens.color.neutral['500'],
      },
    },
  ],
});