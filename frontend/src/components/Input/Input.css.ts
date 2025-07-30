import { style, styleVariants } from '@vanilla-extract/css';
import { tokens } from '../../styles/tokens.css';

export const inputBase = style({
  fontFamily: tokens.font.body,
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: tokens.color.neutral['300'],
  backgroundColor: tokens.color.neutral['50'],
  color: tokens.color.neutral['900'],
  outline: 'none',
  transition: 'all 0.2s ease-in-out',
  
  ':focus': {
    borderColor: tokens.color.primary['500'],
    boxShadow: `0 0 0 3px ${tokens.color.primary['100']}`,
  },
  
  ':disabled': {
    backgroundColor: tokens.color.neutral['100'],
    cursor: 'not-allowed',
    opacity: '0.5',
  },
});

export const sizeVariants = styleVariants({
  xs: {
    paddingLeft: tokens.padding.xs,
    paddingRight: tokens.padding.xs,
    paddingTop: tokens.padding.xs,
    paddingBottom: tokens.padding.xs,
    fontSize: tokens.font.scale.xs,
    borderRadius: tokens.radius.sm,
  },
  sm: {
    paddingLeft: tokens.padding.sm,
    paddingRight: tokens.padding.sm,
    paddingTop: tokens.padding.xs,
    paddingBottom: tokens.padding.xs,
    fontSize: tokens.font.scale.sm,
    borderRadius: tokens.radius.sm,
  },
  md: {
    paddingLeft: tokens.padding.md,
    paddingRight: tokens.padding.md,
    paddingTop: tokens.padding.sm,
    paddingBottom: tokens.padding.sm,
    fontSize: tokens.font.scale.base,
    borderRadius: tokens.radius.md,
  },
  lg: {
    paddingLeft: tokens.padding.lg,
    paddingRight: tokens.padding.lg,
    paddingTop: tokens.padding.sm,
    paddingBottom: tokens.padding.sm,
    fontSize: tokens.font.scale.lg,
    borderRadius: tokens.radius.md,
  },
  xl: {
    paddingLeft: tokens.padding.xl,
    paddingRight: tokens.padding.xl,
    paddingTop: tokens.padding.md,
    paddingBottom: tokens.padding.md,
    fontSize: tokens.font.scale.xl,
    borderRadius: tokens.radius.lg,
  },
});

export const sizeVariantsT = styleVariants({
  tshirtXS: {
    paddingLeft: tokens.padding.tshirtXS,
    paddingRight: tokens.padding.tshirtXS,
    paddingTop: tokens.padding.tshirtXXS,
    paddingBottom: tokens.padding.tshirtXXS,
    fontSize: tokens.font.scale.xs,
    borderRadius: tokens.radius.sm,
  },
  tshirtS: {
    paddingLeft: tokens.padding.tshirtS,
    paddingRight: tokens.padding.tshirtS,
    paddingTop: tokens.padding.tshirtXS,
    paddingBottom: tokens.padding.tshirtXS,
    fontSize: tokens.font.scale.sm,
    borderRadius: tokens.radius.sm,
  },
  tshirtM: {
    paddingLeft: tokens.padding.tshirtM,
    paddingRight: tokens.padding.tshirtM,
    paddingTop: tokens.padding.tshirtS,
    paddingBottom: tokens.padding.tshirtS,
    fontSize: tokens.font.scale.base,
    borderRadius: tokens.radius.md,
  },
  tshirtL: {
    paddingLeft: tokens.padding.tshirtL,
    paddingRight: tokens.padding.tshirtL,
    paddingTop: tokens.padding.tshirtS,
    paddingBottom: tokens.padding.tshirtS,
    fontSize: tokens.font.scale.lg,
    borderRadius: tokens.radius.md,
  },
  tshirtXL: {
    paddingLeft: tokens.padding.tshirtXL,
    paddingRight: tokens.padding.tshirtXL,
    paddingTop: tokens.padding.tshirtM,
    paddingBottom: tokens.padding.tshirtM,
    fontSize: tokens.font.scale.xl,
    borderRadius: tokens.radius.lg,
  },
});

export const variantStyles = styleVariants({
  primary: {
    borderColor: tokens.color.primary['300'],
  },
  secondary: {
    borderColor: tokens.color.secondary['300'],
  },
  tertiary: {
    borderColor: tokens.color.neutral['300'],
  },
});