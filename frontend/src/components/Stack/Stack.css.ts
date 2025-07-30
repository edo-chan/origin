import { style, styleVariants } from '@vanilla-extract/css';

export const stackBase = style({
  display: 'flex',
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