import { style } from '@vanilla-extract/css';
import { theme } from '@/ui/styles/theme.css';

export const sliderRoot = style({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  userSelect: 'none',
  touchAction: 'none',
  width: '100%',
  
  selectors: {
    '&[data-orientation="horizontal"]': {
      height: '20px',
    },
    '&[data-orientation="vertical"]': {
      flexDirection: 'column',
      width: '20px',
      height: '100px',
    },
    '&[data-size="sm"][data-orientation="horizontal"]': {
      height: '16px',
    },
    '&[data-size="lg"][data-orientation="horizontal"]': {
      height: '24px',
    },
    '&[data-disabled]': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
});

export const sliderTrack = style({
  backgroundColor: theme.color.borderLight,
  position: 'relative',
  flexGrow: 1,
  borderRadius: '9999px',
  border: `1px solid ${theme.color.border}`,
  
  selectors: {
    '&[data-orientation="horizontal"]': {
      height: '6px',
    },
    '&[data-orientation="vertical"]': {
      width: '6px',
    },
    [`${sliderRoot}[data-size="sm"] &[data-orientation="horizontal"]`]: {
      height: '4px',
    },
    [`${sliderRoot}[data-size="lg"] &[data-orientation="horizontal"]`]: {
      height: '8px',
    },
  },
});

export const sliderRange = style({
  position: 'absolute',
  backgroundColor: theme.color.primary,
  borderRadius: '9999px',
  height: '100%',
  
  selectors: {
    [`${sliderRoot}[data-variant="secondary"] &`]: {
      backgroundColor: theme.color.secondary,
    },
    [`${sliderRoot}[data-variant="tertiary"] &`]: {
      backgroundColor: theme.color.tertiary,
    },
  },
});

export const sliderThumb = style({
  display: 'block',
  width: '20px',
  height: '20px',
  backgroundColor: 'white',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  borderRadius: '10px',
  border: `2px solid ${theme.color.primary}`,
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  
  selectors: {
    '&:hover': {
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
      transform: 'scale(1.1)',
    },
    '&:focus': {
      outline: 'none',
      boxShadow: `0 0 0 4px ${theme.color.primary}40`,
    },
    [`${sliderRoot}[data-variant="secondary"] &`]: {
      borderColor: theme.color.secondary,
    },
    [`${sliderRoot}[data-variant="tertiary"] &`]: {
      borderColor: theme.color.tertiary,
    },
    [`${sliderRoot}[data-size="sm"] &`]: {
      width: '16px',
      height: '16px',
    },
    [`${sliderRoot}[data-size="lg"] &`]: {
      width: '24px',
      height: '24px',
    },
    [`${sliderRoot}[data-disabled] &`]: {
      cursor: 'not-allowed',
      transform: 'none',
    },
    [`${sliderRoot}[data-disabled] &:hover`]: {
      transform: 'none',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    },
  },
});

export const sliderLabel = style({
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: theme.space.xs,
  color: theme.color.text,
  fontSize: theme.font.size.base,
  fontWeight: theme.font.weight.medium,
  fontFamily: theme.font.family,
});

export const sliderValue = style({
  color: theme.color.textSecondary,
  fontWeight: theme.font.weight.normal,
  fontFamily: theme.font.family,
});