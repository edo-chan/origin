import { style } from '@vanilla-extract/css';
import { theme } from '../../styles/theme.css';

export const switchRoot = style({
  all: 'unset',
  width: '42px',
  height: '25px',
  backgroundColor: theme.color.border,
  borderRadius: '9999px',
  position: 'relative',
  boxShadow: `0 2px 10px ${theme.color.border}`,
  WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)',
  transition: 'background-color 0.2s ease',
  cursor: 'pointer',
  border: `1px solid ${theme.color.borderLight}`,
  
  selectors: {
    '&:focus': {
      boxShadow: `0 0 0 2px ${theme.color.primary}`,
      outline: 'none',
    },
    '&[data-state="checked"]': {
      backgroundColor: theme.color.primary,
      borderColor: theme.color.primary,
    },
    '&[data-variant="secondary"][data-state="checked"]': {
      backgroundColor: theme.color.secondary,
      borderColor: theme.color.secondary,
    },
    '&[data-variant="tertiary"][data-state="checked"]': {
      backgroundColor: theme.color.tertiary,
      borderColor: theme.color.tertiary,
    },
    '&[data-size="sm"]': {
      width: '32px',
      height: '18px',
    },
    '&[data-size="md"]': {
      width: '42px',
      height: '25px',
    },
    '&[data-size="lg"]': {
      width: '52px',
      height: '32px',
    },
    '&:disabled': {
      backgroundColor: theme.color.border,
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
});

export const switchThumb = style({
  display: 'block',
  width: '21px',
  height: '21px',
  backgroundColor: 'white',
  borderRadius: '9999px',
  boxShadow: '0 2px 2px rgba(0, 0, 0, 0.2)',
  transition: 'transform 0.2s ease',
  transform: 'translateX(2px)',
  willChange: 'transform',
  
  selectors: {
    '&[data-state="checked"]': {
      transform: 'translateX(19px)',
    },
    [`${switchRoot}[data-size="sm"] &`]: {
      width: '14px',
      height: '14px',
    },
    [`${switchRoot}[data-size="sm"] &[data-state="checked"]`]: {
      transform: 'translateX(16px)',
    },
    [`${switchRoot}[data-size="md"] &`]: {
      width: '21px',
      height: '21px',
    },
    [`${switchRoot}[data-size="md"] &[data-state="checked"]`]: {
      transform: 'translateX(19px)',
    },
    [`${switchRoot}[data-size="lg"] &`]: {
      width: '28px',
      height: '28px',
    },
    [`${switchRoot}[data-size="lg"] &[data-state="checked"]`]: {
      transform: 'translateX(22px)',
    },
  },
});

export const switchLabel = style({
  fontFamily: theme.font.family,
  fontSize: theme.font.size.base,
  fontWeight: theme.font.weight.normal,
  color: theme.color.text,
  cursor: 'pointer',
  userSelect: 'none',
  lineHeight: 1,
});