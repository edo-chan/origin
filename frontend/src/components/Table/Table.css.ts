import { style, styleVariants } from '@vanilla-extract/css';
import { tokens } from '../../styles/tokens.css';
import { sprinkles } from '../../styles/sprinkles.css';

// Base table styles
export const tableBase = style([
  sprinkles({
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'neutral200',
    borderRadius: 'md',
    backgroundColor: 'neutral50',
  }),
  {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: 0,
    overflow: 'hidden',
  },
]);

export const tableHeader = style([
  sprinkles({
    backgroundColor: 'neutral100',
    borderColor: 'neutral200',
    fontWeight: '600',
    textAlign: 'left',
  }),
]);

export const tableCell = style([
  sprinkles({
    borderColor: 'neutral200',
  }),
  {
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
  },
]);

// Size variants
export const sizeVariants = styleVariants({
  xs: {
    selectors: {
      '& th, & td': {
        padding: tokens.sizing.xs,
        fontSize: tokens.font.scale.xs,
      },
    },
  },
  sm: {
    selectors: {
      '& th, & td': {
        padding: tokens.sizing.sm,
        fontSize: tokens.font.scale.sm,
      },
    },
  },
  md: {
    selectors: {
      '& th, & td': {
        padding: tokens.sizing.md,
        fontSize: tokens.font.scale.base,
      },
    },
  },
  lg: {
    selectors: {
      '& th, & td': {
        padding: tokens.sizing.lg,
        fontSize: tokens.font.scale.lg,
      },
    },
  },
  xl: {
    selectors: {
      '& th, & td': {
        padding: tokens.sizing.xl,
        fontSize: tokens.font.scale.xl,
      },
    },
  },
});

export const sizeVariantsT = styleVariants({
  tshirtXS: {
    selectors: {
      '& th, & td': {
        padding: tokens.sizing.tshirtXS,
        fontSize: tokens.font.scale.xs,
      },
    },
  },
  tshirtS: {
    selectors: {
      '& th, & td': {
        padding: tokens.sizing.tshirtS,
        fontSize: tokens.font.scale.sm,
      },
    },
  },
  tshirtM: {
    selectors: {
      '& th, & td': {
        padding: tokens.sizing.tshirtM,
        fontSize: tokens.font.scale.base,
      },
    },
  },
  tshirtL: {
    selectors: {
      '& th, & td': {
        padding: tokens.sizing.tshirtL,
        fontSize: tokens.font.scale.lg,
      },
    },
  },
  tshirtXL: {
    selectors: {
      '& th, & td': {
        padding: tokens.sizing.tshirtXL,
        fontSize: tokens.font.scale.xl,
      },
    },
  },
});

// Variant styles
export const variantStyles = styleVariants({
  primary: [
    sprinkles({
      borderColor: 'primary200',
    }),
    {
      selectors: {
        '& thead': {
          backgroundColor: tokens.color.primary['50'],
        },
        '& tbody tr:hover': {
          backgroundColor: tokens.color.primary['25'] || tokens.color.primary['50'],
        },
      },
    },
  ],
  secondary: [
    sprinkles({
      borderColor: 'secondary200',
    }),
    {
      selectors: {
        '& thead': {
          backgroundColor: tokens.color.secondary['50'],
        },
        '& tbody tr:hover': {
          backgroundColor: tokens.color.secondary['25'] || tokens.color.secondary['50'],
        },
      },
    },
  ],
  tertiary: [
    sprinkles({
      borderColor: 'neutral200',
    }),
    {
      selectors: {
        '& thead': {
          backgroundColor: tokens.color.neutral['100'],
        },
        '& tbody tr:hover': {
          backgroundColor: tokens.color.neutral['50'],
        },
      },
    },
  ],
});