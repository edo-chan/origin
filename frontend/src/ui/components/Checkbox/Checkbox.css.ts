import { style } from '@vanilla-extract/css';

export const checkboxRoot = style({
  all: 'unset',
  backgroundColor: 'white',
  width: '18px',
  height: '18px',
  borderRadius: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '2px solid #e2e8f0',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  
  selectors: {
    '&:hover': {
      borderColor: '#cbd5e1',
    },
    '&:focus': {
      boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.5)',
    },
    '&[data-state="checked"]': {
      backgroundColor: '#3b82f6',
      borderColor: '#3b82f6',
      color: 'white',
    },
    '&[data-disabled]': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
    '&[data-size="sm"]': {
      width: '14px',
      height: '14px',
    },
    '&[data-size="lg"]': {
      width: '22px',
      height: '22px',
    },
    '&[data-variant="secondary"]': {
      borderColor: '#6b7280',
    },
    '&[data-variant="secondary"][data-state="checked"]': {
      backgroundColor: '#6b7280',
      borderColor: '#6b7280',
    },
    '&[data-variant="tertiary"]': {
      borderColor: '#9ca3af',
    },
    '&[data-variant="tertiary"][data-state="checked"]': {
      backgroundColor: '#9ca3af',
      borderColor: '#9ca3af',
    },
  },
});

export const checkboxIndicator = style({
  color: 'currentColor',
  
  selectors: {
    '&[data-state="checked"]': {
      animation: 'checkboxIndicator 200ms ease-in',
    },
  },
});

export const checkboxLabel = style({
  fontSize: '14px',
  lineHeight: '1.5',
  cursor: 'pointer',
  userSelect: 'none',
  color: '#374151',
  
  selectors: {
    '&:hover': {
      color: '#111827',
    },
  },
});