import { style, styleVariants } from '@vanilla-extract/css';
import { theme } from '@/ui/styles/theme.css';

export const stackBase = style({
  display: 'flex',
  fontFamily: theme.font.family,
});

export const directionVariants = styleVariants({
  row: {
    flexDirection: 'row',
  },
  column: {
    flexDirection: 'column',
  },
});

export const alignVariants = styleVariants({
  'flex-start': {
    alignItems: 'flex-start',
  },
  'flex-end': {
    alignItems: 'flex-end',
  },
  center: {
    alignItems: 'center',
  },
  baseline: {
    alignItems: 'baseline',
  },
  stretch: {
    alignItems: 'stretch',
  },
});

export const justifyVariants = styleVariants({
  'flex-start': {
    justifyContent: 'flex-start',
  },
  'flex-end': {
    justifyContent: 'flex-end',
  },
  center: {
    justifyContent: 'center',
  },
  'space-between': {
    justifyContent: 'space-between',
  },
  'space-around': {
    justifyContent: 'space-around',
  },
  'space-evenly': {
    justifyContent: 'space-evenly',
  },
});

export const wrapVariants = styleVariants({
  nowrap: {
    flexWrap: 'nowrap',
  },
  wrap: {
    flexWrap: 'wrap',
  },
});

export const gapVariants = styleVariants({
  none: {
    gap: '0',
  },
  xs: {
    gap: theme.space.xs,
  },
  sm: {
    gap: theme.space.sm,
  },
  md: {
    gap: theme.space.md,
  },
  lg: {
    gap: theme.space.lg,
  },
  xl: {
    gap: theme.space.xl,
  },
});

export const paddingVariants = styleVariants({
  none: {
    padding: '0',
  },
  xs: {
    padding: theme.space.xs,
  },
  sm: {
    padding: theme.space.sm,
  },
  md: {
    padding: theme.space.md,
  },
  lg: {
    padding: theme.space.lg,
  },
  xl: {
    padding: theme.space.xl,
  },
});