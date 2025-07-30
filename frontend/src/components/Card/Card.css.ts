import { style, styleVariants } from '@vanilla-extract/css';
import { tokens } from '../../styles/tokens.css';
import { sprinkles } from '../../styles/sprinkles.css';

// Base card styles
export const cardBase = style([
  sprinkles({
    backgroundColor: 'neutral50',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'neutral200',
  }),
  {
    transition: 'all 0.2s ease-in-out',
  },
]);

// Size variants
export const sizeVariants = styleVariants({
  xs: [
    sprinkles({
      p: 'xs',
      borderRadius: 'sm',
      boxShadow: 'sm',
    }),
  ],
  sm: [
    sprinkles({
      p: 'sm',
      borderRadius: 'sm',
      boxShadow: 'sm',
    }),
  ],
  md: [
    sprinkles({
      p: 'md',
      borderRadius: 'md',
      boxShadow: 'md',
    }),
  ],
  lg: [
    sprinkles({
      p: 'lg',
      borderRadius: 'md',
      boxShadow: 'md',
    }),
  ],
  xl: [
    sprinkles({
      p: 'xl',
      borderRadius: 'lg',
      boxShadow: 'lg',
    }),
  ],
});

export const sizeVariantsT = styleVariants({
  tshirtXS: [
    sprinkles({
      p: 'tshirtXS',
      borderRadius: 'sm',
      boxShadow: 'sm',
    }),
  ],
  tshirtS: [
    sprinkles({
      p: 'tshirtS',
      borderRadius: 'sm',
      boxShadow: 'sm',
    }),
  ],
  tshirtM: [
    sprinkles({
      p: 'tshirtM',
      borderRadius: 'md',
      boxShadow: 'md',
    }),
  ],
  tshirtL: [
    sprinkles({
      p: 'tshirtL',
      borderRadius: 'md',
      boxShadow: 'md',
    }),
  ],
  tshirtXL: [
    sprinkles({
      p: 'tshirtXL',
      borderRadius: 'lg',
      boxShadow: 'lg',
    }),
  ],
});

// Variant styles
export const variantStyles = styleVariants({
  primary: [
    sprinkles({
      backgroundColor: 'primary50',
      borderColor: 'primary200',
    }),
    {
      ':hover': {
        borderColor: tokens.color.primary['300'],
        boxShadow: tokens.shadow.md,
      },
    },
  ],
  secondary: [
    sprinkles({
      backgroundColor: 'secondary50',
      borderColor: 'secondary200',
    }),
    {
      ':hover': {
        borderColor: tokens.color.secondary['300'],
        boxShadow: tokens.shadow.md,
      },
    },
  ],
  tertiary: [
    sprinkles({
      backgroundColor: 'neutral50',
      borderColor: 'neutral200',
    }),
    {
      ':hover': {
        borderColor: tokens.color.neutral['300'],
        boxShadow: tokens.shadow.md,
      },
    },
  ],
});