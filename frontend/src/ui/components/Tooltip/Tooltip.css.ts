import { style, keyframes } from '@vanilla-extract/css';
import { theme } from '@/ui/styles/theme.css';

const slideUpAndFade = keyframes({
  '0%': { opacity: 0, transform: 'translateY(2px)' },
  '100%': { opacity: 1, transform: 'translateY(0)' },
});

const slideRightAndFade = keyframes({
  '0%': { opacity: 0, transform: 'translateX(-2px)' },
  '100%': { opacity: 1, transform: 'translateX(0)' },
});

const slideDownAndFade = keyframes({
  '0%': { opacity: 0, transform: 'translateY(-2px)' },
  '100%': { opacity: 1, transform: 'translateY(0)' },
});

const slideLeftAndFade = keyframes({
  '0%': { opacity: 0, transform: 'translateX(2px)' },
  '100%': { opacity: 1, transform: 'translateX(0)' },
});

export const tooltipContent = style({
  borderRadius: theme.radius.md,
  padding: `${theme.space.xs} ${theme.space.sm}`,
  fontSize: theme.font.size.sm,
  lineHeight: 1,
  color: theme.color.background,
  backgroundColor: theme.color.text,
  boxShadow: theme.shadow.md,
  userSelect: 'none',
  fontFamily: theme.font.family,
  fontWeight: theme.font.weight.medium,
  zIndex: 1000,
  
  animationDuration: '400ms',
  animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
  willChange: 'transform, opacity',
  
  selectors: {
    '&[data-state="delayed-open"][data-side="top"]': {
      animationName: slideDownAndFade,
    },
    '&[data-state="delayed-open"][data-side="right"]': {
      animationName: slideLeftAndFade,
    },
    '&[data-state="delayed-open"][data-side="bottom"]': {
      animationName: slideUpAndFade,
    },
    '&[data-state="delayed-open"][data-side="left"]': {
      animationName: slideRightAndFade,
    },
    
    // Variant styles
    '&[data-variant="primary"]': {
      backgroundColor: theme.color.primary,
      color: theme.color.background,
    },
    '&[data-variant="secondary"]': {
      backgroundColor: theme.color.secondary,
      color: theme.color.background,
    },
    '&[data-variant="tertiary"]': {
      backgroundColor: theme.color.tertiary,
      color: theme.color.background,
    },
    '&[data-variant="neutral"]': {
      backgroundColor: theme.color.text,
      color: theme.color.background,
    },
    
    // Size variants
    '&[data-size="sm"]': {
      fontSize: theme.font.size.xs,
      padding: `${theme.space.xs} ${theme.space.sm}`,
    },
    '&[data-size="md"]': {
      fontSize: theme.font.size.sm,
      padding: `${theme.space.sm} ${theme.space.md}`,
    },
    '&[data-size="lg"]': {
      fontSize: theme.font.size.base,
      padding: `${theme.space.md} ${theme.space.lg}`,
    },
  },
});

export const tooltipArrow = style({
  fill: theme.color.text,
  
  selectors: {
    [`${tooltipContent}[data-variant="primary"] &`]: {
      fill: theme.color.primary,
    },
    [`${tooltipContent}[data-variant="secondary"] &`]: {
      fill: theme.color.secondary,
    },
    [`${tooltipContent}[data-variant="tertiary"] &`]: {
      fill: theme.color.tertiary,
    },
    [`${tooltipContent}[data-variant="neutral"] &`]: {
      fill: theme.color.text,
    },
  },
});